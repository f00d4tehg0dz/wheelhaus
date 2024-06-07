<script setup lang="ts">
import { ref } from 'vue'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import { Bars3Icon, XMarkIcon } from '@heroicons/vue/24/outline'

const navigation = [
  { name: 'FAQ', href: '#steamFaq', current: false },
  { name: 'Contact', href: 'mailto:adrianvfx@gmail.com', current: false },
  {
    name: 'Add Discord Bot',
    href: 'https://discordapp.com/oauth2/authorize?client_id=636141023789056002&scope=bot&permissions=8',
    current: false
  }
]

const isOpen = ref(false)
</script>

<template>
  <Disclosure as="nav" class="bg-gray-800">
    <div class="mx-auto nav px-2 sm:px-6 lg:px-8">
      <div class="absolute right-0 flex items-center sm:hidden">
          <!-- Mobile menu button-->
          <DisclosureButton class="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
            <span class="sr-only">Open main menu</span>
            <Bars3Icon v-if="!isOpen" class="block h-6 w-6" aria-hidden="true" />
            <XMarkIcon v-else class="block h-6 w-6" aria-hidden="true" />
          </DisclosureButton>
        </div>
      <div class="relative flex h-16 items-center justify-between">
        
        <div class="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
          <div class="flex flex-shrink-0 items-center">
            <a class="text-white text-md font-bold" href="/">The Wheelhaus</a>
          </div>
          <div class="hidden sm:ml-6 sm:block">
            <div class="flex space-x-4 nav-items">
              <a v-for="item in navigation" :key="item.name" :href="item.href" :class="[item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white', 'rounded-md px-3 py-2 text-md font-medium']" :aria-current="item.current ? 'page' : undefined">
                <span v-if="item.name === 'Add Discord Bot'">
                  <button type="button" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    <i class="fab fa-discord"></i>&nbsp; {{ item.name }} &nbsp;
                  </button>
                </span>
                <span v-else>
                  {{ item.name }}
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <DisclosurePanel class="sm:hidden">
      <div class="space-y-1 px-2 pb-3 pt-2">
        <DisclosureButton v-for="item in navigation" :key="item.name" as="a" :href="item.href" :class="[item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white', 'block rounded-md px-3 py-2 text-base font-medium']" :aria-current="item.current ? 'page' : undefined">
          <span v-if="item.name === 'Add Discord Bot'">
            <button type="button" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              <i class="fab fa-discord"></i>&nbsp; {{ item.name }} &nbsp;
            </button>
          </span>
          <span v-else>
            {{ item.name }}
          </span>
        </DisclosureButton>
      </div>
    </DisclosurePanel>
  </Disclosure>
</template>

<style scoped>
.nav {
  display:flex;
  justify-content: flex-start;
}
.nav-items {
  display:flex;
  align-items: center;
}
</style>