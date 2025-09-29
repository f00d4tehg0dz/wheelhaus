<template>
  <div class="controls">
    <div class="dropDownSelection w-full md:w-1/1 px-4 mb-4 md:mb-0">
      <h2 class="text-2xl mb-4">Filter</h2>
      <input type="text" id="username" name="username" v-model="localUsername" class="form-control mb-4 p-2 border border-gray-400 rounded" placeholder="By Steam Username"
        title="Enter your Steam ID (not display name). To find it: 1) Go to your Steam profile page, 2) Look at the URL - your Steam ID is the long number (e.g., 76561199025593371). Your profile must be public: https://steamcommunity.com/my/edit/settings?"
        @focus="handleUsernameFocus"
        @blur="handleUsernameBlur"
      >
      <!-- Steam ID Help Section -->
      <div v-if="showUsernameHelp" class="steam-id-help mb-4" @mouseenter="handleUsernameFocus" @mouseleave="handleUsernameBlur">
        <div class="help-content">
          <h4 class="help-title">How to find your Steam ID:</h4>
          <ol class="help-steps">
            <li>Go to your <a href="https://steamcommunity.com/my/profile" target="_blank" class="help-link">Steam profile page</a></li>
            <li>Look at the URL in your browser's address bar</li>
            <li>Your Steam ID is the long number (e.g., <code class="steam-id-example">76561199025593371</code>)</li>
            <li>Copy and paste this number into the field above</li>
          </ol>
          <div class="help-note">
            <strong>Note:</strong> Your Steam profile must be public for Wheelhaus to access your games. 
            <a href="https://steamcommunity.com/my/edit/settings?" target="_blank" class="help-link">Make your profile public here</a>
          </div>
        </div>
      </div>
      <select class="form-control mb-4 p-2 border border-gray-400 rounded" id="category" name="category" v-model="localSelectedCategory">
        <option selected :value="null">Choose your Category</option>
        <option v-for="category in categories" :value="category.id" :key="category.id">{{ category.name }}</option>
      </select>
      <select class="form-control mb-4 p-2 border border-gray-400 rounded" id="genre" name="genre" v-model="localSelectedGenre">
        <option selected :value="null">Choose your Genre</option>
        <option v-for="genre in genres" :value="genre.id" :key="genre.id">{{ genre.name }}</option>
      </select>
      <div class="form-group mb-4">
        <multiselect 
          v-model="localSelectedTag" 
          :options="tags" 
          :multiple="true" 
          :taggable="true"
          tag-placeholder="Add this as new tag"
          placeholder="Choose your Tags"
          label="name"
          track-by="name"
          @tag="addTag"
          class="form-control p-2 border border-gray-400 rounded dropDownSelection"
        />
      </div>
      <div class="form-check mb-4">
        <label class="form-check-label text-white" for="free">
          <input class="form-check-input mr-2" id="free" name="free" type="checkbox" v-model="localFree">
          Only Show Free Games
        </label>
      </div>
      <div class="form-check">
        <label class="form-check-label text-white" for="vr">
          <input class="form-check-input mr-2" id="vr" name="vr" type="checkbox" v-model="localNonVr">
          Exclude VR Games
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import axios from 'axios'
import Multiselect from 'vue-multiselect'
import '../../node_modules/vue-multiselect/dist/vue-multiselect.css'

interface Category {
  id: number
  name: string
}

interface Genre {
  id: number
  name: string
}

interface Tag {
  id: number
  name: string
}

const props = defineProps<{
  api: string
  selectedCategory: string | null
  selectedGenre: string | null
  selectedTag: string[] | null
  free: boolean
  nonVr: boolean
  username: string | null
}>()

const emit = defineEmits([
  'update:category',
  'update:genre',
  'update:tag',
  'update:free',
  'update:nonVr',
  'update:username'
])

const categories = ref<Category[]>([])
const genres = ref<Genre[]>([])
const tags = ref<Tag[]>([])
const localSelectedCategory = ref(props.selectedCategory)
const localSelectedGenre = ref(props.selectedGenre)
const localSelectedTag = ref(props.selectedTag ? props.selectedTag.map((tagName: string) => ({ id: getTagId(tagName), name: tagName })) : [])
const localFree = ref(props.free)
const localNonVr = ref(props.nonVr)
const localUsername = ref(props.username)
const showUsernameHelp = ref(false)
let helpTimeout: number | null = null

const loadCategories = async () => {
  try {
    const response = await axios.get(`${props.api}categories`)
    categories.value = response.data.sort(sort)
  } catch (error) {
    console.error(error)
  }
}

const loadGenres = async () => {
  try {
    const response = await axios.get(`${props.api}genres`)
    genres.value = response.data.sort(sort)
  } catch (error) {
    console.error(error)
  }
}

const loadTags = async () => {
  try {
    const response = await axios.get(`${props.api}tags`)
    tags.value = response.data.sort(sort)
  } catch (error) {
    console.error(error)
  }
}

const sort = (a: Category | Genre | Tag, b: Category | Genre | Tag) => {
  if (a.name < b.name) {
    return -1
  }
  if (b.name < a.name) {
    return 1
  }
  return 0
}

const getTagId = (tagName: string): number => {
  const tag = tags.value.find((tag: { name: string }) => tag.name === tagName)
  return tag ? tag.id : -1
}

const addTag = (newTag: string) => {
  const existingTag = tags.value.find((tag: { name: string }) => tag.name === newTag)
  if (!existingTag) {
    const newTagObj: Tag = { id: -1, name: newTag }
    tags.value.push(newTagObj)
    localSelectedTag.value.push(newTagObj)
  }
}

const handleUsernameFocus = () => {
  if (helpTimeout) {
    clearTimeout(helpTimeout)
    helpTimeout = null
  }
  showUsernameHelp.value = true
}

