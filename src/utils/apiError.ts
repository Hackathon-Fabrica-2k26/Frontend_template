// Extrai a mensagem útil de um erro do DRF: {"detail": ...}, {"campo": ["msg"]} ou lista.
function extractMessage (data: unknown): string | undefined {
  if (!data) {
    return undefined
  }
  if (typeof data === 'string') {
    return data
  }
  if (Array.isArray(data)) {
    return typeof data[0] === 'string' ? data[0] : undefined
  }
  if (typeof data === 'object') {
    const record = data as Record<string, unknown>
    if (typeof record.detail === 'string') {
      return record.detail
    }
    for (const value of Object.values(record)) {
      const msg = extractMessage(value)
      if (msg) {
        return msg
      }
    }
  }
  return undefined
}

export function buildApiError (error: unknown, fallback: string): Error {
  const response = (error as { response?: { status: number, data?: unknown } })?.response
  let message = extractMessage(response?.data)
  if (!message) {
    if (!response) {
      message = 'Não foi possível conectar ao servidor.'
    } else if (response.status >= 500) {
      message = 'Erro interno no servidor. Tente novamente.'
    } else {
      message = fallback
    }
  }
  return new Error(message)
}
