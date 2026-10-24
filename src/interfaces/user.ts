export interface User {
  id: number
  matricula: string
  email: string
  name: string
  ano?: string
  escola?: number | null
  /** Como a pessoa quer ser chamada; define o canguru e o selo do perfil. */
  tratamento?: 'professora' | 'professor'
}
