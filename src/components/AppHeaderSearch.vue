<template>
  <form
    class="flex h-10 w-36 items-center overflow-hidden rounded-[18px] border border-primary bg-background text-primary transition-shadow duration-300 focus-within:ring-[3px] focus-within:ring-accent/30 sm:h-11 sm:w-56 md:w-72"
    role="search"
    @submit.prevent="submit"
  >
    <button
      aria-label="Buscar"
      class="grid size-9 shrink-0 cursor-pointer appearance-none place-items-center border-0! bg-transparent p-0 text-primary outline-none! focus-visible:outline-none! sm:size-[42px]"
      type="submit"
    >
      <Search aria-hidden="true" :size="18" />
    </button>

    <input
      v-model="query"
      aria-label="Buscar"
      autocomplete="off"
      class="min-w-0 flex-1 appearance-none border-0! bg-transparent p-0 pr-3 text-[14px] text-text shadow-none! outline-none! placeholder:text-primary/80 focus:outline-none! focus-visible:outline-none! sm:pr-4 sm:text-[15px]"
      placeholder="Buscar"
      type="search"
    >
  </form>
</template>

<script setup lang="ts">
  import { Search } from '@lucide/vue'
  import { ref } from 'vue'

  const emit = defineEmits<{ submit: [query: string] }>()
  const query = ref('')

  function submit () {
    const value = query.value.trim()
    if (value) {
      emit('submit', value)
    }
  }
</script>
