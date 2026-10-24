<script setup lang="ts">
  import { ArrowRight, ChevronLeft, ShieldCheck } from '@lucide/vue'
  import { computed, onMounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import privacidadeUrl from '@/assets/mascotes/privacidade.svg'
  import alunosService from '@/services/alunos'
  import { usePedagogicoStore } from '@/stores/pedagogico'
  import { notify } from '@/utils/notify'

  const route = useRoute('/relatorios/novo')
  const router = useRouter()
  const pedagogico = usePedagogicoStore()

  const sugestoesFortes = ['Memória visual', 'Gosta de ajudar colegas', 'Curiosidade', 'Criatividade', 'Boa oralidade']
  const sugestoesDesafios = ['Manter o foco em tarefas longas', 'Sensibilidade a ruídos', 'Coordenação motora fina', 'Frustração ao errar', 'Interação com colegas']

  const etapa = ref<1 | 2>(1)
  const gerando = ref(false)

  const nomeAluno = ref('Aluno')
  const fortes = ref<string[]>([])
  const desafios = ref<string[]>([])
  const novoForte = ref('')
  const novoDesafio = ref('')
  const contexto = ref('Turma de 30 alunos, aula de 4 horas por dia')

  const alunoId = computed(() => Number(route.query.aluno))
  const turmaId = computed(() => Number(route.query.turma) || 1)

  // O que a IA recebe: codinome no lugar do nome e sem números (datas, idades, telefones).
  function anonimizar (texto: string): string {
    let saida = texto.replace(/\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}/g, '[data removida]').replace(/\d{4,}/g, '[número removido]')
    for (const parte of nomeAluno.value.split(' ').filter(p => p.length > 2)) {
      saida = saida.replaceAll(new RegExp(parte, 'gi'), 'Aluno Alfa')
    }
    return saida
  }

  const original = computed(() => ({
    nome: nomeAluno.value,
    fortes: fortes.value,
    desafios: desafios.value,
    contexto: contexto.value,
  }))

  const anonimo = computed(() => ({
    nome: 'Aluno Alfa',
    fortes: fortes.value.map(item => anonimizar(item)),
    desafios: desafios.value.map(item => anonimizar(item)),
    contexto: anonimizar(contexto.value),
  }))

  const podeContinuar = computed(() => fortes.value.length > 0 && desafios.value.length > 0)

  function alternar (lista: string[], valor: string) {
    const i = lista.indexOf(valor)
    if (i === -1) lista.push(valor)
    else lista.splice(i, 1)
  }

  function adicionar (lista: string[], campo: typeof novoForte) {
    const texto = campo.value.trim()
    if (texto && !lista.includes(texto)) lista.push(texto)
    campo.value = ''
  }

  async function gerar () {
    gerando.value = true
    try {
      const { relatorio } = await pedagogico.gerarRelatorio({
        aluno: alunoId.value,
        pontos_fortes: anonimo.value.fortes,
        desafios: anonimo.value.desafios,
        contexto_turma: anonimo.value.contexto,
      })
      await router.replace(`/relatorios/${relatorio.id}`)
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Não foi possível gerar o relatório.')
      gerando.value = false
    }
  }

  onMounted(async () => {
    if (!Number.isInteger(alunoId.value) || alunoId.value <= 0) {
      notify.error('Escolha um aluno para gerar o relatório.')
      await router.replace('/turmas')
      return
    }
    try {
      const { results } = await alunosService.list({ turma: turmaId.value })
      nomeAluno.value = results.find(a => a.id === alunoId.value)?.nome ?? nomeAluno.value
    } catch {
      // Sem o nome, o filtro só usa o codinome.
    }
  })
</script>