const handleUsernameBlur = (event: FocusEvent) => {
  // Check if the focus is moving to an element inside the help section
  const helpSection = document.querySelector('.steam-id-help')
  const relatedTarget = event.relatedTarget as Element
  
  if (helpSection && relatedTarget && helpSection.contains(relatedTarget)) {
    return // Don't close if focus is moving to help section
  }
  
  helpTimeout = setTimeout(() => {
    showUsernameHelp.value = false
  }, 200) // Small delay to allow clicking on help links
}

const handleClickOutside = (event: MouseEvent) => {
  const helpSection = document.querySelector('.steam-id-help')
  const usernameInput = document.querySelector('#username')
  
  if (helpSection && !helpSection.contains(event.target as Node) && 
      usernameInput && !usernameInput.contains(event.target as Node)) {
    showUsernameHelp.value = false
  }
}

watch(localSelectedCategory, (newValue: any) => emit('update:category', newValue))
watch(localSelectedGenre, (newValue: any) => emit('update:genre', newValue))
watch(localSelectedTag, (newValue: any[]) => {
  const tagIds = newValue.map(tag => getTagId(tag.name))
  emit('update:tag', tagIds)
})
watch(localFree, (newValue: any) => emit('update:free', newValue))
watch(localNonVr, (newValue: any) => emit('update:nonVr', newValue))
watch(localUsername, (newValue: any) => emit('update:username', newValue))

onMounted(() => {
  loadCategories()
  loadGenres()
  loadTags()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (helpTimeout) {
    clearTimeout(helpTimeout)
  }
})
</script>

<style lang="css" scoped>
.controls {
	display: flex;
	flex-wrap: wrap;
	flex-direction: row;
	align-content: flex-start;
	justify-content: space-between;
	align-items: stretch;
}

.dropDownSelection {
	position: relative;
}
.dropDownSelection .button {
	-webkit-transition: all .25s ease-in-out;
	-moz-transition: all .25s ease-in-out;
	-ms-transition: all .25s ease-in-out;
	-o-transition: all .25s ease-in-out;
	transition: all .25s ease-in-out;
	font-size: 1rem;
	text-align: center;
	white-space: nowrap;
	vertical-align: middle;
	cursor: pointer;
	border: 3px solid #000000;
	border-radius: 0;
  margin-bottom: 20px;
}
.dropDownSelection .button:hover {
	opacity: .5;
}
.dropDownSelection h2 {
	color: #fff;
}
.dropDownSelection >>> .multiselect {
  border: 3px solid #000000;
  border-radius: 0;
	background: #fe8204;
	font-size: 16px;
	color: #424242;
  min-height: calc(2.25rem + 2px);
  height: calc(2.25rem + 2px);
  padding: 0;
}
.dropDownSelection >>> .multiselect__placeholder {
	color: #424242;
}
.dropDownSelection >>> .multiselect__tags, .multiselect__content-wrapper {
	border: 0px solid #000000;
  border-radius: 0;
	background: #fe8204;
	font-size: 16px;
	color: #424242;
}
.dropDownSelection >>> .multiselect__select::before {
  margin-top: 0;
  border-color:#424242 transparent transparent transparent;
}
.dropDownSelection >>> .multiselect__tags {
	display: block;
	border-radius: 0px;
	background: #fe8204;
}
.dropDownSelection >>> .multiselect--above .multiselect__content-wrapper {
	bottom: 100%;
	border-bottom-left-radius: 0;
	border-bottom-right-radius: 0;
	border-top-left-radius: 5px;
	border-top-right-radius: 5px;
	border-bottom: none;
}
.dropDownSelection >>> .multiselect__tags .multiselect__tag {
  background-color: #4ac200;
	color: #424242;
}
.dropDownSelection >>> .multiselect__tags .multiselect__tag:hover {
  background-color: #59e104;
  color: #424242;
}
.dropDownSelection >>> .multiselect__tags .multiselect__tag-icon {
	color: #424242;
}
.dropDownSelection >>> .multiselect__input {
	color: #424242;
  background-color: #fe8204;
}
.dropDownSelection >>> .multiselect__content {
	background-color: #fe8204;
	color: #424242;
}
.dropDownSelection >>> .multiselect__option--selected {
    background-color: rgb(59 130 246 / 0.5);
    color: #424242;
    font-weight: bold;
}
.dropDownSelection >>> .multiselect__option--highlight {
	background-color: rgb(59 130 246 / 0.5);
	color: #424242;
}
.dropDownSelection >>> .multiselect__option--highlight:hover {
  background-color:rgb(59 130 246 / 0.5);
}

/* Steam ID Help Section Styles */
.steam-id-help {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  animation: slideDown 0.3s ease-out;
  overflow: hidden;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    max-height: 300px;
    transform: translateY(0);
  }
}

.help-content {
  background-color: #2b2b2b;
  border: 2px solid #555;
  border-radius: 8px;
  padding: 16px;
  margin-top: 8px;
}

.help-title {
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
  margin-top: 0;
}

.help-steps {
  color: #e0e0e0;
  margin: 0 0 16px 0;
  padding-left: 20px;
}

.help-steps li {
  margin-bottom: 8px;
  line-height: 1.4;
}

.help-link {
  color: #4ac200;
  text-decoration: underline;
  transition: color 0.2s ease;
}

.help-link:hover {
  color: #59e104;
}

.steam-id-example {
  background-color: #424242;
  color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.help-note {
  background-color: #3a3a3a;
  border-left: 4px solid #fe8204;
  padding: 12px;
  border-radius: 4px;
  color: #e0e0e0;
  font-size: 14px;
  line-height: 1.4;
}

.help-note strong {
  color: #fff;
}
</style>

