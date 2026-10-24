import type {
  Atividade,
  AtividadeExtracao,
  AtividadePayload,
  AtividadesPage,
} from '@/interfaces/atividade'
import api from '@/plugins/api'
import { buildApiError } from '@/utils/apiError'

const mockEnabled = import.meta.env.VITE_MOCK_ATIVIDADES === 'true'

function wait (ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export interface AtividadesFilters {
  turma?: number
  search?: string
  page?: number
}

class AtividadesService {
  async extrair (arquivo: File): Promise<AtividadeExtracao> {
    if (mockEnabled) {
      await wait(2000)

      const nomeBase = arquivo.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .trim()

      const tituloSugerido = nomeBase
        ? nomeBase.charAt(0).toUpperCase() + nomeBase.slice(1)
        : 'Atividade Diagnóstica Adaptada'

      return {
        titulo: tituloSugerido,
        descricao:
          'Atividade interdisciplinar com foco no desenvolvimento de raciocínio lógico, '
          + 'leitura interpretativa e dinâmicas de colaboração em grupo adaptadas '
          + 'aos perfis dos estudantes da turma.',
        texto_original: `Conteúdo extraído do arquivo ${arquivo.name}.`,
      }
    }

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
    if (mockEnabled) {
      await wait(600)
      const titulo = payload.titulo || payload.nome || 'Atividade'
      const descricao = payload.descricao || payload.objetivo || ''
      return {
        id: Math.floor(Math.random() * 1000) + 1,
        nome: titulo,
        titulo,
        descricao,
        objetivo: descricao,
        texto_original: payload.texto_original || '',
        origem: payload.origem || 'arquivo',
        turma: payload.turma,
        tipo: payload.tipo || 'Atividade Regular',
        aluno: payload.aluno,
        relatorios: payload.relatorios || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }

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
