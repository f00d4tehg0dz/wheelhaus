<script setup lang="ts">
import { ref, watch } from 'vue'
import Header from './components/Header.vue'
import Footer from './components/Footers.vue'
import WheelComponent from './components/WheelComponent.vue'
import ControlsComponent from './components/ControlsComponent.vue'
import { inject } from '@vercel/analytics'

const api = ref('https://steam.cma.dk/')
const enableSound = ref(false)
const selectedCategory = ref<number | null>(null)
const selectedGenre = ref<number | null>(null)
const selectedTag = ref<number[]>([])
const username = ref<string | null>(null)
const free = ref(false)
const nonVr = ref(false)
// IGDB rating threshold (0-100). 0 = curation off, >0 = strict filter at that rating minimum.
const qualityThreshold = ref(60)
const winner = ref<Game | null>(null)

const showDonateModal = ref(false)

inject()

watch(winner, (newWinner) => {
  if (newWinner) console.log('Winner changed in App.vue:', newWinner.name)
})

const startPlaying = () => {
  if (winner.value) {
    window.location.href = `steam://run/${winner.value.id}`
  }
}

interface Game {
  id: number
  name: string
  image: string
  description: string
  price: string
  score: number
  time_played: number
  igdb?: {
    cover_url?: string
    rating?: number
    rating_count?: number
    aggregated_rating?: number
    genres?: string[]
    themes?: string[]
    platforms?: string[]
    similar_games?: { name: string; cover_url?: string }[]
    developer?: string
    publisher?: string
    summary?: string
  }
}
</script>

