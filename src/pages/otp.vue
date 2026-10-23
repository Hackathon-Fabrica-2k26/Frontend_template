<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useCountdown } from '@/composables/useCountdown'
  import { useAuthStore } from '@/stores/auth'
  import { notify } from '@/utils/notify'

  definePage({ meta: { layout: false, public: true } })

  const router = useRouter()
  const route = useRoute()
  const auth = useAuthStore()

  /* ---------- configuração do fluxo ---------- */
  const length = 4
  const resendSeconds = 30
  const GAP = 12 // espaço entre as caixas (px); também usado na trilha

  /* ---------- estado ---------- */
  const code = ref<string | number>('')
  const resetKey = ref(0) // muda para remontar o campo (limpa + refoca)
  const loading = ref(false)
  const error = ref('')

  const value = computed(() => String(code.value ?? ''))
  const isComplete = computed(() => value.value.length === length)

  // Mantém o domínio visível e esconde o restante do endereço.
  // Ex.: "aluno@escola.edu.br" -> "a****@escola.edu.br"
  const maskedEmail = computed(() => {
    const raw = auth.otpEmail.trim()
    if (!raw || raw.includes('*')) return raw
    const [local, domain] = raw.split('@')
    if (!local || !domain) return raw

    return `${local.slice(0, 1)}${'*'.repeat(Math.max(3, local.length - 1))}@${domain}`
  })

  const { formatted, isRunning, restart } = useCountdown(resendSeconds)

  onMounted(() => {
    if (!auth.hasPendingOtp) {
      router.replace('/login')
    }
  })

  /* ---------- trilha ondulada ---------- */
  const WAVE_Y = [8, 5, 11, 7] // altura de cada ponto na onda (px)
  const WAVE_WIDTH = 120
  const WAVE_HEIGHT = 20

  const waveYs = computed(() =>
    Array.from({ length }, (_, i) => WAVE_Y[i % WAVE_Y.length]),
  )

  // Curvas cúbicas com tangente horizontal em cada ponto => onda suave
  const wavePath = computed(() => {
    const step = WAVE_WIDTH / Math.max(1, length - 1)

    return waveYs.value.reduce((d, y, i, ys) => {
      if (i === 0) return `M0 ${y}`
      const mid = (i - 0.5) * step
      return `${d} C${mid} ${ys[i - 1]}, ${mid} ${y}, ${i * step} ${y}`
    }, '')
  })

  // Mantém a onda entre o centro da primeira e o centro da última coluna,
  // independentemente da quantidade de dígitos.
  const waveStyle = computed(() => {
    const offset = ((length - 1) / (length * 2)) * GAP
    const start = (100 / (length * 2))
    const width = ((length - 1) / length) * 100

    return {
      left: `calc(${start}% - ${offset}px)`,
      width: `calc(${width}% + ${offset * 2}px)`,
    }
  })

  type DotState = 'filled' | 'active' | 'idle'

  function dotState (i: number): DotState {
    if (i < value.value.length) return 'filled'
    if (i === value.value.length) return 'active'
    return 'idle'
  }

  /* ---------- ações ---------- */
  function goBack () {
    router.push('/login')
  }

  function changeEmail () {
    router.push('/login')
  }

  async function verify () {
    if (!isComplete.value || loading.value) return
    if (!auth.hasPendingOtp) {
      await router.push('/login')
      return
    }

    loading.value = true
    error.value = ''

    try {
      await auth.verifyOtp(value.value)
      const redirect = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
        ? route.query.redirect
        : '/'
      await router.push(redirect)
    } catch (error_) {
      const message = error_ instanceof Error ? error_.message : 'Código inválido ou expirado.'
      error.value = message
      notify.error(message)
    } finally {
      loading.value = false
    }
  }

  async function resend () {
    if (isRunning.value || loading.value) return
    if (!auth.hasPendingOtp) {
      await router.push('/login')
      return
    }

    loading.value = true
    error.value = ''

    try {
      await auth.resendOtp()
      code.value = ''
      resetKey.value++
      restart()
    } catch (error_) {
      const message = error_ instanceof Error ? error_.message : 'Não foi possível reenviar o código.'
      error.value = message
      notify.error(message)
    } finally {
      loading.value = false
    }
  }
</script>

