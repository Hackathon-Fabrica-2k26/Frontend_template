import type { Paginated } from '@/interfaces/item'
import type { AtividadeVariacao } from '@/interfaces/variacao'
import api from '@/plugins/api'
import { buildApiError } from '@/utils/apiError'

export interface VariacoesFilters {
  atividade?: number
  status?: string
  eh_geral?: boolean
  search?: string
  page?: number
}

class VariacoesService {
  async list (params: VariacoesFilters = {}): Promise<Paginated<AtividadeVariacao> | AtividadeVariacao[]> {
    try {
      const { data } = await api.get<Paginated<AtividadeVariacao> | AtividadeVariacao[]>('variacoes/', { params })
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível carregar as variações.')
    }
  }

  async get (id: number): Promise<AtividadeVariacao> {
    try {
      const { data } = await api.get<AtividadeVariacao>(`variacoes/${id}/`)
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível carregar a variação.')
    }
  }

  async update (id: number, payload: Partial<AtividadeVariacao>): Promise<AtividadeVariacao> {
    try {
      const { data } = await api.patch<AtividadeVariacao>(`variacoes/${id}/`, payload)
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível atualizar a variação.')
    }
  }

  async aprovar (id: number): Promise<AtividadeVariacao> {
    try {
      const { data } = await api.post<AtividadeVariacao>(`variacoes/${id}/aprovar/`)
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível aprovar a variação.')
    }
  }

  async downloadPdf (id: number, nomeArquivo?: string): Promise<Blob> {
    try {
      const { data } = await api.get<Blob>(`variacoes/${id}/pdf/`, {
        responseType: 'blob',
      })

      const nomeFinal = nomeArquivo?.endsWith('.pdf') ? nomeArquivo : `${nomeArquivo || `variacao-${id}`}.pdf`
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
      throw buildApiError(error, 'Não foi possível baixar o PDF da variação.')
    }
  }
}

export const variacoesService = new VariacoesService()
export default variacoesService
