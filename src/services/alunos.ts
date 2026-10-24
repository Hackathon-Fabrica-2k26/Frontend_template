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
