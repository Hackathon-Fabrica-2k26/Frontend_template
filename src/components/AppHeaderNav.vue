<template>
  <nav aria-label="Principal" class="flex items-center gap-2 sm:gap-4">
    <router-link
      v-for="link in links"
      :key="link.to"
      class="group relative rounded-xl px-3 py-2.5 text-[19px] whitespace-nowrap text-primary no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:px-3.5"
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
</template>

<script setup lang="ts">
  defineProps<{ links: { title: string, to: string }[] }>()
</script>
