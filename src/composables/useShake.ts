import type { Ref } from 'vue'

/**
 * Tremida amortecida (como uma porta que não abre) para sinalizar erro em formulários.
 * Com movimento reduzido não anima: o feedback fica por conta das cores do estado de erro.
 */
export function useShake (target: Ref<HTMLElement | null>) {
  return function shake (): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    target.value?.animate(
      [
        { transform: 'translateX(0)' },
        { transform: 'translateX(-12px)' },
        { transform: 'translateX(10px)' },
        { transform: 'translateX(-8px)' },
        { transform: 'translateX(6px)' },
        { transform: 'translateX(-3px)' },
        { transform: 'translateX(0)' },
      ],
      { duration: 520, easing: 'cubic-bezier(0.36, 0.07, 0.19, 0.97)' },
    )
  }
}
