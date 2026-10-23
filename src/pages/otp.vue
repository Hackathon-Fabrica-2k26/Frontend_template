<script setup lang="ts">
  import {
    ArrowLeft,
    LoaderCircle,
    ShieldCheck,
  } from '@lucide/vue'
  import { ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'
  import { notify } from '@/utils/notify'

  definePage({
    meta: {
      layout: 'auth',
      public: true,
    },
  })

  const auth = useAuthStore()
  const router = useRouter()
  const route = useRoute()

  const code = ref('')
  const loading = ref(false)
  const resending = ref(false)

  function normalizeCode (event: Event): void {
    code.value = (event.target as HTMLInputElement)
      .value
      .replace(/\D/g, '')
      .slice(0, 4)
  }

  async function submit (): Promise<void> {
    if (loading.value || code.value.length !== 4) return

    loading.value = true

    try {
      await auth.verifyOtp(code.value)

      const redirect = route.query.redirect

      const destination = typeof redirect === 'string'
        && redirect.startsWith('/')
        && !redirect.startsWith('//')
        ? redirect
        : '/'

      await router.replace(destination)
    } catch (error: unknown) {
      notify.error(
        error instanceof Error
          ? error.message
          : 'Não foi possível verificar o código.',
      )
    } finally {
      loading.value = false
    }
  }

  async function resend (): Promise<void> {
    if (resending.value) return

    resending.value = true

    try {
      await auth.resendOtp()
      notify.success('Código reenviado.')
    } catch (error: unknown) {
      notify.error(
        error instanceof Error
          ? error.message
          : 'Erro ao reenviar código.',
      )
    } finally {
      resending.value = false
    }
  }
</script>

<template>
  <main
    class="flex min-h-dvh items-center justify-center
           bg-marsupi-cream px-6 py-12 text-marsupi-dark"
  >
    <div
      class="w-full max-w-107.5
             motion-safe:animate-marsupi-enter"
    >
      <button
        class="mb-10 flex items-center gap-2 text-sm
             text-marsupi-green hover:underline"
        type="button"
        @click="router.push('/login')"
      >
        <ArrowLeft :size="18" />
        Voltar
      </button>

      <div
        class="mb-7 flex size-14 items-center justify-center
               rounded-xl bg-marsupi-sage/30"
      >
        <ShieldCheck :size="28" />
      </div>

      <h1 class="text-3xl font-semibold">
        Verifique seu acesso
      </h1>

      <p class="mt-3 text-sm leading-6 text-marsupi-dark/70">
        Enviamos um código de 4 dígitos para
        <strong>{{ auth.otpEmail }}</strong>.
      </p>

      <form class="mt-8" @submit.prevent="submit">
        <label
          class="mb-2 block text-sm font-medium"
          for="otp-code"
        >
          Código de verificação
        </label>

        <input
          id="otp-code"
          v-model="code"
          autocomplete="one-time-code"
          class="h-16 w-full rounded-xl border
                 border-marsupi-sage bg-transparent
                 text-center text-2xl tracking-[1em]
                 outline-none focus:border-marsupi-green
                 focus:ring-4 focus:ring-marsupi-green/10"
          inputmode="numeric"
          maxlength="4"
          pattern="[0-9]{4}"
          placeholder="0000"
          required
          @input="normalizeCode"
        >

        <button
          class="mt-6 flex h-12 w-full items-center
                 justify-center gap-2 rounded-lg
                 bg-marsupi-green font-semibold text-white
                 hover:bg-marsupi-dark disabled:opacity-50"
          :disabled="loading || code.length !== 4"
          type="submit"
        >
          <LoaderCircle
            v-if="loading"
            class="animate-spin"
            :size="18"
          />
          {{ loading ? 'Verificando...' : 'Verificar código' }}
        </button>
      </form>

      <p class="mt-6 text-center text-sm">
        Não recebeu?
        <button
          class="font-semibold text-marsupi-green
                 hover:underline disabled:opacity-50"
          :disabled="resending"
          type="button"
          @click="resend"
        >
          {{ resending ? 'Reenviando...' : 'Reenviar código' }}
        </button>
      </p>
    </div>
  </main>
</template>
