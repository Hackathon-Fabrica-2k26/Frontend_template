import type { Turma } from '@/interfaces/escola'
import type { AtividadeRecente, PerfilResumo } from '@/interfaces/perfil'
import { mockAtividadesRecentes, mockResumo, mockTurmas } from '@/mocks/dados'

// A tela de perfil usa só dados do front (src/mocks/dados.ts). A pausa imita a espera de uma
// requisição e deixa o esqueleto aparecer. Para voltar à API, troque estes métodos por chamadas ao `api`.
const pausa = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms))

class PerfilService {
  async resumo (): Promise<PerfilResumo> {
    await pausa()
    return { ...mockResumo }
  }

  async turmas (): Promise<Turma[]> {
    await pausa()
    return mockTurmas.map(turma => ({ ...turma }))
  }

  async atividadesRecentes (): Promise<AtividadeRecente[]> {
    await pausa()
    return mockAtividadesRecentes.map(item => ({ ...item }))
  }
}

export default new PerfilService()
