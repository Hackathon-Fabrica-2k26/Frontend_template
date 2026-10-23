import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * Contagem regressiva baseada em timestamp (não acumula atraso se a aba
 * ficar em segundo plano, como aconteceria com um simples `remaining--`).
 */
export function useCountdown (seconds: number) {
  const remaining = ref(seconds)
  let endsAt = 0
  let timer: ReturnType<typeof setInterval> | undefined

  function stop () {
    if (timer) {
      clearInterval(timer)
      timer = undefined
    }
  }

  function tick () {
    remaining.value = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000))
    if (remaining.value === 0) {
      stop()
    }
  }

  function restart (from: number = seconds) {
    stop()
    endsAt = Date.now() + from * 1000
    remaining.value = from
    timer = setInterval(tick, 250)
  }

  const isRunning = computed(() => remaining.value > 0)

  // 24 -> "00:24"
  const formatted = computed(() => {
    const mm = String(Math.floor(remaining.value / 60)).padStart(2, '0')
    const ss = String(remaining.value % 60).padStart(2, '0')
    return `${mm}:${ss}`
  })

  onMounted(() => restart())
  onBeforeUnmount(stop)

  return { remaining, formatted, isRunning, restart }
}
