<template>
  <v-dialog v-model="model" max-width="320" scrim="#263d35" transition="dialog-bottom-transition">
    <div aria-describedby="sair-desc" aria-labelledby="sair-titulo" class="sair-modal" role="alertdialog">
      <span aria-hidden="true" class="sair-modal__icone"><LogOut :size="20" /></span>
      <h2 id="sair-titulo" class="mt-3.5 text-lg font-semibold text-primary">Sair da conta?</h2>

      <p id="sair-desc" class="mt-1.5 text-[13px] text-text/75">
        Você precisará entrar de novo para acessar suas turmas.
      </p>

      <div class="mt-5 flex gap-2.5">
        <button autofocus class="b b--contorno" type="button" @click="model = false">Cancelar</button>
        <button class="b b--cheio" type="button" @click="emit('confirmar')">Sair da conta</button>
      </div>
    </div>
  </v-dialog>
</template>

<script setup lang="ts">
  import { LogOut } from '@lucide/vue'

  const model = defineModel<boolean>({ required: true })
  const emit = defineEmits<{ confirmar: [] }>()
</script>

<style scoped>
.sair-modal {
  padding: 24px 20px 20px;
  border-radius: 16px;
  background: #fff;
  text-align: center;
}

.sair-modal__icone {
  display: inline-grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border-radius: 50%;
  background: rgb(179 38 30 / 0.1);
  color: #b3261e;
}

.b {
  flex: 1;
  height: 44px;
  border: 1px solid var(--color-primary);
  border-radius: 12px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition:
    background-color 200ms ease,
    transform 160ms var(--ease-out-expo);
}

.b:active {
  transform: scale(0.98);
}

.b:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.b--contorno {
  background: #fff;
  color: var(--color-primary);
}

.b--contorno:hover {
  background: rgb(169 199 180 / 0.25);
}

.b--cheio {
  background: var(--color-primary);
  color: var(--color-background);
}

.b--cheio:hover {
  background: #2b5b4d;
}
</style>
