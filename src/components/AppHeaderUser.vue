<template>
  <v-menu location="bottom end" offset="12">
    <template #activator="{ props: menuProps }">
      <button
        v-bind="menuProps"
        aria-haspopup="menu"
        aria-label="Menu da conta"
        class="grid size-10 shrink-0 cursor-pointer appearance-none place-items-center rounded-full border-0 bg-support p-0 text-[13px] font-semibold tracking-wider text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:size-11"
        type="button"
      >
        {{ initials }}
      </button>
    </template>

    <div
      class="w-72 rounded-3xl bg-white p-2 shadow-[0_2px_4px_rgb(38_61_53/0.06),0_16px_32px_-8px_rgb(38_61_53/0.2),0_32px_48px_-20px_rgb(53_107_91/0.3)]"
      role="menu"
    >
      <div class="flex items-center gap-3 p-3">
        <span class="grid size-12 shrink-0 place-items-center rounded-full bg-support text-sm font-semibold tracking-wider text-text">
          {{ initials }}
        </span>

        <div class="flex min-w-0 flex-col leading-tight">
          <strong class="truncate text-[15px] font-semibold text-text">{{ name || 'Professor(a)' }}</strong>
          <small v-if="email" class="truncate text-[13px] text-primary">{{ email }}</small>
        </div>
      </div>

      <hr class="mx-2 border-support/60">

      <button
        class="mt-2 flex w-full cursor-pointer appearance-none items-center gap-3 rounded-[18px] border-0! bg-transparent px-3 py-2.5 text-left text-[15px] text-text transition-colors duration-200 outline-none! hover:bg-support/25 focus-visible:bg-support/25"
        role="menuitem"
        type="button"
        @click="emit('logout')"
      >
        <LogOut class="text-primary" :size="18" />
        Sair
      </button>
    </div>
  </v-menu>
</template>

<script setup lang="ts">
  import { LogOut } from '@lucide/vue'
  import { computed } from 'vue'

  const props = defineProps<{ name?: string, email?: string }>()
  const emit = defineEmits<{ logout: [] }>()

  // "Ana Paula Souza" -> "AS"; nome ausente cai para "?".
  const initials = computed(() => {
    const parts = (props.name ?? '').trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) {
      return '?'
    }
    const first = parts[0]!.charAt(0)
    const last = parts.length > 1 ? parts.at(-1)!.charAt(0) : ''
    return (first + last).toUpperCase()
  })
</script>
