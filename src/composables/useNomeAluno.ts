import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import alunosService from '@/services/alunos'
import responsavelAcesso from '@/services/responsavelAcesso'
import { useAuthStore } from '@/stores/auth'

/**
 * Primeiro nome do aluno de `?aluno=<id>&turma=<id>`, para os textos do fluxo do laudo.
 * Sem aluno na URL ou sem login fica o texto genérico (a API mandaria para o login no 401).
 */
export function useNomeAluno (padrao = 'o aluno') {
  const route = useRoute()
  const auth = useAuthStore()
  const nomeInicial = computed(() => {
    const raw = route.query.nome
    if (typeof raw === 'string' && raw.trim()) {
      return raw.trim().split(' ', 1)[0]
    }
    return padrao
  })
  const nome = ref(nomeInicial.value)

  const alunoId = computed(() => Number(route.query.aluno))
  const turmaId = computed(() => Number(route.query.turma) || undefined)

  onMounted(async () => {
    // Responsável entrou pelo código: o backend devolve o nome do aluno do token.
    if (responsavelAcesso.temSessao()) {
      try {
        const aluno = await responsavelAcesso.aluno()
        nome.value = aluno.nome.split(' ', 1)[0] || padrao
      } catch {
        // Sem o nome, o texto continua genérico.
      }
      return
    }
    if (!Number.isInteger(alunoId.value) || alunoId.value <= 0 || !auth.isLogged) {
      return
    }
    try {
      const { results } = await alunosService.list({ turma: turmaId.value })
      nome.value = results.find(a => a.id === alunoId.value)?.nome.split(' ', 1)[0] ?? padrao
    } catch {
      // Sem o nome, o texto continua genérico.
    }
  })

  return { nome, alunoId }
}
