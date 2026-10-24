export interface Estudante {
  id: number
  nome: string
}

export type Identificacao = 'pendente' | 'automatica' | 'confirmada' | 'sem_aluno' | 'sem_consentimento'

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
