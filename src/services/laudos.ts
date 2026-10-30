import type { PerfilApoio } from '@/interfaces/aluno'
import type { EnvioLaudoOpcoes, Laudo, LaudoConfirmado, LaudoDados } from '@/interfaces/laudo'
import api from '@/plugins/api'
import { buildApiError } from '@/utils/apiError'
import responsavelAcesso from './responsavelAcesso'

interface AlunoLaudoResposta {
  perfil_apoio: PerfilApoio
  nome_conferiu: boolean
  arquivo_excluido_em: string
}

// Com sessão do responsável (link com código) usa as rotas dele; sem ela, as da professora.
function rotas (alunoId: number, perfilId: number) {
  if (responsavelAcesso.temSessao()) {
    return {
      cliente: responsavelAcesso.cliente,
      envio: 'responsavel/laudo/',
      perfil: 'responsavel/perfil-apoio/',
    }
  }
  return { cliente: api, envio: `alunos/${alunoId}/laudo/`, perfil: `perfis-apoio/${perfilId}/` }
}

class LaudosService {
  /**
   * Envia o laudo para processamento em memória pela IA no backend (Gemini).
   * O backend confere o nome, gera/atualiza o PerfilApoio e descarta o arquivo imediatamente.
   */
  async enviar (alunoId: number, arquivo: File, opcoes: EnvioLaudoOpcoes = {}): Promise<Laudo> {
    const formData = new FormData()
    formData.append('arquivo', arquivo)
    if (opcoes.confirmarNome) {
      formData.append('confirmar_nome', 'true')
    }

    const { cliente, envio } = rotas(alunoId, 0)
    try {
      const { data } = await cliente.post<AlunoLaudoResposta>(envio, formData, {
        headers: {
          'Content-Type': undefined,
        },
        params: opcoes.confirmarNome ? { confirmar_nome: true } : undefined,
        signal: opcoes.signal,
        timeout: 120_000,
        onUploadProgress: evento => {
          if (evento.total) {
            opcoes.onProgresso?.(Math.round((evento.loaded / evento.total) * 100))
          }
        },
      })

      return {
        id: data.perfil_apoio.id,
        aluno: data.perfil_apoio.aluno,
        nome_arquivo: arquivo.name,
        nome_confere: data.nome_conferiu,
        necessidades: data.perfil_apoio.necessidades || [],
        adaptacoes: data.perfil_apoio.estrategias || [],
        observacao: data.perfil_apoio.observacoes || '',
        arquivo_apagado_em: data.arquivo_excluido_em,
      }
    } catch (error) {
      throw buildApiError(error, 'Não foi possível enviar o laudo para análise.')
    }
  }

  /**
   * Busca o perfil de apoio gerado pelo laudo para conferência na tela de revisão.
   */
  async buscar (id: number): Promise<Laudo> {
    const { cliente, perfil } = rotas(0, id)
    try {
      const { data } = await cliente.get<PerfilApoio>(perfil)
      return {
        id: data.id,
        aluno: data.aluno,
        nome_arquivo: 'laudo.pdf',
        nome_confere: true,
        necessidades: data.necessidades || [],
        adaptacoes: data.estrategias || [],
        observacao: data.observacoes || '',
      }
    } catch (error) {
      throw buildApiError(error, 'Não foi possível carregar os dados do laudo.')
    }
  }

  /**
   * Salva as correções feitas na tela de conferência diretamente no PerfilApoio ativo.
   */
  async confirmar (id: number, payload: LaudoDados): Promise<LaudoConfirmado> {
    const { cliente, perfil } = rotas(0, id)
    try {
      await cliente.patch<PerfilApoio>(perfil, {
        necessidades: payload.necessidades,
        estrategias: payload.adaptacoes,
        observacoes: payload.observacao,
      })
      return {
        arquivo_apagado_em: new Date().toISOString(),
      }
    } catch (error) {
      throw buildApiError(error, 'Não foi possível salvar o perfil de apoio.')
    }
  }
}

export default new LaudosService()
