import type {
  EnvioTrabalhosResponse,
  Estudante,
  Trabalho,
  TrabalhoPayload,
  TrabalhoRespostaApi,
} from '@/interfaces/trabalho'
import api from '@/plugins/api'
import { buildApiError } from '@/utils/apiError'

function normalizarTrabalho (
  item: TrabalhoRespostaApi,
  nomeArquivoPadrao = '',
): Trabalho {
  const confianca = typeof item.confianca_nome === 'number'
    ? item.confianca_nome
    : (typeof item.confianca === 'number' ? item.confianca : null)

  return {
    id: item.id,
    envio: item.envio,
    atividade: item.atividade,
    variacao: item.variacao ?? null,
    nome_arquivo: item.nome_arquivo || nomeArquivoPadrao,
    nome_lido: item.nome_lido ?? '',
    confianca,
    confianca_nome: confianca,
    identificacao: item.identificacao ?? 'pendente',
    status: item.status,
    descricao_ia: item.descricao_ia,
    dados_analise: item.dados_analise,
    aluno: item.aluno ?? null,
    aluno_nome: item.aluno_nome ?? null,
  }
}

class TrabalhosService {
  /**
   * Envia UM arquivo para a IA analisar e devolve os trabalhos encontrados nele.
   * Um arquivo por chamada permite acompanhar o progresso arquivo a arquivo.
   */
  async analisar (
    atividadeId: number,
    arquivo: File,
    _estudantes: Estudante[] = [],
    _indice = 0,
  ): Promise<Trabalho[]> {
    const formData = new FormData()
    formData.append('arquivos', arquivo)

    try {
      const { data } = await api.post<EnvioTrabalhosResponse | TrabalhoRespostaApi[]>(
        `atividades/${atividadeId}/trabalhos/`,
        formData,
        {
          headers: {
            'Content-Type': undefined,
          },
          timeout: 120_000,
        },
      )

      const lista = Array.isArray(data)
        ? data
        : (Array.isArray(data?.trabalhos) ? data.trabalhos : [])

      return lista.map(item => normalizarTrabalho(item, arquivo.name))
    } catch (error) {
      throw buildApiError(
        error,
        'Não foi possível enviar o arquivo.',
      )
    }
  }

  /**
   * Trabalhos da atividade que ainda esperam a professora dizer de quem são
   * (nome em dúvida ou não encontrado). Antes só apareciam dentro do modal de envio.
   */
  async listarPendentes (atividadeId: number): Promise<Trabalho[]> {
    try {
      const pendentes: Trabalho[] = []
      for (const identificacao of ['pendente', 'sem_aluno'] as const) {
        let page = 1
        while (true) {
          const { data } = await api.get<{ results: TrabalhoRespostaApi[], next: string | null }>(
            'trabalhos/',
            { params: { atividade: atividadeId, identificacao, page } },
          )
          pendentes.push(...data.results.map(item => normalizarTrabalho(item)))
          if (!data.next) {
            break
          }
          page += 1
        }
      }
      return pendentes
    } catch (error) {
      throw buildApiError(error, 'Não foi possível carregar os trabalhos para conferir.')
    }
  }

  async confirmar (
    trabalhoId: number,
    payload: TrabalhoPayload,
  ): Promise<Trabalho | null> {
    try {
      const { data } = await api.patch<TrabalhoRespostaApi>(
        `trabalhos/${trabalhoId}/`,
        {
          aluno: payload.aluno,
          ...(payload.identificacao ? { identificacao: payload.identificacao } : {}),
        },
      )

      return normalizarTrabalho(data)
    } catch (error) {
      throw buildApiError(
        error,
        'Não foi possível confirmar a identificação.',
      )
    }
  }
}

export default new TrabalhosService()
