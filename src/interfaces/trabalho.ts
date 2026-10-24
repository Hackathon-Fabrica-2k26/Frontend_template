export interface Estudante {
  id: number
  nome: string
}

export type Identificacao = 'pendente' | 'automatica' | 'confirmada' | 'sem_aluno' | 'sem_consentimento'

export type StatusTrabalho = 'recebido' | 'analisando' | 'analisado' | 'erro' | string

export interface TrabalhoRespostaApi {
  id: number
  envio?: number
  atividade?: number
  aluno: number | null
  aluno_nome?: string | null
  variacao?: number | null
  nome_lido: string
  confianca_nome?: number | null
  confianca?: number | null
  identificacao: Identificacao
  confirmado_por?: number | null
  descricao_ia?: string
  dados_analise?: Record<string, unknown>
  status?: StatusTrabalho
  nome_arquivo?: string
  created_at?: string
  updated_at?: string
}

export interface EnvioTrabalhosResponse {
  id: number
  atividade: number
  enviado_por?: number
  total_arquivos: number
  status?: 'concluido' | 'revisao_pendente' | string
  trabalhos: TrabalhoRespostaApi[]
  created_at?: string
  updated_at?: string
}

export interface Trabalho {
  id: number
  envio?: number
  atividade?: number
  variacao?: number | null
  nome_arquivo: string
  nome_lido: string
  confianca: number | null
  confianca_nome?: number | null
  identificacao: Identificacao
  status?: StatusTrabalho
  descricao_ia?: string
  dados_analise?: Record<string, unknown>
  aluno: number | null
  aluno_nome?: string | null
}

export interface TrabalhoPayload {
  aluno: number
  identificacao?: 'confirmada'
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
