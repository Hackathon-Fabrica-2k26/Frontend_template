export interface MapaVariacaoAluno {
  id: number
  nome: string
}

export interface MapaVariacaoItem {
  variacao_id: number
  numero: number
  rotulo: string
  eh_geral: boolean
  status: string
  /** Habilidade a reforçar do grupo (vazio = versão só de formato). */
  habilidade?: string
  habilidade_nome?: string
  alunos: MapaVariacaoAluno[]
}

export interface AtividadeVariacao {
  id: number
  atividade: number
  numero: number
  rotulo: string
  eh_geral: boolean
  conteudo: string
  status: 'rascunho' | 'aprovada' | 'descartada' | string
  editada_manual: boolean
  adaptacoes_feitas?: string[]
  habilidade?: string
  habilidade_nome?: string
  aprovada_por?: number | null
  aprovada_em?: string | null
  alunos?: number[]
  created_at?: string
  updated_at?: string
}
