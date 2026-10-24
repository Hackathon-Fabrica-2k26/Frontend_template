<script setup lang="ts">
  import type { ArquivoEnvio, Estudante, StatusAnalise, Trabalho } from '@/interfaces/trabalho'
  import {
    Check,
    CircleAlert,
    FileText,
    LoaderCircle,
    Trash2,
    Upload,
    X,
  } from '@lucide/vue'
  import { computed, ref, watch } from 'vue'
  import trabalhosService from '@/services/trabalho'
  import { notify } from '@/utils/notify'

  const props = defineProps<{
    atividadeId: number
    atividadeNome?: string
    estudantes: Estudante[]
  }>()

  const model = defineModel<boolean>({ required: true })

  const emit = defineEmits<{
    completed: [trabalhos: Trabalho[]]
  }>()

  /* ---------- regras de envio (iguais às do texto do design) ---------- */
  const ACEITOS_MIME = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
  ])
  const ACEITOS_EXTENSAO = /\.(?:pdf|docx?|jpe?g|png)$/i
  const ACCEPT = '.pdf,.doc,.docx,.jpg,.jpeg,.png'
  const TAMANHO_MAXIMO = 20 * 1024 * 1024

  /* ---------- estado ---------- */
  type Etapa = 'envio' | 'processamento' | 'revisao'

  const etapa = ref<Etapa>('envio')
  const arquivos = ref<ArquivoEnvio[]>([])
  const trabalhos = ref<Trabalho[]>([])
  const entrada = ref<HTMLInputElement | null>(null)
  const arrastando = ref(false)
  const salvando = ref(false)

  let proximoUid = 0
  // A análise segue rodando mesmo com o modal fechado ("você pode continuar usando o Marsupi").
  let analisando = false

  /* ---------- derivados ---------- */
  const total = computed(() => arquivos.value.length)
  const concluidos = computed(() => arquivos.value.filter(a => a.status === 'concluido').length)
  const falhas = computed(() => arquivos.value.filter(a => a.status === 'erro').length)
  const finalizados = computed(() => concluidos.value + falhas.value)
  const terminou = computed(() => total.value > 0 && finalizados.value === total.value)
  const percentual = computed(() => (total.value === 0 ? 0 : Math.round((finalizados.value / total.value) * 100)))
  const podeContinuar = computed(() => terminou.value && concluidos.value > 0)

  const podeConfirmar = computed(() =>
    trabalhos.value.length > 0 && trabalhos.value.every(trabalho => trabalho.aluno !== null),
  )

  const cabecalho = computed(() => ({
    envio: {
      titulo: 'Enviar atividades',
      texto: 'A IA identifica os alunos e preenche os dados automaticamente.',
    },
    processamento: {
      titulo: 'Processando...',
      texto: 'Estamos analisando os trabalhos da sua turma.',
    },
    revisao: {
      titulo: 'Revisar identificação',
      texto: 'Confira os alunos identificados antes de concluir.',
    },
  })[etapa.value])

  const rotuloStatus: Record<StatusAnalise, string> = {
    fila: 'Na fila',
    analisando: 'Analisando',
    concluido: 'Concluído',
    erro: 'Falhou',
  }

  /* ---------- abrir / fechar ---------- */
  // Reabrir durante a análise ou numa revisão pendente retoma de onde parou;
  // no resto, começa limpo.
  watch(model, aberto => {
    if (aberto && etapa.value === 'envio' && !analisando) {
      reiniciar()
    }
  })

  function reiniciar (): void {
    arquivos.value = []
    trabalhos.value = []
    etapa.value = 'envio'
    arrastando.value = false
  }

  function fechar (): void {
    if (salvando.value) {
      return
    }
    // Só descarta o que ainda não foi enviado; análise e revisão ficam guardadas.
    if (etapa.value === 'envio') {
      reiniciar()
    }
    model.value = false
  }

  /* ---------- seleção de arquivos ---------- */
  function abrirSeletor (): void {
    entrada.value?.click()
  }

  function arquivoValido (file: File): boolean {
    return (ACEITOS_EXTENSAO.test(file.name) || ACEITOS_MIME.has(file.type)) && file.size <= TAMANHO_MAXIMO
  }

  function adicionar (novos: File[]): void {
    let invalido = false

    for (const file of novos) {
      if (!arquivoValido(file)) {
        invalido = true
        continue
      }

      const repetido = arquivos.value.some(
        atual => atual.file.name === file.name
          && atual.file.size === file.size
          && atual.file.lastModified === file.lastModified,
      )

      if (!repetido) {
        arquivos.value.push({
          uid: ++proximoUid,
          file,
          status: 'fila',
          trabalhos: [],
          erro: '',
        })
      }
    }

    if (invalido) {
      notify.error('Selecione arquivos PDF, DOC, DOCX, JPG ou PNG de até 20 MB.')
    }
  }

  function aoEscolher (event: Event): void {
    const campo = event.target as HTMLInputElement
    adicionar(Array.from(campo.files ?? []))
    campo.value = ''
  }

  function aoSoltar (event: DragEvent): void {
    arrastando.value = false
    adicionar(Array.from(event.dataTransfer?.files ?? []))
  }

  function remover (uid: number): void {
    arquivos.value = arquivos.value.filter(arquivo => arquivo.uid !== uid)
  }

  function tamanho (bytes: number): string {
    const mb = bytes / 1024 / 1024
    if (mb < 0.1) {
      return `${Math.max(1, Math.round(bytes / 1024))} KB`
    }
    return `${mb.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} MB`
  }

  /* ---------- análise ---------- */
  async function enviar (): Promise<void> {
    if (arquivos.value.length === 0 || analisando) {
      return
    }

    for (const arquivo of arquivos.value) {
      arquivo.status = 'fila'
      arquivo.trabalhos = []
      arquivo.erro = ''
    }
    etapa.value = 'processamento'
    await analisar()
  }

  // Um arquivo por vez, para mostrar o progresso real. Quem já concluiu não é reenviado
  // ao tentar de novo.
  async function analisar (): Promise<void> {
    if (analisando) {
      return
    }
    analisando = true

    for (const [indice, arquivo] of arquivos.value.entries()) {
      if (arquivo.status === 'concluido') {
        continue
      }

      arquivo.status = 'analisando'
      arquivo.erro = ''

      try {
        arquivo.trabalhos = await trabalhosService.analisar(
          props.atividadeId,
          arquivo.file,
          props.estudantes,
          indice,
        )
        arquivo.status = 'concluido'
      } catch (error) {
        arquivo.status = 'erro'
        arquivo.erro = error instanceof Error ? error.message : 'Erro ao enviar o arquivo.'
      }
    }

    analisando = false
    trabalhos.value = arquivos.value.flatMap(arquivo => arquivo.trabalhos)

    // Com o modal fechado, avisa que terminou.
    if (!model.value) {
      if (concluidos.value > 0) {
        notify.success('Trabalhos analisados. Abra o envio para revisar os alunos.')
      } else {
        notify.error('Não foi possível analisar os trabalhos enviados.')
      }
    }
  }

  function tentarDeNovo (): void {
    void analisar()
  }

  function nomeDoArquivo (arquivo: ArquivoEnvio): string {
    if (arquivo.status !== 'concluido') {
      return arquivo.file.name
    }
    return arquivo.trabalhos[0]?.nome_lido || 'Aluno não identificado'
  }

  /* ---------- revisão ---------- */
  function formatarConfianca (valor: number | null): string {
    return valor === null ? 'Não informada' : `${Math.round(valor * 100)}%`
  }

  async function confirmar (): Promise<void> {
    if (!podeConfirmar.value || salvando.value) {
      return
    }

    salvando.value = true

    try {
      for (const trabalho of trabalhos.value) {
        if (trabalho.aluno === null) {
          continue
        }
        await trabalhosService.confirmar(trabalho.id, {
          aluno: trabalho.aluno,
          identificacao: 'confirmada',
        })
        trabalho.identificacao = 'confirmada'
      }

      notify.success('Identificações confirmadas!')
      emit('completed', [...trabalhos.value])
      reiniciar()
      model.value = false
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Não foi possível confirmar os trabalhos.')
    } finally {
      salvando.value = false
    }
  }
