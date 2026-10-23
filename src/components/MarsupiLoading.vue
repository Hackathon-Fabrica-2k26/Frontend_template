<template>
  <div
    aria-live="polite"
    class="marsupi-loading"
    :class="{ 'marsupi-loading--full': fullscreen, 'marsupi-loading--done': done }"
    role="status"
  >
    <div aria-hidden="true" class="symbol">
      <div class="layer outline" />

      <div class="layer fill" />
    </div>

    <p class="label">{{ label }}</p>

    <div aria-hidden="true" class="dots">
      <span class="dot dot--primary" />
      <span class="dot dot--support" />
      <span class="dot dot--accent" />
    </div>
  </div>
</template>

<script setup lang="ts">
  withDefaults(defineProps<{ label?: string, fullscreen?: boolean, done?: boolean }>(), {
    label: 'Carregando...',
    fullscreen: false,
    done: false,
  })
</script>

<style scoped>
.marsupi-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  color: var(--color-text);
}

.marsupi-loading--full {
  min-height: 100dvh;
  background: var(--color-background);
}

/* O canguru é uma máscara: a base laranja fica fixa e o verde sobe de baixo para cima. */
.symbol {
  position: relative;
  width: 92px;
  height: 130px;
}

.layer {
  position: absolute;
  inset: 0;
  mask: url('@/assets/logoBase.webp') center / contain no-repeat;
}

.outline {
  background: var(--color-primary);
  opacity: 0.18;
}

.fill {
  background: var(--color-primary);
  animation: marsupi-fill 2.6s cubic-bezier(0.65, 0, 0.35, 1) infinite;
}

.label {
  font-size: 20px;
  font-weight: var(--font-weight-semibold);
}

.dots {
  display: flex;
  gap: 8px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  animation: bounce 1.2s ease-in-out infinite;
}

.dot--primary { background: var(--color-primary); }
.dot--support { background: var(--color-support); animation-delay: 0.15s; }
.dot--accent { background: var(--color-accent); animation-delay: 0.3s; }

/* Fim: o preenchimento trava cheio, o canguru dá um pulso e o texto e os pontos saem. */
.marsupi-loading--done .fill {
  animation: none;
  clip-path: inset(0);
  opacity: 1;
}

.marsupi-loading--done .symbol {
  animation: pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.marsupi-loading--done .label,
.marsupi-loading--done .dots {
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

@keyframes pop {
  0% { transform: scale(1); }
  45% { transform: scale(1.12); }
  100% { transform: scale(1); }
}

@keyframes marsupi-fill {
  0% { clip-path: inset(100% 0 0); opacity: 1; }
  62% { clip-path: inset(0); opacity: 1; }
  86% { clip-path: inset(0); opacity: 1; }
  100% { clip-path: inset(0); opacity: 0; }
}

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
  40% { transform: scale(1.3); opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .dot, .symbol { animation: none !important; }
  .fill { animation: none; clip-path: inset(0); }
}
</style>
