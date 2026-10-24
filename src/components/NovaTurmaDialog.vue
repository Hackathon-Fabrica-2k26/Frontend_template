<template>
  <v-dialog v-model="model" max-width="440" scrim="#263d35" transition="dialog-bottom-transition">
    <form
      ref="formulario"
      aria-labelledby="nova-turma-titulo"
      class="nt"
      novalidate
      role="dialog"
      @submit.prevent="enviar"
    >
      <header class="flex items-start gap-3.5">
        <span aria-hidden="true" class="nt__icone"><GraduationCap :size="22" /></span>

        <div class="min-w-0 flex-1">
          <h2 id="nova-turma-titulo" class="text-lg leading-tight font-semibold text-primary">Nova turma</h2>
          <p class="mt-0.5 text-[13px] text-text/70">Depois de criar, você já pode cadastrar os alunos.</p>
        </div>

        <button aria-label="Fechar" class="nt__fechar" type="button" @click="model = false">
          <X :size="18" />
        </button>
      </header>

      <div class="mt-6 flex flex-col gap-5">
        <div>
          <label class="nt__rotulo" for="nt-nome">Nome da turma <span aria-hidden="true">*</span></label>

          <input
            id="nt-nome"
            ref="campoNome"
            v-model="nome"
            :aria-describedby="erro ? 'nt-nome-erro' : undefined"
            :aria-invalid="Boolean(erro)"
            autocomplete="off"
            class="nt__campo"
            :class="{ 'nt__campo--erro': erro }"
            maxlength="60"
            placeholder="Ex.: 1º ano A"
            type="text"
            @input="erro = ''"
          >

          <p v-if="erro" id="nt-nome-erro" class="nt__erro" role="alert">{{ erro }}</p>
        </div>

        <fieldset class="m-0 min-w-0 border-0 p-0">
          <legend class="nt__rotulo">Turno</legend>

          <div class="nt__turnos" role="radiogroup">
            <label v-for="op in turnos" :key="op.value" class="nt__turno">
              <input
                v-model="turno"
                class="sr-only"
                name="turno"
                type="radio"
                :value="op.value"
              >

              <span>{{ op.title }}</span>
            </label>
          </div>
        </fieldset>

        <div v-if="escolas.length > 1">
          <label class="nt__rotulo" for="nt-escola">Escola</label>

          <select id="nt-escola" v-model="escola" class="nt__campo nt__campo--select">
            <option v-for="e in escolas" :key="e.id" :value="e.id">{{ e.nome }}</option>
          </select>
        </div>
      </div>

      <footer class="mt-7 flex gap-2.5">
        <button class="nt__btn nt__btn--contorno" :disabled="salvando" type="button" @click="model = false">Cancelar</button>

        <button class="nt__btn nt__btn--cheio" :disabled="salvando" type="submit">
          <LoaderCircle v-if="salvando" class="animate-spin" :size="16" />
          {{ salvando ? 'Criando…' : 'Criar turma' }}
        </button>
      </footer>
    </form>
  </v-dialog>
</template>

<script setup lang="ts">
  import type { Escola, TurnoTurma } from '@/interfaces/escola'
  import { GraduationCap, LoaderCircle, X } from '@lucide/vue'
  import { nextTick, ref, useTemplateRef, watch } from 'vue'
  import { useShake } from '@/composables/useShake'

  const props = defineProps<{
    escolas: Escola[]
    escolaPadrao: number | null
    salvando?: boolean
  }>()

  const emit = defineEmits<{
    criar: [payload: { nome: string, turno: TurnoTurma, escola: number | null }]
  }>()

  const model = defineModel<boolean>({ required: true })

  const turnos = [
    { title: 'Manhã', value: 'manha' },
    { title: 'Tarde', value: 'tarde' },
    { title: 'Noite', value: 'noite' },
    { title: 'Integral', value: 'integral' },
  ]

  const nome = ref('')
  const turno = ref<TurnoTurma>('manha')
  const escola = ref<number | null>(null)
  const erro = ref('')

  const campoNome = useTemplateRef<HTMLInputElement>('campoNome')
  const formulario = ref<HTMLElement | null>(null)
  const tremer = useShake(formulario)

  // A cada abertura o formulário volta limpo e o foco vai para o nome.
  watch(model, aberto => {
    if (!aberto) {
      return
    }
    nome.value = ''
    turno.value = 'manha'
    escola.value = props.escolaPadrao
    erro.value = ''
    nextTick(() => setTimeout(() => campoNome.value?.focus(), 60))
  })

  function enviar (): void {
    if (props.salvando) {
      return
    }
    if (!nome.value.trim()) {
      erro.value = 'Informe o nome da turma para continuar.'
      tremer()
      campoNome.value?.focus()
      return
    }
    emit('criar', { nome: nome.value.trim(), turno: turno.value, escola: escola.value })
  }
