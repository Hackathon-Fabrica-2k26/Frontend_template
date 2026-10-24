import type {
  Estudante,
  Trabalho,
  TrabalhoPayload,
} from '@/interfaces/trabalho'
import api from '@/plugins/api'
import { buildApiError } from '@/utils/apiError'

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
