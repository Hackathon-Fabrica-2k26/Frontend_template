import type {
  Config,
  ConfigPayload,
  Escola,
  EscolaPayload,
  HabilidadeTurma,
  NomeReconhecido,
  Paginated,
  ReconhecimentoChamada,
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

  async reconhecer (foto: File): Promise<ReconhecimentoChamada> {
    if (!foto) {
      throw new Error('Selecione uma foto da chamada.')
    }

    const formData = new FormData()
    formData.append('imagem', foto)

    try {
      const { data } = await api.post<{ nomes: Array<string | Partial<NomeReconhecido>> }>(
        'chamada/reconhecer/',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 120_000,
        },
      )

      const lista = Array.isArray(data?.nomes) ? data.nomes : []
      return {
        nomes: lista.map((item, index) => {
          if (typeof item === 'string') {
            return {
              id: `aluno-${index + 1}`,
              nome: item,
              confianca: null,
            }
          }
          return {
            id: String(item?.id ?? `aluno-${index + 1}`),
            nome: String(item?.nome ?? ''),
            confianca: typeof item?.confianca === 'number' ? item.confianca : null,
          }
        }),
      }
    } catch (error) {
      throw buildApiError(error, 'Não foi possível reconhecer os nomes.')
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

  /** Resumo agregado de habilidades da turma calculadas a partir dos trabalhos dos alunos. */
  async obterHabilidades (turmaId: number): Promise<HabilidadeTurma[]> {
    try {
      const { data } = await api.get<HabilidadeTurma[]>(`turmas/${turmaId}/habilidades/`)
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível carregar as habilidades da turma.')
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
