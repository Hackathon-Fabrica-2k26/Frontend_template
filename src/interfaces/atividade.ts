import type { Paginated } from '@/interfaces/item'

export interface AtividadeExtracao {
  titulo: string
  descricao: string
}

export interface Atividade {
  id: number
  nome: string
  titulo?: string
  descricao?: string
  turma?: number
  tipo?: string
  aluno?: number
  relatorios?: number[]
  created_at: string
  updated_at: string
}

export interface AtividadePayload {
  nome: string
  descricao?: string
  turma?: number
  tipo?: string
  aluno?: number
  relatorios?: number[]
}

export type AtividadesPage = Paginated<Atividade>
