<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useCountdown } from '@/composables/useCountdown'

  definePage({ meta: { layout: false, public: true } })

  const router = useRouter()

  /* ---------- configuração do fluxo ---------- */
  const length = 4
  const resendSeconds = 30
  const GAP = 12 // espaço entre as caixas (px); também usado na trilha

  // TODO: receber o e-mail do fluxo de login/backend em vez de usar o mock.
  const email = ref('aluno@escola.edu.br')

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
    const [local, domain] = email.value.trim().split('@')
    if (!local || !domain) return email.value

    return `${local.slice(0, 1)}${'*'.repeat(Math.max(3, local.length - 1))}@${domain}`
  })

  const { formatted, isRunning, restart } = useCountdown(resendSeconds)

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

    loading.value = true
    error.value = ''

    try {
      // TODO: substituir o mock pela chamada ao service de OTP do backend.
      await new Promise<void>(resolve => {
        setTimeout(resolve, 600)
      })
    } catch (error_) {
      error.value = (error_ as Error).message
    } finally {
      loading.value = false
    }
  }

  function resend () {
    code.value = ''
    resetKey.value++
    error.value = ''

    // TODO: chamar o endpoint de reenvio antes de reiniciar a contagem.
    restart()
  }
</script>

<template>
  <v-container class="otp-screen" fluid :style="{ '--gap': `${GAP}px` }">
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
          :height="64"
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
  </v-container>
</template>

<style scoped>
.otp-screen {
  /* Mock local da paleta Marsupi: verde primário no lugar do azul do tema global. */
  --v-theme-primary: 53,107,90;
  --v-theme-on-primary: 255,255,255;

  min-height: 100dvh;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  padding: 24px;
  background: rgb(var(--v-theme-background));
  color: rgb(var(--v-theme-on-background));
  font-family: Roboto, system-ui, sans-serif;
}

/* Componentes Vuetify declaram as variáveis do tema neles mesmos (v-theme--*),
   então repetimos o mock para os botões e campos desta tela. */
.otp-screen :deep(.v-theme--light) {
  --v-theme-primary: 53,107,90;
  --v-theme-on-primary: 255,255,255;
}

.otp-screen__main {
  flex: 1;
  padding-top: 40px;
}

.back {
  margin-left: -12px;
  margin-bottom: 20px;
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
  border-radius: 12px;
  background: rgb(var(--v-theme-background));
}

.otp :deep(.v-field--focused:not(.v-field--error) .v-field__outline) {
  color: rgb(var(--v-theme-primary));
}

.otp :deep(.v-otp-input__field) {
  color: rgb(var(--v-theme-on-background));
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
  stroke: rgba(var(--v-theme-on-background), 0.3);
  stroke-width: 1.5;
}

.trail__dot {
  position: relative; /* fica acima da onda */
  width: 8px;
  height: 8px;
  box-sizing: border-box;
  border-radius: 50%;
  background: rgb(var(--v-theme-background));
  border: 2px solid rgba(var(--v-theme-on-background), 0.3);
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

@media (prefers-reduced-motion: reduce) {
  .trail__dot {
    transition: none;
  }
}
</style>
