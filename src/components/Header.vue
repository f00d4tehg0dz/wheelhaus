<script setup lang="ts">
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import { Bars3Icon, XMarkIcon } from '@heroicons/vue/24/outline'

type NavItem = {
  name: string
  href: string
  external?: boolean
  variant: 'primary' | 'discord' | 'coral' | 'wordmark'
}

const navigation: NavItem[] = [
  { name: 'FAQ', href: '#steamFaq', variant: 'primary' },
  { name: 'Contact', href: 'mailto:adrianvfx@gmail.com', variant: 'primary' },
  {
    name: 'Add Discord Bot',
    href: 'https://discordapp.com/oauth2/authorize?client_id=636141023789056002&scope=bot&permissions=8',
    external: true,
    variant: 'discord',
  },
  {
    name: 'Demodisk',
    href: 'https://www.demodisk.app/',
    external: true,
    variant: 'coral',
  },
]

// Shared sticker button base (no border, chunky dark drop shadow).
const stickerBase =
  'inline-flex items-center gap-2 rounded-lg px-3 py-1.5 font-display text-sm font-bold shadow-[3px_3px_0_0_#0F1435] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#0F1435] focus:outline-none focus:ring-2 focus:ring-brand-gold'

const variantClasses = {
  wordmark: 'bg-brand-coral text-brand-paper text-lg px-4 py-2',
  primary: 'bg-brand-gold text-brand-navy',
  discord: 'bg-[#7289DA] text-brand-paper',
  coral: 'bg-brand-coral text-brand-paper',
}
</script>

<template>
  <Disclosure v-slot="{ open }" as="nav" class="sticky top-0 z-40 border-b-4 border-brand-ink bg-brand-navy shadow-lg">
    <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between gap-4">
        <!-- Wordmark -->
        <a href="/" :class="[stickerBase, variantClasses.wordmark, 'shrink-0']">
          The Wheelhaus
        </a>

        <!-- Desktop nav -->
        <div class="hidden items-center gap-3 sm:flex">
          <a
            v-for="item in navigation"
            :key="item.name"
            :href="item.href"
            :target="item.external ? '_blank' : undefined"
            :rel="item.external ? 'noopener' : undefined"
            :class="[stickerBase, variantClasses[item.variant]]"
          >
            <i v-if="item.variant === 'discord'" class="fab fa-discord" aria-hidden="true"></i>
            <span>{{ item.name }}</span>
          </a>
        </div>

        <!-- Mobile hamburger -->
        <DisclosureButton
          class="inline-flex items-center justify-center rounded-lg bg-brand-gold p-2 text-brand-navy shadow-[3px_3px_0_0_#0F1435] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#0F1435] focus:outline-none focus:ring-2 focus:ring-brand-paper sm:hidden"
        >
          <span class="sr-only">Open main menu</span>
          <Bars3Icon v-if="!open" class="block h-6 w-6" aria-hidden="true" />
          <XMarkIcon v-else class="block h-6 w-6" aria-hidden="true" />
        </DisclosureButton>
      </div>
    </div>

    <!-- Mobile panel -->
    <DisclosurePanel class="sm:hidden">
      <div class="flex flex-col gap-3 border-t-2 border-brand-ink/60 px-4 pb-4 pt-3">
        <DisclosureButton
          v-for="item in navigation"
          :key="'m-' + item.name"
          as="a"
          :href="item.href"
          :target="item.external ? '_blank' : undefined"
          :rel="item.external ? 'noopener' : undefined"
          :class="[stickerBase, variantClasses[item.variant], 'justify-center w-full']"
        >
          <i v-if="item.variant === 'discord'" class="fab fa-discord" aria-hidden="true"></i>
          <span>{{ item.name }}</span>
        </DisclosureButton>
      </div>
    </DisclosurePanel>
  </Disclosure>
</template>
