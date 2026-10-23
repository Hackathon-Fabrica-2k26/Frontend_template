<template>
  <v-app>
    <Transition mode="out-in" name="page">
      <MarsupiLoading v-if="loading" key="loading" :done="done" fullscreen />
      <router-view v-else key="app" />
    </Transition>
  </v-app>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'

  // O canguru termina de encher em ~1,6s e segura cheio até ~2,2s (ver MarsupiLoading).
  const MIN_LOADING_MS = 2000
  // Duração do pulso final antes de abrir o app.
  const DONE_MS = 700

  const router = useRouter()
  const loading = ref(true)
  const done = ref(false)

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  onMounted(async () => {
    await Promise.all([router.isReady(), wait(MIN_LOADING_MS)])
    done.value = true
    await wait(DONE_MS)
    loading.value = false
  })
</script>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.page-leave-to {
  opacity: 0;
  transform: scale(1.04);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
</style>
