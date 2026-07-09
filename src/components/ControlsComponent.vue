<template>
  <div class="w-full">
    <div class="filter-panel relative w-full">
      <h2 class="mb-4 inline-block rounded-lg border-[3px] border-brand-paper bg-brand-gold px-4 py-1 font-display text-2xl font-bold uppercase tracking-wide text-brand-navy shadow-[3px_3px_0_0_#0F1435]">Filter</h2>

      <!-- Steam ID input -->
      <div class="relative mb-4">
        <label for="username" class="sr-only">Steam ID</label>
        <input
          id="username"
          name="username"
          v-model="localUsername"
          type="text"
          placeholder="By Steam Username"
          autocomplete="off"
          class="w-full rounded-lg border-[3px] border-brand-navy bg-brand-cream px-3 py-2 font-body font-semibold text-brand-navy placeholder:text-brand-navy/60 shadow-[3px_3px_0_0_#0F1435] transition-shadow focus:outline-none focus:ring-2 focus:ring-brand-gold focus:shadow-[2px_2px_0_0_#0F1435]"
          @focus="handleUsernameFocus"
          @blur="handleUsernameBlur"
        />

        <!-- Steam ID Help Section -->
        <div
          v-if="showUsernameHelp"
          class="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border-[3px] border-brand-navy bg-brand-paper p-4 text-brand-navy shadow-[3px_3px_0_0_#0F1435] animate-slide-down"
          @mouseenter="handleUsernameFocus"
          @mouseleave="handleUsernameBlur"
        >
          <h4 class="mb-3 font-display text-base font-bold text-brand-navy">How to find your Steam ID</h4>
          <ol class="mb-4 list-inside list-decimal space-y-1 text-sm leading-relaxed text-brand-navy">
            <li>
              Go to your
              <a href="https://steamcommunity.com/my/profile" target="_blank" rel="noopener" class="font-bold text-brand-coral underline transition-colors hover:text-brand-navy">
                Steam profile page
              </a>
            </li>
            <li>Look at the URL in your browser's address bar</li>
            <li>
              Your Steam ID is the long number (e.g.
              <code class="rounded bg-brand-gold px-1.5 py-0.5 font-mono text-xs font-bold text-brand-navy">76561199025593371</code>)
            </li>
            <li>Copy and paste this number into the field above</li>
          </ol>
          <div class="rounded-lg border-l-[5px] border-brand-coral bg-brand-cream p-3 text-sm leading-relaxed text-brand-navy">
            <strong class="font-bold text-brand-navy">Note:</strong>
            Your Steam profile must be public for Wheelhaus to access your games.
            <a href="https://steamcommunity.com/my/edit/settings?" target="_blank" rel="noopener" class="font-bold text-brand-coral underline transition-colors hover:text-brand-navy">
              Make your profile public here
            </a>
          </div>
        </div>
      </div>

      <!-- Category -->
      <label for="category" class="sr-only">Category</label>
      <select
        id="category"
        name="category"
        v-model="localSelectedCategory"
        class="mb-4 w-full appearance-none rounded-lg border-[3px] border-brand-navy bg-brand-cream bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22%231B2660%22><path d=%22M5 8l5 5 5-5z%22/></svg>')] bg-[length:20px_20px] bg-[right_0.75rem_center] bg-no-repeat px-3 py-2 pr-10 font-body font-semibold text-brand-navy shadow-[3px_3px_0_0_#0F1435] transition-shadow focus:outline-none focus:ring-2 focus:ring-brand-gold focus:shadow-[2px_2px_0_0_#0F1435]"
      >
        <option selected :value="null">Choose your Category</option>
        <option v-for="category in categories" :value="category.id" :key="category.id">{{ category.name }}</option>
      </select>

      <!-- Genre -->
      <label for="genre" class="sr-only">Genre</label>
      <select
        id="genre"
        name="genre"
        v-model="localSelectedGenre"
        class="mb-4 w-full appearance-none rounded-lg border-[3px] border-brand-navy bg-brand-cream bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22%231B2660%22><path d=%22M5 8l5 5 5-5z%22/></svg>')] bg-[length:20px_20px] bg-[right_0.75rem_center] bg-no-repeat px-3 py-2 pr-10 font-body font-semibold text-brand-navy shadow-[3px_3px_0_0_#0F1435] transition-shadow focus:outline-none focus:ring-2 focus:ring-brand-gold focus:shadow-[2px_2px_0_0_#0F1435]"
      >
        <option selected :value="null">Choose your Genre</option>
        <option v-for="genre in genres" :value="genre.id" :key="genre.id">{{ genre.name }}</option>
      </select>

      <!-- Tags (multiselect — third-party) -->
      <div class="mb-4">
        <multiselect
          v-model="localSelectedTag"
          :options="tags"
          :multiple="true"
          :taggable="true"
          tag-placeholder="Add this as new tag"
          placeholder="Choose your Tags"
          label="name"
          track-by="name"
          class="brand-multiselect"
          @tag="addTag"
        />
      </div>

      <!-- Toggles -->
      <div class="space-y-3">
        <label for="free" class="flex cursor-pointer select-none items-center gap-3 rounded-lg border-[3px] border-transparent px-1 py-1 font-body font-semibold text-brand-paper transition-colors hover:text-brand-gold">
          <input
            id="free"
            name="free"
            type="checkbox"
            v-model="localFree"
            class="h-5 w-5 rounded border-2 border-brand-navy bg-brand-cream accent-brand-coral focus:outline-none focus:ring-2 focus:ring-brand-gold"
          />
          <span>Only Show Free Games</span>
        </label>

        <label for="vr" class="flex cursor-pointer select-none items-center gap-3 rounded-lg border-[3px] border-transparent px-1 py-1 font-body font-semibold text-brand-paper transition-colors hover:text-brand-gold">
          <input
            id="vr"
            name="vr"
            type="checkbox"
            v-model="localNonVr"
            class="h-5 w-5 rounded border-2 border-brand-navy bg-brand-cream accent-brand-coral focus:outline-none focus:ring-2 focus:ring-brand-gold"
          />
          <span>Exclude VR Games</span>
        </label>

      </div>

      <!-- IGDB rating threshold slider -->
      <div class="mt-5 rounded-xl border-[3px] border-brand-navy bg-brand-navy/40 p-4 shadow-[3px_3px_0_0_#0F1435]">
        <div class="mb-2 flex items-baseline justify-between gap-2">
          <label for="quality-threshold" class="font-display text-sm font-bold uppercase tracking-wide text-brand-gold">
            Min IGDB Rating
          </label>
          <span class="font-display text-2xl font-bold text-brand-paper">
            <template v-if="localQualityThreshold === 0">Off</template>
            <template v-else>{{ localQualityThreshold }}<span class="text-sm text-brand-cream/70">/100</span></template>
          </span>
        </div>

        <input
          id="quality-threshold"
          name="quality-threshold"
          type="range"
          min="0"
          max="100"
          step="1"
          v-model.number="localQualityThreshold"
          class="brand-slider w-full cursor-pointer"
          :aria-valuenow="localQualityThreshold"
          aria-valuemin="0"
          aria-valuemax="100"
        />

        <div class="mt-1 flex justify-between text-[10px] font-bold text-brand-cream/70">
          <span v-for="t in RATING_TICKS" :key="t">{{ t === 0 ? 'Off' : t }}</span>
        </div>

        <p class="mt-2 text-xs font-semibold leading-snug text-brand-cream/80">
          <template v-if="localQualityThreshold === 0">
            <span class="text-brand-coral">All Steam games allowed</span>, including unrated ones.
          </template>
          <template v-else-if="localQualityThreshold >= 60">
            <span class="text-brand-gold">Recommended</span> — only IGDB games rated {{ localQualityThreshold }}+ with 5+ reviewers.
          </template>
          <template v-else>
            Only IGDB games rated {{ localQualityThreshold }}+ with 5+ reviewers.
            <span class="text-brand-gold">Recommended: 60+</span>
          </template>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import axios from 'axios'
