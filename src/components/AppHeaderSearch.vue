<template>
  <form
    class="flex h-11 items-center overflow-hidden rounded-[18px] border border-primary bg-background text-primary transition-[width,box-shadow] duration-500 ease-out-expo motion-reduce:transition-none"
    :class="open ? 'w-72 ring-[3px] ring-accent/30 max-sm:w-52' : 'w-11'"
    role="search"
    @focusout="onFocusOut"
    @submit.prevent="submit"
  >
    <button
      :aria-expanded="open"
      aria-label="Buscar"
      class="grid size-[42px] shrink-0 cursor-pointer appearance-none place-items-center border-0! bg-transparent p-0 text-primary outline-none! focus-visible:outline-none!"
      type="button"
      @click="toggle"
    >
      <Search aria-hidden="true" :size="18" />
    </button>

    <input
      ref="input"
      v-model="query"
      aria-label="Buscar"
      autocomplete="off"
      class="min-w-0 flex-1 appearance-none border-0! bg-transparent p-0 pr-4 text-[15px] text-text shadow-none! outline-none! transition-opacity duration-300 placeholder:text-primary/80 focus:outline-none! focus-visible:outline-none!"
      :class="open ? 'opacity-100 delay-150' : 'pointer-events-none opacity-0'"
      placeholder="Buscar"
      :tabindex="open ? 0 : -1"
      type="search"
      @keydown.esc="close"
    >
  </form>
</template>

<script setup lang="ts">
  import { Search } from '@lucide/vue'
  import { nextTick, ref } from 'vue'

  const emit = defineEmits<{ submit: [query: string] }>()
  const query = ref('')
  const open = ref(false)
  const input = ref<HTMLInputElement>()

  async function toggle () {
    if (open.value && query.value.trim()) {
      submit()
      return
    }
    open.value = !open.value
    if (open.value) {
      await nextTick()
      input.value?.focus()
    }
  }

  function close () {
    open.value = false
  }

  // Recolhe quando o foco sai do campo e não há nada digitado.
  function onFocusOut (event: FocusEvent) {
    const form = event.currentTarget as HTMLElement
    if (!form.contains(event.relatedTarget as Node | null) && !query.value.trim()) {
      close()
    }
  }

  function submit () {
    const value = query.value.trim()
    if (value) {
      emit('submit', value)
    }
  }
</script>