</script>

<template>
  <v-dialog
    v-model="model"
    class="dialogo-atividades"
    max-width="720"
    persistent
    scrim="#263d35"
    style="--v-overlay-opacity: 0.55"
  >
    <div aria-live="polite" class="modal">
      <header class="modal__cabecalho">
        <div>
          <h2>{{ cabecalho.titulo }}</h2>
          <p>{{ cabecalho.texto }}</p>
        </div>

        <button
          aria-label="Fechar"
          class="botao-icone"
          :disabled="salvando"
          type="button"
          @click="fechar"
        >
          <X :size="22" :stroke-width="1.6" />
        </button>
      </header>

      <!-- ===== 1. Envio ===== -->
      <template v-if="etapa === 'envio'">
        <div
          class="soltar"
          :class="{ 'soltar--arrastando': arrastando }"
          role="button"
          tabindex="0"
          @click="abrirSeletor"
          @dragleave.prevent="arrastando = false"
          @dragover.prevent="arrastando = true"
          @drop.prevent="aoSoltar"
          @keydown.enter.prevent="abrirSeletor"
          @keydown.space.prevent="abrirSeletor"
        >
          <span aria-hidden="true" class="soltar__icone">
            <Upload :size="20" :stroke-width="1.7" />
          </span>

          <strong>Arraste e solte ou Procurar arquivos</strong>
          <span>PDF, DOC, DOCX, JPG e PNG · Até 20 MB por arquivo</span>
        </div>

        <input
          ref="entrada"
          :accept="ACCEPT"
          class="entrada-oculta"
          multiple
          type="file"
          @change="aoEscolher"
        >

        <TransitionGroup v-if="arquivos.length > 0" class="lista" name="item" tag="ul">
          <li v-for="arquivo in arquivos" :key="arquivo.uid" class="arquivo">
            <FileText class="arquivo__icone" :size="28" :stroke-width="1.3" />

            <div class="arquivo__info">
              <strong>{{ arquivo.file.name }}</strong>
              <span>{{ tamanho(arquivo.file.size) }} · Concluído</span>
            </div>

            <button
              :aria-label="`Remover ${arquivo.file.name}`"
              class="botao-icone"
              type="button"
              @click="remover(arquivo.uid)"
            >
              <Trash2 :size="20" :stroke-width="1.5" />
            </button>
          </li>
        </TransitionGroup>

        <p v-else class="vazio">Nenhum arquivo selecionado.</p>
      </template>

      <!-- ===== 2. Processando ===== -->
      <template v-else-if="etapa === 'processamento'">
        <div class="resumo">
          <strong v-if="atividadeNome">{{ atividadeNome }}</strong>
          <span>{{ total }} {{ total === 1 ? 'arquivo enviado' : 'arquivos enviados' }}</span>
        </div>

        <div class="progresso">
          <div class="progresso__linha">
            <strong>
              {{ finalizados }} de {{ total }} {{ total === 1 ? 'trabalho analisado' : 'trabalhos analisados' }}
              <template v-if="falhas > 0"> · {{ falhas }} com falha</template>
            </strong>

            <span>{{ percentual }}%</span>
          </div>

          <div
            aria-valuemax="100"
            aria-valuemin="0"
            :aria-valuenow="percentual"
            class="progresso__trilha"
            role="progressbar"
          >
            <span class="progresso__barra" :style="{ width: `${percentual}%` }" />
          </div>

          <small>Você pode continuar usando o Marsupi.</small>
        </div>

        <ul class="lista lista--status">
          <li v-for="(arquivo, indice) in arquivos" :key="arquivo.uid" class="trabalho">
            <div class="trabalho__info">
              <strong>{{ nomeDoArquivo(arquivo) }}</strong>

              <span>
                Trabalho {{ String(indice + 1).padStart(2, '0') }}
                <template v-if="arquivo.status === 'erro'"> · {{ arquivo.erro }}</template>
              </span>
            </div>

            <span class="estado" :class="`estado--${arquivo.status}`">
              <LoaderCircle v-if="arquivo.status === 'analisando'" class="estado__giro" :size="14" />
              <Check v-else-if="arquivo.status === 'concluido'" :size="14" :stroke-width="2.4" />
              <CircleAlert v-else-if="arquivo.status === 'erro'" :size="14" />
              {{ rotuloStatus[arquivo.status] }}
            </span>
          </li>
        </ul>
      </template>

      <!-- ===== 3. Revisão ===== -->
      <template v-else>
        <ul class="lista lista--revisao">
          <li v-for="trabalho in trabalhos" :key="trabalho.id" class="revisao">
            <div class="revisao__topo">
              <div class="arquivo__info">
                <strong>{{ trabalho.nome_arquivo }}</strong>
                <span>Nome lido: {{ trabalho.nome_lido || 'Não identificado' }}</span>
              </div>

              <span class="selo" :class="`selo--${trabalho.identificacao}`">
                {{ trabalho.identificacao === 'pendente' ? 'Pendente' : 'Identificado' }}
              </span>
            </div>

            <p class="revisao__confianca">
              Confiança da IA: {{ formatarConfianca(trabalho.confianca) }}
            </p>

            <label class="revisao__campo">
              Estudante da turma
              <select v-model="trabalho.aluno" class="revisao__select" :disabled="salvando">
                <option :value="null">Selecione um estudante</option>

                <option v-for="estudante in estudantes" :key="estudante.id" :value="estudante.id">
                  {{ estudante.nome }}
                </option>
              </select>
            </label>
          </li>
        </ul>
      </template>

      <footer class="modal__rodape">
        <!-- Envio -->
        <template v-if="etapa === 'envio'">
          <button class="botao botao--contorno" type="button" @click="fechar">Cancelar</button>

          <button class="botao botao--cheio" :disabled="arquivos.length === 0" type="button" @click="enviar">
            Enviar
          </button>
        </template>

        <!-- Processando -->
        <template v-else-if="etapa === 'processamento'">
          <button
            v-if="terminou && falhas > 0"
            class="botao botao--contorno"
            type="button"
            @click="tentarDeNovo"
          >
            Tentar novamente
          </button>

          <button
            class="botao botao--cheio botao--largo"
            :class="{ 'botao--pronto': podeContinuar }"
            :disabled="!podeContinuar"
            type="button"
            @click="etapa = 'revisao'"
          >
            Continuar
          </button>
        </template>

        <!-- Revisão -->
        <template v-else>
          <button
            class="botao botao--contorno"
            :disabled="salvando"
            type="button"
            @click="etapa = 'processamento'"
          >
            Voltar
          </button>

          <button
            class="botao botao--cheio"
            :disabled="!podeConfirmar || salvando"
            type="button"
            @click="confirmar"
          >
            <LoaderCircle v-if="salvando" class="estado__giro" :size="17" />
            {{ salvando ? 'Salvando...' : 'Confirmar identificação' }}
          </button>
        </template>
      </footer>
    </div>
  </v-dialog>
