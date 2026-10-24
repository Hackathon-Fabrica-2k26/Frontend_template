<template>
  <v-menu
    content-class="menu-conta"
    location="bottom end"
    offset="14"
    origin="top right"
    transition="scale-transition"
  >
    <template #activator="{ props: menuProps }">
      <button
        v-bind="menuProps"
        aria-haspopup="menu"
        aria-label="Menu da conta"
        class="grid size-10 shrink-0 cursor-pointer appearance-none place-items-center rounded-[24px] border-0 bg-support p-0 text-[13px] font-semibold tracking-wider text-text transition-[box-shadow,background-color,scale] duration-300 ease-out-expo hover:shadow-[0_0_0_4px_rgb(169_199_180/0.4)] active:scale-95 aria-expanded:shadow-[0_0_0_4px_rgb(169_199_180/0.55),0_8px_18px_-6px_rgb(53_107_91/0.45)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:size-11"
        type="button"
      >
        {{ initials }}
      </button>
    </template>

    <div class="painel" role="menu">
      <div class="painel__topo">
        <span class="painel__avatar">{{ initials }}</span>

        <div class="flex min-w-0 flex-col leading-tight">
          <strong class="truncate text-[15px] font-semibold text-text">{{ name || 'Professor(a)' }}</strong>
          <small v-if="email" class="mt-0.5 truncate text-[13px] text-primary">{{ email }}</small>
          <span class="painel__selo">Professora</span>
        </div>
      </div>

      <div class="mt-2 flex flex-col gap-1">
        <router-link class="item" role="menuitem" to="/perfil">
          <span class="item__icone"><UserRound :size="17" /></span>
          Meu perfil
        </router-link>

        <button class="item item--sair" role="menuitem" type="button" @click="emit('logout')">
          <span class="item__icone"><LogOut :size="17" /></span>
          Sair
        </button>
      </div>
    </div>
  </v-menu>
</template>

<script setup lang="ts">
  import { LogOut, UserRound } from '@lucide/vue'
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

<!-- Sem scoped: o menu do Vuetify é teleportado para fora do componente. -->
<style>
.menu-conta {
  border-radius: 24px;
  background: transparent !important;
  box-shadow: none !important;
  contain: none !important;
  overflow: visible !important;
}

.painel {
  width: 296px;
  padding: 8px;
  border: 1px solid rgb(169 199 180 / 0.7);
  border-radius: 24px;
  background: #fff;
  box-shadow:
    0 2px 4px rgb(38 61 53 / 0.06),
    0 18px 32px -10px rgb(38 61 53 / 0.22),
    0 36px 56px -24px rgb(53 107 91 / 0.38),
    0 0 0 6px rgb(169 199 180 / 0.18);
}

.painel__topo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgb(169 199 180 / 0.32), rgb(247 247 241 / 0.6));
}

.painel__avatar {
  display: grid;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 24px;
  background: var(--color-primary);
  color: var(--color-background);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.painel__selo {
  align-self: flex-start;
  margin-top: 6px;
  padding: 1px 10px;
  border-radius: 24px;
  background: rgb(255 255 255 / 0.8);
  font-size: 11px;
  color: var(--color-text);
}

.painel .item {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 12px;
  padding: 8px 10px;
  border: 0;
  border-radius: 16px;
  background: transparent;
  font-family: inherit;
  font-size: 15px;
  color: var(--color-text);
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  outline: none;
  transition: background-color 200ms ease;
}

.painel .item__icone {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 12px;
  background: rgb(169 199 180 / 0.3);
  color: var(--color-primary);
  transition:
    background-color 200ms ease,
    color 200ms ease,
    translate 300ms var(--ease-out-expo);
}

.painel .item:hover,
.painel .item:focus-visible {
  background: rgb(169 199 180 / 0.22);
}

.painel .item:hover .item__icone,
.painel .item:focus-visible .item__icone {
  background: var(--color-primary);
  color: var(--color-background);
  translate: 2px 0;
}

.painel .item:focus-visible {
  box-shadow: inset 0 0 0 2px var(--color-accent);
}

.painel .item--sair .item__icone {
  background: rgb(179 38 30 / 0.08);
  color: #b3261e;
}

.painel .item--sair:hover,
.painel .item--sair:focus-visible {
  background: rgb(179 38 30 / 0.06);
}

.painel .item--sair:hover .item__icone,
.painel .item--sair:focus-visible .item__icone {
  background: #b3261e;
  color: #fff;
}
</style>
