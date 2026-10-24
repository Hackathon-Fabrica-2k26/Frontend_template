<template>
  <v-dialog
    v-model="aberto"
    class="dialog-atividade"
    max-width="620"
    persistent
  >
    <div aria-labelledby="atividade-detalhes-titulo" class="modal-card" role="dialog">
      <!-- Cabeçalho -->
      <header class="modal-header">
        <div>
          <span class="modal-eyebrow">Atividade pedagógica</span>

          <h2 id="atividade-detalhes-titulo" class="modal-titulo">
            {{ editando ? 'Editar atividade' : 'Detalhes da atividade' }}
          </h2>
        </div>

        <button
          aria-label="Fechar modal"
          class="btn-fechar"
          type="button"
          @click="fechar"
        >
          <X :size="20" />
        </button>
      </header>

      <div class="modal-divisor" />

      <!-- Carregando detalhes -->
      <div v-if="carregando" aria-busy="true" class="modal-corpo flex flex-col items-center py-12">
        <MarsupiLoading label="Carregando atividade..." />
      </div>

      <!-- Erro ao carregar -->
      <div v-else-if="erroCarregamento" class="modal-corpo py-10 text-center" role="alert">
        <p class="text-sm text-red-600">{{ erroCarregamento }}</p>

        <button class="btn btn--contorno mt-4" type="button" @click="carregarDetalhes">
          Tentar novamente
        </button>
      </div>

      <!-- Conteúdo da atividade -->
      <div v-else-if="atividade" class="modal-corpo">
        <!-- Modo Edição -->
        <form v-if="editando" class="flex flex-col gap-4" @submit.prevent="salvar">
          <div>
            <label class="rotulo" for="edit-atividade-titulo">
              Título da atividade <span aria-hidden="true">*</span>
            </label>

            <input
              id="edit-atividade-titulo"
              v-model="form.titulo"
              :aria-invalid="Boolean(erroTitulo)"
              class="entrada"
              :class="{ 'entrada--erro': erroTitulo }"
              placeholder="Ex.: Explorando as vogais"
              type="text"
              @input="erroTitulo = ''"
            >

            <p v-if="erroTitulo" class="erro" role="alert">{{ erroTitulo }}</p>
          </div>

          <div>
            <label class="rotulo" for="edit-atividade-descricao">
              Descrição / Objetivo
            </label>

            <textarea
              id="edit-atividade-descricao"
              v-model="form.descricao"
              class="entrada area-texto"
              placeholder="Descreva os objetivos pedagógicos da atividade..."
              rows="4"
            />
          </div>

          <div class="mt-2 flex items-center justify-end gap-2.5">
            <button
              class="btn btn--contorno"
              :disabled="salvando"
              type="button"
              @click="cancelarEdicao"
            >
              Cancelar
            </button>

            <button
              class="btn btn--cheio"
              :disabled="salvando"
              type="submit"
            >
              <LoaderCircle v-if="salvando" class="animate-spin" :size="16" />
              {{ salvando ? 'Salvando…' : 'Salvar alterações' }}
            </button>
          </div>
        </form>

        <!-- Modo Visualização -->
        <div v-else class="flex flex-col gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="status" :class="`status--${statusNormalizado}`">
                {{ rotuloStatus[statusNormalizado] || 'Pendente' }}
              </span>
            </div>

            <h3 class="mt-2 text-xl font-semibold text-primary break-words">
              {{ atividade.titulo || atividade.nome || 'Atividade sem título' }}
            </h3>
          </div>

          <!-- Metadados -->
          <div class="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            <div class="campo-meta">
              <span class="campo-meta__rotulo">
                <Calendar :size="13" /> Criada em
              </span>

              <span class="campo-meta__valor">{{ dataFormatada }}</span>
            </div>

            <div class="campo-meta">
              <span class="campo-meta__rotulo">
                <School :size="13" /> Turma
              </span>

              <span class="campo-meta__valor">{{ nomeTurma }}</span>
            </div>

            <div class="campo-meta col-span-2 sm:col-span-1">
              <span class="campo-meta__rotulo">
                <FileText :size="13" /> Origem
              </span>

              <span class="campo-meta__valor uppercase">{{ atividade.origem || 'Texto' }}</span>
            </div>
          </div>

          <!-- Descrição / Objetivo -->
          <div class="bloco-info">
            <h4 class="bloco-info__titulo">Objetivo pedagógico</h4>

            <p class="bloco-info__texto">
              {{ atividade.objetivo || atividade.descricao || 'Nenhuma descrição informada.' }}
            </p>
          </div>

          <!-- Variações da Atividade -->
          <div class="bloco-variacoes">
            <div class="flex items-center justify-between gap-2 mb-2.5">
              <div class="flex items-center gap-2">
                <h4 class="bloco-info__titulo m-0">Variações pedagógicas adaptadas</h4>

                <span v-if="variacoes.length > 0" class="badge-contador">
                  {{ variacoes.length }}
                </span>
              </div>

              <button
                v-if="variacoes.length === 0"
                class="btn btn--acao-pequena"
                :disabled="gerandoVariacoes"
                type="button"
                @click="gerarVariacoes"
              >
                <LoaderCircle v-if="gerandoVariacoes" class="animate-spin" :size="13" />
                <Sparkles v-else :size="13" />
                {{ gerandoVariacoes ? 'Gerando…' : 'Gerar com IA' }}
              </button>
            </div>

            <!-- Carregando variações -->
            <div v-if="carregandoVariacoes" class="py-3 text-center">
              <LoaderCircle class="animate-spin text-primary inline-block" :size="18" />
            </div>

            <!-- Lista de variações -->
            <div v-else-if="variacoes.length > 0" class="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
              <div
                v-for="v in variacoes"
                :key="v.id"
                class="cartao-variacao"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2">
                      <span class="font-semibold text-xs text-primary">
                        {{ formatarRotuloVariacao(v) }}
                      </span>

                      <span
                        class="status-variacao"
                        :class="v.status === 'aprovada' ? 'status-variacao--aprovada' : 'status-variacao--rascunho'"
                      >
                        {{ v.status === 'aprovada' ? 'Aprovada' : 'Rascunho' }}
                      </span>
                    </div>

                    <p class="mt-1 text-xs text-text/75 line-clamp-2">
                      {{ v.conteudo || 'Sem conteúdo de variação.' }}
                    </p>
                  </div>

                  <div class="flex items-center gap-1.5 shrink-0">
                    <button
                      v-if="v.status !== 'aprovada'"
                      class="btn btn--acao-variacao btn--aprovar"
                      :disabled="aprovandoId === v.id"
                      title="Aprovar variação"
                      type="button"
                      @click="aprovarVariacao(v)"
                    >
                      <LoaderCircle v-if="aprovandoId === v.id" class="animate-spin" :size="13" />
                      <Check v-else :size="13" />
                      Aprovar
                    </button>

                    <button
                      class="btn btn--acao-variacao btn--pdf"
                      :disabled="baixandoPdfId === v.id"
                      title="Baixar PDF da variação"
                      type="button"
                      @click="baixarPdf(v)"
                    >
                      <LoaderCircle v-if="baixandoPdfId === v.id" class="animate-spin" :size="13" />
                      <Download v-else :size="13" />
                      PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Vazio -->
            <div v-else class="variacoes-vazio">
              <p class="text-xs text-text/70">
                Nenhuma variação gerada para esta atividade ainda.
              </p>
            </div>
          </div>

          <!-- Texto original se houver -->
          <div v-if="atividade.texto_original" class="bloco-info">
            <h4 class="bloco-info__titulo">Conteúdo extraído original</h4>

            <p class="bloco-info__texto line-clamp-3">
              {{ atividade.texto_original }}
            </p>
          </div>

          <!-- Confirmação de exclusão -->
          <div v-if="confirmandoExclusao" class="painel-alerta" role="alert">
            <p class="text-xs font-medium text-red-800">
              Tem certeza de que deseja excluir esta atividade? Essa ação não pode ser desfeita.
            </p>

            <div class="mt-3 flex gap-2">
              <button
                class="btn btn--perigo-cheio"
                :disabled="excluindo"
                type="button"
                @click="excluir"
              >
                <LoaderCircle v-if="excluindo" class="animate-spin" :size="14" />
                {{ excluindo ? 'Excluindo…' : 'Sim, excluir' }}
              </button>

              <button
                class="btn btn--contorno"
                :disabled="excluindo"
                type="button"
                @click="confirmandoExclusao = false"
              >
                Cancelar
              </button>
            </div>
          </div>

          <!-- Barra de Ações -->
          <div v-else class="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-support/40">
            <button
              class="btn-perigo"
              type="button"
              @click="confirmandoExclusao = true"
            >
              <Trash2 :size="15" />
              Excluir atividade
            </button>

            <button
              class="btn btn--cheio"
              type="button"
              @click="iniciarEdicao"
            >
              <Pencil :size="15" />
              Editar dados
            </button>
          </div>
        </div>
      </div>
    </div>
  </v-dialog>
