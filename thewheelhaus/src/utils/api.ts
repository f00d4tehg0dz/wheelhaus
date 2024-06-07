import axios from 'axios'

export const loadCategories = async (api: string) => {
  const response = await axios.get(`${api}categories`)
  return response.data.sort(sort)
}

export const loadGenres = async (api: string) => {
  const response = await axios.get(`${api}genres`)
  return response.data.sort(sort)
}

export const loadTags = async (api: string) => {
  const response = await axios.get(`${api}tags`)
  return response.data.sort(sort)
}

const sort = (a: { name: string }, b: { name: string }) => {
  if (a.name < b.name) return -1
  if (b.name < a.name) return 1
  return 0
}
