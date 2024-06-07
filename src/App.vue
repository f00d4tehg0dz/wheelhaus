<script setup lang="ts">
import { ref } from 'vue'
import Header from './components/Header.vue'
import Footer from './components/Footers.vue'
import WheelComponent from './components/WheelComponent.vue'
import ControlsComponent from './components/ControlsComponent.vue'

const api = ref('https://steam.cma.dk/')
const enableSound = ref(true)
const selectedCategory = ref<string | null>(null)
const selectedGenre = ref<string | null>(null)
const selectedTag = ref<string[]>([])
const username = ref<string | null>(null)
const free = ref(false)
const nonVr = ref(false)
const winner = ref<Game | null>(null)

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
}
</script>

<template>
  <div>
    <Header></Header>
    <div class="jumbotron bg-gray-800 text-white p-6">
      <div class="container mx-auto px-4">
        <div class="flex flex-wrap -mx-4">
          <div class="w-full md:w-1/4 px-4 mb-4 md:mb-0">
            <ControlsComponent
              :api="api"
              :selectedCategory="selectedCategory"
              :selectedGenre="selectedGenre"
              :selectedTag="selectedTag"
              :free="free"
              :nonVr="nonVr"
              :username="username"
              @update:category="selectedCategory = $event"
              @update:genre="selectedGenre = $event"
              @update:tag="selectedTag = $event"
              @update:free="free = $event"
              @update:nonVr="nonVr = $event"
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
              :enableSound="enableSound"
              @input="winner = $event"
            />
          </div>
          <div class="w-full md:w-1/4 px-4 mb-4 md:mb-0 flex justify-center items-center">
            <button @click="enableSound = !enableSound" class="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
              {{ enableSound ? 'Mute Sound' : 'Unmute Sound' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="container mx-auto px-4 py-6">
      <div v-if="winner" class="w-full mb-6 steamContent opacity-0 transition-opacity duration-500 ease-in-out" :class="{ 'opacity-100': winner }">
        <div class="bg-gray-700 p-6 rounded shadow-lg">
          <ul class="list-none">
            <li class="gameNameSelected text-xl font-bold mb-2">{{ winner.name }}</li>
            <div id="gameInfos">
              <div class="appIDDescription" v-html="winner.description.substr(0, 375) + '...'"></div>
              <div class="gameNameSelectedPrice mb-2">Game Price: {{ winner.price }}</div>
              <div class="gameNameSelectedRating mb-2">Meta Critic Rating: {{ winner.score || 'None' }}</div>
            </div>
            <li v-if="winner.time_played" class="gameNameSelectedPlayTime mb-2">You have played this game for {{ winner.time_played }} hours</li>
            <li class="mb-2">
              <button class="launchGame bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" @click="startPlaying">Launch the Game</button>
            </li>
          </ul>
        </div>
      </div>
      <div class="w-full">
        <div id="steamFaq">
          <h1 class="text-2xl font-bold mb-4">Does this access every Steam Game?</h1>
          <p class="mb-4">Yes! thanks to <a href="https://cma.dk" target="_blank" class="text-blue-500 hover:text-blue-700">CMAndersen</a></p>
          <h1 class="text-2xl font-bold mb-4">Why do some Steam Games have no image?</h1>
          <p class="mb-4">Certain games in the Steam library are missing the image ID. So you will have an empty spot</p>
          <h1 class="text-2xl font-bold mb-4">Your Steam Username Library not loading?</h1>
          <p class="mb-4">
            Your Steam profile and game library needs to be publicly available.
            If it's set to private or friends-only, thewheelhaus cannot read your game library.
            You can visit <a href="https://support.steampowered.com/kb_article.php?ref=4113-YUDH-6401" target="_blank" class="text-blue-500 hover:text-blue-700"><b>here</b></a> to change your "Game Details" to public.
          </p>
          <h1 class="text-2xl font-bold mb-4">Can I monetarily thank you?</h1>
          <p class="mb-4"><strong>Sure!</strong></p>
          <p class="mb-4">Bitcoin: <strong>bc1qj2escmrpphnr3uj4xe7whch57l593uyxqh0ese</strong></p>
          <p class="mb-4">Ethereum: <strong>0x4eb833601a09d0A54860D3f10c25864e76Cd0559</strong></p>
          <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top" class="mb-4">
            <input type="hidden" name="cmd" value="_donations" />
            <input type="hidden" name="business" value="adrianvfx@gmail.com" />
            <input type="hidden" name="item_name" value="Wheelhaus Website" />
            <input type="hidden" name="currency_code" value="USD" />
            <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
            <img alt="" src="https://www.paypal.com/en_US/i/scr/pixel.gif" width="1" height="1" />
          </form>
          <p class="mb-4">How can I contact you?</p>
          <p>You can email me at <a href="mailto:adrianvfx@gmail.com" class="text-blue-500 hover:text-blue-700">adrianvfx@gmail.com</a></p>
        </div>
      </div>
    </div>
    <Footer></Footer>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
.steamContent {
  transition: opacity 0.5s ease-in-out;
}
</style>