</template>

<script setup lang="ts">
  import type { Atividade } from '@/interfaces/atividade'
  import type { Turma } from '@/interfaces/escola'
  import type { StatusAtividade } from '@/interfaces/perfil'
  import type { AtividadeVariacao } from '@/interfaces/variacao'
  import {
    Calendar,
    Check,
    Download,
    FileText,
    LoaderCircle,
    Pencil,
    School,
    Sparkles,
    Trash2,
    X,
  } from '@lucide/vue'
  import { computed, reactive, ref, watch } from 'vue'
  import { atividadesService } from '@/services/atividades'
  import { variacoesService } from '@/services/variacoes'
  import { buildApiError } from '@/utils/apiError'
  import { notify } from '@/utils/notify'

  const aberto = defineModel<boolean>({ default: false })

  const props = defineProps<{
    atividadeId: number | null
    turmas?: Turma[]
  }>()

  const emit = defineEmits<{
    (e: 'atualizada', atividade: Atividade): void
    (e: 'excluida', id: number): void
  }>()

  const carregando = ref(false)
  const erroCarregamento = ref('')
  const atividade = ref<Atividade | null>(null)
  const editando = ref(false)
  const salvando = ref(false)
  const confirmandoExclusao = ref(false)
  const excluindo = ref(false)
  const erroTitulo = ref('')

  const variacoes = ref<AtividadeVariacao[]>([])
  const carregandoVariacoes = ref(false)
  const baixandoPdfId = ref<number | null>(null)
  const aprovandoId = ref<number | null>(null)
  const gerandoVariacoes = ref(false)

  const form = reactive({
    titulo: '',
    descricao: '',
  })

  const rotuloStatus: Record<StatusAtividade, string> = {
    analisada: 'Analisada',
    em_analise: 'Em análise',
    pendente: 'Pendente',
  }

  const statusNormalizado = computed<StatusAtividade>(() => {
    const raw = atividade.value?.status?.toLowerCase() || ''
    if (['analisada', 'analisado', 'aprovada', 'encerrada'].includes(raw)) {
      return 'analisada'
    }
    if (['em_analise', 'analisando', 'variacoes_geradas'].includes(raw)) {
      return 'em_analise'
    }
    return 'pendente'
  })

  const dataFormatada = computed(() => {
    if (!atividade.value?.created_at) {
      return '—'
    }
    const data = new Date(atividade.value.created_at)
    return Number.isNaN(data.getTime()) ? '—' : data.toLocaleDateString('pt-BR')
  })

  const nomeTurma = computed(() => {
    if (!atividade.value?.turma) {
      return 'Não vinculada'
    }
    const encontrada = props.turmas?.find(t => t.id === atividade.value?.turma)
    return encontrada?.nome || `Turma #${atividade.value.turma}`
  })

  function formatarRotuloVariacao (v: AtividadeVariacao): string {
    if (v.eh_geral) {
      return `${v.rotulo} (Geral)`
    }
    return v.rotulo || `Variação ${v.numero}`
  }

  async function carregarVariacoes (atividadeId: number): Promise<void> {
    carregandoVariacoes.value = true
    try {
      const res = await variacoesService.list({ atividade: atividadeId })
      variacoes.value = Array.isArray(res) ? res : (res?.results ?? [])
    } catch {
      variacoes.value = []
    } finally {
      carregandoVariacoes.value = false
    }
  }

  async function carregarDetalhes (): Promise<void> {
    if (!props.atividadeId) {
      return
    }

    carregando.value = true
    erroCarregamento.value = ''
    editando.value = false
    confirmandoExclusao.value = false

    try {
      const data = await atividadesService.get(props.atividadeId)
      atividade.value = data
      form.titulo = data.titulo || data.nome || ''
      form.descricao = data.objetivo || data.descricao || ''
      await carregarVariacoes(data.id)
    } catch (error) {
      erroCarregamento.value = buildApiError(error, 'Não foi possível carregar os detalhes da atividade.').message
    } finally {
      carregando.value = false
    }
  }

  function fechar (): void {
    aberto.value = false
  }

  function iniciarEdicao (): void {
    form.titulo = atividade.value?.titulo || atividade.value?.nome || ''
    form.descricao = atividade.value?.objetivo || atividade.value?.descricao || ''
    erroTitulo.value = ''
    editando.value = true
  }

  function cancelarEdicao (): void {
    editando.value = false
    erroTitulo.value = ''
  }

  async function salvar (): Promise<void> {
    if (salvando.value || !props.atividadeId) {
      return
    }

    erroTitulo.value = form.titulo.trim() ? '' : 'Informe o título da atividade.'
    if (erroTitulo.value) {
      return
    }

    salvando.value = true
    try {
      const atualizada = await atividadesService.update(props.atividadeId, {
        titulo: form.titulo.trim(),
        nome: form.titulo.trim(),
        objetivo: form.descricao.trim(),
        descricao: form.descricao.trim(),
      })

      atividade.value = atualizada
      editando.value = false
      notify.success('Atividade atualizada com sucesso')
      emit('atualizada', atualizada)
    } catch (error) {
      notify.error(buildApiError(error, 'Não foi possível atualizar a atividade.').message)
    } finally {
      salvando.value = false
    }
  }

  async function excluir (): Promise<void> {
    if (excluindo.value || !props.atividadeId) {
      return
    }

    excluindo.value = true
    try {
      await atividadesService.remove(props.atividadeId)
      notify.success('Atividade excluída com sucesso')
      emit('excluida', props.atividadeId)
      fechar()
    } catch (error) {
      notify.error(buildApiError(error, 'Não foi possível excluir a atividade.').message)
    } finally {
      excluindo.value = false
    }
  }

  async function aprovarVariacao (variacao: AtividadeVariacao): Promise<void> {
    aprovandoId.value = variacao.id
    try {
      const atualizada = await variacoesService.aprovar(variacao.id)
      const index = variacoes.value.findIndex(v => v.id === variacao.id)
      if (index !== -1) {
        variacoes.value[index] = atualizada
      }
      notify.success(`Variação ${variacao.rotulo} aprovada com sucesso!`)
      if (atividade.value) {
        emit('atualizada', atividade.value)
      }
    } catch (error) {
      notify.error(buildApiError(error, 'Não foi possível aprovar a variação.').message)
    } finally {
      aprovandoId.value = null
    }
  }

  async function baixarPdf (variacao: AtividadeVariacao): Promise<void> {
    baixandoPdfId.value = variacao.id
    try {
      const rotulo = variacao.rotulo || `variacao-${variacao.id}`
      await variacoesService.downloadPdf(variacao.id, `${rotulo}-atividade-${props.atividadeId}.pdf`)
      notify.success(`Download de ${rotulo} iniciado!`)
    } catch (error) {
      notify.error(buildApiError(error, 'Não foi possível baixar o PDF da variação.').message)
    } finally {
      baixandoPdfId.value = null
    }
  }

  async function gerarVariacoes (): Promise<void> {
    if (!props.atividadeId || gerandoVariacoes.value) {
      return
    }

    gerandoVariacoes.value = true
    try {
      const geradas = await atividadesService.gerarVariacoes(props.atividadeId)
      variacoes.value = geradas
      notify.success('Variações geradas com sucesso!')
      if (atividade.value) {
        emit('atualizada', atividade.value)
      }
    } catch (error) {
      notify.error(buildApiError(error, 'Não foi possível gerar variações.').message)
    } finally {
      gerandoVariacoes.value = false
    }
  }

  watch(
    aberto,
    visivel => {
      if (visivel && props.atividadeId) {
        carregarDetalhes()
      } else {
        atividade.value = null
        variacoes.value = []
        editando.value = false
        confirmandoExclusao.value = false
      }
    },
  )
