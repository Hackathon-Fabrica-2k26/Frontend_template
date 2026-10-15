import type { Item, ItemPayload, Paginated } from '@/interfaces/item'
import api from '@/plugins/api'
import { buildApiError } from '@/utils/apiError'

// Exemplo de CRUD. Copie este arquivo para criar o service de um recurso novo.
class ItemsService {
  async list (params: { search?: string, done?: boolean, page?: number } = {}) {
    try {
      const { data } = await api.get<Paginated<Item>>('items/', { params })
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível carregar os itens.')
    }
  }

  async create (payload: ItemPayload) {
    try {
      const { data } = await api.post<Item>('items/', payload)
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível criar o item.')
    }
  }

  async update (id: number, payload: Partial<ItemPayload>) {
    try {
      const { data } = await api.patch<Item>(`items/${id}/`, payload)
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível atualizar o item.')
    }
  }

  async remove (id: number) {
    try {
      await api.delete(`items/${id}/`)
    } catch (error) {
      throw buildApiError(error, 'Não foi possível excluir o item.')
    }
  }
}

export default new ItemsService()
