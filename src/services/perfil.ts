import type { Atividade } from '@/interfaces/atividade'
import type { Paginated, Turma } from '@/interfaces/escola'
import type { AtividadeRecente, PerfilPayload, PerfilResumo, StatusAtividade } from '@/interfaces/perfil'
import type { User } from '@/interfaces/user'
import api from '@/plugins/api'
import { buildApiError } from '@/utils/apiError'

function normalizarStatusAtividade (status?: string): StatusAtividade {
  switch (status?.toLowerCase()) {
    case 'analisada':
    case 'analisado':
    case 'aprovada':
    case 'encerrada': {
      return 'analisada'
    }
    case 'em_analise':
    case 'analisando':
    case 'variacoes_geradas': {
      return 'em_analise'
    }
    default: {
      return 'pendente'
    }
  }
}

interface ResumoApiResponse {
  turmas?: number
  atividades?: number
  atividades_criadas?: number
  trabalhos_analisados?: number
}

// Os dados do perfil vêm dos recursos da API (turmas, atividades e relatórios).
class PerfilService {
  async resumo (): Promise<PerfilResumo> {
    try {
      const { data } = await api.get<ResumoApiResponse>('auth/me/resumo/')
      return {
        turmas: Number(data?.turmas ?? 0),
        atividades: Number(data?.atividades ?? data?.atividades_criadas ?? 0),
        trabalhos_analisados: Number(data?.trabalhos_analisados ?? 0),
      }
    } catch (error) {
      throw buildApiError(error, 'Não foi possível carregar o resumo do perfil.')
    }
  }

  async turmas (): Promise<Turma[]> {
    try {
      const { data } = await api.get<Paginated<Turma> | Turma[]>('turmas/')
      if (Array.isArray(data)) {
        return data
      }
      return data?.results ?? []
    } catch (error) {
      throw buildApiError(error, 'Não foi possível carregar as turmas.')
    }
  }

  async atividadesRecentes (): Promise<AtividadeRecente[]> {
    try {
      const { data } = await api.get<Paginated<Atividade> | Atividade[]>('atividades/')
      const itens = Array.isArray(data) ? data : (data?.results ?? [])
      return itens.map(item => ({
        id: item.id,
        titulo: item.titulo || item.nome || 'Atividade sem título',
        data: item.created_at || new Date().toISOString(),
        status: normalizarStatusAtividade(item.status),
        turma: item.turma,
      }))
    } catch (error) {
      throw buildApiError(error, 'Não foi possível carregar as atividades recentes.')
    }
  }

  async atualizar (payload: PerfilPayload): Promise<User> {
    try {
      const { data } = await api.patch<User>('auth/me/', {
        name: payload.name.trim(),
        email: payload.email.trim(),
      })
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível atualizar o perfil.')
    }
  }

  async atualizarPerfil (payload: PerfilPayload): Promise<User> {
    return this.atualizar(payload)
  }

  async me (): Promise<User> {
    try {
      const { data } = await api.get<User>('auth/me/')
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível carregar os dados do professor.')
    }
  }
}

export default new PerfilService()
