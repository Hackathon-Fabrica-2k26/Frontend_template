export type { Paginated } from '@/interfaces/item'

export type PerfilDisc = 'D' | 'I' | 'S' | 'C' | ''

export interface Responsavel {
  id: number
  nome: string
  email: string
  telefone: string
  cpf: string
  endereco: string
  created_at?: string
  updated_at?: string
}

export type ResponsavelPayload = Pick<
  Responsavel,
  'nome' | 'email' | 'telefone' | 'cpf' | 'endereco'
>

export interface MetaDados {
  id: number
  perfil_disc: PerfilDisc
  caracteristicas: Record<string, unknown>
  created_at?: string
  updated_at?: string
}

export interface MetaDadosPayload {
  perfil_disc?: PerfilDisc
  caracteristicas?: Record<string, unknown>
}

export interface Aluno {
  id: number
  nome: string
  turma: number
  meta_dados: number | null
  responsavel: number | null
  created_at?: string
  updated_at?: string
}

export interface AlunoPayload {
  nome: string
  turma: number
  meta_dados?: number | null
  responsavel?: number | null
}
