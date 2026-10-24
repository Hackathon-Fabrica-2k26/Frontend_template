<template>
  <section aria-label="Notificações" class="avisos" role="region">
    <TransitionGroup class="avisos__lista" name="aviso" tag="ol">
      <li v-for="(notice, index) in notices" :key="notice.id" class="avisos__item">
        <AppNotice
          :mascote="index === 0 && notice.type === 'success'"
          :notice="notice"
          @fechar="dismiss(notice.id)"
        />
      </li>
    </TransitionGroup>
  </section>
</template>

<script setup lang="ts">
  import { dismiss, notices } from '@/utils/notify'
</script>

<style scoped>
/* Canto superior direito, abaixo do header, para o canguru ter onde espiar. */
.avisos {
  position: fixed;
  z-index: 3000;
  top: 118px;
  right: 24px;
  width: min(380px, calc(100vw - 32px));
  pointer-events: none;
}

.avisos__lista {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.avisos__item {
  pointer-events: none;
}

/* Entra deslizando com um leve sobressalto; sai rápido. */
.aviso-enter-active {
  transition: opacity 0.3s ease, transform 0.55s cubic-bezier(0.34, 1.4, 0.64, 1);
}

.aviso-leave-active {
  position: absolute;
  width: 100%;
  transition: opacity 0.22s ease, transform 0.3s var(--ease-out-expo, ease);
}

.aviso-move {
  transition: transform 0.4s var(--ease-out-expo, ease);
}

.aviso-enter-from {
  opacity: 0;
  transform: translateX(28px) scale(0.96);
}

.aviso-leave-to {
  opacity: 0;
  transform: translateX(18px);
}

@media (max-width: 640px) {
  .avisos {
    top: 96px;
    right: 16px;
  }
}
</style>
