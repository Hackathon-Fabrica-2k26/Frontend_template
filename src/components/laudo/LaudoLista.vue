<script setup lang="ts">
  import type { Component } from 'vue'
  import { Check, Pencil, X } from '@lucide/vue'
  import { nextTick, ref, useId, watch } from 'vue'

  // Uma seção do que a leitura do laudo encontrou. "Editar" troca a lista por um campo de texto
  // com um item por linha; "Concluir" limpa e salva, "Cancelar" (ou Esc) descarta.
  const props = defineProps<{
    titulo: string
    icone: Component
    /** `ponto` para itens soltos, `check` para recomendações. */
    marcador: 'ponto' | 'check'
  }>()

  const itens = defineModel<string[]>({ required: true })

  // Avisa a página (o mascote inclina a cabeça na edição e acena ao concluir).
  const emit = defineEmits<{ editando: [ativo: boolean], concluido: [] }>()

  const LINHAS_MIN = 3
  const LINHAS_MAX = 10

  const id = useId()
  const campoId = `${id}-campo`
  const ajudaId = `${id}-ajuda`
  const erroId = `${id}-erro`

  const campo = ref<HTMLTextAreaElement | null>(null)
  const botaoEditar = ref<HTMLButtonElement | null>(null)
  const editando = ref(false)
  const texto = ref('')
  const erro = ref('')

  // O campo cresce com as linhas (de 3 a 10); passou disso, rola.
  function ajustarAltura () {
    const el = campo.value
    if (!el) return
    const estilo = getComputedStyle(el)
    const linha = Number.parseFloat(estilo.lineHeight)
    const bordas = Number.parseFloat(estilo.borderTopWidth) + Number.parseFloat(estilo.borderBottomWidth)
    const extra = Number.parseFloat(estilo.paddingTop) + Number.parseFloat(estilo.paddingBottom) + bordas
    el.style.height = 'auto'
    const conteudo = el.scrollHeight + bordas
    const maximo = linha * LINHAS_MAX + extra
    el.style.height = `${Math.min(Math.max(conteudo, linha * LINHAS_MIN + extra), maximo)}px`
    el.style.overflowY = conteudo > maximo ? 'auto' : 'hidden'
  }

  watch(editando, ativo => emit('editando', ativo))

  // O campo só existe depois do fade de troca: foca quando ele aparece, com o cursor no fim.
  watch(campo, el => {
    if (!el) return
    ajustarAltura()
    el.focus()
    el.setSelectionRange(el.value.length, el.value.length)
  })

  function editar () {
    texto.value = itens.value.join('\n')
    erro.value = ''
    editando.value = true
  }

  async function fechar () {
    editando.value = false
    erro.value = ''
    await nextTick()
    botaoEditar.value?.focus()
  }

  function concluir () {
    const novos = texto.value
      .split('\n')
      .map(linha => linha.replace(/\s+/g, ' ').trim())
      .filter(Boolean)

    if (novos.length === 0) {
      erro.value = 'Mantenha pelo menos um item.'
      campo.value?.focus()
      return
    }

    itens.value = novos
    emit('concluido')
    void fechar()
  }

  function aoDigitar () {
    ajustarAltura()
    if (erro.value && texto.value.trim()) erro.value = ''
  }
</script>

<template>
  <section class="lista" :class="{ 'lista--editando': editando }">
    <header class="lista__topo">
      <span aria-hidden="true" class="lista__icone">
        <component :is="props.icone" :size="16" />
      </span>

      <h2>{{ titulo }}</h2>

      <div v-if="editando" class="lista__acoes">
        <button class="lista__acao" type="button" @click="fechar">
          <X :size="14" />
          Cancelar
        </button>

        <button class="lista__acao lista__acao--forte" type="button" @click="concluir">
          <Check :size="14" />
          Concluir
        </button>
      </div>

      <button
        v-else
        ref="botaoEditar"
        :aria-label="`Editar ${titulo}`"
        class="lista__acao"
        type="button"
        @click="editar"
      >
        <Pencil :size="14" />
        Editar
      </button>
    </header>

    <Transition mode="out-in" name="lista-troca">
      <div v-if="editando" key="editor" class="lista__editor">
        <p class="lista__rotulo">
          <label :for="campoId">{{ titulo }}</label>
          <span :id="ajudaId"> (um item por linha)</span>
        </p>

        <textarea
          :id="campoId"
          ref="campo"
          v-model="texto"
          :aria-describedby="`${ajudaId} ${erroId}`"
          :aria-invalid="erro ? 'true' : undefined"
          class="lista__campo"
          :rows="LINHAS_MIN"
          @input="aoDigitar"
          @keydown.esc.prevent="fechar"
        />

        <!-- Espaço reservado: a mensagem aparece sem empurrar o cartão. -->
        <p :id="erroId" aria-live="polite" class="lista__erro">{{ erro }}</p>
      </div>

      <ul v-else key="itens" class="lista__itens" :class="`lista__itens--${marcador}`">
        <li v-for="(item, i) in itens" :key="`${i}-${item}`">
          <span aria-hidden="true" class="lista__marcador">
            <Check v-if="marcador === 'check'" :size="10" :stroke-width="3" />
          </span>
          {{ item }}
        </li>

        <li v-if="itens.length === 0" class="lista__vazio">Nada encontrado. Use "Editar" para incluir.</li>
      </ul>
    </Transition>
  </section>
