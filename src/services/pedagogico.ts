import type { PerfilApoio } from '@/interfaces/aluno'
import type { Paginated } from '@/interfaces/item'
import type {
  GerarRelatorioPayload,
  GerarRelatorioResponse,
  RefinamentoResposta,
  Relatorio,
  RelatorioPayload,
} from '@/interfaces/pedagogico'
import api from '@/plugins/api'
import { buildApiError } from '@/utils/apiError'

class PedagogicoService {
  async list (params: { aluno?: number, atividade?: number, page?: number } = {}) {
    try {
      const { data } = await api.get<Paginated<Relatorio>>('relatorios/', { params })
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível carregar os relatórios.')
    }
  }

  async create (payload: RelatorioPayload) {
    try {
      const { data } = await api.post<Relatorio>('relatorios/', payload)
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível criar o relatório.')
    }
  }

  async update (id: number, payload: Partial<RelatorioPayload>) {
    try {
      const { data } = await api.patch<Relatorio>(`relatorios/${id}/`, payload)
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível atualizar o relatório.')
    }
  }

  async remove (id: number) {
    try {
      await api.delete(`relatorios/${id}/`)
    } catch (error) {
      throw buildApiError(error, 'Não foi possível excluir o relatório.')
    }
  }

  async get (id: number): Promise<Relatorio> {
    try {
      const { data } = await api.get<Relatorio>(`relatorios/${id}/`)
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível carregar o relatório.')
    }
  }

  /** Ciclo de refinamento: o professor descreve o ajuste e recebe o prompt melhorado. */
  async refinar (id: number, ajuste: string): Promise<RefinamentoResposta> {
    try {
      const { data } = await api.post<RefinamentoResposta>(`relatorios/${id}/refinar/`, { ajuste })
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível refinar a atividade.')
    }
  }

  async gerar (payload: GerarRelatorioPayload): Promise<GerarRelatorioResponse> {
    try {
      const { data } = await api.post<GerarRelatorioResponse>('relatorios/gerar/', payload)
      return data
    } catch (error) {
      const response = (error as { response?: { status?: number, data?: { erro?: string } } })?.response
      if (response?.status === 502) {
        throw new Error(
          response.data?.erro || 'Serviço de IA temporariamente indisponível. Tente novamente em instantes.',
          { cause: error },
        )
      }
      throw buildApiError(error, 'Não foi possível gerar o relatório pedagógico.')
    }
  }

  async downloadPdf (id: number, nomeArquivo?: string): Promise<Blob> {
    try {
      const { data } = await api.get<Blob>(`relatorios/${id}/pdf/`, {
        responseType: 'blob',
      })

      const nomeFinal = nomeArquivo?.endsWith('.pdf') ? nomeArquivo : `${nomeArquivo || `relatorio-${id}`}.pdf`
      const url = window.URL.createObjectURL(data)
      const link = document.createElement('a')
      link.href = url
      link.download = nomeFinal
      document.body.append(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível baixar o PDF do relatório.')
    }
  }

  async obterPerfilApoio (alunoId: number): Promise<PerfilApoio | null> {
    try {
      const { data } = await api.get<Paginated<PerfilApoio>>('perfis-apoio/', {
        params: { aluno: alunoId, ativo: true },
      })
      return data.results?.[0] ?? null
    } catch (error) {
      throw buildApiError(error, 'Não foi possível carregar o perfil de apoio do aluno.')
    }
  }

  async atualizarPerfilApoio (id: number, payload: Partial<PerfilApoio>): Promise<PerfilApoio> {
    try {
      const { data } = await api.patch<PerfilApoio>(`perfis-apoio/${id}/`, payload)
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível atualizar o perfil de apoio.')
    }
  }
}

export const pedagogicoService = new PedagogicoService()
export default pedagogicoService