</script>

<style scoped>
.modal-card {
  overflow: hidden;
  border-radius: 20px;
  background: #fff;
  box-shadow:
    0 10px 25px -5px rgb(38 61 53 / 0.15),
    0 20px 48px -10px rgb(38 61 53 / 0.22);
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 24px 16px;
}

.modal-eyebrow {
  display: block;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgb(38 61 53 / 0.6);
}

.modal-titulo {
  margin-top: 2px;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.3;
  color: var(--color-primary);
}

.btn-fechar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: rgb(38 61 53 / 0.6);
  cursor: pointer;
  transition:
    background-color 160ms ease,
    color 160ms ease;
}

.btn-fechar:hover {
  background: rgb(169 199 180 / 0.25);
  color: var(--color-primary);
}

.modal-divisor {
  height: 1px;
  background: rgb(169 199 180 / 0.45);
}

.modal-corpo {
  padding: 20px 24px 24px;
}

.status {
  display: inline-block;
  padding: 2px 12px;
  border-radius: 24px;
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text);
}

.status--analisada {
  background: rgb(169 199 180 / 0.45);
}

.status--em_analise {
  background: rgb(227 180 119 / 0.4);
}

.status--pendente {
  background: rgb(38 61 53 / 0.08);
}

.campo-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 12px;
  border-radius: 10px;
  background: var(--color-background);
}

