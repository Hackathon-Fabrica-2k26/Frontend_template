import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import alunosService from '@/services/alunos'
import { useAuthStore } from '@/stores/auth'

/**
 * Primeiro nome do aluno de `?aluno=<id>&turma=<id>`, para os textos do fluxo do laudo.
 * Sem aluno na URL ou sem login fica o texto genérico (a API mandaria para o login no 401).
 */
export function useNomeAluno (padrao = 'o aluno') {
  const route = useRoute()
  const auth = useAuthStore()
  const nome = ref(padrao)

  const alunoId = computed(() => Number(route.query.aluno))
  const turmaId = computed(() => Number(route.query.turma) || undefined)

  onMounted(async () => {
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
