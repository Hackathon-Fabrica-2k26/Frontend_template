<template>
  <section aria-label="Dados da professora" class="cartao">
    <!-- Esqueleto -->
    <div v-if="carregando" aria-busy="true" class="flex flex-col items-center">
      <span class="sk size-[84px] rounded-[24px]" />
      <span class="sk mt-5 h-5 w-20 rounded-md" />
      <span class="sk mt-2 h-4 w-24 rounded-[24px]" />

      <div class="mt-6 flex w-full flex-col gap-2.5">
        <span v-for="n in 4" :key="n" class="sk h-[52px] w-full rounded-xl" :class="{ 'h-[42px]': n === 4 }" />
      </div>
    </div>

    <template v-else>
      <div class="flex flex-col items-center text-center">
        <img
          alt=""
          class="avatar"
          height="88"
          :src="imagemAvatar"
          width="88"
        >

        <h2 class="mt-4 line-clamp-2 max-w-full text-[22px] leading-tight font-semibold break-words text-primary" :title="usuario?.name">{{ primeiroNome }}</h2>
        <span class="mt-1.5 rounded-[24px] bg-support/45 px-3 py-0.5 text-xs text-text">{{ rotuloTratamento }}</span>
      </div>

      <form class="mt-6 mb-5" novalidate @submit.prevent="salvar">
        <Transition mode="out-in" name="modo">
          <!-- Visualização -->
          <div v-if="!editando" key="ver" class="flex flex-col gap-2.5">
            <div class="campo-ver">
              <span class="campo-ver__rotulo">Nome</span>
              <span class="campo-ver__valor">{{ usuario?.name || '—' }}</span>
            </div>

            <div class="campo-ver">
              <span class="campo-ver__rotulo">E-mail</span>
              <span class="campo-ver__valor">{{ usuario?.email || '—' }}</span>
            </div>

            <div class="campo-ver campo-ver--leitura">
              <div class="min-w-0">
                <span class="campo-ver__rotulo">Matrícula</span>
                <span class="campo-ver__valor text-text/60">{{ usuario?.matricula || '—' }}</span>
              </div>

              <LockKeyhole aria-label="Somente leitura" class="shrink-0 text-primary/70" :size="15" />
            </div>

            <div class="campo-ver campo-ver--leitura">
              <div class="min-w-0">
                <span class="campo-ver__rotulo">Código por e-mail ao entrar</span>
                <span class="campo-ver__valor text-text/60">{{ otpAtivo ? 'Ligado' : 'Desligado' }}</span>
              </div>

              <v-switch
                aria-label="Pedir código por e-mail ao entrar"
                class="shrink-0"
                color="primary"
                density="compact"
                :disabled="salvandoOtp"
                hide-details
                inset
                :loading="salvandoOtp"
                :model-value="otpAtivo"
                @update:model-value="alternarOtp"
              />
            </div>

            <button class="btn btn--contorno mt-2" type="button" @click="editar">Editar dados</button>
          </div>

          <!-- Edição -->
          <div v-else key="editar" class="flex flex-col gap-3.5">
            <div ref="blocoNome">
              <label class="rotulo" for="perfil-nome">Nome <span aria-hidden="true">*</span></label>

              <input
                id="perfil-nome"
                ref="campoNome"
                v-model="form.name"
                :aria-describedby="erroNome ? 'perfil-nome-erro' : undefined"
                :aria-invalid="Boolean(erroNome)"
                autocomplete="name"
                class="entrada-perfil"
                :class="{ 'entrada-perfil--erro': erroNome }"
                placeholder="Digite seu nome"
                type="text"
                @input="erroNome = ''"
              >

              <p v-if="erroNome" id="perfil-nome-erro" class="erro" role="alert">{{ erroNome }}</p>
            </div>

            <div>
              <label class="rotulo" for="perfil-email">E-mail <span aria-hidden="true">*</span></label>

              <input
                id="perfil-email"
                v-model="form.email"
                :aria-describedby="erroEmail ? 'perfil-email-erro' : undefined"
                :aria-invalid="Boolean(erroEmail)"
                autocomplete="email"
                class="entrada-perfil"
                :class="{ 'entrada-perfil--erro': erroEmail }"
                placeholder="Digite seu e-mail"
                type="email"
                @input="erroEmail = ''"
              >

              <p v-if="erroEmail" id="perfil-email-erro" class="erro" role="alert">{{ erroEmail }}</p>
            </div>

            <div>
              <label class="rotulo" for="perfil-matricula">Matrícula</label>

              <div class="relative">
                <input
                  id="perfil-matricula"
                  class="entrada-perfil entrada-perfil--leitura pr-10"
                  readonly
                  type="text"
                  :value="usuario?.matricula"
                >

                <LockKeyhole class="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-primary/70" :size="15" />
              </div>
            </div>

            <fieldset class="m-0 min-w-0 border-0 p-0">
              <legend class="rotulo">Seu canguru</legend>

              <div class="grid grid-cols-2 gap-2" role="radiogroup">
                <label v-for="op in tratamentos" :key="op.valor" class="tratamento">
                  <input
                    v-model="form.tratamento"
                    class="sr-only"
                    name="tratamento"
                    type="radio"
                    :value="op.valor"
                  >

                  <span class="tratamento__corpo">
                    <img alt="" height="32" :src="op.imagem" width="32">
                    {{ op.rotulo }}
                  </span>
                </label>
              </div>
            </fieldset>

            <div class="mt-1 flex gap-2">
              <button class="btn btn--cheio min-w-0 flex-[1.4]" :disabled="salvando" type="submit">
                <LoaderCircle v-if="salvando" class="animate-spin" :size="16" />
                {{ salvando ? 'Salvando…' : 'Salvar alterações' }}
              </button>

              <button class="btn btn--contorno min-w-0 flex-1" :disabled="salvando" type="button" @click="cancelar">Cancelar</button>
            </div>
          </div>
        </Transition>
      </form>

      <hr class="mt-auto mb-4 w-full border-support/50">

      <button class="sair" type="button" @click="emit('sair')">
        <LogOut :size="16" />
        Sair da conta
      </button>
    </template>
  </section>