<template>
  <v-container class="otp-screen" fluid :style="{ '--gap': `${GAP}px` }">
    <div aria-hidden="true" class="otp-screen__art">
      <svg preserveAspectRatio="none" viewBox="0 0 500 600">
        <path
          class="art__primary"
          d="M 230 0 C 205 60 190 90 165 135 C 140 180 135 220 112 270 C 88 320 60 340 55 390 C 50 440 68 460 65 500 C 62 535 45 555 30 580 C 25 588 20 595 15 600 L 500 600 L 500 0 Z"
        />

        <path
          class="art__sage"
          d="M 500 240 C 455 250 430 255 415 275 C 390 305 400 335 386 365 C 370 400 345 425 320 450 C 290 480 260 500 240 530 C 220 556 205 575 190 600 L 500 600 Z"
        />

        <path
          class="art__ink"
          d="M 500 375 C 484 385 464 392 450 408 C 432 428 430 442 410 462 C 390 482 370 492 350 512 C 330 532 315 548 300 568 C 287 585 278 594 272 600 L 500 600 Z"
        />

        <path
          class="art__orange"
          d="M 500 470 C 470 480 445 490 430 500 C 405 518 390 530 370 540 C 345 555 325 565 300 575 C 285 582 270 590 255 600 L 310 600 C 330 588 350 582 375 570 C 405 558 435 548 460 540 C 475 535 490 530 500 528 Z"
        />
      </svg>
    </div>

    <div class="otp-screen__content">
      <main class="otp-screen__main">
        <v-btn
          class="back text-none"
          :disabled="loading"
          prepend-icon="mdi-arrow-left"
          variant="text"
          @click="goBack"
        >
          Voltar
        </v-btn>

        <h1 class="title">Confirme seu acesso</h1>
        <p class="subtitle">Digite o código de {{ length }} dígitos enviado para</p>

        <p class="email">
          <span>{{ maskedEmail }}</span>
          <a class="email__link" href="#" @click.prevent="changeEmail">Alterar e-mail</a>
        </p>

        <form class="form" novalidate @submit.prevent="verify">
          <p class="label">Código de verificação</p>

          <v-otp-input
            :key="resetKey"
            v-model="code"
            autofocus
            class="otp"
            :disabled="loading"
            :error="!!error"
            label="Código de verificação"
            :length="length"
            type="number"
            variant="outlined"
          />

          <!-- trilha de progresso: um ponto por dígito, ligados por uma onda -->
          <div aria-hidden="true" class="trail">
            <svg
              class="trail__wave"
              preserveAspectRatio="none"
              :style="waveStyle"
              :viewBox="`0 0 ${WAVE_WIDTH} ${WAVE_HEIGHT}`"
            >
              <path :d="wavePath" fill="none" vector-effect="non-scaling-stroke" />
            </svg>

            <span
              v-for="(y, i) in waveYs"
              :key="i"
              class="trail__dot"
              :class="`trail__dot--${dotState(i)}`"
              :style="{ marginTop: `${y - 4}px` }"
            />
          </div>

          <p v-if="error" class="error" role="alert">{{ error }}</p>

          <v-btn
            block
            class="submit text-none"
            color="primary"
            :disabled="!isComplete"
            :loading="loading"
            rounded="lg"
            size="x-large"
            type="submit"
          >
            Verificar código
          </v-btn>
        </form>

        <v-btn
          class="resend text-none"
          color="primary"
          :disabled="isRunning || loading"
          variant="text"
          @click="resend"
        >
          {{ isRunning ? `Reenviar código em ${formatted}` : 'Reenviar código' }}
        </v-btn>

        <p class="hint">Não encontrou? Confira a caixa de spam.</p>
      </main>

      <footer class="brand">Marsupi</footer>
    </div>
  </v-container>
</template>

<style scoped>
.otp-screen {
  /* Mock local da paleta Marsupi; o tema global do Vuetify não é alterado. */
  --otp-bg: #F7F7F1;
  --otp-ink: 38,61,53;
  --otp-line: 208,223,210;
  --otp-sage: 169,199,180;

  position: relative;
  min-height: 100dvh;
  padding: 0;
  overflow: hidden;
  background: var(--otp-bg);
  color: rgb(var(--otp-ink));
  font-family: Roboto, system-ui, sans-serif;
}

/* Componentes Vuetify redeclaram as variáveis do tema neles mesmos (v-theme--*),
   então repetimos o mock para os botões e campos desta tela. */
.otp-screen,
.otp-screen :deep(.v-theme--light) {
  --v-theme-background: 247,247,241;
  --v-theme-surface: 247,247,241;
  --v-theme-primary: 53,107,90;
  --v-theme-secondary: 227,180,119;
  --v-theme-on-primary: 247,247,241;
  --v-theme-on-background: 38,61,53;
  --v-theme-on-surface: 38,61,53;
}

.otp-screen__art {
  display: none;
}

.otp-screen__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  width: min(100%, 420px);
  min-height: 100dvh;
  margin-inline: auto;
  padding: 24px;
}

.otp-screen__main {
  flex: 1;
  padding-top: 40px;
}

