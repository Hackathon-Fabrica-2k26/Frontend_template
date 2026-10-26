export interface User {
  id: number
  matricula: string
  email: string
  name: string
  ano?: string
  escola?: number | null
  /** Verificação em duas etapas (código por e-mail ao entrar). Desligada por padrão. */
  otp_ativo?: boolean
  /** Como a pessoa quer ser chamada; define o canguru e o selo do perfil. */
  tratamento?: 'professora' | 'professor'
}
