export interface Relatorio {
  id: number
  aluno: number
  atividade?: number | null
  tipo?: string
  disclaimer?: string
  dados: Record<string, unknown>
  created_at: string
  updated_at: string
}

export type RelatorioPayload = Pick<Relatorio, 'aluno' | 'dados'> & {
  atividade?: number | null
  tipo?: string
}

export interface GerarRelatorioPayload {
  aluno: number
  pontos_fortes: string[]
  desafios: string[]
  contexto_turma?: string
}

export interface GerarRelatorioResponse {
  relatorio: Relatorio
  payload_enviado: Record<string, unknown>
}

export interface AtividadeAdaptada {
  titulo: string
  objetivo: string
  duracao: string
  instrucoes: string[]
  dica_inclusiva: string
}

/** Conteúdo do campo `dados` de um relatório gerado pela IA. */
export interface RelatorioDados {
  resumo_perfil: string
  radar: Record<string, number>
  pontos_fortes: string[]
  areas_suporte: string[]
  atividades: AtividadeAdaptada[]
  dica_autonomia: string
}

export interface RefinamentoResposta {
  prompt_melhorado: string
}
