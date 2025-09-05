<script setup lang="ts">
import { ref } from 'vue'
import Header from './components/Header.vue'
import Footer from './components/Footers.vue'
import WheelComponent from './components/WheelComponent.vue'
import ControlsComponent from './components/ControlsComponent.vue'
import { inject } from '@vercel/analytics'
const api = ref('https://steam.cma.dk/')
const enableSound = ref(true)
const selectedCategory = ref<string | null>(null)
const selectedGenre = ref<string | null>(null)
const selectedTag = ref<string[]>([])
const username = ref<string | null>(null)
const free = ref(false)
const nonVr = ref(false)
const winner = ref<Game | null>(null)

const showDonateModal = ref(false)

// Initialize Vercel Analytics
inject()

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
            You can visit <a href="https://steamcommunity.com/my/edit/settings?" target="_blank" class="text-blue-500 hover:text-blue-700" aria-label="Steam Privacy Profile Settings"><b>the Steam Privacy Profile Settings</b></a> to change your "Game Details" to public.
          </p>
          <div class="mb-4">
            <h1 class="text-2xl font-bold mb-4">How can I contact you?</h1>
            <p>You can email me at <a href="mailto:adrianvfx@gmail.com" class="text-blue-500 hover:text-blue-700">adrianvfx@gmail.com</a></p>
          </div>
          <button @click="showDonateModal = true" class="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded mb-4">Donate to thewheelhaus</button>
          <div v-if="showDonateModal" class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
            <div class="bg-gray-800 p-8 rounded shadow-lg w-full max-w-md relative">
              <button @click="showDonateModal = false" class="absolute top-2 right-2 text-white text-2xl">&times;</button>
              <h2 class="text-xl font-bold mb-4 text-white">Donate to thewheelhaus</h2>
              <div class="mb-4">
                <span class="text-white font-semibold">Bitcoin:</span>
                <span class="text-orange-400 select-all"> 3EDFUfa5bRKZH478m5JtMdXn5PYoxrJjH7 </span>
              </div>
              <div class="mb-4">
                <span class="text-white font-semibold">Ethereum:</span>
                <span class="text-blue-400 select-all"> 0x4d11D9c4518f341A458d0EB055b9D9f977C1A992 </span>
              </div>
              <div class="text-gray-300 text-sm">Thank you for supporting the project!</div>
            </div>
          </div>
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