</template>

<script setup lang="ts">
  import type { User } from '@/interfaces/user'
  import { LoaderCircle, LockKeyhole, LogOut } from '@lucide/vue'
  import { computed, nextTick, reactive, ref, useTemplateRef } from 'vue'
  import avatarProfessor from '@/assets/mascotes/avatar-professor.svg'
  import avatarProfessora from '@/assets/mascotes/avatar.svg'
  import { useShake } from '@/composables/useShake'
  import { useAuthStore } from '@/stores/auth'
  import { buildApiError } from '@/utils/apiError'
  import { notify } from '@/utils/notify'

  const props = defineProps<{ usuario: User | null, carregando?: boolean }>()
  const emit = defineEmits<{ sair: [] }>()

  const auth = useAuthStore()

  const editando = ref(false)
  const salvando = ref(false)
  const erroNome = ref('')
  const erroEmail = ref('')
  const form = reactive<{ name: string, email: string, tratamento: 'professora' | 'professor' }>({ name: '', email: '', tratamento: 'professora' })

  const campoNome = useTemplateRef<HTMLInputElement>('campoNome')
  const blocoNome = ref<HTMLElement | null>(null)
  const tremer = useShake(blocoNome)

  const tratamentoAtual = computed(() => props.usuario?.tratamento ?? 'professora')
  const rotuloTratamento = computed(() => (tratamentoAtual.value === 'professor' ? 'Professor' : 'Professora'))
  const imagemAvatar = computed(() => (tratamentoAtual.value === 'professor' ? avatarProfessor : avatarProfessora))

  const tratamentos = [
    { valor: 'professora', rotulo: 'Professora', imagem: avatarProfessora },
    { valor: 'professor', rotulo: 'Professor', imagem: avatarProfessor },
  ] as const

  const primeiroNome = computed(() => props.usuario?.name?.trim().split(/\s+/, 1)[0] || 'Professora')

  // Verificação em duas etapas: desligada por padrão, a professora liga aqui.
  const salvandoOtp = ref(false)
  const otpAtivo = computed(() => Boolean(auth.user?.otp_ativo ?? props.usuario?.otp_ativo))

  async function alternarOtp (valor: boolean | null): Promise<void> {
    if (salvandoOtp.value) return
    salvandoOtp.value = true
    try {
      await auth.definirOtp(Boolean(valor))
      notify.success(valor
        ? 'Pronto: no próximo login vamos pedir o código enviado ao seu e-mail.'
        : 'Verificação por código desligada.')
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Não foi possível alterar a verificação.')
    } finally {
      salvandoOtp.value = false
    }
  }

  function editar (): void {
    form.name = props.usuario?.name ?? ''
    form.email = props.usuario?.email ?? ''
    form.tratamento = tratamentoAtual.value
    erroNome.value = ''
    erroEmail.value = ''
    editando.value = true
    nextTick(() => campoNome.value?.focus())
  }

  function cancelar (): void {
    editando.value = false
  }

  async function salvar (): Promise<void> {
    if (salvando.value) {
      return
    }

    erroNome.value = form.name.trim() ? '' : 'Informe seu nome para continuar.'
    erroEmail.value = /^\S[^\s@]*@\S[^\s.]*\.\S+$/.test(form.email.trim()) ? '' : 'Informe um e-mail válido.'

    if (erroNome.value || erroEmail.value) {
      tremer()
      ;(erroNome.value ? campoNome.value : document.querySelector('#perfil-email'))?.focus()
      return
    }

    salvando.value = true
    try {
      await auth.updateProfile({ ...props.usuario, name: form.name.trim(), email: form.email.trim(), tratamento: form.tratamento })
      editando.value = false
      notify.success('Perfil atualizado')
    } catch (error) {
      notify.error(buildApiError(error, 'Não foi possível atualizar o perfil.').message)
    } finally {
      salvando.value = false
    }
  }
