<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

interface IgdbEnrichment {
  steam_appid: number
  name?: string
  cover_url?: string
  rating?: number
  rating_count?: number
  aggregated_rating?: number
  summary?: string
  genres?: string[]
  themes?: string[]
  platforms?: string[]
  developer?: string
  publisher?: string
  similar_games?: { name: string; cover_url?: string }[]
}

interface Game {
  id: number
  name: string
  image: string
  description: string
  price: string
  score: number
  time_played: number
  igdb?: IgdbEnrichment
}

const props = defineProps<{
  api: string
  category: number | null
  genre: number | null
  tag: number[] | null
  username: string | null
  free: boolean | null
  nonVr: boolean | null
  qualityThreshold: number // 0 = curation off, 1-100 = minimum IGDB rating required
  enableSound: boolean
}>()

const QUALITY_MIN_RATING_COUNT = 5
const WHEEL_SIZE = 8
// Overfetch pool so we have enough survivors after the IGDB quality filter.
// CMA API returns random Steam apps; only ~20-40% typically have IGDB entries meeting the threshold.
const INITIAL_POOL_SIZE = 100
// Cap how many extra batches we'll pull while trying to reach WHEEL_SIZE survivors.
// Wheel CSS is hardcoded for 8 segments — anything less looks broken, so we retry hard.
const MAX_REFETCH_ATTEMPTS = 5

const emit = defineEmits(['input'])

const games = ref<Game[]>([])
const loading = ref(false)
const spinning = ref(false)
const deg = ref(0)
const target = ref(0)
const empty = ref(false)
const errorMessage = ref<string | null>(null)
const mp3 = ref<HTMLAudioElement | null>(null)

const wheelRef = ref<HTMLElement | null>(null)
const winner = ref<Game | null>(null)

const fetchBatch = async (limit: number): Promise<Game[]> => {
  // CMA API uses `per_page` (not `limit`) and hard-caps at 100 per request.
  const response = await axios.get(`${props.api}apps`, {
    params: {
      per_page: Math.min(limit, 100),
      random: 1,
      category: props.category,
      genre: props.genre,
      tag: Array.isArray(props.tag) ? (props.tag.length ? props.tag : null) : props.tag,
      free: props.free ? 1 : 0,
      non_vr: props.nonVr ? 1 : 0,
      username: props.username || null,
    }
  })
  return response.data as Game[]
}

interface EnrichResult {
  games: Game[]
  igdbReachable: boolean
}

const enrichWithIgdb = async (batch: Game[]): Promise<EnrichResult> => {
  if (batch.length === 0) return { games: batch, igdbReachable: true }
  try {
    const resp = await axios.post('/api/igdb', {
      steam_appids: batch.map(g => g.id)
    }, { timeout: 8000 })
    const enrichments = (resp.data?.games ?? []) as IgdbEnrichment[]
    const byAppid = new Map<number, IgdbEnrichment>(
      enrichments.map(e => [Number(e.steam_appid), e])
    )
    return {
      games: batch.map(g => ({ ...g, igdb: byAppid.get(g.id) })),
      igdbReachable: true,
    }
  } catch (error) {
    console.warn('IGDB proxy unreachable:', error)
    return { games: batch, igdbReachable: false }
  }
}

const passesQualityFilter = (g: Game): boolean => {
  const r = g.igdb?.rating
  const c = g.igdb?.rating_count
  if (typeof r !== 'number' || typeof c !== 'number') return false
  return r >= props.qualityThreshold && c >= QUALITY_MIN_RATING_COUNT
}

