export interface PerfilResumo {
  turmas: number
  atividades: number
  trabalhos_analisados: number
}

export type StatusAtividade = 'analisada' | 'em_analise' | 'pendente'

export interface AtividadeRecente {
  id: number
  titulo: string
  data: string
  status: StatusAtividade
  turma?: number
}

export interface PerfilPayload {
  name: string
  email: string
}
