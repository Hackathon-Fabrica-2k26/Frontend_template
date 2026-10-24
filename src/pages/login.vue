<template>
  <main class="login-page">
    <div class="waves-layer">
      <AuthWaves />
    </div>

    <section class="login-section">
      <div ref="loginContent" class="login-content">
        <!-- Máscara: o arquivo da logo é preto; aqui ganha o verde primary, como no header. -->
        <span
          aria-label="Marsupi"
          class="login-logo"
          role="img"
          :style="{ maskImage: `url(${logo})` }"
        />

        <h1 class="login-title">
          Bem-vindo de volta
        </h1>

        <p class="login-subtitle">
          Entre com sua matrícula e senha para
          continuar no Marsupi.
        </p>

        <!-- O canguru espia por cima dos campos e reage ao que a pessoa faz. -->
        <div class="mascote-linha">
          <LoginMascote :estado="estadoMascote" />
        </div>

        <form
          ref="form"
          class="login-form"
          novalidate
          @focusin="aoFocar"
          @focusout="aoDesfocar"
          @submit.prevent="submit"
        >
          <div class="field-entrance field-first">
            <AuthInput
              ref="matriculaInput"
              v-model="matricula"
              autocomplete="username"
              :disabled="loading"
              :invalid="!!errorMsg"
              label="Matrícula"
              placeholder="Digite sua matrícula"
              required
              @update:model-value="errorMsg = ''"
            />
          </div>

          <div class="field-entrance field-second">
            <AuthInput
              ref="passwordInput"
              v-model="password"
              autocomplete="current-password"
              :disabled="loading"
              :invalid="!!errorMsg"
              label="Senha"
              placeholder="Digite sua senha"
              required
              type="password"
              @update:model-value="errorMsg = ''"
              @visibilidade="revelar = $event"
            />
          </div>

          <!-- Erro ao lado do campo, não só em toast: fica visível até a pessoa editar -->
          <Transition name="erro">
            <p v-if="errorMsg" class="login-error" role="alert">
              <CircleAlert :size="16" />
              <span>{{ errorMsg }}</span>
            </p>
          </Transition>

          <div class="login-options">
            <label class="remember-label">
              <input v-model="remember" :disabled="loading" type="checkbox">
              Manter conectado
            </label>

            <a class="forgot-link" href="#" @click.prevent>
              Esqueci minha senha
            </a>
          </div>

          <div class="button-entrance">
            <button class="login-button" :disabled="loading || !matricula.trim() || !password" type="submit">
              <LoaderCircle v-if="loading" class="loading-icon" :size="20" />

              <span>
                {{ loading ? 'Entrando...' : 'Entrar' }}
              </span>

              <ArrowRight v-if="!loading" class="button-arrow" :size="20" />
            </button>
          </div>
        </form>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
  import { ArrowRight, CircleAlert, LoaderCircle } from '@lucide/vue'
  import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'

  import logo from '@/assets/logoBaseTexto.webp'
  import AuthInput from '@/components/auth/AuthInput.vue'
  import AuthWaves from '@/components/auth/AuthWaves.vue'
  import LoginMascote from '@/components/auth/LoginMascote.vue'
  import { useShake } from '@/composables/useShake'
  import { useAuthStore } from '@/stores/auth'

  definePage({
    meta: {
      layout: false,
      public: true,
    },
  })

  const auth = useAuthStore()
  const router = useRouter()
  const route = useRoute()

  const matricula = ref('')
  const password = ref('')
  const remember = ref(false)
  const loading = ref(false)
  const loginContent = ref<HTMLElement | null>(null)
  const form = ref<HTMLElement | null>(null)
  const passwordInput = ref<{ focus: () => void } | null>(null)
  const errorMsg = ref('')

  const shake = useShake(form)

  // Estado do mascote: o que a pessoa está fazendo no formulário.
  const foco = ref<'matricula' | 'senha' | null>(null)
  const revelar = ref(false)
  const erroAtivo = ref(false)
  const sucesso = ref(false)
  let timerErro = 0

  const estadoMascote = computed(() => {
    if (sucesso.value) return 'success'
    if (loading.value) return 'think'
    if (erroAtivo.value) return 'error'
    if (foco.value === 'senha') return revelar.value ? 'peek' : 'hide'
    if (foco.value === 'matricula') return 'watch'
    return 'idle'
  })

  function aoFocar (event: FocusEvent): void {
    const campo = (event.target as HTMLElement).closest('.auth-field')?.querySelector('input')
    if (campo) foco.value = campo.autocomplete === 'current-password' ? 'senha' : 'matricula'
  }

  function aoDesfocar (event: FocusEvent): void {
    if (!form.value?.contains(event.relatedTarget as Node | null)) foco.value = null
  }

  function mostrarErro (): void {
    erroAtivo.value = true
    window.clearTimeout(timerErro)
    timerErro = window.setTimeout(() => {
      erroAtivo.value = false
    }, 2200)
  }

  onBeforeUnmount(() => window.clearTimeout(timerErro))

  async function submit (): Promise<void> {
    if (loading.value || !matricula.value.trim() || !password.value) {
      return
    }

    loading.value = true
    errorMsg.value = ''
    let failed = false

    try {
      await auth.login(
        matricula.value.trim(),
        password.value,
        remember.value,
      )

      // Comemora um instante antes de seguir para o código.
      sucesso.value = true
      await new Promise(resolve => setTimeout(resolve, 1300))

      const content = loginContent.value

      if (content) {
        const animation = content.animate(
          [
            { opacity: 1, transform: 'translateY(0)' },
            { opacity: 0, transform: 'translateY(-12px)' },
          ],
          {
            duration: 380,
            easing: 'ease-in-out',
            fill: 'forwards',
          },
        )

        await animation.finished.catch(() => undefined)
      }

      await router.push({
        path: '/otp',
        query: route.query.redirect
          ? { redirect: String(route.query.redirect) }
          : {},
      })
    } catch (error: unknown) {
      for (const animation of loginContent.value?.getAnimations() ?? []) {
        animation.cancel()
      }

      failed = true
      mostrarErro()
      errorMsg.value = error instanceof Error
        ? error.message
        : 'Não foi possível entrar.'
    } finally {
      loading.value = false
    }

    if (failed) {
      // Os campos estavam desabilitados durante o envio: espera reabilitar para focar.
      password.value = ''
      await nextTick()
      shake()
      passwordInput.value?.focus()
    }
  }
