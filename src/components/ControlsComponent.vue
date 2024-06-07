<template>
  <div class="controls">
    <div class="dropDownSelection w-full md:w-1/1 px-4 mb-4 md:mb-0">
      <h2 class="text-2xl mb-4">Filter</h2>
      <input type="text" id="username" name="username" v-model="localUsername" class="form-control mb-4 p-2 border border-gray-400 rounded" placeholder="By Steam Username">
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
import { ref, onMounted, watch } from 'vue'
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
</style>