</template>

<style scoped>
.modal {
  --ease: var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1));

  padding: 32px;
  border-radius: 20px;
  background: #fcfcf9;
  color: var(--color-text);
  box-shadow: 0 24px 60px -12px rgb(38 61 53 / 0.35);
}

.modal__cabecalho {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 18px;
  border-bottom: 1px solid #dfe6de;
}

.modal__cabecalho h2 {
  margin: 0 0 4px;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.25;
}

.modal__cabecalho p {
  margin: 0;
  color: #4d6b5e;
  font-size: 0.875rem;
  line-height: 1.5;
}

.botao-icone {
  display: grid;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  place-items: center;
  background: transparent;
  border: 0;
  border-radius: 10px;
  color: #4d6b5e;
  cursor: pointer;
  transition: background-color 0.2s var(--ease), color 0.2s var(--ease);
}

.botao-icone:hover:not(:disabled) {
  background: #e6eee6;
  color: var(--color-primary);
}

.botao-icone:focus-visible,
.soltar:focus-visible,
.botao:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* ---------- envio ---------- */
.soltar {
  display: flex;
  min-height: 155px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 24px;
  padding: 20px;
  background: #f1f5ef;
  border: 1.5px dashed #bdd0c3;
  border-radius: 12px;
  color: var(--color-text);
  cursor: pointer;
  text-align: center;
  transition: background-color 0.25s var(--ease), border-color 0.25s var(--ease);
}

