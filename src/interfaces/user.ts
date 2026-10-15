export interface User {
  id: number
  email: string
  name: string
}

export interface RegisterPayload {
  email: string
  name: string
  password: string
}