import Multiselect from 'vue-multiselect'
import '../../node_modules/vue-multiselect/dist/vue-multiselect.css'

interface Category { id: number; name: string }
interface Genre { id: number; name: string }
interface Tag { id: number; name: string }

const props = defineProps<{
  api: string
  selectedCategory: number | null
  selectedGenre: number | null
  selectedTag: number[] | null
  free: boolean
  nonVr: boolean
  qualityThreshold: number
  username: string | null
}>()

const emit = defineEmits([
  'update:category',
  'update:genre',
  'update:tag',
  'update:free',
  'update:nonVr',
  'update:qualityThreshold',
  'update:username',
])

const categories = ref<Category[]>([])
const genres = ref<Genre[]>([])
const tags = ref<Tag[]>([])
const localSelectedCategory = ref(props.selectedCategory)
const localSelectedGenre = ref(props.selectedGenre)
const localSelectedTag = ref<Tag[]>(
  props.selectedTag
    ? props.selectedTag
        .map((tagId: number) => tags.value.find((t) => t.id === tagId))
        .filter((t): t is Tag => !!t)
    : []
)
const localFree = ref(props.free)
const localNonVr = ref(props.nonVr)
const localQualityThreshold = ref(props.qualityThreshold)
const localUsername = ref(props.username)
const showUsernameHelp = ref(false)
let helpTimeout: ReturnType<typeof setTimeout> | null = null