.soltar:hover,
.soltar--arrastando {
  background: #e8f0e8;
  border-color: var(--color-primary);
}

.soltar strong {
  font-size: 0.9375rem;
  font-weight: 500;
}

.soltar > span:last-child {
  color: #5d786b;
  font-size: 0.6875rem;
}

.soltar__icone {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  background: #e1eae0;
  border-radius: 50%;
  color: var(--color-primary);
  transition: transform 0.35s cubic-bezier(0.34, 1.5, 0.64, 1);
}

.soltar:hover .soltar__icone,
.soltar--arrastando .soltar__icone {
  transform: translateY(-3px) scale(1.08);
}

.entrada-oculta {
  display: none;
}

.lista {
  display: flex;
  max-height: 232px;
  flex-direction: column;
  gap: 10px;
  margin: 18px 0 0;
  padding: 2px 8px 2px 0;
  overflow-y: auto;
  list-style: none;
  scrollbar-color: var(--color-support) #e1eae0;
  scrollbar-width: thin;
}

.lista--status {
  max-height: 300px;
}

.lista--revisao {
  max-height: 340px;
}

.arquivo,
.trabalho,
.revisao {
  background: #fff;
  border: 1px solid #dfe7e0;
  border-radius: 10px;
}

.arquivo {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
}