</template>

<style scoped>
.lista {
  width: 100%;
  padding: 14px 16px 16px;
  border-radius: 12px;
  background: var(--apoio-caixa);
  text-align: left;
}

/* Em telas estreitas, Cancelar/Concluir descem para a linha de baixo, à direita. */
.lista__topo {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 10px;
  margin-bottom: 10px;
}

.lista__acoes {
  display: flex;
  margin-left: auto;
}

.lista__icone {
  display: grid;
  width: 32px;
  height: 32px;
  flex: none;
  place-items: center;
  border-radius: 50%;
  background: #fff;
}

h2 {
  min-width: 0;
  flex: 1 1 9rem;
  margin: 0;
  font-size: 0.9375rem;
  font-weight: var(--font-weight-semibold);
  line-height: 1.3;
  overflow-wrap: break-word;
}

/* Alvo de toque de 44px sem aumentar o cabeçalho. */
.lista__acao {
  display: inline-flex;
  min-height: 44px;
  flex: none;
  align-items: center;
  gap: 6px;
  margin-block: -6px;
  padding: 0 10px;
  border: 0;
  border-radius: 10px;
  background: none;
  color: var(--apoio-texto);
  font: inherit;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: background-color 150ms ease;
}

.lista__acao:hover {
  background: #e9ece4;
}

.lista__acao:focus-visible {
  outline: 2px solid var(--apoio-verde);
  outline-offset: 1px;
}

.lista__acao--forte {
  color: var(--apoio-verde);
  font-weight: var(--font-weight-semibold);
}

.lista__itens {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.875rem;
  line-height: 1.5;
}

.lista__itens li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  overflow-wrap: anywhere;
}

/* Marcador alinhado ao centro da primeira linha (14px × 1,5 = 21px). */
.lista__marcador {
  display: grid;
  flex: none;
  place-items: center;
}

.lista__itens--ponto .lista__marcador {
  width: 6px;
  height: 6px;
  margin: 7.5px 4px 0;
  border-radius: 50%;
  background: #7fa792;
}

.lista__itens--check .lista__marcador {
  width: 14px;
  height: 14px;
  margin-top: 3.5px;
  border-radius: 50%;
  background: #dbe7de;
  color: var(--apoio-verde);
}

.lista__vazio {
  color: var(--apoio-texto-sec);
  font-style: italic;
}

.lista__editor {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.lista__rotulo {
  margin: 0;
  color: var(--apoio-texto-sec);
  font-size: 0.8125rem;
}

/* Mobile first: 16px no campo evita o zoom automático do iOS. */
.lista__campo {
  display: block;
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--apoio-borda);
  border-radius: 12px;
  background: #fff;
  color: var(--apoio-texto);
  font-family: var(--font-family);
  font-size: 1rem;
  line-height: 1.5;
  resize: none;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}

.lista__campo:focus {
  border-color: var(--apoio-verde);
  outline: none;
  box-shadow: 0 0 0 2px rgb(47 79 69 / 0.2);
}

.lista__campo[aria-invalid='true'] {
  border-color: var(--apoio-erro);
  box-shadow: 0 0 0 2px rgb(192 57 43 / 0.15);
}

.lista__erro {
  min-height: 1.25rem;
  margin: 0;
  color: var(--apoio-erro);
  font-size: 0.8125rem;
  line-height: 1.25rem;
}

@media (min-width: 600px) {
  .lista__campo {
    font-size: 0.875rem;
  }
}

.lista-troca-enter-active,
.lista-troca-leave-active {
  transition: opacity 100ms ease;
}

.lista-troca-enter-from,
.lista-troca-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .lista-troca-enter-active,
  .lista-troca-leave-active {
    transition: none;
  }

  .lista__campo {
    transition: none;
  }
}
</style>
