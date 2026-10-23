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
  config: number
  created_at?: string
  updated_at?: string
}

export type EscolaPayload = Pick<Escola, 'nome' | 'endereco' | 'config'>

export type TurnoTurma = 'manha' | 'tarde' | 'noite' | 'integral' | string

export interface Turma {
  id: number
  nome: string
  escola: number
  professores: number[]
  turno?: TurnoTurma
  total_estudantes?: number
  created_at?: string
  updated_at?: string
}

export interface TurmaPayload {
  nome: string
  escola: number
  professores?: number[]
  turno?: TurnoTurma
}
