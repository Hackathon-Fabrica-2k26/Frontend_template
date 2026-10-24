import type {
  Consentimento,
  ConsentimentoPayload,
  Paginated,
} from '@/interfaces/consentimento'
import api from '@/plugins/api'
import { buildApiError } from '@/utils/apiError'

class ConsentimentoService {
  async list (params: { aluno?: number, finalidade?: string, page?: number } = {}) {
    try {
      const { data } = await api.get<Paginated<Consentimento>>('consentimentos/', { params })
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível carregar os consentimentos.')
    }
  }

  async obterPorAluno (alunoId: number): Promise<Consentimento | null> {
    try {
      const { data } = await api.get<Paginated<Consentimento>>('consentimentos/', {
        params: { aluno: alunoId },
      })
      if (!data.results || data.results.length === 0) {
        return null
      }
      // Prioriza o consentimento ativo, se houver
      const ativo = data.results.find(item => item.ativo)
      return ativo ?? data.results[0]
    } catch (error) {
      throw buildApiError(error, 'Não foi possível consultar o consentimento do aluno.')
    }
  }

  async registrar (payload: ConsentimentoPayload): Promise<Consentimento> {
    try {
      const { data } = await api.post<Consentimento>('consentimentos/', {
        finalidade: 'analise_pedagogica_ia',
        versao_texto: 'v1',
        ...payload,
      })
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível registrar o consentimento.')
    }
  }

  async revogar (id: number): Promise<Consentimento> {
    try {
      const { data } = await api.post<Consentimento>(`consentimentos/${id}/revogar/`)
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível revogar o consentimento.')
    }
  }
}

export const consentimentoService = new ConsentimentoService()
export default consentimentoService