// Fisher-Yates shuffle so we pick a truly random subset of the pool.
const shuffle = <T,>(arr: T[]): T[] => {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const loadGames = async (callback: () => void) => {
  empty.value = false
  errorMessage.value = null
  games.value = []

  const survivors = new Map<number, Game>()
  let igdbEverReachable = true

  const addSurvivors = (batch: Game[]) => {
    for (const g of batch) {
      if (!survivors.has(g.id)) survivors.set(g.id, g)
      if (survivors.size >= WHEEL_SIZE) break
    }
  }

  try {
    if (props.qualityThreshold > 0) {
      // Curated mode: overfetch a big random pool from CMA -> enrich all with IGDB ->
      // filter by user's rating threshold. Re-fetch additional batches until we have
      // WHEEL_SIZE unique survivors or hit the attempt cap.
      for (let attempt = 0; attempt < MAX_REFETCH_ATTEMPTS && survivors.size < WHEEL_SIZE; attempt++) {
        const pool = await fetchBatch(INITIAL_POOL_SIZE)
        if (pool.length === 0) break

        const { games: enriched, igdbReachable } = await enrichWithIgdb(pool)
        if (!igdbReachable) {
          igdbEverReachable = false
          break
        }

        const passing = enriched.filter(passesQualityFilter)
        console.log(`[wheel] attempt ${attempt + 1}: ${passing.length}/${enriched.length} games passed rating >=${props.qualityThreshold} (survivors so far: ${survivors.size})`)

        addSurvivors(shuffle(passing))
      }

      if (!igdbEverReachable) {
        errorMessage.value = 'IGDB curation unavailable. Drop the rating slider to 0 or check the /api/igdb endpoint.'
        empty.value = true
        return
      }

      if (survivors.size === 0) {
        errorMessage.value = `No IGDB games rated ${props.qualityThreshold}+ in this filter set. Try a lower rating or relax filters.`
        empty.value = true
        return
      }

      if (survivors.size < WHEEL_SIZE) {
        errorMessage.value = `Only found ${survivors.size} of ${WHEEL_SIZE} games rated ${props.qualityThreshold}+ after ${MAX_REFETCH_ATTEMPTS} tries. Try lowering the rating or relaxing filters.`
        empty.value = true
        return
      }

      games.value = Array.from(survivors.values()).slice(0, WHEEL_SIZE)
    } else {
      // Threshold = 0: curation off. Fetch WHEEL_SIZE and retry if CMA returned fewer
      // (strict filters can produce short batches).
      for (let attempt = 0; attempt < MAX_REFETCH_ATTEMPTS && survivors.size < WHEEL_SIZE; attempt++) {
        const batch = await fetchBatch(WHEEL_SIZE)
        if (batch.length === 0) break
        addSurvivors(batch)
      }

      if (survivors.size === 0) {
        errorMessage.value = 'No Steam games matched your filters. Try relaxing them.'
        empty.value = true
        return
      }

      if (survivors.size < WHEEL_SIZE) {
        errorMessage.value = `Only found ${survivors.size} of ${WHEEL_SIZE} games matching your filters. Try relaxing them.`
        empty.value = true
        return
      }

      const finalBatch = Array.from(survivors.values()).slice(0, WHEEL_SIZE)
      const { games: enriched } = await enrichWithIgdb(finalBatch)
      games.value = enriched
    }
  } catch (error) {
    console.error(error)
    games.value = []
    errorMessage.value = 'Failed to load games. Please try again.'
    empty.value = true
  } finally {
    callback()
  }
}

const resetWheelRotation = () => {
  if (wheelRef.value) {
    wheelRef.value.style.transition = 'none'
    wheelRef.value.style.transform = 'rotate(0deg)'
  }
  deg.value = 0
}

const spinWheel = () => {
  spinning.value = true
  winner.value = null

  const segmentCount = games.value.length
  const segmentAngle = 360 / segmentCount
  const spins = 5
  const randomSegment = Math.floor(Math.random() * segmentCount)

  // Ensuring it spins multiple times with momentum and aligns the winner with the black arrow
  const additionalDegrees = spins * 360
  const finalDegrees = additionalDegrees + randomSegment * segmentAngle
  deg.value = finalDegrees
  target.value = randomSegment

  if (wheelRef.value) {
    wheelRef.value.style.transition = 'transform 4s cubic-bezier(0.33, 1, 0.68, 1)'
    wheelRef.value.style.transform = `rotate(${deg.value}deg)`
  }

  setTimeout(() => {
    spinning.value = false

    // Calculate the winning segment based on the final rotation
    const currentRotation = deg.value % 360
    const adjustedRotation = (currentRotation + 360) % 360 // ensure positive value
    const selectedSegmentIndex = Math.floor((360 - adjustedRotation) / segmentAngle)

    winner.value = games.value[selectedSegmentIndex]
    console.log('Winner selected:', winner.value)
    emit('input', winner.value)
  }, 4000)
}

const spin = () => {
  loading.value = true
  loadGames(() => {
    loading.value = false
    if (games.value.length < 1) {
      empty.value = true
    } else {
      resetWheelRotation()
      setTimeout(() => {
        spinWheel()
        playSound()
      }, 50) // Short delay to ensure the reset is applied
    }
  })
}

const playSound = () => {
  if (props.enableSound && mp3.value) {
    mp3.value.play().then(() => {
      console.log('Audio playing')
    }).catch((error: any) => {
      console.error("Failed to play audio:", error)
    })
  }
}

onMounted(() => {
  mp3.value = new Audio('../music/thewheelhausaudio.mp3')
  mp3.value.addEventListener('canplaythrough', () => {
    console.log('Audio file can be played through without stopping')
  })
  mp3.value.addEventListener('error', (e: any) => {
    console.error('Audio file error:', e)
  })
})
</script>

<template>
  <div id="gameWheel" class="relative flex flex-col items-center gap-4">
    <div class="relative w-full max-w-[450px]">
      <button
        class="skills-wheelbtn"
        title="Spin the wheel"
        :disabled="loading || spinning"
        @click="spin"
      >
        {{ loading ? 'Loading' : spinning ? 'Spinning' : empty ? 'No results' : 'Spin' }}
      </button>
      <div class="gameImageCopy" v-show="winner">
        <img
          :src="winner?.image ?? undefined"
          :class="{ show: winner }"
          alt=""
        />
      </div>
      <div class="skills-wheel">
        <ul class="wheel" ref="wheelRef">
          <li v-for="(game, index) in games" :key="index">
            <img id="clipPolygon" :style="{ backgroundImage: 'url(' + (game.image || game.igdb?.cover_url || '') + ')' }">
          </li>
        </ul>
      </div>
    </div>

    <!-- Curation error / empty state -->
    <div
      v-if="errorMessage"
      role="alert"
      class="w-full max-w-[450px] rounded-xl border-[3px] border-brand-navy bg-brand-gold px-4 py-3 font-body text-sm font-semibold text-brand-navy shadow-[4px_4px_0_0_#0F1435]"
    >
      {{ errorMessage }}
    </div>
  </div>
</template>

<style scoped>
#gameWheel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  background-repeat: no-repeat;
  background-size: 150px;
  background-position: center !important;
  width: 100%;
  position: relative;
  padding: 24px 0;
}