const sort = (a: Category | Genre | Tag, b: Category | Genre | Tag) => {
  if (a.name < b.name) return -1
  if (b.name < a.name) return 1
  return 0
}

function getTagId(tagName: string): number {
  const tag = tags.value.find((t: { name: string }) => t.name === tagName)
  return tag ? tag.id : -1
}

// Suggested rating tick marks on the slider.
const RATING_TICKS = [0, 20, 40, 60, 80, 100] as const


const loadCategories = async () => {
  try {
    const response = await axios.get(`${props.api}categories`)
    categories.value = response.data.sort(sort)
  } catch (error) { console.error(error) }
}

const loadGenres = async () => {
  try {
    const response = await axios.get(`${props.api}genres`)
    genres.value = response.data.sort(sort)
  } catch (error) { console.error(error) }
}

const loadTags = async () => {
  try {
    const response = await axios.get(`${props.api}tags`)
    tags.value = response.data.sort(sort)
  } catch (error) { console.error(error) }
}

const addTag = (newTag: string) => {
  const existing = tags.value.find((t: { name: string }) => t.name === newTag)
  if (!existing) {
    const newTagObj: Tag = { id: -1, name: newTag }
    tags.value.push(newTagObj)
    localSelectedTag.value.push(newTagObj)
  }
}

const handleUsernameFocus = () => {
  if (helpTimeout) { clearTimeout(helpTimeout); helpTimeout = null }
  showUsernameHelp.value = true
}

const handleUsernameBlur = (event: FocusEvent) => {
  const helpSection = document.querySelector('.filter-panel .animate-slide-down')
  const relatedTarget = event.relatedTarget as Element | null
  if (helpSection && relatedTarget && helpSection.contains(relatedTarget)) return
  helpTimeout = setTimeout(() => { showUsernameHelp.value = false }, 200)
}

const handleClickOutside = (event: MouseEvent) => {
  const panel = document.querySelector('.filter-panel')
  if (panel && !panel.contains(event.target as Node)) {
    showUsernameHelp.value = false
  }
}

watch(localSelectedCategory, (v: any) => emit('update:category', v))
watch(localSelectedGenre, (v: any) => emit('update:genre', v))
watch(localSelectedTag, (v: any[]) => emit('update:tag', v.map(tag => getTagId(tag.name))))
watch(localFree, (v: any) => emit('update:free', v))
watch(localNonVr, (v: any) => emit('update:nonVr', v))
watch(localQualityThreshold, (v: any) => emit('update:qualityThreshold', Number(v)))
watch(localUsername, (v: any) => emit('update:username', v))

