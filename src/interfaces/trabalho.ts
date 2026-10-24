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

/** Situação de um arquivo enviado durante a análise da IA. */
export type StatusAnalise = 'fila' | 'analisando' | 'concluido' | 'erro'

/** Arquivo escolhido na tela de envio, acompanhado até o fim da análise. */
export interface ArquivoEnvio {
  uid: number
  file: File
  status: StatusAnalise
  trabalhos: Trabalho[]
  erro: string
}
