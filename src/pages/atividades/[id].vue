<script setup lang="ts">
  import type { Aluno } from '@/interfaces/aluno'
  import type { Atividade } from '@/interfaces/atividade'
  import type { AtividadeVariacao, MapaVariacaoItem } from '@/interfaces/variacao'
  import { ArrowLeft, Check, Download, FileText, Sparkles, Upload } from '@lucide/vue'
  import { computed, ref, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import { alunosService } from '@/services/alunos'
  import { atividadesService } from '@/services/atividades'
  import { variacoesService } from '@/services/variacoes'
  import { notify } from '@/utils/notify'

  const route = useRoute('/atividades/[id]')
  const atividade = ref<Atividade | null>(null)
  const alunos = ref<Aluno[]>([])
  const variacoes = ref<AtividadeVariacao[]>([])
  const mapa = ref<MapaVariacaoItem[]>([])
  const carregando = ref(true)
  const erro = ref('')
  const erroMapa = ref('')
  const ocupada = ref(false)
  const envioAberto = ref(false)
  const conteudos = ref<Record<number, string>>({})
  const titulo = computed(() => atividade.value?.titulo || atividade.value?.nome || 'Atividade')
  const aprovada = computed(() => variacoes.value.filter(v => v.status === 'aprovada').length)

  function mensagem (error: unknown): string {
    return error instanceof Error ? error.message : 'Não foi possível concluir a operação.'
  }

  function alterada (v: AtividadeVariacao): boolean {
    return conteudos.value[v.id] !== v.conteudo
  }

  function destinatarios (v: AtividadeVariacao): string {
    const item = mapa.value.find(m => m.variacao_id === v.id)
    if (item) return item.alunos.map(a => a.nome).join(', ') || 'Nenhum estudante associado'
    return erroMapa.value ? 'Destinatários indisponíveis' : 'Nenhum estudante associado'
  }

  async function carregarMapa () {
    erroMapa.value = ''
    try {
      mapa.value = await atividadesService.mapaVariacoes(Number(route.params.id))
    } catch (error) {
      erroMapa.value = mensagem(error)
    }
  }

  async function carregar () {
    carregando.value = true
    erro.value = ''
    atividade.value = null
    alunos.value = []
    variacoes.value = []
    mapa.value = []
    try {
      const id = Number(route.params.id)
      if (!Number.isInteger(id) || id <= 0) throw new Error('Atividade inválida.')
      atividade.value = await atividadesService.get(id)
      let paginaVersoes = 1
      while (true) {
        const lista = await variacoesService.list({ atividade: id, page: paginaVersoes })
        variacoes.value.push(...(Array.isArray(lista) ? lista : lista.results))
        if (Array.isArray(lista) || !lista.next) break
        paginaVersoes += 1
      }
      // Carrega todas as páginas para não omitir estudantes da seleção de trabalhos.
      if (atividade.value.turma) {
        let page = 1
        while (true) {
          const resposta = await alunosService.list({ turma: atividade.value.turma, page })
          alunos.value.push(...resposta.results)
          if (!resposta.next) break
          page += 1
        }
      }
      conteudos.value = Object.fromEntries(variacoes.value.map(v => [v.id, v.conteudo]))
      await carregarMapa()
    } catch (error) {
      erro.value = mensagem(error)
    } finally {
      carregando.value = false
    }
  }

  async function atualizarRelatorios () {
    if (!atividade.value) return
    try {
      atividade.value = await atividadesService.get(atividade.value.id)
    } catch (error) {
      notify.error(mensagem(error))
    }
  }

  async function gerar () {
    if (!atividade.value || ocupada.value) return
    ocupada.value = true
    try {
      variacoes.value = await atividadesService.gerarVariacoes(atividade.value.id)
      conteudos.value = Object.fromEntries(variacoes.value.map(v => [v.id, v.conteudo]))
      await carregarMapa()
      notify.success('Versões geradas. Revise cada uma antes de aprovar.')
    } catch (error) {
      notify.error(mensagem(error))
    } finally {
      ocupada.value = false
    }
  }

  async function salvar (v: AtividadeVariacao) {
    const conteudo = conteudos.value[v.id]?.trim()
    if (!conteudo || ocupada.value) return
    ocupada.value = true
    try {
      const atualizada = await variacoesService.update(v.id, { conteudo, editada_manual: true, status: 'rascunho' })
      variacoes.value = variacoes.value.map(item => item.id === v.id ? atualizada : item)
      conteudos.value[v.id] = atualizada.conteudo
      notify.success('Alterações salvas. Revise e aprove novamente.')
    } catch (error) {
      notify.error(mensagem(error))
    } finally {
      ocupada.value = false
    }
  }

  async function aprovar (v: AtividadeVariacao) {
    if (ocupada.value || alterada(v)) return
    ocupada.value = true
    try {
      const atualizada = await variacoesService.aprovar(v.id)
      variacoes.value = variacoes.value.map(item => item.id === v.id ? atualizada : item)
      notify.success('Versão aprovada para impressão.')
    } catch (error) {
      notify.error(mensagem(error))
    } finally {
      ocupada.value = false
    }
  }

  async function baixar (v: AtividadeVariacao) {
    if (ocupada.value || alterada(v) || v.status !== 'aprovada') return
    ocupada.value = true
    try {
      await variacoesService.downloadPdf(v.id, `${titulo.value}_v${v.numero}.pdf`)
    } catch (error) {
      notify.error(mensagem(error))
    } finally {
      ocupada.value = false
    }
  }

  watch(() => route.params.id, carregar, { immediate: true })
</script>

<template>
  <main class="atividade-pagina">
    <v-btn :prepend-icon="ArrowLeft" :to="atividade?.turma ? `/turmas/${atividade.turma}` : '/turmas'" variant="text">Voltar à turma</v-btn>
    <MarsupiLoading v-if="carregando" label="Carregando atividade..." />

    <v-alert v-else-if="erro" role="alert" type="error" variant="tonal">
      {{ erro }}
      <v-btn class="ml-3" variant="text" @click="carregar">Tentar novamente</v-btn>
    </v-alert>

    <template v-else-if="atividade">
      <header class="cabecalho">
        <div>
          <p class="legenda">PLANEJAMENTO DA TURMA</p>
          <h1>{{ titulo }}</h1>
          <p>{{ atividade.descricao || 'Revise a proposta e prepare as versões para a turma.' }}</p>
        </div>

        <v-btn color="primary" :disabled="ocupada" :prepend-icon="Upload" @click="envioAberto = true">Enviar trabalhos</v-btn>
      </header>

      <section aria-labelledby="original-titulo" class="bloco">
        <h2 id="original-titulo"><FileText :size="22" /> Proposta original</h2>
        <p class="texto-original">{{ atividade.texto_original || atividade.descricao || 'Sem texto original disponível.' }}</p>
      </section>

      <section aria-labelledby="versoes-titulo" class="bloco">
        <div class="cabecalho">
          <div>
            <h2 id="versoes-titulo">Versões para a turma</h2>
            <p>{{ aprovada }} de {{ variacoes.length }} versões aprovadas</p>
          </div>

          <v-btn
            v-if="variacoes.length === 0"
            color="primary"
            :loading="ocupada"
            :prepend-icon="Sparkles"
            @click="gerar"
          >Gerar versões com IA</v-btn>
        </div>

        <p v-if="variacoes.length === 0">A atividade é cadastrada uma vez. A IA prepara a versão geral e as adaptações a partir dos perfis de apoio disponíveis.</p>

        <v-alert
          v-if="erroMapa"
          class="my-4"
          role="alert"
          type="warning"
          variant="tonal"
        >
          {{ erroMapa }}
          <v-btn variant="text" @click="carregarMapa">Recarregar destinatários</v-btn>
        </v-alert>

        <article v-for="versao in variacoes" :key="versao.id" class="versao">
          <div class="cabecalho">
            <h3>{{ versao.rotulo || `Versão ${versao.numero}` }}</h3>
            <v-chip :color="versao.status === 'aprovada' ? 'primary' : 'warning'" size="small">{{ versao.status === 'aprovada' ? 'Aprovada' : versao.status === 'rascunho' ? 'Em revisão' : versao.status }}</v-chip>
          </div>

          <p>{{ versao.eh_geral ? 'Versão geral' : 'Versão adaptada' }} · {{ destinatarios(versao) }}</p>

          <v-textarea
            v-model="conteudos[versao.id]"
            auto-grow
            class="mt-4"
            :disabled="ocupada"
            :label="`Conteúdo da versão ${versao.numero}`"
            rows="6"
            variant="outlined"
          />

          <div class="acoes">
            <v-btn :disabled="ocupada || !alterada(versao) || !conteudos[versao.id]?.trim()" variant="outlined" @click="salvar(versao)">Salvar alterações</v-btn>
            <v-btn color="primary" :disabled="ocupada || alterada(versao) || versao.status === 'aprovada' || !versao.conteudo.trim()" :prepend-icon="Check" @click="aprovar(versao)">Aprovar versão</v-btn>
            <v-btn :disabled="ocupada || alterada(versao) || versao.status !== 'aprovada'" :prepend-icon="Download" variant="text" @click="baixar(versao)">Baixar PDF</v-btn>
          </div>

          <p v-if="alterada(versao)" class="aviso" role="status">Salve as alterações antes de aprovar ou baixar esta versão.</p>
        </article>
      </section>

      <section class="bloco">
        <h2>Relatórios da atividade</h2>
        <p v-if="!atividade.relatorios?.length">Nenhum relatório vinculado ainda. Envie os trabalhos e confirme a identificação dos estudantes.</p>

        <div v-else class="acoes">
          <v-btn v-for="id in atividade.relatorios" :key="id" :to="`/relatorios/${id}`" variant="outlined">Abrir relatório {{ id }}</v-btn>
        </div>
      </section>

      <EnviarTrabalhosDialog
        v-model="envioAberto"
        :atividade-id="atividade.id"
        :atividade-nome="titulo"
        :estudantes="alunos"
        @completed="atualizarRelatorios"
      />
    </template>
  </main>
</template>

<style scoped>
.atividade-pagina { max-width: 1120px; margin: 0 auto; color: #263d35; }
.cabecalho { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 20px; margin: 20px 0; }
h1 { font-size: clamp(1.6rem, 4vw, 2.3rem); overflow-wrap: anywhere; }
h2 { display: flex; align-items: center; gap: 10px; font-size: 1.25rem; margin-bottom: 12px; }
p { line-height: 1.7; }
.legenda { color: #356b5b; font-size: .75rem; letter-spacing: .12em; font-weight: 600; }
.bloco { padding: clamp(18px, 3vw, 30px); margin: 24px 0; background: #fff; border: 1px solid #dbe5dc; border-radius: 18px; }
.versao { border-top: 1px solid #dbe5dc; margin-top: 24px; padding-top: 8px; }
.texto-original { white-space: pre-wrap; overflow-wrap: anywhere; max-height: 360px; overflow: auto; }
.acoes { display: flex; gap: 12px; flex-wrap: wrap; }
.aviso { margin-top: 12px; color: #815a15; }
@media (max-width: 600px) { .acoes > * { width: 100%; } }
</style>
