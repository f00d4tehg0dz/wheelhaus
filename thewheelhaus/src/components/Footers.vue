<script setup lang="ts">
const date = new Date().getFullYear()
</script>

<template>
    <footer id="footer" class="bg-black py-4">
        <div class="container mx-auto px-4">
            <div class="w-full">
                <p class="text-white text-center" v-cloak>
                    Created by <a class="text-blue-500 hover:text-blue-700" href="https://linktr.ee/adrianchrysanthou" target="_blank">Adrian Chrysanthou</a>,
                    contributor <a class="text-blue-500 hover:text-blue-700" href="https://github.com/Elte156" target="_blank">Elte156</a>,
                    and steamAPI by <a class="text-blue-500 hover:text-blue-700" href="https://cma.dk" target="_blank">CMAndersen</a>,
                    powered by <a class="text-blue-500 hover:text-blue-700" href="http://www.steampowered.com" target="_blank">Steam</a> &copy; {{ date }}
                </p>
            </div>
        </div>
    </footer>
</template>

<style scoped>
footer p {
    margin: 0;
}
</style>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FooterVue'
})
</script>