.campo-meta__rotulo {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: rgb(38 61 53 / 0.65);
}

.campo-meta__valor {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bloco-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
  border: 1px solid rgb(169 199 180 / 0.45);
  border-radius: 12px;
  background: #fafbfa;
}

.bloco-info__titulo {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-primary);
}

.bloco-info__texto {
  font-size: 13px;
  line-height: 1.45;
  color: var(--color-text);
}

.bloco-variacoes {
  padding: 12px 14px;
  border: 1px solid rgb(169 199 180 / 0.45);
  border-radius: 12px;
  background: #fff;
}

.badge-contador {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1px 7px;
  border-radius: 12px;
  background: rgb(169 199 180 / 0.35);
  font-size: 11px;
  font-weight: 600;
  color: var(--color-primary);
}

.cartao-variacao {
  padding: 10px 12px;
  border: 1px solid rgb(169 199 180 / 0.4);
  border-radius: 10px;
  background: var(--color-background);
}

.status-variacao {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 500;
}

.status-variacao--aprovada {
  background: rgb(169 199 180 / 0.5);
  color: #1e4638;
}

.status-variacao--rascunho {
  background: rgb(227 180 119 / 0.4);
  color: #7c4a15;
}

.variacoes-vazio {
  padding: 12px 0;
  text-align: center;
}