</script>

<style scoped>
.nt {
  padding: 24px;
  border-radius: 16px;
  background: #fff;
}

.nt__icone {
  display: grid;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  place-items: center;
  border-radius: 12px;
  background: rgb(169 199 180 / 0.35);
  color: var(--color-primary);
}

.nt__fechar {
  display: grid;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  place-items: center;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: rgb(38 61 53 / 0.7);
  cursor: pointer;
  transition: background-color 200ms ease;
}

.nt__fechar:hover {
  background: rgb(169 199 180 / 0.3);
}

.nt__rotulo {
  display: block;
  margin-bottom: 8px;
  padding: 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
}

.nt__campo {
  display: block;
  width: 100%;
  height: 48px;
  padding: 0 14px;
  border: 1px solid var(--color-support);
  border-radius: 12px;
  background: #fff;
  font-family: inherit;
  font-size: 14px;
  color: var(--color-text);
  outline: none;
  transition:
    border-color 200ms ease,
    box-shadow 200ms ease;
}

.nt__campo::placeholder {
  color: rgb(38 61 53 / 0.5);
}

.nt__campo:hover {
  border-color: #85ab9b;
}

.nt__campo:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgb(53 107 91 / 0.12);
}

.nt__campo--erro,
.nt__campo--erro:hover,
.nt__campo--erro:focus {
  border-color: #b3261e;
}

.nt__campo--erro:focus {
  box-shadow: 0 0 0 3px rgb(179 38 30 / 0.14);
}

.nt__erro {
  margin: 6px 0 0;
  font-size: 12px;
  color: #b3261e;
}

.nt__turnos {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.nt__turno span {
  display: grid;
  height: 44px;
  place-items: center;
  border: 1px solid var(--color-support);
  border-radius: 12px;
  background: #fff;
  font-size: 13px;
  color: var(--color-text);
  cursor: pointer;
  transition:
    background-color 200ms ease,
    border-color 200ms ease,
    color 200ms ease,
    transform 160ms var(--ease-out-expo);
}

.nt__turno span:hover {
  border-color: #85ab9b;
}

.nt__turno span:active {
  transform: scale(0.97);
}

.nt__turno input:checked + span {
  border-color: var(--color-primary);
  background: var(--color-primary);
  font-weight: 500;
  color: var(--color-background);
}

.nt__turno input:focus-visible + span {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.nt__btn {
  display: inline-flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 48px;
  border: 1px solid var(--color-primary);
  border-radius: 12px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background-color 200ms ease,
    transform 160ms var(--ease-out-expo);
}

.nt__btn:active:not(:disabled) {
  transform: scale(0.98);
}

.nt__btn:disabled {
  cursor: progress;
  opacity: 0.7;
}

.nt__btn:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.nt__btn--contorno {
  background: #fff;
  color: var(--color-primary);
}

.nt__btn--contorno:hover:not(:disabled) {
  background: rgb(169 199 180 / 0.25);
}

.nt__btn--cheio {
  background: var(--color-primary);
  color: var(--color-background);
}

.nt__btn--cheio:hover:not(:disabled) {
  background: #2b5b4d;
}

@media (max-width: 420px) {
  .nt__turnos {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
