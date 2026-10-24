import type { Paginated } from '@/interfaces/item'

export interface AtividadeExtracao {
  titulo: string
  descricao: string
  texto_original?: string
}

export interface Atividade {
  id: number
  nome?: string
  titulo?: string
  descricao?: string
  objetivo?: string
  texto_original?: string
  origem?: string
  turma?: number
  tipo?: string
  aluno?: number
  relatorios?: number[]
  created_at: string
  updated_at: string
}

export interface AtividadePayload {
  nome?: string
  titulo?: string
  descricao?: string
  objetivo?: string
  texto_original?: string
  origem?: string
  turma?: number
  tipo?: string
  aluno?: number
  relatorios?: number[]
}

export type AtividadesPage = Paginated<Atividade>
