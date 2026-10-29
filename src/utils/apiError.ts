// Extrai a mensagem útil de um erro do DRF: {"detail": ...}, {"erro": ..., "motivo": ...}, {"campo": ["msg"]} ou lista.
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
    // Tratamento para DocumentoRecusadoError (HTTP 422) e NomeNaoConfereError (HTTP 409) do backend
    if (typeof record.erro === 'string' && record.erro.trim()) {
      const erro = record.erro.trim()
      const motivo = typeof record.motivo === 'string' ? record.motivo.trim() : ''
      if (motivo && !erro.toLowerCase().includes(motivo.toLowerCase())) {
        const separador = /[.!?]$/.test(erro) ? ' ' : '. '
        return `${erro}${separador}${motivo}`
      }
      return erro
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

export class ApiError extends Error {
  status?: number
  data?: unknown
  tipoDocumento?: string
  motivo?: string
  confirmacaoNecessaria?: boolean

  constructor (message: string, status?: number, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
    if (data && typeof data === 'object') {
      const record = data as Record<string, unknown>
      if (typeof record.tipo_documento === 'string') {
        this.tipoDocumento = record.tipo_documento
      }
      if (typeof record.motivo === 'string') {
        this.motivo = record.motivo
      }
      if (record.confirmacao_necessaria === true) {
        this.confirmacaoNecessaria = true
      }
    }
  }
}

export function buildApiError (error: unknown, fallback: string): ApiError {
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
  return new ApiError(message, response?.status, response?.data)
}
