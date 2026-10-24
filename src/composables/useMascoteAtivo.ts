import { computed, onBeforeUnmount, ref } from 'vue'

/**
 * Estado "canguru em cima" de um card: hover do mouse, foco de TECLADO ou um aceno temporário.
 *
 * O ponteiro sempre manda: ao entrar ou sair, qualquer aceno em andamento é cancelado, para o
 * canguru nunca ficar preso em cima depois que o mouse saiu. O foco só conta quando é de
 * teclado (:focus-visible); o foco deixado por um clique do mouse não prende o canguru.
 *
 * Dois bloqueios contra "hover fantasma":
 * 1. O navegador dispara pointerenter/pointermove sintéticos quando a página rola, o layout muda
 *    ou um card anima de entrada embaixo de um mouse parado. Só vale hover se o mouse se moveu
 *    de verdade (a posição na tela mudou) há pouco tempo.
 * 2. Só um card fica ativo por vez: ativar um desliga o hover e o aceno dos outros.
 */
let ultimoMovimento = 0
let ultimaPosicao: [number, number] | null = null
let escutando = false
let desativarAtual: (() => void) | null = null
let cancelarAcenoAtual: (() => void) | null = null

function escutarMovimentoReal () {
  if (escutando || typeof window === 'undefined') {
    return
  }
  escutando = true
  window.addEventListener('pointermove', (event: PointerEvent) => {
    if (event.pointerType === 'touch') {
      return
    }
    const anterior = ultimaPosicao
    ultimaPosicao = [event.screenX, event.screenY]
    if (!anterior || Math.abs(event.screenX - anterior[0]) + Math.abs(event.screenY - anterior[1]) >= 1) {
      ultimoMovimento = performance.now()
    }
  }, { capture: true, passive: true })
}

const movimentoRecente = () => performance.now() - ultimoMovimento < 120

export function useMascoteAtivo () {
  escutarMovimentoReal()

  const hover = ref(false)
  const foco = ref(false)
  const aceno = ref(false)
  const ativo = computed(() => hover.value || foco.value || aceno.value)

  let fim: number | undefined

  function cancelarAceno () {
    window.clearTimeout(fim)
    aceno.value = false
  }

  // Sobe e acena por um instante (saudação, ciclo automático ou reação a um clique).
  function acenar (ms = 2600) {
    // Não acena por cima de um card que o mouse já está usando.
    if (desativarAtual) {
      return
    }
    cancelarAcenoAtual = cancelarAceno
    aceno.value = true
    window.clearTimeout(fim)
    fim = window.setTimeout(() => (aceno.value = false), ms)
  }

  function desativar () {
    hover.value = false
    cancelarAceno()
    if (desativarAtual === desativar) {
      desativarAtual = null
    }
  }

  function ligar () {
    if (desativarAtual && desativarAtual !== desativar) {
      desativarAtual()
    }
    desativarAtual = desativar
    if (cancelarAcenoAtual && cancelarAcenoAtual !== cancelarAceno) {
      cancelarAcenoAtual()
    }
    hover.value = true
    cancelarAceno()
  }

  // Em tela de toque não existe "passar o mouse": ignora para não ficar preso.
  // O hover liga na entrada só se o mouse acabou de andar; senão espera o próximo movimento real.
  function entrar (event: PointerEvent) {
    if (event.pointerType === 'touch') {
      return
    }
    if (movimentoRecente()) {
      ligar()
    }
  }

  function mover (event: PointerEvent) {
    if (event.pointerType === 'touch' || hover.value || !movimentoRecente()) {
      return
    }
    ligar()
  }

  function sair (event: PointerEvent) {
    if (event.pointerType === 'touch') {
      return
    }
    desativar()
  }

  function focar (event: FocusEvent) {
    foco.value = (event.target as HTMLElement).matches(':focus-visible')
  }

  function desfocar () {
    foco.value = false
  }

  onBeforeUnmount(() => {
    cancelarAceno()
    if (desativarAtual === desativar) {
      desativarAtual = null
    }
    if (cancelarAcenoAtual === cancelarAceno) {
      cancelarAcenoAtual = null
    }
  })

  return {
    ativo,
    hover,
    acenar,
    cancelarAceno,
    // Para usar com v-on="handlers" no elemento do card.
    handlers: {
      pointerenter: entrar,
      pointermove: mover,
      pointerleave: sair,
      pointercancel: sair,
      focusin: focar,
      focusout: desfocar,
    },
  }
}
