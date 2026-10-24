import type {
  EnvioTrabalhosResponse,
  Estudante,
  Trabalho,
  TrabalhoPayload,
  TrabalhoRespostaApi,
} from '@/interfaces/trabalho'
import api from '@/plugins/api'
import { buildApiError } from '@/utils/apiError'

// Sem backend de trabalhos ainda, o padrão é simular as respostas. Use VITE_MOCK_TRABALHOS=false
// no .env para falar com a API de verdade.
const mockEnabled = import.meta.env.VITE_MOCK_TRABALHOS !== 'false'

let mockId = 0
// Só no modo simulado, para testar os estados de erro:
// - nome com "erro": falha sempre;
// - nome com "instavel": falha só na primeira vez.
const jaFalhou = new Set<string>()

function wait (ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

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
    estudantes: Estudante[] = [],
    indice = 0,
  ): Promise<Trabalho[]> {
    if (mockEnabled) {
      await wait(1000 + (indice % 3) * 450)

      const nome = arquivo.name.toLowerCase()
      if (nome.includes('erro') || (nome.includes('instavel') && !jaFalhou.has(arquivo.name))) {
        jaFalhou.add(arquivo.name)
        throw new Error('Não foi possível analisar este arquivo.')
      }

      const estudante = estudantes.length > 0
        ? estudantes[indice % estudantes.length]
        : undefined
      const pendente = indice % 3 === 1 || !estudante

      return [{
        id: ++mockId,
        nome_arquivo: arquivo.name,
        nome_lido: estudante?.nome ?? '',
        confianca: pendente ? 0.48 : 0.96,
        confianca_nome: pendente ? 0.48 : 0.96,
        identificacao: pendente ? 'pendente' : 'confirmada',
        aluno: pendente || !estudante ? null : estudante.id,
        aluno_nome: pendente || !estudante ? null : estudante.nome,
      }]
    }

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

  async confirmar (
    trabalhoId: number,
    payload: TrabalhoPayload,
  ): Promise<Trabalho | null> {
    if (mockEnabled) {
      await wait(350)
      return null
    }

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