.back {
  margin-left: -50px;
  margin-bottom: 40px;
  letter-spacing: 0;
  color: rgb(var(--v-theme-primary));
}

.title {
  font-size: 1.75rem;
  font-weight: 600;
  line-height: 1.2;
}

.subtitle {
  margin-top: 12px;
  font-size: 1.05rem;
}

.email {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-top: 8px;
  font-weight: 500;
}

.email__link {
  font-size: 0.75rem;
  font-weight: 400;
  color: rgb(var(--v-theme-primary));
  text-decoration: underline;
  text-underline-offset: 3px;
}

.form {
  margin-top: 28px;
}

.label {
  margin-bottom: 8px;
  font-size: 0.875rem;
}

/* ---------- caixas ---------- */
.otp :deep(.v-otp-input__content) {
  max-width: none;
  padding: 0;
  gap: var(--gap);
}

.otp :deep(.v-field) {
  border-radius: 10px;
  background: var(--otp-bg);
}

.otp :deep(.v-field__outline) {
  --v-field-border-opacity: 1;
}

.otp :deep(.v-field:not(.v-field--focused):not(.v-field--error) .v-field__outline) {
  color: rgb(var(--otp-line));
}

.otp :deep(.v-field--focused:not(.v-field--error) .v-field__outline) {
  color: rgb(var(--v-theme-primary));
}

.otp :deep(.v-otp-input__field) {
  color: rgb(var(--otp-ink));
  font-size: 1.75rem;
  font-weight: 500;
}

.otp :deep(.v-otp-input__caret) {
  background: rgb(var(--v-theme-primary));
}

/* ---------- trilha ---------- */
.trail {
  position: relative;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr; /* mesmas colunas das caixas */
  column-gap: var(--gap);
  justify-items: center;
  align-items: start;
  height: 20px;
  margin-top: 16px;
}

/* a onda vai do centro da 1ª coluna ao centro da última */
.trail__wave {
  position: absolute;
  top: 0;
  height: 20px;
  overflow: visible;
}
.trail__wave path {
  stroke: rgb(var(--otp-sage));
  stroke-width: 1.5;
}

.trail__dot {
  position: relative; /* fica acima da onda */
  width: 8px;
  height: 8px;
  box-sizing: border-box;
  border-radius: 50%;
  background: var(--otp-bg);
  border: 2px solid rgb(var(--otp-sage));
  transition: background-color 0.2s, border-color 0.2s;
}
.trail__dot--filled {
  background: rgb(var(--v-theme-primary));
  border-color: rgb(var(--v-theme-primary));
}
.trail__dot--active {
  border-color: rgb(var(--v-theme-secondary));
}

.error {
  margin-top: 12px;
  font-size: 0.875rem;
  color: rgb(var(--v-theme-error));
}

.submit {
  margin-top: 24px;
  height: 52px;
  font-weight: 600;
  letter-spacing: 0;
}

.resend {
  display: flex;
  margin: 20px auto 0;
  letter-spacing: 0;
  font-size: 0.875rem;
}
/* mantém a cor do design enquanto a contagem roda */
.resend.v-btn--disabled {
  opacity: 1;
  color: rgb(var(--v-theme-primary)) !important;
}

.hint {
  margin-top: 28px;
  text-align: center;
  font-size: 0.875rem;
}

.brand {
  padding-top: 24px;
  font-size: 0.75rem;
  font-weight: 500;
  color: rgb(var(--v-theme-primary));
}

/* ---------- desktop ---------- */
@media (min-width: 1024px) {
  .otp-screen__content {
    width: min(400px, 33vw);
    margin-inline: 0;
    margin-left: 10.4vw;
    padding: clamp(48px, 12vh, 140px) 0 32px;
  }

  .otp-screen__main {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-top: 0;
  }

  .title {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .label {
    margin-bottom: 6px;
  }

  .otp {
    padding-block: 0;
  }

  .otp-screen__art {
    display: block;
    position: absolute;
    inset: 0 0 0 auto;
    width: 55%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
  }

  .otp-screen__art svg {
    display: block;
    width: 100%;
    height: 100%;
  }

  .art__primary {
    fill: rgb(var(--v-theme-primary));
  }
  .art__sage {
    fill: rgb(var(--otp-sage));
  }
  .art__ink {
    fill: rgb(var(--otp-ink));
  }
  .art__orange {
    fill: rgb(var(--v-theme-secondary));
  }

  .otp :deep(.v-otp-input__content) {
    height: 80px;
  }

  .back {
    margin-bottom: 24px;
    max-width: 10vw;
  }

  .submit {
    margin-top: 20px;
  }

  .resend {
    margin-top: 14px;
  }

  .hint {
    margin-top: 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .trail__dot {
    transition: none;
  }
}
</style>
