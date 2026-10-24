<template>
  <v-dialog
    v-model="aberto"
    class="dialog-criar-atividade"
    max-width="660"
    persistent
  >
    <div class="modal-card">
      <!-- Cabeçalho -->
      <div class="modal-header">
        <div>
          <h2 class="modal-titulo">Criar atividade</h2>

          <p class="modal-subtitulo">
            Envie um arquivo. Depois, revise o nome e a descrição.
          </p>
        </div>

        <button
          aria-label="Fechar modal"
          class="btn-fechar"
          type="button"
          @click="fechar"
        >
          <X :size="20" />
        </button>
      </div>

      <div class="modal-divisor" />

      <!-- Estado: Processando com IA -->
      <div v-if="processando" class="estado-processando">
        <MarsupiLoading label="Processando com IA" />
      </div>

      <!-- Estado: Formulário -->
      <div v-else class="modal-corpo">
        <!-- Área de Upload / Dropzone -->
        <div
          class="dropzone"
          :class="{ 'dropzone--arrastando': arrastando, 'dropzone--com-arquivo': !!arquivoSelecionado }"
          @click="acionarSelecaoArquivo"
          @dragenter.prevent="arrastando = true"
          @dragleave.prevent="arrastando = false"
          @dragover.prevent="arrastando = true"
          @drop.prevent="tratarSoltarArquivo"
        >
          <input
            ref="inputArquivoRef"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            class="input-arquivo-oculto"
            type="file"
            @change="tratarArquivoSelecionado"
          >

          <template v-if="arquivoSelecionado">
            <div class="arquivo-preview">
              <div class="arquivo-icone">
                <FileText :size="28" />
              </div>

              <div class="arquivo-info">
                <span class="arquivo-nome">{{ arquivoSelecionado.name }}</span>
                <span class="arquivo-tamanho">{{ formatarTamanho(arquivoSelecionado.size) }}</span>
              </div>

              <button
                class="btn-trocar-arquivo"
                type="button"
                @click.stop="acionarSelecaoArquivo"
              >
                Trocar arquivo
              </button>
            </div>
          </template>

          <template v-else>
            <div class="dropzone-icone">
              <Upload :size="30" />
            </div>

            <p class="dropzone-texto">
              Arraste o arquivo ou
              <span class="link-procurar">Procurar arquivo</span>
            </p>

            <span class="dropzone-formatos">PDF ou DOCX</span>
          </template>
        </div>

        <!-- Campo: Nome da atividade -->
        <div class="campo-grupo">
          <label class="campo-label" for="campo-nome-atividade">
            Nome da atividade
          </label>

          <input
            id="campo-nome-atividade"
            v-model="nomeAtividade"
            class="campo-input"
            placeholder="Preenchido automaticamente após o envio"
            type="text"
          >
        </div>

        <!-- Campo: Descrição -->
        <div class="campo-grupo">
          <label class="campo-label" for="campo-descricao-atividade">
            Descrição
          </label>

          <textarea
            id="campo-descricao-atividade"
            v-model="descricaoAtividade"
            class="campo-textarea"
            placeholder="A descrição será extraída do arquivo."
            rows="5"
          />
        </div>

        <p class="nota-ajuste">
          Você poderá ajustar os dados antes de confirmar.
        </p>

        <!-- Ações do Rodapé -->
        <div class="modal-acoes">
          <button
            class="btn-cancelar"
            :disabled="salvando"
            type="button"
            @click="fechar"
          >
            Cancelar
          </button>

          <button
            class="btn-confirmar"
            :disabled="!podeConfirmar || salvando"
            type="button"
            @click="confirmarAtividade"
          >
            <span v-if="salvando">Salvando...</span>
            <span v-else>Confirmar</span>
          </button>
        </div>
      </div>
    </div>
  </v-dialog>
</template>

