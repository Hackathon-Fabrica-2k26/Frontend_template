import type {
  Estudante,
  Trabalho,
  TrabalhoPayload,
} from '@/interfaces/trabalho'
import api from '@/plugins/api'
import { buildApiError } from '@/utils/apiError'

const mockEnabled = import.meta.env.VITE_MOCK_TRABALHOS !== 'false'

function wait (ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

class TrabalhosService {
  async upload (
    atividadeId: number,
    arquivos: File[],
    estudantes: Estudante[] = [],
  ): Promise<Trabalho[]> {
    if (mockEnabled) {
      await wait(2200)

      return arquivos.map((arquivo, index) => {
        const estudante = estudantes[index % estudantes.length]
        const pendente = index % 3 === 1 || !estudante

        return {
          id: index + 1,
          nome_arquivo: arquivo.name,
          nome_lido: estudante?.nome ?? '',
          confianca: pendente ? 0.48 : 0.96,
          identificacao: pendente ? 'pendente' : 'confirmada',
          aluno: pendente ? null : estudante.id,
        }
      })
    }

    const formData = new FormData()

    for (const arquivo of arquivos) {
      formData.append('arquivos', arquivo)
    }

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
        'Não foi possível enviar os trabalhos.',
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
