export interface TurmaPayload {
  nome: string
  turno: string
  ano_letivo: number
  alunos?: string[]
}

export interface Turma extends TurmaPayload {
  id: number
}

export interface NomeReconhecido {
  id: string
  nome: string
  confianca: number | null
}

export interface ReconhecimentoChamada {
  nomes: NomeReconhecido[]
}
