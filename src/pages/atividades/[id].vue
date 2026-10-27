<script setup lang="ts">
  import type { Aluno } from '@/interfaces/aluno'
  import type { Atividade } from '@/interfaces/atividade'
  import type { Relatorio } from '@/interfaces/pedagogico'
  import type { Trabalho } from '@/interfaces/trabalho'
  import type { AtividadeVariacao, MapaVariacaoItem } from '@/interfaces/variacao'
  import { ArrowLeft, Check, Download, FileText, Pencil, Sparkles, Upload } from '@lucide/vue'
  import { computed, ref, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import { alunosService } from '@/services/alunos'
  import { atividadesService } from '@/services/atividades'
  import { pedagogicoService } from '@/services/pedagogico'
  import trabalhosService from '@/services/trabalho'
  import { variacoesService } from '@/services/variacoes'
  import { notify } from '@/utils/notify'

  // Base: página de versões do PR #80 (IgorMMichels), reorganizada em abas (issue #90).
  type Aba = 'atividade' | 'versoes' | 'trabalhos'

  const route = useRoute('/atividades/[id]')
  const aba = ref<Aba>('atividade')
  const atividade = ref<Atividade | null>(null)
  const alunos = ref<Aluno[]>([])
  const variacoes = ref<AtividadeVariacao[]>([])
  const mapa = ref<MapaVariacaoItem[]>([])
  const relatorios = ref<Relatorio[]>([])
  const pendentes = ref<Trabalho[]>([])
  const escolhaAluno = ref<Record<number, number | null>>({})
  const confirmando = ref<number | null>(null)
  const carregando = ref(true)
  const erro = ref('')
  const erroMapa = ref('')
  const ocupada = ref(false)
  const envioAberto = ref(false)
  const conteudos = ref<Record<number, string>>({})
  const editando = ref(false)
  const edicao = ref({ titulo: '', texto_original: '' })
  const titulo = computed(() => atividade.value?.titulo || atividade.value?.nome || 'Atividade')
  const aprovadas = computed(() => variacoes.value.filter(v => v.status === 'aprovada').length)
  const nomesAlunos = computed(() => new Map(alunos.value.map(a => [a.id, a.nome])))

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

  function formatarData (iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR')
  }

  async function carregarMapa () {
    erroMapa.value = ''
    try {
      mapa.value = await atividadesService.mapaVariacoes(Number(route.params.id))
    } catch (error) {
      erroMapa.value = mensagem(error)
    }
  }

  async function carregarRelatorios () {
    if (!atividade.value) return
    try {
      relatorios.value = (await pedagogicoService.list({ atividade: atividade.value.id })).results
    } catch {
      relatorios.value = []
    }
    try {
      pendentes.value = await trabalhosService.listarPendentes(atividade.value.id)
      escolhaAluno.value = Object.fromEntries(pendentes.value.map(t => [t.id, t.aluno ?? null]))
    } catch {
      pendentes.value = []
    }
  }

  async function confirmarTrabalho (t: Trabalho) {
    const aluno = escolhaAluno.value[t.id]
    if (!aluno || confirmando.value) return
    confirmando.value = t.id
    try {
      await trabalhosService.confirmar(t.id, { aluno, identificacao: 'confirmada' })
      notify.success('Trabalho confirmado. O relatório foi gerado.')
      await carregarRelatorios()
    } catch (error) {
      notify.error(mensagem(error))
    } finally {
      confirmando.value = null
    }
  }

  async function carregar () {
    carregando.value = true
    erro.value = ''
    atividade.value = null
    alunos.value = []
    variacoes.value = []
    mapa.value = []
    relatorios.value = []
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
      await Promise.all([carregarMapa(), carregarRelatorios()])
    } catch (error) {
      erro.value = mensagem(error)
    } finally {
      carregando.value = false
    }
  }

  function iniciarEdicao () {
    if (!atividade.value) return
    edicao.value = {
      titulo: titulo.value,
      texto_original: atividade.value.texto_original || '',
    }
    editando.value = true
  }

  async function salvarAtividade () {
    if (!atividade.value || ocupada.value) return
    const tituloLimpo = edicao.value.titulo.trim()
    if (!tituloLimpo) {
      notify.error('Informe o título da atividade.')
      return
    }
    ocupada.value = true
    try {
      atividade.value = await atividadesService.update(atividade.value.id, {
        titulo: tituloLimpo,
        texto_original: edicao.value.texto_original,
      })
      editando.value = false
      notify.success('Atividade atualizada.')
    } catch (error) {
      notify.error(mensagem(error))
    } finally {
      ocupada.value = false
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

  async function baixarRelatorio (r: Relatorio) {
    try {
      const nome = nomesAlunos.value.get(r.aluno) ?? `aluno-${r.aluno}`
      await pedagogicoService.downloadPdf(r.id, `relatorio-${titulo.value}-${nome}`)
    } catch (error) {
      notify.error(mensagem(error))
    }
  }

  watch(() => route.params.id, carregar, { immediate: true })
</script>

<template>
  <main class="atividade-pagina">
    <v-btn :prepend-icon="ArrowLeft" to="/atividades" variant="text">Voltar às atividades</v-btn>
    <MarsupiLoading v-if="carregando" label="Carregando atividade..." />

    <v-alert v-else-if="erro" role="alert" type="error" variant="tonal">
      {{ erro }}
      <v-btn class="ml-3" variant="text" @click="carregar">Tentar novamente</v-btn>
    </v-alert>

    <template v-else-if="atividade">
      <header class="cabecalho">
        <div>
          <p class="legenda">ATIVIDADE</p>
          <h1>{{ titulo }}</h1>
        </div>

        <v-btn color="primary" :disabled="ocupada" :prepend-icon="Upload" @click="envioAberto = true">Enviar trabalhos</v-btn>
      </header>

      <v-tabs v-model="aba" class="abas" color="primary">
        <v-tab value="atividade">Atividade</v-tab>
        <v-tab value="versoes">Versões ({{ variacoes.length }})</v-tab>
        <v-tab value="trabalhos">Trabalhos ({{ relatorios.length }}{{ pendentes.length > 0 ? ` · ${pendentes.length} para conferir` : '' }})</v-tab>
      </v-tabs>

      <!-- Atividade: texto original e edição -->
      <section v-if="aba === 'atividade'" aria-labelledby="original-titulo" class="bloco">
        <div class="cabecalho cabecalho--bloco">
          <h2 id="original-titulo"><FileText :size="22" /> Proposta original</h2>
          <v-btn v-if="!editando" :prepend-icon="Pencil" variant="outlined" @click="iniciarEdicao">Editar</v-btn>
        </div>

        <template v-if="editando">
          <v-text-field v-model="edicao.titulo" label="Título" variant="outlined" />

          <v-textarea
            v-model="edicao.texto_original"
            auto-grow
            label="Texto da atividade"
            rows="8"
            variant="outlined"
          />

          <div class="acoes">
            <v-btn :disabled="ocupada" variant="text" @click="editando = false">Cancelar</v-btn>
            <v-btn color="primary" :loading="ocupada" @click="salvarAtividade">Salvar</v-btn>
          </div>
        </template>

        <p v-else class="texto-original">{{ atividade.texto_original || atividade.descricao || 'Sem texto original disponível.' }}</p>
      </section>

      <!-- Versões: gerar, revisar, aprovar, PDF e mapa versão -> alunos -->
      <section v-else-if="aba === 'versoes'" aria-labelledby="versoes-titulo" class="bloco">
        <div class="cabecalho cabecalho--bloco">
          <div>
            <h2 id="versoes-titulo">Versões para a turma</h2>
            <p>{{ aprovadas }} de {{ variacoes.length }} versões aprovadas</p>
          </div>

          <v-btn
            v-if="variacoes.length === 0"
            color="primary"
            :loading="ocupada"
            :prepend-icon="Sparkles"
            @click="gerar"
          >Gerar versões com IA</v-btn>
        </div>

        <p v-if="variacoes.length === 0">A atividade é cadastrada uma vez. A IA separa os estudantes pela habilidade a reforçar (vista em pelo menos 2 trabalhos) e prepara uma versão para cada grupo; quem tem perfil de apoio recebe também o formato adaptado.</p>

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

          <p>
            <strong>{{ versao.eh_geral ? 'Versão geral' : versao.habilidade_nome ? `Reforço: ${versao.habilidade_nome}` : 'Versão com formato adaptado' }}</strong>
            · {{ destinatarios(versao) }}
          </p>

          <ul v-if="versao.adaptacoes_feitas?.length" class="adaptacoes">
            <li v-for="item in versao.adaptacoes_feitas" :key="item">{{ item }}</li>
          </ul>

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

      <!-- Trabalhos: envio e relatórios gerados -->
      <section v-else aria-labelledby="trabalhos-titulo" class="bloco">
        <div class="cabecalho cabecalho--bloco">
          <h2 id="trabalhos-titulo">Trabalhos e relatórios</h2>

          <v-btn
            color="primary"
            :disabled="ocupada"
            :prepend-icon="Upload"
            variant="outlined"
            @click="envioAberto = true"
          >Enviar trabalhos</v-btn>
        </div>

        <div v-if="pendentes.length > 0" aria-label="Trabalhos para conferir" class="pendentes" role="region">
          <h3>Confira de quem é cada trabalho</h3>
          <p>A IA não teve certeza do nome. Escolha o estudante para gerar o relatório.</p>

          <ul class="relatorios">
            <li v-for="t in pendentes" :key="t.id" class="relatorio">
              <div>
                <strong>{{ t.nome_lido ? `Nome lido: “${t.nome_lido}”` : 'Nome não encontrado no trabalho' }}</strong>
                <small v-if="t.descricao_ia">{{ t.descricao_ia }}</small>
              </div>

              <div class="acoes">
                <v-select
                  v-model="escolhaAluno[t.id]"
                  class="seletor-aluno"
                  density="compact"
                  hide-details
                  item-title="nome"
                  item-value="id"
                  :items="alunos"
                  label="Estudante"
                  variant="outlined"
                />

                <v-btn
                  color="primary"
                  :disabled="!escolhaAluno[t.id]"
                  :loading="confirmando === t.id"
                  @click="confirmarTrabalho(t)"
                >Confirmar</v-btn>
              </div>
            </li>
          </ul>
        </div>

        <p v-if="relatorios.length === 0">Nenhum relatório ainda. Envie os trabalhos e confirme a identificação dos estudantes.</p>

        <ul v-else class="relatorios">
          <li v-for="r in relatorios" :key="r.id" class="relatorio">
            <div>
              <strong>{{ nomesAlunos.get(r.aluno) ?? `Estudante #${r.aluno}` }}</strong>
              <small>{{ formatarData(r.created_at) }}</small>
            </div>

            <div class="acoes">
              <v-btn :to="`/relatorios/${r.id}`" variant="text">Abrir</v-btn>
              <v-btn :prepend-icon="Download" variant="outlined" @click="baixarRelatorio(r)">PDF</v-btn>
            </div>
          </li>
        </ul>
      </section>

      <EnviarTrabalhosDialog
        v-model="envioAberto"
        :atividade-id="atividade.id"
        :atividade-nome="titulo"
        :estudantes="alunos"
        @completed="carregarRelatorios"
      />
    </template>
  </main>
</template>

<style scoped>
.atividade-pagina { max-width: 1120px; margin: 0 auto; color: #263d35; }
.cabecalho { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 20px; margin: 20px 0; }
.cabecalho--bloco { margin-top: 0; }
h1 { font-size: clamp(1.6rem, 4vw, 2.3rem); overflow-wrap: anywhere; }
h2 { display: flex; align-items: center; gap: 10px; font-size: 1.25rem; margin-bottom: 0; }
p { line-height: 1.7; }
.legenda { color: #356b5b; font-size: .75rem; letter-spacing: .12em; font-weight: 600; }
.abas { border-bottom: 1px solid #dbe5dc; }
.bloco { padding: clamp(18px, 3vw, 30px); margin: 24px 0; background: #fff; border: 1px solid #dbe5dc; border-radius: 12px; }
.versao { border-top: 1px solid #dbe5dc; margin-top: 24px; padding-top: 8px; }
.texto-original { white-space: pre-wrap; overflow-wrap: anywhere; max-height: 480px; overflow: auto; }
.acoes { display: flex; gap: 12px; flex-wrap: wrap; }
.aviso { margin-top: 12px; color: #815a15; }
.adaptacoes { margin: 4px 0 0 18px; color: #52695f; font-size: .9rem; }
.relatorios { display: flex; flex-direction: column; gap: 8px; margin: 16px 0 0; padding: 0; list-style: none; }
.relatorio { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 16px; border: 1px solid #dbe5dc; border-radius: 12px; }
.relatorio small { display: block; color: #52695f; }
.pendentes { margin: 16px 0 24px; padding: 16px; border-radius: 12px; background: #fbf1e3; }
.pendentes h3 { font-size: 1rem; font-weight: 600; }
.seletor-aluno { min-width: 220px; }
@media (max-width: 600px) { .acoes > * { width: 100%; } }
</style>
