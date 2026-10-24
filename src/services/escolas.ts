import type {
  Config,
  ConfigPayload,
  Escola,
  EscolaPayload,
  Paginated,
  Turma,
  TurmaPayload,
} from '@/interfaces/escola'
import api from '@/plugins/api'
import { buildApiError } from '@/utils/apiError'

class ConfigsService {
  async list (params: { page?: number } = {}) {
    try {
      const { data } = await api.get<Paginated<Config>>('configs/', { params })
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível carregar as configurações.')
    }
  }

  async create (payload: ConfigPayload) {
    try {
      const { data } = await api.post<Config>('configs/', payload)
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível criar a configuração.')
    }
  }

  async update (id: number, payload: Partial<ConfigPayload>) {
    try {
      const { data } = await api.patch<Config>(`configs/${id}/`, payload)
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível atualizar a configuração.')
    }
  }

  async remove (id: number) {
    try {
      await api.delete(`configs/${id}/`)
    } catch (error) {
      throw buildApiError(error, 'Não foi possível excluir a configuração.')
    }
  }
}

class EscolasService {
  async list (params: { search?: string, page?: number } = {}) {
    try {
      const { data } = await api.get<Paginated<Escola>>('escolas/', { params })
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível carregar as escolas.')
    }
  }

  async create (payload: EscolaPayload) {
    try {
      const { data } = await api.post<Escola>('escolas/', payload)
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível criar a escola.')
    }
  }

  async update (id: number, payload: Partial<EscolaPayload>) {
    try {
      const { data } = await api.patch<Escola>(`escolas/${id}/`, payload)
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível atualizar a escola.')
    }
  }

  async remove (id: number) {
    try {
      await api.delete(`escolas/${id}/`)
    } catch (error) {
      throw buildApiError(error, 'Não foi possível excluir a escola.')
    }
  }
}

class TurmasService {
  async get (id: number) {
    try {
      const { data } = await api.get<Turma>(`turmas/${id}/`)
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível carregar a turma.')
    }
  }

  async list (params: { escola?: number, search?: string, page?: number } = {}) {
    try {
      const { data } = await api.get<Paginated<Turma>>('turmas/', { params })
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível carregar as turmas.')
    }
  }

  async get (id: number) {
    try {
      const { data } = await api.get<Turma>(`turmas/${id}/`)
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível carregar a turma.')
    }
  }

  async create (payload: TurmaPayload) {
    try {
      const { data } = await api.post<Turma>('turmas/', payload)
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível criar a turma.')
    }
  }

  async update (id: number, payload: Partial<TurmaPayload>) {
    try {
      const { data } = await api.patch<Turma>(`turmas/${id}/`, payload)
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível atualizar a turma.')
    }
  }

  async remove (id: number) {
    try {
      await api.delete(`turmas/${id}/`)
    } catch (error) {
      throw buildApiError(error, 'Não foi possível excluir a turma.')
    }
  }
}

export const configsService = new ConfigsService()
export const escolasService = new EscolasService()
export const turmasService = new TurmasService()

export default {
  configs: configsService,
  escolas: escolasService,
  turmas: turmasService,
}
