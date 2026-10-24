import type {
  Config,
  ConfigPayload,
  Escola,
  EscolaPayload,
  NomeReconhecido,
  Paginated,
  ReconhecimentoChamada,
  Turma,
  TurmaPayload,
} from '@/interfaces/escola'
import api from '@/plugins/api'
import { buildApiError } from '@/utils/apiError'

const usarMockTurmas = import.meta.env.VITE_MOCK_TURMAS === 'true'
const CHAVE_TURMAS = 'marsupi:turmas'

const nomesExemplo = [
  'Alice Santos',
  'Arthur Oliveira',
  'Beatriz Costa',
  'Davi Pereira',
  'Helena Martins',
  'Lucas Almeida',
  'Maria Eduarda Lima',
  'Miguel Souza',
]

function aguardar (ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function carregarTurmasLocais (): Turma[] {
  try {
    const dados = localStorage.getItem(CHAVE_TURMAS)
    if (!dados) {
      return []
    }
    const resultado: unknown = JSON.parse(dados)
    return Array.isArray(resultado) ? resultado as Turma[] : []
  } catch {
    return []
  }
}

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
    if (usarMockTurmas) {
      const results = carregarTurmasLocais()
      return {
        count: results.length,
        next: null,
        previous: null,
        results,
      } satisfies Paginated<Turma>
    }

    try {
      const { data } = await api.get<Paginated<Turma>>('turmas/', { params })
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível carregar as turmas.')
    }
  }

  async get (id: number) {
    if (usarMockTurmas) {
      const turma = carregarTurmasLocais().find(t => t.id === id)
      if (turma) {
        return turma
      }
    }

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

    if (usarMockTurmas) {
      await aguardar(1800)
      return {
        nomes: nomesExemplo.map((nome, index) => ({
          id: `mock-${index + 1}`,
          nome,
          confianca: index === 3 || index === 6 ? 0.65 : 0.97,
        })),
      }
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
    if (usarMockTurmas) {
      await aguardar(700)
      const turma: Turma = {
        id: Date.now(),
        nome: payload.nome,
        escola: payload.escola ?? 1,
        professores: payload.professores ?? [],
        ano_letivo: payload.ano_letivo,
        turno: payload.turno,
        total_estudantes: payload.alunos?.length ?? 0,
      }
      const turmas = carregarTurmasLocais()
      try {
        localStorage.setItem(CHAVE_TURMAS, JSON.stringify([turma, ...turmas]))
      } catch {
        throw new Error('Não foi possível salvar a turma neste navegador.')
      }
      return turma
    }

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
