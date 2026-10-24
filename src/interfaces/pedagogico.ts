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
