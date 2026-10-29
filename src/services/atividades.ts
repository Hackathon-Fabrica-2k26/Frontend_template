import type {
  Atividade,
  AtividadeExtracao,
  AtividadePayload,
  AtividadesPage,
} from '@/interfaces/atividade'
import type { AtividadeVariacao, MapaVariacaoItem } from '@/interfaces/variacao'
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

  async gerarVariacoes (id: number): Promise<AtividadeVariacao[]> {
    try {
      const { data } = await api.post<AtividadeVariacao[]>(`atividades/${id}/gerar-variacoes/`)
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível gerar variações para a atividade.')
    }
  }

  async mapaVariacoes (id: number): Promise<MapaVariacaoItem[]> {
    try {
      const { data } = await api.get<MapaVariacaoItem[]>(`atividades/${id}/mapa-variacoes/`)
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível carregar o mapa de variações.')
    }
  }

  async downloadPdf (id: number, nomeArquivo?: string, todas = false): Promise<void> {
    try {
      const { data } = await api.get<Blob>(`atividades/${id}/pdf/`, {
        params: todas ? { todas: true } : {},
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      const nomeFinal = nomeArquivo?.endsWith('.pdf') ? nomeArquivo : `${nomeArquivo || `atividade-${id}`}.pdf`
      link.setAttribute('download', nomeFinal)
      document.body.append(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      throw buildApiError(error, 'Não foi possível baixar o PDF da atividade.')
    }
  }
}

export const atividadesService = new AtividadesService()
