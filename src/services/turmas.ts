
import type {
  ReconhecimentoChamada,
  Turma,
  TurmaPayload,
} from '@/interfaces/turma'
import api from '@/plugins/api'
import { buildApiError } from '@/utils/apiError'

const usarMock = import.meta.env.VITE_MOCK_TURMAS !== 'false'
const CHAVE_TURMAS = 'marsupi:turmas'

const nomesExemplo = [
  'Alice Santos',
  'Arthur Oliveira',
  'Beatriz Costa',
  'Davi Pereira',
  'Helena Martins',
  'Lucas Almeida',
  'Maria Eduarda Lima',
  'Miguel Souza',
]

function aguardar (ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function carregarTurmasLocais (): Turma[] {
  try {
    const dados = localStorage.getItem(CHAVE_TURMAS)
    if (!dados) return []

    const resultado: unknown = JSON.parse(dados)
    return Array.isArray(resultado) ? resultado as Turma[] : []
  } catch {
    return []
  }
}

class TurmasService {
  async list (): Promise<Turma[]> {
    if (usarMock) {
      return carregarTurmasLocais()
    }

    try {
      const { data } = await api.get<Turma[] | {
        results: Turma[]
      }>('turmas/')

      return Array.isArray(data) ? data : data.results
    } catch (error) {
      throw buildApiError(
        error,
        'Não foi possível carregar as turmas.',
      )
    }
  }

  async reconhecer (foto: File): Promise<ReconhecimentoChamada> {
    if (!foto) {
      throw new Error('Selecione uma foto da chamada.')
    }

    if (usarMock) {
      await aguardar(1800)

      return {
        nomes: nomesExemplo.map((nome, index) => ({
          id: `mock-${index + 1}`,
          nome,
          confianca: index === 3 || index === 6 ? 0.65 : 0.97,
        })),
      }
    }

    const formData = new FormData()
    formData.append('foto', foto)

    try {
      const { data } = await api.post<ReconhecimentoChamada>(
        'chamada/reconhecer/',
        formData,
        { timeout: 120_000 },
      )

      return data
    } catch (error) {
      throw buildApiError(
        error,
        'Não foi possível reconhecer os nomes.',
      )
    }
  }

  async create (payload: TurmaPayload): Promise<Turma> {
    if (usarMock) {
      await aguardar(700)

      const turma: Turma = {
        id: Date.now(),
        ...payload,
      }

      const turmas = carregarTurmasLocais()

      try {
        localStorage.setItem(
          CHAVE_TURMAS,
          JSON.stringify([turma, ...turmas]),
        )
      } catch {
        throw new Error(
          'Não foi possível salvar a turma neste navegador.',
        )
      }

      return turma
    }

    try {
      const { data } = await api.post<Turma>(
        'turmas/',
        payload,
      )

      return data
    } catch (error) {
      throw buildApiError(
        error,
        'Não foi possível criar a turma.',
      )
    }
  }
}

export default new TurmasService()
