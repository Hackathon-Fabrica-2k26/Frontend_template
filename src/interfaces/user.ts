export interface User {
  id: number
  matricula: string
  email: string
  name: string
  ano?: string
  escola?: number | null
}

export interface RegisterPayload {
  matricula: string
  email: string
  name: string
  password: string
  ano?: string
  escola?: number | null
}
