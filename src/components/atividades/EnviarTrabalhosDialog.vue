<script setup lang="ts">
  import type { Estudante, Trabalho } from '@/interfaces/trabalho'
  import {
    FileImage,
    LoaderCircle,
    Trash2,
    Upload,
    X,
  } from '@lucide/vue'
  import { computed, ref, watch } from 'vue'
  import MarsupiLoading from '@/components/MarsupiLoading.vue'
  import trabalhosService from '@/services/trabalho'
  import { notify } from '@/utils/notify'

  const props = defineProps<{
    atividadeId: number
    estudantes: Estudante[]
  }>()

  const model = defineModel<boolean>({ required: true })

  const emit = defineEmits<{
    completed: [trabalhos: Trabalho[]]
  }>()

  const fileInput = ref<HTMLInputElement | null>(null)
  const files = ref<File[]>([])
  const trabalhos = ref<Trabalho[]>([])
  const step = ref<'upload' | 'review'>('upload')
  const dragging = ref(false)
  const processing = ref(false)
  const saving = ref(false)

  const canSubmit = computed(() => {
    if (step.value === 'upload') {
      return files.value.length > 0
    }

    return (
      trabalhos.value.length > 0
      && trabalhos.value.every(trabalho => trabalho.aluno !== null)
    )
  })

  watch(model, open => {
    if (open) reset()
  })

  function reset (): void {
    files.value = []
    trabalhos.value = []
    step.value = 'upload'
    dragging.value = false

    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }

  function close (): void {
    if (processing.value || saving.value) return

    model.value = false
  }

  function openFilePicker (): void {
    fileInput.value?.click()
  }

  function addFiles (incoming: File[]): void {
    const allowed = new Set(['image/jpeg', 'image/png', 'image/webp'])
    const maxSize = 20 * 1024 * 1024

    let invalid = false

    for (const file of incoming) {
      if (!allowed.has(file.type) || file.size > maxSize) {
        invalid = true
        continue
      }

      const duplicate = files.value.some(
        current =>
          current.name === file.name
          && current.size === file.size
          && current.lastModified === file.lastModified,
      )

      if (!duplicate) files.value.push(file)
    }

    if (invalid) {
      notify.error(
        'Selecione imagens PNG, JPG ou WEBP de até 20 MB.',
      )
    }
  }

  function handleFileChange (event: Event): void {
    const input = event.target as HTMLInputElement

    addFiles(Array.from(input.files ?? []))
    input.value = ''
  }

  function handleDrop (event: DragEvent): void {
    dragging.value = false
    addFiles(Array.from(event.dataTransfer?.files ?? []))
  }

  function removeFile (index: number): void {
    files.value.splice(index, 1)
  }

  function formatSize (bytes: number): string {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`
  }

  function formatConfidence (value: number | null): string {
    if (value === null) return 'Não informada'

    return `${Math.round(value * 100)}%`
  }

  async function upload (): Promise<void> {
    if (files.value.length === 0 || processing.value) return

    processing.value = true

    try {
      trabalhos.value = await trabalhosService.upload(
        props.atividadeId,
        files.value,
        props.estudantes,
      )

      if (trabalhos.value.length === 0) {
        throw new Error('Nenhum trabalho foi retornado.')
      }

      step.value = 'review'
      notify.success('Trabalhos analisados. Revise os alunos.')
    } catch (error) {
      notify.error(
        error instanceof Error
          ? error.message
          : 'Erro ao enviar trabalhos.',
      )
    } finally {
      processing.value = false
    }
  }

  function backToUpload (): void {
    step.value = 'upload'
  }

  async function confirm (): Promise<void> {
    if (!canSubmit.value || saving.value) return

    saving.value = true

    try {
      for (const trabalho of trabalhos.value) {
        if (trabalho.aluno === null) continue

        await trabalhosService.confirmar(trabalho.id, {
          aluno: trabalho.aluno,
          identificacao: 'confirmada',
        })

        trabalho.identificacao = 'confirmada'
      }

      notify.success('Identificações confirmadas!')
      emit('completed', trabalhos.value)
      model.value = false
    } catch (error) {
      notify.error(
        error instanceof Error
          ? error.message
          : 'Não foi possível confirmar os trabalhos.',
      )
    } finally {
      saving.value = false
    }
  }
</script>
<template>
  <v-dialog v-model="model" max-width="640" persistent>
    <div class="upload-dialog">
      <header class="dialog-header">
        <div>
          <h2>Enviar atividades</h2>

          <p>
            A IA identifica os alunos e preenche os dados
            automaticamente.
          </p>

        </div>

        <button
          aria-label="Fechar"
          class="icon-button"
          :disabled="processing || saving"
          type="button"
          @click="close"
        >
          <X :size="19" />
        </button>
      </header>

      <template v-if="processing">
        <div class="processing-area">
          <MarsupiLoading label="Analisando os trabalhos..." />

          <p>
            Estamos identificando os estudantes nas imagens.
          </p>
        </div>
      </template>

      <template v-else-if="step === 'upload'">
        <div
          class="dropzone"
          :class="{ dragging }"
          role="button"
          tabindex="0"
          @click="openFilePicker"
          @dragleave.prevent="dragging = false"
          @dragover.prevent="dragging = true"
          @drop.prevent="handleDrop"
          @keydown.enter.prevent="openFilePicker"
          @keydown.space.prevent="openFilePicker"
        >
          <Upload :size="27" :stroke-width="1.7" />
          <strong>Arraste e solte ou procure arquivos</strong>
          <span>PNG, JPG ou WEBP · Máx. 20 MB por arquivo</span>
        </div>

        <input
          ref="fileInput"
          accept="image/png,image/jpeg,image/webp"
          class="hidden-input"
          multiple
          type="file"
          @change="handleFileChange"
        >

        <div v-if="files.length > 0" class="file-list">
          <div v-for="(file, index) in files" :key="`${file.name}-${file.lastModified}-${index}`" class="file-item">
            <FileImage :size="19" />

            <div class="file-info">
              <strong>{{ file.name }}</strong>
              <span>{{ formatSize(file.size) }} · Concluído</span>
            </div>

            <button :aria-label="`Remover ${file.name}`" class="icon-button" type="button" @click="removeFile(index)">
              <Trash2 :size="17" />
            </button>
          </div>
        </div>

        <p v-else class="empty-message">
          Nenhum arquivo selecionado.
        </p>
      </template>

      <template v-else>
        <div class="review-heading">
          <h3>Revisar identificação</h3>

          <p>
            Confira os alunos identificados antes de concluir.
          </p>
        </div>

        <div class="review-list">
          <div v-for="trabalho in trabalhos" :key="trabalho.id" class="review-item">
            <div class="review-top">
              <div class="file-info">
                <strong>{{ trabalho.nome_arquivo }}</strong>

                <span>
                  Nome lido:
                  {{ trabalho.nome_lido || 'Não identificado' }}
                </span>
              </div>

              <span class="status" :class="trabalho.identificacao">
                {{
                  trabalho.identificacao === 'pendente'
                    ? 'Pendente'
                    : 'Identificado'
                }}
              </span>
            </div>

            <p class="confidence">
              Confiança da IA:
              {{ formatConfidence(trabalho.confianca) }}
            </p>

            <label class="student-label">
              Estudante da turma
              <select v-model="trabalho.aluno" class="student-select" :disabled="saving">
                <option :value="null">
                  Selecione um estudante
                </option>

                <option v-for="estudante in estudantes" :key="estudante.id" :value="estudante.id">
                  {{ estudante.nome }}
                </option>
              </select>
            </label>
          </div>
        </div>
      </template>

      <footer class="dialog-footer">
        <button
          class="cancel-button"
          :disabled="processing || saving"
          type="button"
          @click="step === 'review' ? backToUpload() : close()"
        >
          {{ step === 'review' ? 'Voltar' : 'Cancelar' }}
        </button>

        <button
          class="submit-button"
          :disabled="!canSubmit || processing || saving"
          type="button"
          @click="step === 'upload' ? upload() : confirm()"
        >
          <LoaderCircle v-if="saving" class="spinner" :size="17" />
          {{
            saving
              ? 'Salvando...'
              : step === 'upload'
                ? 'Enviar'
                : 'Confirmar identificação'
          }}
        </button>
      </footer>
    </div>
  </v-dialog>
</template>

<style scoped>
.upload-dialog {
  padding: 24px;
  border-radius: 16px;
  background: #fff;
  color: #263d35;
  box-shadow: 0 18px 60px #00000020;
}

.dialog-header,
.dialog-footer,
.file-item,
.review-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.dialog-header {
  align-items: flex-start;
  margin-bottom: 20px;
}

.dialog-header h2 {
  margin: 0 0 6px;
  font-size: 21px;
  font-weight: 700;
}

.dialog-header p,
.review-heading p {
  margin: 0;
  color: #82948a;
  font-size: 13px;
  line-height: 1.5;
}

.icon-button {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #688479;
  cursor: pointer;
  transition: background 200ms ease;
}

.icon-button:hover:not(:disabled) {
  background: #edf4ef;
}

.dropzone {
  display: flex;
  min-height: 155px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 20px;
  border: 1.5px dashed #b6d2c0;
  border-radius: 12px;
  background: #f8fbf8;
  color: #356b5b;
  text-align: center;
  cursor: pointer;
  transition: background 200ms ease, border-color 200ms ease;
}

.dropzone:hover,
.dropzone.dragging {
  border-color: #356b5b;
  background: #edf5ef;
}

.dropzone strong {
  font-size: 13px;
  font-weight: 600;
}

.dropzone span {
  color: #899b90;
  font-size: 11px;
}

.hidden-input {
  display: none;
}

.file-list,
.review-list {
  display: flex;
  flex-direction: column;
  gap: 9px;
  max-height: 260px;
  margin-top: 15px;
  overflow-y: auto;
}

.file-item,
.review-item {
  padding: 10px 12px;
  border: 1px solid #e1e9e3;
  border-radius: 9px;
  background: #fff;
}

.file-item>svg {
  flex-shrink: 0;
  color: #557c6d;
}

.file-info {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 3px;
}

.file-info strong {
  overflow: hidden;
  font-size: 12px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-info span,
.confidence {
  color: #91a198;
  font-size: 11px;
}

.empty-message {
  padding: 15px;
  color: #91a198;
  font-size: 12px;
  text-align: center;
}

.processing-area {
  display: flex;
  min-height: 300px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
}

.processing-area p {
  color: #82948a;
  font-size: 13px;
  text-align: center;
}

.review-heading h3 {
  margin: 0 0 5px;
  font-size: 16px;
}

.review-list {
  max-height: 340px;
}

.review-item {
  padding: 14px;
}

.status {
  flex-shrink: 0;
  padding: 5px 9px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 600;
}

.status.confirmada {
  background: #e5f3e9;
  color: #39734d;
}

.status.pendente {
  background: #fff1dc;
  color: #a36c25;
}

.confidence {
  margin: 8px 0 12px;
}

.student-label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
}

.student-select {
  width: 100%;
  min-height: 40px;
  padding: 0 10px;
  border: 1px solid #cad9ce;
  border-radius: 8px;
  background: white;
  color: #263d35;
  font-size: 13px;
}

.student-select:focus {
  outline: 2px solid #a6c7b6;
}

.dialog-footer {
  justify-content: flex-end;
  margin-top: 22px;
}

.cancel-button,
.submit-button {
  min-height: 39px;
  padding: 0 18px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 220ms ease, opacity 220ms ease;
}

.cancel-button {
  border: 1px solid #d5e2d9;
  background: white;
  color: #356b5b;
}

.cancel-button:hover:not(:disabled) {
  background: #f0f5f1;
}

.submit-button {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #356b5b;
  background: #356b5b;
  color: white;
}

.submit-button:hover:not(:disabled) {
  background: #294f43;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner {
  animation: spin 850ms linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 600px) {
  .upload-dialog {
    padding: 18px;
  }

  .dialog-header h2 {
    font-size: 19px;
  }

  .review-top {
    align-items: flex-start;
  }
}

@media (prefers-reduced-motion: reduce) {

  *,
  *::before,
  *::after {
    animation: none !important;
    transition: none !important;
  }
}
</style>