.arquivo__icone {
  flex-shrink: 0;
  color: #3f5a4e;
}

.arquivo__info,
.trabalho__info {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 2px;
}

.arquivo__info strong,
.trabalho__info strong {
  overflow: hidden;
  font-size: 0.8125rem;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.arquivo__info span,
.trabalho__info span {
  color: #6a8276;
  font-size: 0.6875rem;
}

.vazio {
  margin: 18px 0 0;
  color: #6a8276;
  font-size: 0.8125rem;
  text-align: center;
}

/* ---------- processando ---------- */
.resumo {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 22px;
}

.resumo strong {
  font-size: 0.9375rem;
  font-weight: 500;
}

.resumo span {
  color: #6a8276;
  font-size: 0.6875rem;
}

.progresso {
  margin-top: 18px;
}

.progresso__linha {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  font-size: 0.75rem;
}

.progresso__linha strong {
  font-weight: 600;
}

.progresso__linha span {
  color: #6a8276;
  font-size: 0.6875rem;
}

.progresso__trilha {
  height: 6px;
  margin-top: 8px;
  overflow: hidden;
  background: #e4e9e2;
  border-radius: 999px;
}

.progresso__barra {
  display: block;
  height: 100%;
  background: var(--color-primary);
  border-radius: 999px;
  transition: width 0.6s var(--ease);
}

.progresso small {
  display: block;
  margin-top: 8px;
  color: #6a8276;
  font-size: 0.6875rem;
}

.trabalho {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 12px 14px;
}

.estado {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 5px;
  color: #6a8276;
  font-size: 0.6875rem;
  font-weight: 500;
  transition: color 0.3s var(--ease);
}

.estado--analisando {
  color: var(--color-primary);
}

.estado--concluido {
  color: #39734d;
}

.estado--concluido svg {
  animation: estado-pop 0.45s cubic-bezier(0.34, 1.7, 0.64, 1);
}

.estado--erro {
  color: #b3261e;
}

.estado__giro {
  animation: giro 0.85s linear infinite;
}

@keyframes giro {
  to {
    transform: rotate(360deg);
  }
}

@keyframes estado-pop {
  from {
    opacity: 0;
    transform: scale(0.3);
  }
}

/* ---------- revisão ---------- */
.revisao {
  padding: 14px;
}

.revisao__topo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.revisao__confianca {
  margin: 8px 0 12px;
  color: #6a8276;
  font-size: 0.6875rem;
}

.revisao__campo {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.revisao__select {
  width: 100%;
  min-height: 42px;
  padding: 0 10px;
  background: #fff;
  border: 1px solid #cad9ce;
  border-radius: 8px;
  color: var(--color-text);
  font-size: 0.8125rem;
}

.revisao__select:focus-visible {
  outline: 2px solid var(--color-support);
}

.selo {
  flex-shrink: 0;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 0.625rem;
  font-weight: 600;
}

.selo--confirmada {
  background: #e5f3e9;
  color: #39734d;
}

.selo--pendente {
  background: #fff1dc;
  color: #a36c25;
}

/* ---------- rodapé e botões ---------- */
.modal__rodape {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 22px;
  border-top: 1px solid #dfe6de;
}

.botao {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 26px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.25s var(--ease),
    color 0.25s var(--ease),
    opacity 0.25s var(--ease),
    transform 0.2s var(--ease);
}

.botao:active:not(:disabled) {
  transform: scale(0.985);
}

.botao--contorno {
  background: #fff;
  border: 1px solid #cfd9d1;
  color: var(--color-text);
  font-weight: 500;
}

.botao--contorno:hover:not(:disabled) {
  background: #f0f5f1;
}

.botao--cheio {
  background: #2f5a4b;
  border: 1px solid #2f5a4b;
  color: #fff;
}

.botao--cheio:hover:not(:disabled) {
  background: #264a3d;
}

.botao--largo {
  flex: 1;
}

.botao:disabled {
  cursor: not-allowed;
}

.botao--cheio:disabled {
  background: #dfe8e0;
  border-color: #dfe8e0;
  color: #6a8276;
}

.botao--contorno:disabled {
  opacity: 0.5;
}

/* "Continuar" chama a atenção uma vez quando a análise termina. */
.botao--pronto {
  animation: botao-pronto 0.7s var(--ease);
}

@keyframes botao-pronto {
  40% {
    box-shadow: 0 0 0 7px rgb(53 107 91 / 0.18);
    transform: scale(1.015);
  }
}

/* ---------- lista: entrada e saída dos itens ---------- */
.item-enter-active {
  transition: opacity 0.3s var(--ease), transform 0.4s var(--ease);
}

.item-leave-active {
  position: absolute;
  width: calc(100% - 8px);
  transition: opacity 0.2s ease, transform 0.25s var(--ease);
}

.item-move {
  transition: transform 0.35s var(--ease);
}

.item-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.item-leave-to {
  opacity: 0;
  transform: translateX(14px);
}

@media (max-width: 600px) {
  .modal {
    padding: 22px 18px;
  }

  .modal__cabecalho h2 {
    font-size: 1.25rem;
  }

  .botao {
    padding: 0 18px;
  }

  .revisao__topo {
    align-items: flex-start;
  }
}
</style>
