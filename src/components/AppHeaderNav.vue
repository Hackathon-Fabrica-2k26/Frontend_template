<template>
  <nav v-if="mdAndUp" aria-label="Principal" class="flex items-center gap-2 sm:gap-4">
    <router-link
      v-for="link in links"
      :key="link.to"
      class="group relative rounded-xl px-3 py-2.5 text-[19px] whitespace-nowrap text-primary no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:px-3.5"
      :class="{ 'font-semibold text-text!': isLinkActive(link.to) }"
      exact-active-class="font-semibold text-text!"
      :to="link.to"
    >
      {{ link.title }}
      <span
        aria-hidden="true"
        class="absolute inset-x-3 bottom-0.5 h-[3px] origin-left scale-x-0 rounded-full bg-accent transition-transform duration-500 ease-out-expo group-hover:scale-x-100 group-[.font-semibold]:scale-x-100 motion-reduce:transition-none"
      />
    </router-link>
  </nav>

  <v-menu v-else location="bottom start" offset="12">
    <template #activator="{ props: menuProps }">
      <v-btn
        v-bind="menuProps"
        aria-label="Menu de navegação"
        color="primary"
        density="comfortable"
        icon
        variant="text"
      >
        <Menu :size="22" />
      </v-btn>
    </template>

    <v-list class="min-w-48 rounded-2xl py-2" density="comfortable" nav>
      <v-list-item
        v-for="link in links"
        :key="link.to"
        :active="isLinkActive(link.to)"
        :title="link.title"
        :to="link.to"
      />
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
  import { Menu } from '@lucide/vue'
  import { useRoute } from 'vue-router'
  import { useDisplay } from 'vuetify'

  defineProps<{ links: { title: string, to: string }[] }>()

  const route = useRoute()
  const { mdAndUp } = useDisplay()

  function isLinkActive (to: string): boolean {
    if (to === '/') {
      return route.path === '/' || route.path === '/turmas'
    }
    return route.path === to || route.path.startsWith(`${to}/`)
  }
</script>
