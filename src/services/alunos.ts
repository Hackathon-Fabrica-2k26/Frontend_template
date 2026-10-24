import type {
  Aluno,
  AlunoPayload,
  MetaDados,
  MetaDadosPayload,
  Observacao,
  Paginated,
  PontosAtencaoResposta,
  Responsavel,
  ResponsavelPayload,
} from '@/interfaces/aluno'
import api from '@/plugins/api'
import { buildApiError } from '@/utils/apiError'

class AlunosService {
  async list (params: { turma?: number, search?: string, page?: number } = {}) {
    try {
      const { data } = await api.get<Paginated<Aluno>>('alunos/', { params })
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível carregar os alunos.')
    }
  }

  async create (payload: AlunoPayload) {
    try {
      const { data } = await api.post<Aluno>('alunos/', payload)
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível criar o aluno.')
    }
  }

  async update (id: number, payload: Partial<AlunoPayload>) {
    try {
      const { data } = await api.patch<Aluno>(`alunos/${id}/`, payload)
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível atualizar o aluno.')
    }
  }

  async remove (id: number) {
    try {
      await api.delete(`alunos/${id}/`)
    } catch (error) {
      throw buildApiError(error, 'Não foi possível excluir o aluno.')
    }
  }

  async obterPontosAtencao (alunoId: number): Promise<PontosAtencaoResposta> {
    try {
      const { data } = await api.get<PontosAtencaoResposta>(`alunos/${alunoId}/pontos-atencao/`)
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível carregar os pontos de atenção.')
    }
  }

  /** Relatórios do aluno (id e atividade de cada um), do mais novo para o mais antigo. */
  async listarRelatorios (alunoId: number): Promise<RelatorioDoAluno[]> {
    try {
      const { data } = await api.get<RelatorioDoAluno[] | { results: RelatorioDoAluno[] }>(
        `alunos/${alunoId}/relatorios/`,
        { params: { page_size: 100 } },
      )
      return Array.isArray(data) ? data : data.results
    } catch (error) {
      throw buildApiError(error, 'Não foi possível carregar os relatórios do aluno.')
    }
  }

  /** Baixa um PDF com todos os relatórios do aluno. */
  async baixarRelatoriosPdf (alunoId: number, nomeArquivo: string): Promise<void> {
    try {
      const { data } = await api.get<Blob>(`alunos/${alunoId}/relatorios/pdf/`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(data)
      const link = document.createElement('a')
      link.href = url
      link.download = nomeArquivo.endsWith('.pdf') ? nomeArquivo : `${nomeArquivo}.pdf`
      document.body.append(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      throw buildApiError(error, 'Não foi possível baixar os relatórios em PDF.')
    }
  }

  /** Gera o código do link do responsável (aparece só nesta resposta; vale 7 dias, uma vez). */
  async gerarCodigoAcesso (alunoId: number): Promise<string> {
    try {
      const { data } = await api.post<{ codigo: string }>(`alunos/${alunoId}/codigo-acesso/`)
      return data.codigo
    } catch (error) {
      throw buildApiError(error, 'Não foi possível gerar o link do responsável.')
    }
  }
}

export interface RelatorioDoAluno {
  id: number
  atividade: number | null
  tipo: string
  created_at: string
}

class ObservacoesService {
  async list (params: { aluno: number, page?: number }) {
    try {
      const { data } = await api.get<Paginated<Observacao>>('observacoes/', { params })
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível carregar as observações.')
    }
  }
}

class ResponsaveisService {
  async list (params: { search?: string, page?: number } = {}) {
    try {
      const { data } = await api.get<Paginated<Responsavel>>('responsaveis/', { params })
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível carregar os responsáveis.')
    }
  }

  async create (payload: ResponsavelPayload) {
    try {
      const { data } = await api.post<Responsavel>('responsaveis/', payload)
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível criar o responsável.')
    }
  }

  async update (id: number, payload: Partial<ResponsavelPayload>) {
    try {
      const { data } = await api.patch<Responsavel>(`responsaveis/${id}/`, payload)
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível atualizar o responsável.')
    }
  }

  async remove (id: number) {
    try {
      await api.delete(`responsaveis/${id}/`)
    } catch (error) {
      throw buildApiError(error, 'Não foi possível excluir o responsável.')
    }
  }
}

class MetaDadosService {
  async list (params: { page?: number } = {}) {
    try {
      const { data } = await api.get<Paginated<MetaDados>>('meta-dados/', { params })
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível carregar os metadados.')
    }
  }

  async create (payload: MetaDadosPayload) {
    try {
      const { data } = await api.post<MetaDados>('meta-dados/', payload)
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível criar os metadados.')
    }
  }

  async update (id: number, payload: Partial<MetaDadosPayload>) {
    try {
      const { data } = await api.patch<MetaDados>(`meta-dados/${id}/`, payload)
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível atualizar os metadados.')
    }
  }

  async remove (id: number) {
    try {
      await api.delete(`meta-dados/${id}/`)
    } catch (error) {
      throw buildApiError(error, 'Não foi possível excluir os metadados.')
    }
  }
}

export const alunosService = new AlunosService()
export const responsaveisService = new ResponsaveisService()
export const metaDadosService = new MetaDadosService()
export const observacoesService = new ObservacoesService()

export default {
  alunos: alunosService,
  responsaveis: responsaveisService,
  metaDados: metaDadosService,
  observacoes: observacoesService,
}
