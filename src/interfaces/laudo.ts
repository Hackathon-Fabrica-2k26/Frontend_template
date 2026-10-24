/** O que a leitura do laudo encontrou. A professora confere e corrige antes de salvar. */
export interface LaudoDados {
  necessidades: string[]
  adaptacoes: string[]
  observacao: string
}

export interface Laudo extends LaudoDados {
  id: number
  aluno: number
  nome_arquivo: string
  /** O nome escrito no laudo bate com o do aluno escolhido. */
  nome_confere: boolean
  created_at?: string
}

export interface LaudoConfirmado {
  /** ISO 8601: quando o arquivo do laudo foi apagado. */
  arquivo_apagado_em: string
}

export interface EnvioLaudoOpcoes {
  /** Recebe de 0 a 100 conforme o arquivo sobe. */
  onProgresso?: (percentual: number) => void
  signal?: AbortSignal
}
