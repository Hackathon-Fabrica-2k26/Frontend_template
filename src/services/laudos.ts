import type { EnvioLaudoOpcoes, Laudo, LaudoConfirmado, LaudoDados } from '@/interfaces/laudo'
import api from '@/plugins/api'
import { buildApiError } from '@/utils/apiError'

// Sem backend de laudos ainda, o padrão é simular o envio. Use VITE_MOCK_LAUDOS=false
// no .env para falar com a API de verdade.
const mockEnabled = import.meta.env.VITE_MOCK_LAUDOS !== 'false'

let mockId = 0

function wait (ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Leitura simulada: a mesma para qualquer laudo, assim a tela abre até depois de recarregar.
function laudoSimulado (id: number, alunoId = 0, nomeArquivo = 'laudo.pdf'): Laudo {
  return {
    id,
    aluno: alunoId,
    nome_arquivo: nomeArquivo,
    nome_confere: true,
    necessidades: [
      'Necessidade de apoio na rotina escolar',
      'Previsibilidade nas atividades diárias',
      'Apoio na organização de materiais e tarefas',
    ],
    adaptacoes: [
      'Utilizar rotina visual na sala de aula',
      'Oferecer instruções claras e objetivas',
      'Permitir pausas curtas durante as atividades prolongadas',
      'Garantir ambiente organizado com estímulos visuais adequados',
    ],
    observacao: 'Acompanhamento regular necessário para o desenvolvimento escolar.',
  }
}

// Só no modo simulado: um arquivo com "erro" no nome falha no meio do envio.
function simularEnvio (alunoId: number, arquivo: File, { onProgresso, signal }: EnvioLaudoOpcoes): Promise<Laudo> {
  return new Promise((resolve, reject) => {
    let percentual = 0

    const timer = setInterval(() => {
      percentual = Math.min(100, percentual + 4 + Math.round(Math.random() * 8))
      onProgresso?.(percentual)

      if (percentual >= 60 && arquivo.name.toLowerCase().includes('erro')) {
        clearInterval(timer)
        reject(new Error('Não foi possível enviar o laudo.'))
      } else if (percentual === 100) {
        clearInterval(timer)
        resolve(laudoSimulado(++mockId, alunoId, arquivo.name))
      }
    }, 180)

    signal?.addEventListener('abort', () => {
      clearInterval(timer)
      reject(new Error('Envio cancelado.'))
    })
  })
}

class LaudosService {
  async enviar (alunoId: number, arquivo: File, opcoes: EnvioLaudoOpcoes = {}) {
    if (mockEnabled) {
      return simularEnvio(alunoId, arquivo, opcoes)
    }

    const formData = new FormData()
    formData.append('aluno', String(alunoId))
    formData.append('arquivo', arquivo)

    try {
      const { data } = await api.post<Laudo>('laudos/', formData, {
        headers: {
          'Content-Type': undefined,
        },
        signal: opcoes.signal,
        timeout: 120_000,
        onUploadProgress: evento => {
          if (evento.total) {
            opcoes.onProgresso?.(Math.round((evento.loaded / evento.total) * 100))
          }
        },
      })
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível enviar o laudo.')
    }
  }

  async buscar (id: number) {
    if (mockEnabled) {
      await wait(400)
      return laudoSimulado(id)
    }

    try {
      const { data } = await api.get<Laudo>(`laudos/${id}/`)
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível carregar o laudo.')
    }
  }

  /** Salva o que a professora conferiu. O backend apaga o arquivo e devolve quando. */
  async confirmar (id: number, payload: LaudoDados) {
    if (mockEnabled) {
      await wait(800)
      return { arquivo_apagado_em: new Date().toISOString() }
    }

    try {
      const { data } = await api.post<LaudoConfirmado>(`laudos/${id}/confirmar/`, payload)
      return data
    } catch (error) {
      throw buildApiError(error, 'Não foi possível salvar o laudo.')
    }
  }
}

export default new LaudosService()
