export interface Item {
  id: number
  title: string
  description: string
  done: boolean
  owner: number
  created_at: string
  updated_at: string
}

export type ItemPayload = Pick<Item, 'title' | 'description' | 'done'>

/** Resposta paginada padrão do DRF (PAGE_SIZE = 20). */
export interface Paginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
