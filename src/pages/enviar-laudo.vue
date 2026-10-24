<script setup lang="ts">
  import { FileText, Lock, Upload } from '@lucide/vue'
  import { computed, onBeforeUnmount, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import carregandoUrl from '@/assets/mascotes/carregando.svg'
  import enviadoUrl from '@/assets/mascotes/enviado.svg'
  import LaudoBotao from '@/components/laudo/LaudoBotao.vue'
  import LaudoExpandir from '@/components/laudo/LaudoExpandir.vue'
  import LaudoMascote from '@/components/laudo/LaudoMascote.vue'
  import LaudoPagina from '@/components/laudo/LaudoPagina.vue'
  import { useNomeAluno } from '@/composables/useNomeAluno'
  import laudosService from '@/services/laudos'
  import { notify } from '@/utils/notify'

  definePage({
    meta: {
      layout: false,
      public: true,
    },
  })

  const route = useRoute('/enviar-laudo')
  const router = useRouter()
  const { nome: nomeAluno, alunoId } = useNomeAluno('o aluno')

  const TAMANHO_MAXIMO = 10 * 1024 * 1024
  const TIPOS_ACEITOS = new Set(['application/pdf', 'image/jpeg', 'image/png'])

  type Estado = 'vazio' | 'enviando' | 'enviado'

  const inputArquivo = ref<HTMLInputElement | null>(null)
  const arquivo = ref<File | null>(null)
  const laudoId = ref<number | null>(null)
  const estado = ref<Estado>('vazio')
  const progresso = ref(0)
  const arrastando = ref(false)
  let envio: AbortController | null = null

  // O último arquivo continua na linha enquanto ela fecha ao remover (sem piscar vazia).
  const arquivoExibido = ref<File | null>(null)
  watch(arquivo, novo => {
    if (novo) arquivoExibido.value = novo
  })

  // Mascote: o carregando.svg (pula, com os três pontinhos) até o envio terminar; aí vira o
  // avião de papel e "decola". Com um arquivo por cima da área, ele se estica para pegar.
  const mascote = ref<InstanceType<typeof LaudoMascote> | null>(null)
  const mascoteUrl = computed(() => estado.value === 'enviado' ? enviadoUrl : carregandoUrl)

  watch(estado, novo => {
    if (novo === 'enviado') mascote.value?.reagir('decola')
  })

  const titulo = computed(() => nomeAluno.value === 'o aluno' ? 'Envie o laudo do aluno' : `Envie o laudo de ${nomeAluno.value}`)

  const rotuloBotao = computed(() => ({
    vazio: 'Enviar',
    enviando: 'Enviando...',
    enviado: 'Continuar',
  })[estado.value])

  function formatarTamanho (bytes: number): string {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
    return `${(bytes / (1024 * 1024)).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} MB`
  }

  function escolher () {
    inputArquivo.value?.click()
  }

  function aoEscolher (evento: Event) {
    const alvo = evento.target as HTMLInputElement
    const selecionado = alvo.files?.[0]
    // Limpa o input para conseguir escolher o mesmo arquivo de novo depois de remover.
    alvo.value = ''
    if (selecionado) void enviar(selecionado)
  }

  function aoSoltar (evento: DragEvent) {
    arrastando.value = false
    const solto = evento.dataTransfer?.files?.[0]
    if (solto) void enviar(solto)
  }

  async function enviar (novo: File) {
    if (!TIPOS_ACEITOS.has(novo.type)) {
      notify.error('Envie um arquivo PDF, JPG ou PNG.')
      return
    }
    if (novo.size > TAMANHO_MAXIMO) {
      notify.error('O arquivo passa de 10 MB. Escolha um menor.')
      return
    }

    envio?.abort()
    const controle = new AbortController()
    envio = controle

    arquivo.value = novo
    progresso.value = 0
    estado.value = 'enviando'

    try {
      const laudo = await laudosService.enviar(alunoId.value, novo, {
        signal: controle.signal,
        onProgresso: valor => {
          progresso.value = valor
        },
      })
      laudoId.value = laudo.id
      estado.value = 'enviado'
    } catch (error) {
      // Cancelado por "Remover" ou por outro arquivo: o estado já foi tratado lá.
      if (controle.signal.aborted) return
      notify.error(error instanceof Error ? error.message : 'Não foi possível enviar o laudo.')
      remover()
    } finally {
      if (envio === controle) envio = null
    }
  }

  function remover () {
    envio?.abort()
    envio = null
    arquivo.value = null
    laudoId.value = null
    progresso.value = 0
    estado.value = 'vazio'
  }

  function continuar () {
    if (!laudoId.value) return
    void router.push({ path: '/conferir-dados', query: { ...route.query, laudo: laudoId.value } })
  }

  onBeforeUnmount(() => envio?.abort())
</script>

<template>
  <LaudoPagina
    etapa="enviar"
    subtitulo="PDF, JPG ou PNG, de até 10 MB."
    :titulo="titulo"
  >
    <template #mascote>
      <LaudoMascote
        ref="mascote"
        entrada="pop"
        :pose="arrastando ? 'esticado' : 'parado'"
        :src="mascoteUrl"
      />
    </template>

    <button
      class="dropzone"
      :class="{ 'dropzone--arrastando': arrastando }"
      type="button"
      @click="escolher"
      @dragenter.prevent="arrastando = true"
      @dragleave.prevent="arrastando = false"
      @dragover.prevent="arrastando = true"
      @drop.prevent="aoSoltar"
    >
      <span aria-hidden="true" class="dropzone__icone">
        <Upload :size="18" />
      </span>

      <strong>Arraste o arquivo aqui ou escolha no computador</strong>
      <span class="dropzone__formatos">PDF, JPG ou PNG · até 10 MB</span>
    </button>

    <input
      ref="inputArquivo"
      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
      class="d-none"
      type="file"
      @change="aoEscolher"
    >

    <LaudoExpandir :aberto="!!arquivo">
      <div v-if="arquivoExibido" class="arquivo">
        <span aria-hidden="true" class="arquivo__icone">
          <FileText :size="16" />
        </span>

        <div class="arquivo__info">
          <div class="arquivo__linha">
            <strong class="arquivo__nome">{{ arquivoExibido.name }} · {{ formatarTamanho(arquivoExibido.size) }}</strong>
            <button class="arquivo__remover" type="button" @click="remover">Remover</button>
          </div>

          <v-progress-linear
            :aria-label="`Envio do laudo: ${progresso}%`"
            bg-color="#dce6df"
            bg-opacity="1"
            class="arquivo__barra"
            color="#2f4f45"
            height="6"
            :model-value="progresso"
            rounded
          />

          <span class="arquivo__percentual">{{ progresso }}%</span>
        </div>
      </div>
    </LaudoExpandir>

    <p class="seguro">
      <Lock aria-hidden="true" :size="14" />
      Conexão segura · o arquivo é apagado ao final
    </p>

    <template #acoes>
      <LaudoBotao @click="router.back()">
        Voltar
      </LaudoBotao>

      <LaudoBotao :disabled="estado !== 'enviado'" principal @click="continuar">
        {{ rotuloBotao }}
      </LaudoBotao>
    </template>
  </LaudoPagina>
</template>

<style scoped>
.dropzone {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: clamp(20px, 5vw, 32px) 16px;
  border: 1.5px dashed var(--color-support);
  border-radius: 12px;
  background: var(--apoio-caixa);
  color: var(--apoio-texto);
  font: inherit;
  text-align: center;
  cursor: pointer;
  transition:
    background-color 200ms ease,
    border-color 200ms ease,
    box-shadow 200ms ease,
    scale 200ms var(--apoio-ease);
}

.dropzone:hover {
  border-color: var(--apoio-verde);
}

/* Arrastando por cima: borda contínua, fundo menta e um leve "convite" para soltar. */
.dropzone--arrastando {
  border-style: solid;
  border-color: var(--apoio-verde);
  background: var(--apoio-menta);
  box-shadow: 0 0 0 4px rgb(47 79 69 / 0.08);
  scale: 1.01;
}

/* Sem isso, passar sobre o texto dispara dragleave e a área pisca. */
.dropzone--arrastando > * {
  pointer-events: none;
}

.dropzone:focus-visible {
  outline: 2px solid var(--apoio-verde);
  outline-offset: 3px;
}

.dropzone strong {
  font-size: 0.875rem;
  font-weight: var(--font-weight-semibold);
  overflow-wrap: anywhere;
}

.dropzone__icone {
  display: grid;
  width: 36px;
  height: 36px;
  margin-bottom: 4px;
  place-items: center;
  border-radius: 50%;
  background: var(--apoio-menta);
  transition: translate 200ms var(--apoio-ease), background-color 200ms ease;
}

.dropzone--arrastando .dropzone__icone {
  background: #fff;
  translate: 0 -3px;
}

.dropzone__formatos {
  color: var(--apoio-texto-sec);
  font-size: 0.75rem;
}

.arquivo {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--apoio-caixa);
  text-align: left;
}

