<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

interface Game {
  id: number
  name: string
  image: string
  description: string
  price: string
  score: number
  time_played: number
}

const props = defineProps<{
  api: string
  category: string | null
  genre: string | null
  tag: string[] | string | null
  username: string | null
  free: boolean | null
  nonVr: boolean | null
  enableSound: boolean
}>()

const emit = defineEmits(['input'])

const games = ref<Game[]>([])
const loading = ref(false)
const spinning = ref(false)
const deg = ref(0)
const target = ref(0)
const empty = ref(false)
const mp3 = ref<HTMLAudioElement | null>(null)

const wheelRef = ref<HTMLElement | null>(null)
const winner = ref<Game | null>(null)

const loadGames = async (callback: () => void) => {
  empty.value = false
  games.value = []

  try {
    const response = await axios.get(`${props.api}apps`, {
      params: {
        category: props.category,
        genre: props.genre,
        tag: Array.isArray(props.tag) ? (props.tag.length ? props.tag : null) : props.tag,
        free: props.free,
        non_vr: props.nonVr,
        username: props.username || null,
      }
    })
    games.value = response.data
    callback()
  } catch (error) {
    console.error(error)
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
  mp3.value = new Audio('/src/assets/music/thewheelhausaudio.mp3')
  mp3.value.addEventListener('canplaythrough', () => {
    console.log('Audio file can be played through without stopping')
  })
  mp3.value.addEventListener('error', (e: any) => {
    console.error('Audio file error:', e)
  })
})
</script>

<template>
  <div id="gameWheel" class="relative">
    <div class="gameImageCopy" v-show="winner" transition="fadeIn">
      <img :src="winner ? winner.image : null" :class="{ show: winner }">
    </div>
    <div class="skills-wheel">
      <ul class="wheel" ref="wheelRef">
        <li v-for="(game, index) in games" :key="index" :ref="index">
          <img id="clipPolygon" :style="{ backgroundImage: 'url(' + game.image + ')' }">
        </li>
      </ul>
      <button class="skills-wheelbtn" title="spin" @click="spin">{{ loading ? 'Loading' : spinning ? 'Spinning' : empty ? 'No results' : 'Spin' }}</button>
    </div>
  </div>
</template>
<style scoped>
#gameWheel {
  display: block;
  background-repeat: no-repeat;
  background-size: 150px;
  background-position: center !important;
  background-attachment: fixed;
  width: 100%;
}

.bg {
  display: block;
  position: absolute;
  width: 100%;
  background-image: url(../images/overlay_bg.png);
  background-repeat: no-repeat;
  background-size: 100% 1080px;
}

.skills-wheel {
  height: 450px;
  left: 50%;
  transform: translateX(-50%);
  overflow: hidden;
  position: relative;
  border-radius: 100%;
  width: 100%;
  max-width: 450px;
  min-width: 450px;
  min-height: 450px;
  background-color: rgb(254, 130, 4);
  box-shadow: 0px 0px 0px 12px #fe8204;
}

.skills-wheel:before {
  border-style: solid;
  border-width: 32px 32px 0;
  border-color: #000 transparent transparent;
  content: "";
  height: 0;
  left: 50%;
  margin-left: -32px;
  position: absolute;
  top: 10px;
  z-index: 100;
  width: 0;
}

.skills-wheelbtn {
  color: #000;
  background-color: #fe8204;
  border: 4px solid #000;
  height: 100px;
  line-height: 18px;
  padding: 0;
  text-align: center;
  position: absolute;
  border-radius: 100%;
  text-decoration: none;
  text-transform: uppercase;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 999;
  box-shadow: 3px 3px #000;
  width: 100px;
  transition: all .25s ease-in-out;
}

.skills-wheelbtn:focus {
  outline: 0;
}

.skills-wheelbtn:hover {
  box-shadow: 0px 0px #000;
  color: #fff;
}

.skills-wheelbtn:active {
  box-shadow: none;
  height: 96px;
  box-shadow: 0px 0px #000;
}

.wheel {
  position: absolute;
  width: 100%;
  height: 100%;
  transition: transform 4s cubic-bezier(0.33, 1, 0.68, 1);
  border: 12px solid #000;
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
    max-width: 310px;
    min-width: 310px;
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
