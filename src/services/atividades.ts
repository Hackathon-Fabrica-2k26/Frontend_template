import type {
  Atividade,
  AtividadeExtracao,
  AtividadePayload,
  AtividadesPage,
} from '@/interfaces/atividade'
import api from '@/plugins/api'
import { buildApiError } from '@/utils/apiError'

export interface AtividadesFilters {
  turma?: number
  search?: string
  page?: number
}

class AtividadesService {
  async extrair (arquivo: File): Promise<AtividadeExtracao> {
    const formData = new FormData()
    formData.append('arquivo', arquivo)

    try {
      const { data } = await api.post<AtividadeExtracao>('atividades/extrair/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível extrair os dados do arquivo.')
    }
  }

  async create (payload: AtividadePayload): Promise<Atividade> {
    try {
      const { data } = await api.post<Atividade>('atividades/', payload)
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível cadastrar a atividade.')
    }
  }

  async list (params: AtividadesFilters = {}): Promise<AtividadesPage> {
    try {
      const { data } = await api.get<AtividadesPage>('atividades/', { params })
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível carregar as atividades.')
    }
  }

  async get (id: number): Promise<Atividade> {
    try {
      const { data } = await api.get<Atividade>(`atividades/${id}/`)
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível obter a atividade.')
    }
  }
}

export const atividadesService = new AtividadesService()