onMounted(() => {
  loadCategories()
  loadGenres()
  loadTags()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (helpTimeout) clearTimeout(helpTimeout)
})
</script>

<style lang="css" scoped>
/* Slide-down animation for Steam ID help panel */
@keyframes slideDown {
  from { opacity: 0; max-height: 0; transform: translateY(-10px); }
  to   { opacity: 1; max-height: 320px; transform: translateY(0); }
}
.animate-slide-down {
  animation: slideDown 0.25s ease-out;
}

/* Branded range slider */
.brand-slider {
  appearance: none;
  -webkit-appearance: none;
  height: 8px;
  background: transparent;
  outline: none;
}
.brand-slider::-webkit-slider-runnable-track {
  height: 8px;
  border-radius: 999px;
  background: linear-gradient(90deg, #F1E6D3 0%, #F1E6D3 100%);
  border: 2px solid #0F1435;
}
.brand-slider::-moz-range-track {
  height: 8px;
  border-radius: 999px;
  background: #F1E6D3;
  border: 2px solid #0F1435;
}
.brand-slider::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  height: 22px;
  width: 22px;
  border-radius: 999px;
  background: #E85A47;
  border: 3px solid #0F1435;
  margin-top: -9px;
  cursor: pointer;
  box-shadow: 2px 2px 0 0 #0F1435;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}
.brand-slider::-moz-range-thumb {
  height: 22px;
  width: 22px;
  border-radius: 999px;
  background: #E85A47;
  border: 3px solid #0F1435;
  cursor: pointer;
  box-shadow: 2px 2px 0 0 #0F1435;
}
.brand-slider::-webkit-slider-thumb:hover,
.brand-slider:focus::-webkit-slider-thumb {
  background: #F4B821;
  transform: translate(1px, 1px);
  box-shadow: 1px 1px 0 0 #0F1435;
}
.brand-slider::-moz-range-thumb:hover,
.brand-slider:focus::-moz-range-thumb {
  background: #F4B821;
}

/* vue-multiselect is third-party CSS — target with :deep() */
.brand-multiselect :deep(.multiselect),
.brand-multiselect :deep(.multiselect__tags) {
  border: 3px solid #1B2660;
  border-radius: 10px;
  background: #F1E6D3;
  font-size: 15px;
  color: #1B2660;
  font-weight: 600;
  min-height: calc(2.25rem + 6px);
  box-shadow: 3px 3px 0 0 #0F1435;
}
.brand-multiselect :deep(.multiselect__tags) {
  padding: 8px 40px 0 8px;
  box-shadow: none;
  border: 0;
}
.brand-multiselect :deep(.multiselect__placeholder) {
  color: #1B2660;
  opacity: 0.6;
  padding-top: 2px;
}
.brand-multiselect :deep(.multiselect__content-wrapper) {
  border: 3px solid #1B2660;
  border-top: 0;
  border-radius: 0 0 10px 10px;
  background: #F1E6D3;
}
.brand-multiselect :deep(.multiselect__select::before) {
  border-color: #1B2660 transparent transparent transparent;
}
.brand-multiselect :deep(.multiselect__tag) {
  background-color: #F4B821;
  color: #1B2660;
  font-weight: 700;
  border-radius: 6px;
}
.brand-multiselect :deep(.multiselect__tag-icon) { color: #1B2660; }
.brand-multiselect :deep(.multiselect__tag-icon:hover),
.brand-multiselect :deep(.multiselect__tag:hover) {
  background-color: #E85A47;
  color: #FBF7EE;
}
.brand-multiselect :deep(.multiselect__input),
.brand-multiselect :deep(.multiselect__content) {
  background-color: #F1E6D3;
  color: #1B2660;
}
.brand-multiselect :deep(.multiselect__option--selected) {
  background-color: #F4B821;
  color: #1B2660;
  font-weight: 700;
}
.brand-multiselect :deep(.multiselect__option--highlight),
.brand-multiselect :deep(.multiselect__option--highlight:hover) {
  background-color: #E85A47;
  color: #FBF7EE;
}
</style>