.bg {
  display: block;
  position: absolute;
  width: 100%;
}

/* Coral rim (echoes the BroughtYouThisThing target motif) */
.skills-wheel {
  height: 450px;
  margin: 0 auto;
  overflow: hidden;
  position: relative;
  border-radius: 100%;
  width: 450px;
  max-width: 100%;
  min-height: 450px;
  background:
    repeating-radial-gradient(circle at center,
      #E85A47 0px,
      #E85A47 24px,
      #F1E6D3 24px,
      #F1E6D3 48px);
  box-shadow:
    0 0 0 8px #1B2660,
    0 0 0 14px #E85A47,
    0 0 0 20px #1B2660,
    8px 12px 0 20px #0F1435;
}

/* Navy pointer arrow */
.skills-wheel:before {
  border-style: solid;
  border-width: 40px 24px 0;
  border-color: #1B2660 transparent transparent;
  content: "";
  height: 0;
  left: 50%;
  margin-left: -24px;
  position: absolute;
  top: -6px;
  z-index: 100;
  width: 0;
  filter: drop-shadow(0 3px 0 #0F1435);
}

/* Center "SPIN" retro sticker button */
.skills-wheelbtn {
  color: #FBF7EE;
  background-color: #E85A47;
  border: 5px solid #1B2660;
  height: 110px;
  width: 110px;
  line-height: 18px;
  padding: 0;
  text-align: center;
  position: absolute;
  border-radius: 100%;
  text-decoration: none;
  text-transform: uppercase;
  font-family: 'Fredoka', system-ui, sans-serif;
  font-weight: 700;
  font-size: 1.1rem;
  letter-spacing: 0.04em;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 999;
  box-shadow: 4px 4px 0 0 #0F1435;
  transition: all .18s ease;
}

.skills-wheelbtn:focus {
  outline: 0;
}

.skills-wheelbtn:hover {
  background-color: #F4B821;
  color: #1B2660;
  box-shadow: 2px 2px 0 0 #0F1435;
  transform: translate(calc(-50% + 2px), calc(-50% + 2px));
}

.skills-wheelbtn:active {
  box-shadow: 0 0 0 0 #0F1435;
  transform: translate(calc(-50% + 4px), calc(-50% + 4px));
}

.wheel {
  position: absolute;
  width: 100%;
  height: 100%;
  transition: transform 4s cubic-bezier(0.33, 1, 0.68, 1);
  border: 6px solid #1B2660;
  box-sizing: border-box;
  margin: 0 auto;
  overflow: hidden;
  position: relative;
  border-radius: 100%;
  text-align: center;
  transform-origin: center center;
  rotate: 77deg;
}

.wheel li {
  position: absolute;
  width: 100%;
  height: 100%;
  list-style: none;
  margin: 0;
  padding: 0;
  transform-origin: center center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, .4);
}

.wheel li:nth-child(1) {
  transform: rotate(0);
}

.wheel li:nth-child(2) {
  transform: rotate(45deg);
}

.wheel li:nth-child(3) {
  transform: rotate(90deg);
}

.wheel li:nth-child(4) {
  transform: rotate(135deg);
}

.wheel li:nth-child(5) {
  transform: rotate(180deg);
}

.wheel li:nth-child(6) {
  transform: rotate(225deg);
}

.wheel li:nth-child(7) {
  transform: rotate(270deg);
}

.wheel li:nth-child(8) {
  transform: rotate(315deg);
}

.wheel li:nth-child(odd) img {
  opacity: .8;
}

@media (max-width: 768px) {
  .skills-wheel {
    height: 310px;
    width: 310px;
    max-width: 100%;
    min-height: 310px;
  }
  .gameImageCopy {
    width: 100%;
    height: 100%;
  }
}

</style>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'WheelComponent'
})
</script>
