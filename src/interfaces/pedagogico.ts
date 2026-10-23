import type { Paginated } from '@/interfaces/item'

export interface Relatorio {
  id: number
  aluno: number
  dados: Record<string, unknown>
  created_at: string
  updated_at: string
}

export type RelatorioPayload = Pick<Relatorio, 'aluno' | 'dados'>

export interface Atividade {
  id: number
  aluno: number
  nome: string
  tipo: string
  relatorios: number[]
  created_at: string
  updated_at: string
}

export type AtividadePayload = Pick<Atividade, 'aluno' | 'nome' | 'tipo'> & {
  relatorios?: number[]
}

export type RelatoriosPage = Paginated<Relatorio>
export type AtividadesPage = Paginated<Atividade>
