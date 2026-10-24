import { computed, onBeforeUnmount, ref } from 'vue'

/**
 * Estado "canguru em cima" de um card: hover do mouse, foco de TECLADO ou um aceno temporário.
 *
 * O ponteiro sempre manda: ao entrar ou sair, qualquer aceno em andamento é cancelado, para o
 * canguru nunca ficar preso em cima depois que o mouse saiu. O foco só conta quando é de
 * teclado (:focus-visible); o foco deixado por um clique do mouse não prende o canguru.
 */
export function useMascoteAtivo () {
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
    aceno.value = true
    window.clearTimeout(fim)
    fim = window.setTimeout(() => (aceno.value = false), ms)
  }

  // Em tela de toque não existe "passar o mouse": ignora para não ficar preso.
  function entrar (event: PointerEvent) {
    if (event.pointerType === 'touch') {
      return
    }
    hover.value = true
    cancelarAceno()
  }

  function sair (event: PointerEvent) {
    if (event.pointerType === 'touch') {
      return
    }
    hover.value = false
    cancelarAceno()
  }

  function focar (event: FocusEvent) {
    foco.value = (event.target as HTMLElement).matches(':focus-visible')
  }

  function desfocar () {
    foco.value = false
  }

  onBeforeUnmount(cancelarAceno)

  return {
    ativo,
    hover,
    acenar,
    cancelarAceno,
    // Para usar com v-on="handlers" no elemento do card.
    handlers: {
      pointerenter: entrar,
      pointerleave: sair,
      pointercancel: sair,
      focusin: focar,
      focusout: desfocar,
    },
  }
}