<template>
  <div class="page-shell">
    <Header />

    <section class="jumbotron">
      <div class="container mx-auto px-4 py-10">
        <div class="hero-copy text-center mb-8">
          <h1 class="hero-title">The Wheelhaus</h1>
          <p class="hero-eyebrow">The premier <strong>Steam Roulette</strong> wheel.</p>
          <p class="hero-sub">
            Spin the wheel to pick a random Steam game to play. Curate by category, genre, tag,
            price, or your own Steam library, enriched with IGDB ratings so the wheel skips shovelware.
          </p>
          <p class="hero-domains">Also at <a href="https://steamroulette.xyz" rel="noopener">steamroulette.xyz</a> · <a href="https://steamroulette.games" rel="noopener">steamroulette.games</a></p>
        </div>

        <div class="flex flex-wrap -mx-4 items-start">
          <div class="w-full md:w-1/4 px-4 mb-4 md:mb-0">
            <ControlsComponent
              :api="api"
              :selectedCategory="selectedCategory"
              :selectedGenre="selectedGenre"
              :selectedTag="selectedTag"
              :free="free"
              :nonVr="nonVr"
              :qualityThreshold="qualityThreshold"
              :username="username"
              @update:category="selectedCategory = $event"
              @update:genre="selectedGenre = $event"
              @update:tag="selectedTag = $event"
              @update:free="free = $event"
              @update:nonVr="nonVr = $event"
              @update:qualityThreshold="qualityThreshold = $event"
              @update:username="username = $event"
            />
          </div>
          <div class="w-full md:w-1/2 px-4 mb-4 md:mb-0 flex justify-center">
            <WheelComponent
              :api="api"
              :category="selectedCategory"
              :genre="selectedGenre"
              :tag="selectedTag"
              :username="username"
              :free="free"
              :nonVr="nonVr"
              :qualityThreshold="qualityThreshold"
              :enableSound="enableSound"
              @input="winner = $event"
            />
          </div>
          <div class="w-full md:w-1/4 px-4 mb-4 md:mb-0 flex justify-center items-center">
            <button
              @click="enableSound = !enableSound"
              class="btn-brand btn-brand-secondary"
              :aria-pressed="!enableSound"
            >
              {{ enableSound ? 'Mute Sound' : 'Unmute Sound' }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <div class="container mx-auto px-4 py-8">
      <!-- Winner card -->
      <article
        v-if="winner"
        class="w-full mb-8 steamContent opacity-0 transition-opacity duration-500 ease-in-out"
        :class="{ 'opacity-100': winner }"
        itemscope
        itemtype="https://schema.org/VideoGame"
      >
        <div class="winner-inner p-6 md:p-8">
          <div class="winner-grid">
            <div v-if="winner.igdb?.cover_url" class="winner-cover">
              <img :src="winner.igdb.cover_url" :alt="winner.name + ' cover art'" itemprop="image" />
            </div>
            <div class="winner-body">
              <h2 class="gameNameSelected" itemprop="name">{{ winner.name }}</h2>

              <!-- Hero IGDB score badge (always renders so users know rating state) -->
              <div class="igdb-hero" itemprop="aggregateRating" itemscope itemtype="https://schema.org/AggregateRating">
                <div class="igdb-hero-label">IGDB Rating</div>
                <template v-if="winner.igdb?.rating">
                  <div class="igdb-hero-score">
                    <span class="igdb-hero-value" itemprop="ratingValue">{{ Math.round(winner.igdb.rating) }}</span>
                    <span class="igdb-hero-suffix">/100</span>
                  </div>
                  <div class="igdb-hero-meta" v-if="winner.igdb.rating_count">
                    from <span itemprop="ratingCount">{{ winner.igdb.rating_count }}</span> user ratings
                  </div>
                  <meta itemprop="bestRating" content="100" />
                  <meta itemprop="worstRating" content="0" />
                </template>
                <template v-else>
                  <div class="igdb-hero-score igdb-hero-score-empty">
                    <span class="igdb-hero-suffix">Not yet rated on IGDB</span>
                  </div>
                </template>
              </div>

              <!-- Supplementary ratings (IGDB critics + Metacritic fallback) -->
              <div v-if="winner.igdb?.aggregated_rating || winner.score" class="rating-row">
                <span v-if="winner.igdb?.aggregated_rating" class="rating-pill rating-pill-alt">
                  IGDB Critics {{ Math.round(winner.igdb.aggregated_rating) }}/100
                </span>
                <span v-if="winner.score" class="rating-pill">
                  Metacritic {{ winner.score }}
                </span>
              </div>

              <div v-if="winner.igdb?.genres?.length || winner.igdb?.themes?.length" class="meta-row">
                <span v-for="g in winner.igdb?.genres" :key="'g-' + g" class="tag-chip" itemprop="genre">{{ g }}</span>
                <span v-for="t in winner.igdb?.themes" :key="'t-' + t" class="tag-chip tag-chip-alt">{{ t }}</span>
              </div>

              <p class="game-summary" itemprop="description">
                <span v-if="winner.igdb?.summary">{{ winner.igdb.summary.substring(0, 420) }}...</span>
                <span v-else v-html="winner.description.substring(0, 420) + '...'"></span>
              </p>

              <ul class="winner-facts">
                <li v-if="winner.igdb?.developer"><strong>Developer:</strong> <span itemprop="author">{{ winner.igdb.developer }}</span></li>
                <li v-if="winner.igdb?.publisher"><strong>Publisher:</strong> <span itemprop="publisher">{{ winner.igdb.publisher }}</span></li>
                <li v-if="winner.igdb?.platforms?.length"><strong>Platforms:</strong> {{ winner.igdb.platforms.join(', ') }}</li>
                <li><strong>Price:</strong> <span itemprop="offers" itemscope itemtype="https://schema.org/Offer"><span itemprop="price">{{ winner.price }}</span></span></li>
                <li v-if="winner.time_played"><strong>Your playtime:</strong> {{ winner.time_played }} hours</li>
              </ul>

              <div class="winner-cta-row">
                <button class="launchGame" @click="startPlaying">Launch on Steam</button>
                <a :href="'https://store.steampowered.com/app/' + winner.id" target="_blank" rel="noopener" class="btn-brand btn-brand-secondary">View Store Page</a>
              </div>

              <div v-if="winner.igdb?.similar_games?.length" class="similar-games mt-6">
                <h3 class="similar-title">Similar games you might like</h3>
                <div class="similar-grid">
                  <div v-for="sg in winner.igdb.similar_games.slice(0, 6)" :key="sg.name" class="similar-card">
                    <img v-if="sg.cover_url" :src="sg.cover_url" :alt="sg.name" />
                    <span>{{ sg.name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      <!-- FAQ (AEO / GEO friendly, entity-rich, answer-shaped) -->
      <section id="steamFaq" itemscope itemtype="https://schema.org/FAQPage" aria-labelledby="faq-heading">
        <h2 id="faq-heading" class="text-3xl mb-6">Frequently Asked Questions about The Wheelhaus</h2>

        <div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
          <h3 class="text-xl font-bold mb-2" itemprop="name">What is The Wheelhaus?</h3>
          <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
            <p class="mb-4" itemprop="text">
              The Wheelhaus is the premier <strong>Steam Roulette</strong> web app. It is the same random Steam game wheel popularized by the
              <a href="https://www.youtube.com/@Funhaus" target="_blank" rel="noopener">Funhaus</a> YouTube channel and used today on
              <a href="https://www.youtube.com/@BroughtYouThisThing" target="_blank" rel="noopener">BroughtYouThisThing</a>.
              It spins a wheel of randomly selected Steam games and reveals a winner for you to play. It supports filters by category, genre, tag, price,
              and your personal Steam library, and it uses IGDB ratings to curate higher-quality picks.
              The Wheelhaus is also reachable at <a href="https://steamroulette.xyz" rel="noopener">steamroulette.xyz</a>
              and <a href="https://steamroulette.games" rel="noopener">steamroulette.games</a>.
            </p>
          </div>
        </div>

        <div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
          <h3 class="text-xl font-bold mb-2" itemprop="name">What is Steam Roulette?</h3>
          <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
            <p class="mb-4" itemprop="text">
              <strong>Steam Roulette</strong> is a format where a random Steam game is selected (usually by spinning a wheel) and the player
              commits to playing whatever the wheel lands on. It was popularized by the
              <a href="https://www.youtube.com/@Funhaus" target="_blank" rel="noopener">Funhaus</a> YouTube channel, which turned it into a
              recurring show format. The Wheelhaus is the specific web app that powers Steam Roulette segments; it is currently used by
              <a href="https://www.youtube.com/@BroughtYouThisThing" target="_blank" rel="noopener">BroughtYouThisThing</a>
              and remains the premier tool for the format.
            </p>
          </div>
        </div>

        <div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
          <h3 class="text-xl font-bold mb-2" itemprop="name">How does The Wheelhaus pick a random Steam game?</h3>
          <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
            <p class="mb-4" itemprop="text">
              The Wheelhaus fetches a random batch of Steam apps through the community
              <a href="https://cma.dk" target="_blank" rel="noopener">CMAndersen Steam API</a>, applies your filters, and then optionally enriches
              each game with IGDB ratings. Games rated below 60/100 by fewer than 5 reviewers are dropped so the wheel skips low-quality titles.
              The remaining games become segments on the wheel and one is chosen when the wheel stops spinning.
            </p>
          </div>
        </div>

        <div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
          <h3 class="text-xl font-bold mb-2" itemprop="name">Does The Wheelhaus include every Steam game?</h3>
          <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
            <p class="mb-4" itemprop="text">
              Yes. The underlying dataset covers every public Steam app thanks to the
              <a href="https://cma.dk" target="_blank" rel="noopener">CMAndersen Steam API</a>. Filters and IGDB curation narrow the pool
              to games that match your criteria.
            </p>
          </div>
        </div>

        <div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
          <h3 class="text-xl font-bold mb-2" itemprop="name">Why do some Steam games show no image?</h3>
          <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
            <p class="mb-4" itemprop="text">
              A small number of Steam apps are missing header art in the Steam catalog. When that happens The Wheelhaus falls back to the
              IGDB cover if one is available; otherwise the segment appears empty.
            </p>
          </div>
        </div>

        <div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
          <h3 class="text-xl font-bold mb-2" itemprop="name">How do I use my Steam library with The Wheelhaus?</h3>
          <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
            <p class="mb-4" itemprop="text">
              Enter your 17-digit Steam ID (not display name) into the username field. Your Steam profile and game library must be set to
              public. You can update this in the
              <a href="https://steamcommunity.com/my/edit/settings?" target="_blank" rel="noopener">Steam Privacy Profile Settings</a>
              by changing "Game Details" to Public.
            </p>
          </div>
        </div>

        <div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
          <h3 class="text-xl font-bold mb-2" itemprop="name">Is The Wheelhaus free to use?</h3>
          <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
            <p class="mb-4" itemprop="text">
              Yes. The Wheelhaus is completely free and does not require an account. It is an independent project built by
              <a href="https://linktr.ee/adrianchrysanthou" target="_blank" rel="noopener">Adrian Chrysanthou</a> and is not affiliated with Valve or Steam.
              Support is welcome via the Donate button below.
            </p>
          </div>
        </div>

        <div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
          <h3 class="text-xl font-bold mb-2" itemprop="name">How do I contact the creator?</h3>
          <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
            <p class="mb-4" itemprop="text">
              Email <a href="mailto:adrianvfx@gmail.com">adrianvfx@gmail.com</a> for bug reports, feature requests, or feedback.
            </p>
          </div>
        </div>

        <button
          @click="showDonateModal = true"
          class="btn-brand mt-4"
          aria-haspopup="dialog"
        >
          Donate to The Wheelhaus
        </button>

        <div
          v-if="showDonateModal"
          class="fixed inset-0 flex items-center justify-center z-50 bg-brand-ink/80"
          role="dialog"
          aria-modal="true"
          aria-labelledby="donate-title"
        >
          <div class="donate-modal">
            <button @click="showDonateModal = false" class="donate-close" aria-label="Close">&times;</button>
            <h3 id="donate-title" class="text-xl font-bold mb-4">Donate to The Wheelhaus</h3>
            <div class="mb-3">
              <span class="font-semibold text-brand-navy">Bitcoin:</span>
              <span class="text-brand-coral select-all"> 3EDFUfa5bRKZH478m5JtMdXn5PYoxrJjH7 </span>
            </div>
            <div class="mb-3">
              <span class="font-semibold text-brand-navy">Ethereum:</span>
              <span class="text-brand-navy select-all"> 0x4d11D9c4518f341A458d0EB055b9D9f977C1A992 </span>
            </div>
            <div class="text-brand-ink/70 text-sm">Thank you for supporting the project!</div>
          </div>
        </div>
      </section>
    </div>

    <Footer />
  </div>
</template>

<style scoped>
.page-shell {
  background: #39A9E0;
  min-height: 100vh;
  width: 100%;
}

.jumbotron {
  background:
    radial-gradient(circle at 15% 20%, rgba(244, 184, 33, 0.18) 0%, transparent 40%),
    radial-gradient(circle at 85% 80%, rgba(232, 90, 71, 0.20) 0%, transparent 45%),
    linear-gradient(180deg, #1B2660 0%, #0F1435 100%);
  color: #FBF7EE;
  padding: 0;
  border-bottom: 6px solid #0F1435;
}

.hero-copy {
  max-width: 780px;
  margin: 0 auto;
}

.hero-title {
  font-family: 'Fredoka', 'BreakersSlab', system-ui, sans-serif;
  font-weight: 700;
  font-size: clamp(2rem, 4.5vw, 3.5rem);
  color: #FBF7EE;
  line-height: 1.05;
  margin-bottom: 12px;
  text-shadow: 3px 3px 0 #0F1435;
}

.hero-eyebrow {
  color: #F4B821;
  font-family: 'Fredoka', system-ui, sans-serif;
  font-weight: 600;
  font-size: 1.15rem;
  margin: 0 auto 14px;
  max-width: 720px;
  line-height: 1.4;
}
.hero-eyebrow strong {
  color: #FBF7EE;
  font-weight: 700;
}

.hero-sub {
  color: #F1E6D3;
  font-size: 1.05rem;
  max-width: 640px;
  margin: 0 auto;
  line-height: 1.55;
}

.hero-domains {
  margin-top: 14px;
  font-size: 0.9rem;
  color: #F1E6D3;
  opacity: 0.85;
}
.hero-domains a {
  color: #F4B821;
  font-weight: 700;
  text-decoration: underline;
}
.hero-domains a:hover {
  color: #E85A47;
}

/* Winner card */
.winner-inner {
  background: #1B2660;
  color: #FBF7EE;
  border-radius: 16px;
}

.winner-grid {
  display: grid;
  grid-template-columns: minmax(0, 220px) 1fr;
  gap: 28px;
  align-items: start;
}

.winner-cover img {
  width: 100%;
  height: auto;
  border-radius: 12px;
  border: 3px solid #F1E6D3;
  box-shadow: 4px 4px 0 0 #0F1435;
  display: block;
}

/* Hero IGDB rating badge */
.igdb-hero {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  background: #F4B821;
  color: #1B2660;
  border: 3px solid #1B2660;
  border-radius: 14px;
  box-shadow: 4px 4px 0 0 #0F1435;
  padding: 10px 18px 12px;
  margin: 14px 0;
}
.igdb-hero-label {
  font-family: 'Fredoka', system-ui, sans-serif;
  font-weight: 700;
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.85;
}
.igdb-hero-score {
  display: flex;
  align-items: baseline;
  gap: 4px;
  line-height: 1;
  margin-top: 2px;
}
.igdb-hero-value {
  font-family: 'Fredoka', system-ui, sans-serif;
  font-weight: 700;
  font-size: 2.6rem;
}
.igdb-hero-suffix {
  font-family: 'Fredoka', system-ui, sans-serif;
  font-weight: 600;
  font-size: 1rem;
  opacity: 0.75;
}
.igdb-hero-score-empty .igdb-hero-suffix {
  font-size: 0.95rem;
  padding: 6px 0 2px;
}
.igdb-hero-meta {
  font-size: 0.78rem;
  font-weight: 600;
  opacity: 0.75;
  margin-top: 2px;
}

.rating-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 8px 0 14px;
}

.rating-pill {
  background: #F4B821;
  color: #1B2660;
  padding: 6px 14px;
  border-radius: 999px;
  font-weight: 700;
  font-family: 'Fredoka', system-ui, sans-serif;
  border: 2px solid #1B2660;
}

.rating-pill-alt {
  background: #E85A47;
  color: #FBF7EE;
}

.rating-pill small {
  opacity: 0.75;
  font-weight: 600;
  margin-left: 4px;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 14px;
}

.tag-chip {
  background: #F1E6D3;
  color: #1B2660;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 700;
}

.tag-chip-alt {
  background: transparent;
  color: #F4B821;
  border: 1.5px solid #F4B821;
}

.game-summary {
  color: #F1E6D3;
  line-height: 1.55;
  margin-bottom: 14px;
}

.winner-facts {
  padding-left: 0;
  margin-bottom: 20px;
}
.winner-facts li {
  color: #F1E6D3;
  padding: 3px 0;
}
.winner-facts strong {
  color: #F4B821;
  margin-right: 6px;
}

.winner-cta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.similar-title {
  color: #F4B821;
  font-family: 'Fredoka', system-ui, sans-serif;
  font-size: 1.15rem;
  margin-bottom: 12px;
}

.similar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 10px;
}

.similar-card {
  background: #0F1435;
  border: 2px solid #F1E6D3;
  border-radius: 10px;
  padding: 6px;
  text-align: center;
  color: #F1E6D3;
  font-size: 0.78rem;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.similar-card img {
  width: 100%;
  height: 130px;
  object-fit: cover;
  border-radius: 6px;
}

@media (max-width: 640px) {
  .winner-grid {
    grid-template-columns: 1fr;
  }
  .winner-cover img {
    max-width: 200px;
    margin: 0 auto;
  }
}

/* FAQ */
.faq-item {
  padding: 14px 0;
  border-bottom: 2px dashed rgba(27, 38, 96, 0.15);
}
.faq-item:last-of-type {
  border-bottom: none;
}
.faq-item h3 {
  color: #1B2660;
}

/* Donate modal */
.donate-modal {
  background: #FBF7EE;
  border: 4px solid #1B2660;
  border-radius: 16px;
  box-shadow: 6px 6px 0 0 #0F1435;
  padding: 28px;
  width: 100%;
  max-width: 460px;
  position: relative;
  color: #1B2660;
}
.donate-close {
  position: absolute;
  top: 8px;
  right: 12px;
  font-size: 1.6rem;
  color: #1B2660;
  background: transparent;
  border: none;
  cursor: pointer;
}
.donate-close:hover {
  color: #E85A47;
}
</style>
