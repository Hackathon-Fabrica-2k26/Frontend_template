import type {
  Estudante,
  Trabalho,
  TrabalhoPayload,
} from '@/interfaces/trabalho'
import api from '@/plugins/api'
import { buildApiError } from '@/utils/apiError'

// Padrão: false (consome a API real). Use VITE_MOCK_TRABALHOS=true no .env para simular.
const mockEnabled = import.meta.env.VITE_MOCK_TRABALHOS === 'true'

let mockId = 0
// Só no modo simulado, para testar os estados de erro:
// - nome com "erro": falha sempre;
// - nome com "instavel": falha só na primeira vez.
const jaFalhou = new Set<string>()

function wait (ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
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
        identificacao: pendente ? 'pendente' : 'confirmada',
        aluno: pendente || !estudante ? null : estudante.id,
      }]
    }

    const formData = new FormData()
    formData.append('arquivos', arquivo)

    try {
      const { data } = await api.post<Trabalho[]>(
        `atividades/${atividadeId}/trabalhos/`,
        formData,
        {
          headers: {
            'Content-Type': undefined,
          },
          timeout: 120_000,
        },
      )

      return data
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
      const { data } = await api.patch<Trabalho>(
        `trabalhos/${trabalhoId}/`,
        payload,
      )

      return data
    } catch (error) {
      throw buildApiError(
        error,
        'Não foi possível confirmar a identificação.',
      )
    }
  }
}

export default new TrabalhosService()