</script>

<style scoped>
.login-page {
  position: relative;
  isolation: isolate;
  min-height: 100dvh;
  overflow: hidden;
  background: #f7f7f1;
  color: #263d35;
}

.waves-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.login-section {
  position: relative;
  z-index: 1;
  display: flex;
  min-height: 100dvh;
  width: 55%;
  align-items: center;
  padding: 32px 32px 32px clamp(48px, 8vw, 140px);
}

.login-content {
  width: 100%;
  max-width: 500px;
}

.login-logo {
  display: block;
  width: 230px;
  aspect-ratio: 596 / 240;
  margin-bottom: 44px;
  background: #356b5b;
  mask-position: left center;
  mask-repeat: no-repeat;
  mask-size: contain;
  animation: enter-up 650ms ease-out both;
}

.login-title {
  margin: 0;
  font-size: clamp(30px, 3.4vw, 42px);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.025em;
  animation: enter-up 650ms 90ms ease-out both;
}

.login-subtitle {
  max-width: 460px;
  margin: 12px 0 8px;
  color: #759d90;
  font-size: 17px;
  line-height: 1.6;
  animation: enter-up 650ms 160ms ease-out both;
}

.mascote-linha {
  /* Acima dos campos: as patas seguram a borda do campo de matrícula. */
  position: relative;
  z-index: 2;
  display: flex;
  margin: -6px 0 -30px;
  animation: enter-up 650ms 200ms ease-out both;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field-entrance {
  animation: enter-up 650ms ease-out both;
}

.field-first {
  animation-delay: 230ms;
}

.field-second {
  animation-delay: 300ms;
}

.login-options {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 10px 16px;
  margin-top: 4px;
  font-size: 15px;
  animation: enter-up 650ms 370ms ease-out both;
}

.remember-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.remember-label input {
  width: 16px;
  height: 16px;
  accent-color: #356b5b;
  cursor: pointer;
}

.forgot-link {
  color: #356b5b;
  text-decoration: none;
  transition: color 300ms ease;
}

.forgot-link:hover {
  color: #263d35;
  text-decoration: underline;
  text-underline-offset: 4px;
}

/* Entrada independente do botão */
.login-error {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: -4px 0 0;
  color: #b3261e;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
}

.login-error svg {
  flex-shrink: 0;
}

.erro-enter-active {
  transition: opacity 260ms ease, transform 360ms cubic-bezier(0.16, 1, 0.3, 1);
}

.erro-leave-active {
  transition: opacity 140ms ease;
}

.erro-enter-from {
  opacity: 0;
  transform: translateY(-6px);
}

.erro-leave-to {
  opacity: 0;
}

.button-entrance {
  margin-top: 12px;
  animation: enter-up 650ms 440ms ease-out both;
}

/* Botão estável, sem saltos */
.login-button {
  display: flex;
  width: 100%;
  height: 58px;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border: 1px solid transparent;
  border-radius: 12px;
  background-color: #356b5b;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(38, 61, 53, 0.06);

  transition:
    background-color 500ms ease,
    box-shadow 500ms ease,
    transform 300ms ease;
}

.login-button:hover:not(:disabled) {
  background-color: #2d5e50;
  box-shadow: 0 7px 18px rgba(38, 61, 53, 0.13);
}

.login-button:active:not(:disabled) {
  transform: scale(0.992);
  transition-duration: 130ms;
}

.login-button:focus-visible {
  outline: 2px solid #356b5b;
  outline-offset: 3px;
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button-arrow {
  transition: transform 400ms ease;
}

.login-button:hover:not(:disabled) .button-arrow {
  transform: translateX(3px);
}

.loading-icon {
  animation: spin 850ms linear infinite;
}

@keyframes enter-up {
  from {
    opacity: 0;
    transform: translateY(16px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1023px) {
  .waves-layer {
    display: none;
  }

  .login-section {
    width: 100%;
    justify-content: center;
    padding: 36px 24px;
  }
}

@media (max-width: 480px) {
  .login-logo {
    width: 180px;
    margin-bottom: 32px;
  }

  .login-title {
    font-size: 30px;
  }

  .login-subtitle {
    font-size: 15px;
    margin-bottom: 28px;
  }
}

@media (prefers-reduced-motion: reduce) {

  .login-logo,
  .login-title,
  .login-subtitle,
  .field-entrance,
  .login-options,
  .button-entrance,
  .loading-icon {
    animation: none;
  }

  .login-button,
  .button-arrow,
  .forgot-link {
    transition: none;
  }
}
</style>