.arquivo__icone {
  display: grid;
  width: 32px;
  height: 32px;
  flex: none;
  place-items: center;
  border-radius: 50%;
  background: #fff;
}

.arquivo__info {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 6px;
}

.arquivo__linha {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.arquivo__nome {
  overflow: hidden;
  font-size: 0.875rem;
  font-weight: var(--font-weight-semibold);
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Alvo de toque de 44px sem aumentar a linha. */
.arquivo__remover {
  flex: none;
  min-height: 44px;
  margin: -12px -8px;
  padding: 0 8px;
  border: 0;
  border-radius: 8px;
  background: none;
  color: var(--apoio-erro);
  font: inherit;
  font-size: 0.8125rem;
  cursor: pointer;
}

.arquivo__remover:hover {
  text-decoration: underline;
}

.arquivo__remover:focus-visible {
  outline: 2px solid var(--apoio-erro);
}

.arquivo__barra :deep(.v-progress-linear__determinate) {
  transition: width 250ms ease;
}

.arquivo__percentual {
  align-self: flex-end;
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
  font-weight: var(--font-weight-semibold);
}

.seguro {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 0;
  color: var(--apoio-texto-sec);
  font-size: 0.75rem;
}

@media (prefers-reduced-motion: reduce) {
  .dropzone,
  .dropzone__icone,
  .arquivo__barra :deep(.v-progress-linear__determinate) {
    transition: none;
  }

  .dropzone--arrastando {
    scale: none;
  }

  .dropzone--arrastando .dropzone__icone {
    translate: none;
  }
}
</style>
