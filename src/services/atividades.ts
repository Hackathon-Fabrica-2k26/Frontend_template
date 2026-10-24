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
    } catch {
      // Mock enquanto o endpoint do backend não estiver integrado à branch dev
      await new Promise(resolve => setTimeout(resolve, 2000))

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
      }
    }
  }

  async create (payload: AtividadePayload): Promise<Atividade> {
    try {
      const { data } = await api.post<Atividade>('atividades/', payload)
      return data
    } catch (error) {
      // Se for erro de validação ou de rede não relacionado à rota inexistente, poderia tratar.
      // Caso 404/indisponível na dev, simula criação mockada para não bloquear o fluxo da professora:
      const status = (error as { response?: { status?: number } })?.response?.status
      if (status === 404 || !status) {
        await new Promise(resolve => setTimeout(resolve, 600))
        return {
          id: Math.floor(Math.random() * 1000) + 1,
          nome: payload.nome,
          titulo: payload.nome,
          descricao: payload.descricao || '',
          turma: payload.turma,
          tipo: payload.tipo || 'Atividade Regular',
          aluno: payload.aluno,
          relatorios: payload.relatorios || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      }

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
