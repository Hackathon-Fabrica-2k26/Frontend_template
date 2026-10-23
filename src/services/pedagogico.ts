import type {
  Atividade,
  AtividadePayload,
  AtividadesPage,
  Relatorio,
  RelatorioPayload,
  RelatoriosPage,
} from '@/interfaces/pedagogico'
import api from '@/plugins/api'
import { buildApiError } from '@/utils/apiError'

export interface RelatoriosFilters {
  aluno?: number
  page?: number
}

export interface AtividadesFilters extends RelatoriosFilters {
  search?: string
}

class RelatoriosService {
  async list (params: RelatoriosFilters = {}): Promise<RelatoriosPage> {
    try {
      const { data } = await api.get<RelatoriosPage>('relatorios/', { params })
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível carregar os relatórios.')
    }
  }

  async create (payload: RelatorioPayload): Promise<Relatorio> {
    try {
      const { data } = await api.post<Relatorio>('relatorios/', payload)
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível criar o relatório.')
    }
  }

  async update (id: number, payload: Partial<RelatorioPayload>): Promise<Relatorio> {
    try {
      const { data } = await api.patch<Relatorio>(`relatorios/${id}/`, payload)
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível atualizar o relatório.')
    }
  }

  async remove (id: number): Promise<void> {
    try {
      await api.delete(`relatorios/${id}/`)
    } catch (error) {
      throw buildApiError(error, 'Não foi possível excluir o relatório.')
    }
  }
}

class AtividadesService {
  async list (params: AtividadesFilters = {}): Promise<AtividadesPage> {
    try {
      const { data } = await api.get<AtividadesPage>('atividades/', { params })
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível carregar as atividades.')
    }
  }

  async create (payload: AtividadePayload): Promise<Atividade> {
    try {
      const { data } = await api.post<Atividade>('atividades/', payload)
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível criar a atividade.')
    }
  }

  async update (id: number, payload: Partial<AtividadePayload>): Promise<Atividade> {
    try {
      const { data } = await api.patch<Atividade>(`atividades/${id}/`, payload)
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível atualizar a atividade.')
    }
  }

  async remove (id: number): Promise<void> {
    try {
      await api.delete(`atividades/${id}/`)
    } catch (error) {
      throw buildApiError(error, 'Não foi possível excluir a atividade.')
    }
  }
}

export const relatoriosService = new RelatoriosService()
export const atividadesService = new AtividadesService()