</script>

<style scoped>
.cartao {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 24px 20px;
  border: 1px solid rgb(169 199 180 / 0.55);
  border-radius: 20px;
  box-shadow:
    0 1px 2px rgb(38 61 53 / 0.05),
    0 10px 20px -10px rgb(53 107 91 / 0.2),
    0 24px 40px -26px rgb(53 107 91 / 0.26);
  background: #fff;
}

.avatar {
  display: block;
  width: 88px;
  height: 88px;
  border-radius: 50%;
}

.campo-ver {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 9px 14px 10px;
  border-radius: 12px;
  background: var(--color-background);
}

.campo-ver--leitura {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.campo-ver__rotulo {
  display: block;
  font-size: 11px;
  color: rgb(38 61 53 / 0.65);
}

.campo-ver__valor {
  display: block;
  overflow: hidden;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tratamento__corpo {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px 6px 6px;
  border: 1px solid var(--color-support);
  border-radius: 12px;
  background: #fff;
  font-size: 13px;
  color: var(--color-text);
  cursor: pointer;
  transition:
    border-color 200ms ease,
    background-color 200ms ease,
    transform 160ms var(--ease-out-expo);
}

.tratamento__corpo:hover {
  border-color: #85ab9b;
}

.tratamento__corpo:active {
  transform: scale(0.98);
}

.tratamento__corpo img {
  border-radius: 50%;
}

.tratamento input:checked + .tratamento__corpo {
  border-color: var(--color-primary);
  background: rgb(169 199 180 / 0.25);
  font-weight: 500;
}

.tratamento input:focus-visible + .tratamento__corpo {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.rotulo {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
}

.entrada-perfil {
  display: block;
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border: 1px solid var(--color-support);
  border-radius: 12px;
  background: #fff;
  font-size: 14px;
  color: var(--color-text);
  outline: none;
  transition:
    border-color 200ms ease,
    box-shadow 200ms ease;
}

.entrada-perfil::placeholder {
  color: rgb(38 61 53 / 0.5);
}

.entrada-perfil:hover:not(:read-only) {
  border-color: #85ab9b;
}

.entrada-perfil:focus:not(:read-only) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgb(53 107 91 / 0.12);
}

.entrada-perfil--leitura {
  background: var(--color-background);
  color: rgb(38 61 53 / 0.6);
  cursor: default;
}

.entrada-perfil--erro,
.entrada-perfil--erro:hover:not(:read-only),
.entrada-perfil--erro:focus:not(:read-only) {
  border-color: #b3261e;
}

.entrada-perfil--erro:focus {
  box-shadow: 0 0 0 3px rgb(179 38 30 / 0.14);
}

.erro {
  margin: 6px 0 0;
  font-size: 12px;
  color: #b3261e;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 44px;
  padding: 0 10px;
  white-space: nowrap;
  border: 1px solid var(--color-primary);
  border-radius: 12px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition:
    background-color 200ms ease,
    color 200ms ease,
    transform 160ms var(--ease-out-expo);
}

.btn:active:not(:disabled) {
  transform: scale(0.98);
}

.btn:disabled {
  cursor: progress;
  opacity: 0.7;
}

.btn:focus-visible,
.sair:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.btn--contorno {
  background: #fff;
  color: var(--color-primary);
}

.btn--contorno:hover:not(:disabled) {
  background: rgb(169 199 180 / 0.25);
}

.btn--cheio {
  background: var(--color-primary);
  color: var(--color-background);
}

.btn--cheio:hover:not(:disabled) {
  background: #2b5b4d;
}

.sair {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 8px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  font-family: inherit;
  font-size: 13px;
  color: #b3261e;
  cursor: pointer;
  transition: background-color 200ms ease;
}

.sair:hover {
  background: rgb(179 38 30 / 0.06);
}

.sk {
  display: block;
  background: linear-gradient(100deg, rgb(169 199 180 / 0.2) 30%, rgb(169 199 180 / 0.42) 50%, rgb(169 199 180 / 0.2) 70%);
  background-size: 250% 100%;
  animation: sk 1.5s linear infinite;
}

@keyframes sk {
  to {
    background-position: -150% 0;
  }
}

.modo-enter-active,
.modo-leave-active {
  transition:
    opacity 160ms ease,
    translate 220ms var(--ease-out-expo);
}

.modo-enter-from,
.modo-leave-to {
  opacity: 0;
  translate: 0 6px;
}
</style>
