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
  matricula?: string
  data_nascimento?: string | null
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

export interface Observacao {
  id: number
  aluno: number
  titulo?: string
  descricao: string
  visibilidade?: string
  created_at: string
}

export interface PerfilApoio {
  id: number
  aluno: number
  necessidades: string[]
  estrategias: string[]
  observacoes: string
  ativo: boolean
  created_at?: string
  updated_at?: string
}

export interface PontoAtencaoItem {
  padrao: string
  texto: string
  base_pedagogica: string
  total_trabalhos: number
}

export interface PontosAtencaoResposta {
  pontos: PontoAtencaoItem[]
  disclaimer: string
  minimo_trabalhos: number
  mensagem?: string
}

export interface HabilidadeAluno {
  codigo: string
  area: string
  nome: string
  trabalhos_a_reforcar: number
  trabalhos_demonstrada: number
  em_reforco: boolean
  ultimo_trabalho_em: string | null
}

