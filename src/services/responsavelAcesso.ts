import axios from 'axios'
import { buildApiError } from '@/utils/apiError'

// Sessão do responsável (sem conta): o código do link vira um token de 24h no backend.
// Fica no sessionStorage, então some ao fechar a aba.
const CHAVE_SESSAO = 'marsupi_responsavel'

interface SessaoResponsavel {
  token: string
  expiraEm: number
}

export interface AlunoDoResponsavel {
  nome: string
  turma: string | null
  consentimento_ativo: boolean
}

// Cliente separado: o `api` padrão injeta o JWT da professora e manda para o login no 401.
const cliente = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30_000,
})

cliente.interceptors.request.use(config => {
  const sessao = lerSessao()
  if (sessao) {
    config.headers.Authorization = `Responsavel ${sessao.token}`
  }
  return config
})

function lerSessao (): SessaoResponsavel | null {
  try {
    const bruto = sessionStorage.getItem(CHAVE_SESSAO)
    if (!bruto) {
      return null
    }
    const sessao = JSON.parse(bruto) as SessaoResponsavel
    if (!sessao.token || sessao.expiraEm <= Date.now()) {
      sessionStorage.removeItem(CHAVE_SESSAO)
      return null
    }
    return sessao
  } catch {
    return null
  }
}

class ResponsavelAcessoService {
  get cliente () {
    return cliente
  }

  temSessao (): boolean {
    return lerSessao() !== null
  }

  sair (): void {
    try {
      sessionStorage.removeItem(CHAVE_SESSAO)
    } catch {
      // Sem storage não há sessão para apagar.
    }
  }

  /** Troca o código do link por um token. O código só vale uma vez. */
  async acessar (codigo: string, nome: string): Promise<void> {
    try {
      const { data } = await cliente.post<{ token: string, expira_em_segundos: number }>(
        'responsavel/acesso/',
        { codigo: codigo.trim(), nome: nome.trim() },
      )
      sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify({
        token: data.token,
        expiraEm: Date.now() + data.expira_em_segundos * 1000,
      }))
    } catch (error) {
      throw buildApiError(error, 'Não foi possível validar o link. Peça um novo à professora.')
    }
  }

  async aluno (): Promise<AlunoDoResponsavel> {
    try {
      const { data } = await cliente.get<AlunoDoResponsavel>('responsavel/aluno/')
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível carregar os dados do aluno.')
    }
  }

  async consentir (): Promise<void> {
    try {
      await cliente.post('responsavel/consentimento/')
    } catch (error) {
      throw buildApiError(error, 'Não foi possível registrar o seu consentimento.')
    }
  }
}

export const responsavelAcessoService = new ResponsavelAcessoService()
export default responsavelAcessoService
