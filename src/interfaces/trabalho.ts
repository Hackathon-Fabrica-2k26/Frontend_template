export interface Estudante {
  id: number
  nome: string
}

export type Identificacao = 'confirmada' | 'pendente'

export interface Trabalho {
  id: number
  nome_arquivo: string
  nome_lido: string
  confianca: number | null
  identificacao: Identificacao
  aluno: number | null
}

export interface TrabalhoPayload {
  aluno: number
  identificacao: 'confirmada'
}

/**
 * Situação de um arquivo durante a análise da IA.
 * - concluido: verificado
 * - erro: falhou uma vez; dá para recarregar (uma nova tentativa)
 * - reenviar: falhou de novo; só enviando outro arquivo no lugar
 */
export type StatusAnalise = 'fila' | 'analisando' | 'concluido' | 'erro' | 'reenviar'

/** Arquivo escolhido na tela de envio, acompanhado até o fim da análise. */
export interface ArquivoEnvio {
  uid: number
  file: File
  status: StatusAnalise
  trabalhos: Trabalho[]
  erro: string
  /** Quantas vezes a análise deste arquivo falhou (zera ao trocar o arquivo). */
  tentativas: number
}
