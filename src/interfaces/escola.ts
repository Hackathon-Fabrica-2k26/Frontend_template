export type { Paginated } from '@/interfaces/item'

export interface Config {
  id: number
  modelo: string
  campos_form: Record<string, unknown>
  created_at?: string
  updated_at?: string
}

export interface ConfigPayload {
  api_key: string
  modelo: string
  campos_form?: Record<string, unknown>
}

export interface Escola {
  id: number
  nome: string
  endereco: string
  config: number | null
  created_at?: string
  updated_at?: string
}

export interface EscolaPayload {
  nome: string
  endereco: string
  config?: number | null
}

export type TurnoTurma = 'manha' | 'tarde' | 'noite' | 'integral' | string

export interface Turma {
  id: number
  nome: string
  escola: number
  professores: number[]
  ano_letivo?: number
  turno?: TurnoTurma
  turno_display?: string
  total_estudantes?: number
  created_at?: string
  updated_at?: string
}

export interface TurmaPayload {
  nome: string
  escola?: number
  professores?: number[]
  ano_letivo?: number
  turno?: TurnoTurma
  alunos?: string[]
}

export interface NomeReconhecido {
  id: string
  nome: string
  confianca: number | null
}

export interface ReconhecimentoChamada {
  nomes: NomeReconhecido[]
}