<template>
  <div class="novo">
    <div v-if="gerando" class="gerando">
      <MarsupiLoading label="Processando" />
      <p>Enviando só o codinome e o contexto pedagógico.</p>
    </div>

    <template v-else>
      <button class="voltar" type="button" @click="etapa === 2 ? (etapa = 1) : router.back()">
        <ChevronLeft :size="18" /> Voltar
      </button>

      <ol aria-label="Etapas" class="passos">
        <li :class="{ ativo: etapa === 1 }">1. Entrada guiada</li>
        <li :class="{ ativo: etapa === 2 }">2. Filtro de privacidade</li>
      </ol>

      <!-- Etapa 1: perguntas pedagógicas simples -->
      <section v-if="etapa === 1" class="cartao">
        <h1>Conte sobre {{ nomeAluno }}</h1>
        <p class="sub">Escolha o que você observa em sala. Sem jargões, sem diagnóstico.</p>

        <h2>O que a criança faz bem?</h2>

        <div class="chips">
          <v-chip
            v-for="s in sugestoesFortes"
            :key="s"
            :color="fortes.includes(s) ? 'primary' : undefined"
            :variant="fortes.includes(s) ? 'flat' : 'outlined'"
            @click="alternar(fortes, s)"
          >
            {{ s }}
          </v-chip>

          <v-chip
            v-for="s in fortes.filter(f => !sugestoesFortes.includes(f))"
            :key="s"
            closable
            color="primary"
            @click:close="alternar(fortes, s)"
          >
            {{ s }}
          </v-chip>
        </div>

        <v-text-field
          v-model="novoForte"
          density="comfortable"
          hide-details
          placeholder="Outro ponto forte (Enter para adicionar)"
          variant="outlined"
          @keyup.enter="adicionar(fortes, novoForte)"
        />

        <h2>Onde ela precisa de apoio?</h2>

        <div class="chips">
          <v-chip
            v-for="s in sugestoesDesafios"
            :key="s"
            :color="desafios.includes(s) ? 'primary' : undefined"
            :variant="desafios.includes(s) ? 'flat' : 'outlined'"
            @click="alternar(desafios, s)"
          >
            {{ s }}
          </v-chip>

          <v-chip
            v-for="s in desafios.filter(f => !sugestoesDesafios.includes(f))"
            :key="s"
            closable
            color="primary"
            @click:close="alternar(desafios, s)"
          >
            {{ s }}
          </v-chip>
        </div>

        <v-text-field
          v-model="novoDesafio"
          density="comfortable"
          hide-details
          placeholder="Outro desafio (Enter para adicionar)"
          variant="outlined"
          @keyup.enter="adicionar(desafios, novoDesafio)"
        />

        <h2>Contexto da turma</h2>
        <v-text-field v-model="contexto" density="comfortable" hide-details variant="outlined" />

        <div class="acoes">
          <v-btn :append-icon="ArrowRight" color="primary" :disabled="!podeContinuar" @click="etapa = 2">
            Continuar
          </v-btn>
        </div>
      </section>

      <!-- Etapa 2: o que você escreveu × o que a IA recebe -->
      <section v-else class="cartao">
        <div class="titulo-privacidade">
          <img alt="" :src="privacidadeUrl">

          <div>
            <h1><ShieldCheck :size="22" /> Filtro de privacidade</h1>

            <p class="sub">
              Dados de crianças são protegidos pela LGPD (Art. 14). Por isso, a IA nunca recebe o nome,
              a cidade nem datas: só um codinome pedagógico.
            </p>
          </div>
        </div>

        <div class="lado-a-lado">
          <article class="lado original">
            <h3>O que você escreveu</h3>
            <p><strong>Aluno:</strong> {{ original.nome }}</p>
            <p><strong>Pontos fortes:</strong> {{ original.fortes.join('; ') }}</p>
            <p><strong>Apoio:</strong> {{ original.desafios.join('; ') }}</p>
            <p><strong>Contexto:</strong> {{ original.contexto }}</p>
          </article>

          <article class="lado anonimo">
            <h3>O que a IA recebe</h3>
            <p><strong>Aluno:</strong> {{ anonimo.nome }}</p>
            <p><strong>Pontos fortes:</strong> {{ anonimo.fortes.join('; ') }}</p>
            <p><strong>Apoio:</strong> {{ anonimo.desafios.join('; ') }}</p>
            <p><strong>Contexto:</strong> {{ anonimo.contexto }}</p>
          </article>
        </div>

        <div class="acoes">
          <v-btn color="primary" @click="gerar">Entendi, gerar relatório</v-btn>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.novo { max-width: 860px; margin: 0 auto; color: #263d35; font-family: Poppins, sans-serif; }
.voltar { display: inline-flex; align-items: center; gap: .25rem; margin-bottom: 1rem; background: none; border: 0; color: #356b5b; font: inherit; font-weight: 500; cursor: pointer; }
.passos { display: flex; gap: .5rem; flex-wrap: wrap; margin: 0 0 1rem; padding: 0; list-style: none; }
.passos li { padding: .35rem .9rem; border-radius: 999px; background: #eef5f0; font-size: .85rem; color: #52695f; }
.passos li.ativo { background: #356b5b; color: #fff; }
.cartao { padding: 1.75rem; border-radius: 24px; background: #fff; border: 1px solid #dfe8e0; }
h1 { display: flex; align-items: center; gap: .5rem; margin: 0 0 .25rem; font-size: 1.5rem; font-weight: 600; }
h2 { margin: 1.5rem 0 .6rem; font-size: 1rem; font-weight: 600; }
.sub { margin: 0; line-height: 1.6; color: #52695f; }
.chips { display: flex; flex-wrap: wrap; gap: .5rem; margin-bottom: .75rem; }
.acoes { display: flex; justify-content: flex-end; margin-top: 1.5rem; }
.titulo-privacidade { display: flex; gap: 1rem; align-items: center; }
.titulo-privacidade img { width: 110px; flex: none; }
.lado-a-lado { display: grid; gap: 1rem; margin-top: 1.25rem; grid-template-columns: 1fr; }
@media (min-width: 720px) { .lado-a-lado { grid-template-columns: 1fr 1fr; } }
.lado { padding: 1rem 1.25rem; border-radius: 16px; font-size: .9rem; line-height: 1.5; }
.lado h3 { margin: 0 0 .5rem; font-size: .95rem; }
.lado p { margin: 0 0 .4rem; }
.original { background: #fbf3e6; border: 1px solid #e3b477; }
.anonimo { background: #eef5f0; border: 1px solid #a9c7b4; }
.gerando { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 4rem 1rem; text-align: center; }
</style>