<script setup lang="ts">
  import type { Atividade } from '@/interfaces/atividade'
  import { FileText, Upload, X } from '@lucide/vue'
  import { computed, ref, watch } from 'vue'
  import { useAtividadesStore } from '@/stores/atividades'
  import { notify } from '@/utils/notify'

  const props = withDefaults(
    defineProps<{
      turmaId?: number | string
      turmaNome?: string
    }>(),
    {
      turmaId: undefined,
      turmaNome: undefined,
    },
  )

  const emit = defineEmits<{
    close: []
    created: [atividade: Atividade]
  }>()

  const aberto = defineModel<boolean>({ default: false })

  const atividadesStore = useAtividadesStore()

  const inputArquivoRef = ref<HTMLInputElement | null>(null)
  const arquivoSelecionado = ref<File | null>(null)
  const arrastando = ref(false)
  const processando = ref(false)
  const salvando = ref(false)

  const nomeAtividade = ref('')
  const descricaoAtividade = ref('')

  const extensoesPermitidas = ['.pdf', '.docx']

  const podeConfirmar = computed(() => {
    return nomeAtividade.value.trim().length > 0
  })

  // Limpa o formulário sempre que o modal for reaberto
  watch(
    aberto,
    abertoAgora => {
      if (abertoAgora) {
        resetarFormulario()
      }
    },
  )

  function resetarFormulario (): void {
    arquivoSelecionado.value = null
    arrastando.value = false
    processando.value = false
    salvando.value = false
    nomeAtividade.value = ''
    descricaoAtividade.value = ''
    if (inputArquivoRef.value) {
      inputArquivoRef.value.value = ''
    }
  }

  function fechar (): void {
    aberto.value = false
    emit('close')
  }

  function acionarSelecaoArquivo (): void {
    inputArquivoRef.value?.click()
  }

  function validarArquivo (arquivo: File): boolean {
    const nome = arquivo.name.toLowerCase()
    const validaExtensao = extensoesPermitidas.some(ext => nome.endsWith(ext))
    if (!validaExtensao) {
      notify.error('Envie apenas arquivos nos formatos PDF ou DOCX.')
      return false
    }

    // Limite de 25 MB
    const limiteBytes = 25 * 1024 * 1024
    if (arquivo.size > limiteBytes) {
      notify.error('O arquivo deve ter no máximo 25 MB.')
      return false
    }

    return true
  }

  async function processarArquivo (arquivo: File): Promise<void> {
    if (!validarArquivo(arquivo)) {
      return
    }

    arquivoSelecionado.value = arquivo
    processando.value = true

    try {
      const extracao = await atividadesStore.extrairAtividade(arquivo)
      nomeAtividade.value = extracao.titulo || ''
      descricaoAtividade.value = extracao.descricao || ''
      notify.success('Dados da atividade extraídos com sucesso!')
    } catch {
      notify.error('Não foi possível extrair os dados do arquivo.')
    } finally {
      processando.value = false
    }
  }

  function tratarArquivoSelecionado (evento: Event): void {
    const target = evento.target as HTMLInputElement
    const arquivo = target.files?.[0]
    if (arquivo) {
      processarArquivo(arquivo)
    }
  }

  function tratarSoltarArquivo (evento: DragEvent): void {
    arrastando.value = false
    const arquivo = evento.dataTransfer?.files?.[0]
    if (arquivo) {
      processarArquivo(arquivo)
    }
  }

  function formatarTamanho (bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  async function confirmarAtividade (): Promise<void> {
    if (!podeConfirmar.value) return

    salvando.value = true
    try {
      const turmaNum = props.turmaId ? Number(props.turmaId) : undefined
      const novaAtividade = await atividadesStore.criarAtividade({
        nome: nomeAtividade.value.trim(),
        descricao: descricaoAtividade.value.trim(),
        turma: turmaNum,
        tipo: 'Atividade Adaptada',
      })

      notify.success('Atividade criada com sucesso!')
      emit('created', novaAtividade)
      fechar()
    } catch {
      notify.error('Erro ao salvar a atividade. Tente novamente.')
    } finally {
      salvando.value = false
    }
  }
</script>

<style scoped>
.modal-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 20px 48px rgba(26, 46, 36, 0.16);
  width: 100%;
  color: var(--color-text, #1f382b);
  font-family: var(--font-sans, 'Poppins', sans-serif);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.modal-titulo {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.25;
  color: #1f382b;
}

.modal-subtitulo {
  font-size: 14px;
  color: #5b7566;
  margin-top: 4px;
}

.btn-fechar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #5b7566;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}

.btn-fechar:hover {
  background-color: #eef3f0;
  color: #1f382b;
}

.modal-divisor {
  height: 1px;
  background-color: #e5ede8;
  margin: 20px 0 24px 0;
}

.estado-processando {
  padding: 56px 16px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-corpo {
  display: flex;
  flex-direction: column;
}

/* Dropzone */
.dropzone {
  border: 1.5px dashed #a9c7b4;
  border-radius: 16px;
  background: #f8faf9;
  padding: 32px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
  margin-bottom: 22px;
}

.dropzone:hover,
.dropzone--arrastando {
  border-color: #356b5b;
  background: #eef5f1;
}

.dropzone--com-arquivo {
  padding: 20px;
  border-style: solid;
  border-color: #cde0d5;
}

.input-arquivo-oculto {
  display: none;
}

.dropzone-icone {
  color: #356b5b;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dropzone-texto {
  font-size: 15px;
  color: #263d35;
  margin: 0;
}

.link-procurar {
  color: #356b5b;
  font-weight: 500;
  text-decoration: underline;
  cursor: pointer;
}

.dropzone-formatos {
  font-size: 12px;
  font-weight: 500;
  color: #718278;
  margin-top: 6px;
  letter-spacing: 0.04em;
}

/* Preview do arquivo */
.arquivo-preview {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
}

.arquivo-icone {
  color: #356b5b;
  display: flex;
  align-items: center;
}

.arquivo-info {
  display: flex;
  flex-direction: column;
  text-align: left;
  flex: 1;
  min-width: 0;
}

.arquivo-nome {
  font-size: 14px;
  font-weight: 600;
  color: #1f382b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.arquivo-tamanho {
  font-size: 12px;
  color: #718278;
}

.btn-trocar-arquivo {
  background: none;
  border: none;
  color: #356b5b;
  font-size: 13px;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
}

/* Campos de entrada */
.campo-grupo {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}

.campo-label {
  font-size: 14px;
  font-weight: 600;
  color: #1f382b;
  margin-bottom: 8px;
}

.campo-input {
  width: 100%;
  padding: 12px 16px;
  background-color: #eef3f0;
  border: 1px solid transparent;
  border-radius: 12px;
  font-size: 14px;
  color: #1f382b;
  outline: none;
  transition: border-color 0.2s, background-color 0.2s;
  font-family: inherit;
}

.campo-input::placeholder {
  color: #718278;
}

.campo-input:focus {
  border-color: #356b5b;
  background-color: #ffffff;
}

.campo-textarea {
  width: 100%;
  padding: 12px 16px;
  background-color: #eef3f0;
  border: 1px solid transparent;
  border-radius: 12px;
  font-size: 14px;
  color: #1f382b;
  outline: none;
  resize: vertical;
  min-height: 120px;
  transition: border-color 0.2s, background-color 0.2s;
  font-family: inherit;
}

.campo-textarea::placeholder {
  color: #718278;
}

.campo-textarea:focus {
  border-color: #356b5b;
  background-color: #ffffff;
}

.nota-ajuste {
  font-size: 13px;
  color: #718278;
  margin: 4px 0 24px 0;
}

/* Botões do Rodapé */
.modal-acoes {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-cancelar {
  padding: 10px 24px;
  border-radius: 9999px;
  border: 1px solid #b9c8bf;
  background: transparent;
  color: #2d5a43;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
}

.btn-cancelar:hover:not(:disabled) {
  background-color: #f0f5f2;
  border-color: #2d5a43;
}

.btn-confirmar {
  padding: 10px 28px;
  border-radius: 9999px;
  border: none;
  background-color: #356b5b;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s, opacity 0.2s;
}

.btn-confirmar:hover:not(:disabled) {
  background-color: #265043;
}

.btn-confirmar:disabled {
  background-color: #c3d6cb;
  color: #f7faf8;
  cursor: not-allowed;
}
</style>
