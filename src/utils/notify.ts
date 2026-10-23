import { reactive } from 'vue'

export type NoticeType = 'success' | 'error' | 'info'

export interface Notice {
  id: number
  type: NoticeType
  message: string
  duration: number
}

const MAX_VISIBLE = 4

// Fila reativa lida por <AppNotifications /> (montado em App.vue).
export const notices = reactive<Notice[]>([])

let seq = 0

export function dismiss (id: number): void {
  const index = notices.findIndex(notice => notice.id === id)
  if (index !== -1) {
    notices.splice(index, 1)
  }
}

function push (type: NoticeType, message: string, duration: number): number {
  // Mesma mensagem de novo: troca o aviso antigo pelo novo em vez de empilhar repetidos.
  const repeated = notices.find(notice => notice.type === type && notice.message === message)
  if (repeated) {
    dismiss(repeated.id)
  }

  const id = ++seq
  notices.unshift({ id, type, message, duration })

  while (notices.length > MAX_VISIBLE) {
    notices.pop()
  }

  return id
}

export const notify = {
  success: (message: string) => push('success', message, 3500),
  error: (message: string) => push('error', message, 6000),
  info: (message: string) => push('info', message, 4500),
}
