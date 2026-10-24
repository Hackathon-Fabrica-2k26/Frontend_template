import type { Turma } from '@/interfaces/escola'
import type { AtividadeRecente, PerfilResumo } from '@/interfaces/perfil'
import { atividadesService } from '@/services/atividades'
import { turmasService } from '@/services/escolas'
import pedagogicoService from '@/services/pedagogico'

// Os dados do perfil vêm dos recursos da API (turmas, atividades e relatórios).
class PerfilService {
  async resumo (): Promise<PerfilResumo> {
    const [turmas, atividades, relatorios] = await Promise.all([
      turmasService.list(),
      atividadesService.list(),
      pedagogicoService.list(),
    ])

    return {
      turmas: turmas.count,
      atividades: atividades.count,
      trabalhos_analisados: relatorios.count,
    }
  }

  async turmas (): Promise<Turma[]> {
    return (await turmasService.list()).results
  }

  async atividadesRecentes (): Promise<AtividadeRecente[]> {
    const { results } = await atividadesService.list()

    return results.slice(0, 5).map(atividade => ({
      id: atividade.id,
      titulo: atividade.titulo || atividade.nome || 'Atividade',
      data: atividade.created_at,
      status: atividade.relatorios && atividade.relatorios.length > 0 ? 'analisada' : 'pendente',
      turma: atividade.turma,
    }))
  }
}

export default new PerfilService()
