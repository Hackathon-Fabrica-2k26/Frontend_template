// Dados do perfil, só no front (sem servidor). Para trocar o conteúdo, edite este arquivo.
import type { Turma } from '@/interfaces/escola'
import type { AtividadeRecente, PerfilResumo } from '@/interfaces/perfil'
import type { User } from '@/interfaces/user'

function turma (id: number, nome: string, alunos: number): Turma {
  return {
    id,
    nome,
    escola: 1,
    professores: [1],
    turno: 'manha',
    turno_display: 'Manhã',
    total_estudantes: alunos,
    created_at: '2026-02-10T00:00:00Z',
  }
}

export const mockTurmas: Turma[] = [
  turma(1, '1º ano A', 25),
  turma(2, '2º ano A', 22),
  turma(3, '3º ano A', 28),
]

export const mockResumo: PerfilResumo = {
  turmas: mockTurmas.length,
  atividades: 12,
  trabalhos_analisados: 48,
}

export const mockAtividadesRecentes: AtividadeRecente[] = [
  { id: 1, titulo: 'Explorando as vogais', data: '2026-10-23', status: 'analisada', turma: 1 },
  { id: 2, titulo: 'Contando até 10', data: '2026-10-20', status: 'em_analise', turma: 2 },
]

// Usada no perfil só quando não há usuário logado (ex.: login desligado localmente).
export const mockUsuario: User = {
  id: 1,
  name: 'Ana Paula Souza',
  email: 'ana.souza@escola.com',
  matricula: 'U00001',
}