.btn--acao-pequena {
  height: 28px;
  padding: 0 10px;
  font-size: 11px;
  gap: 4px;
  border: 1px solid var(--color-primary);
  background: var(--color-primary);
  color: var(--color-background);
  border-radius: 8px;
}

.btn--acao-pequena:hover:not(:disabled) {
  background: #2b5b4d;
}

.btn--acao-variacao {
  height: 28px;
  padding: 0 9px;
  font-size: 11px;
  gap: 4px;
  border-radius: 8px;
}

.btn--aprovar {
  border: 1px solid var(--color-primary);
  background: #fff;
  color: var(--color-primary);
}

.btn--aprovar:hover:not(:disabled) {
  background: rgb(169 199 180 / 0.25);
}

.btn--pdf {
  border: 1px solid var(--color-support);
  background: #fff;
  color: var(--color-text);
}

.btn--pdf:hover:not(:disabled) {
  background: var(--color-background);
}

.painel-alerta {
  padding: 12px 14px;
  border: 1px solid rgb(220 38 38 / 0.3);
  border-radius: 12px;
  background: rgb(254 242 242);
}

.rotulo {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
}

.entrada {
  display: block;
  width: 100%;
  height: 42px;
  padding: 0 12px;
  border: 1px solid var(--color-support);
  border-radius: 10px;
  background: #fff;
  font-size: 13px;
  color: var(--color-text);
  outline: none;
  transition:
    border-color 200ms ease,
    box-shadow 200ms ease;
}

.entrada:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgb(53 107 91 / 0.12);
}

.entrada--erro {
  border-color: #b3261e;
}

.area-texto {
  height: auto;
  padding: 10px 12px;
  resize: vertical;
}

.erro {
  margin: 5px 0 0;
  font-size: 11px;
  color: #b3261e;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 40px;
  padding: 0 16px;
  border-radius: 10px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition:
    background-color 200ms ease,
    transform 160ms ease;
}

.btn:active:not(:disabled) {
  transform: scale(0.98);
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn--contorno {
  border: 1px solid var(--color-support);
  background: #fff;
  color: var(--color-text);
}

.btn--contorno:hover:not(:disabled) {
  background: var(--color-background);
}

.btn--cheio {
  border: 1px solid var(--color-primary);
  background: var(--color-primary);
  color: var(--color-background);
}

.btn--cheio:hover:not(:disabled) {
  background: #2b5b4d;
}

.btn-perigo {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  font-family: inherit;
  font-size: 13px;
  color: #b3261e;
  cursor: pointer;
  transition: background-color 160ms ease;
}

.btn-perigo:hover {
  background: rgb(220 38 38 / 0.08);
}

.btn--perigo-cheio {
  border: 1px solid #b3261e;
  background: #b3261e;
  color: #fff;
}

.btn--perigo-cheio:hover:not(:disabled) {
  background: #991b1b;
}
</style>
