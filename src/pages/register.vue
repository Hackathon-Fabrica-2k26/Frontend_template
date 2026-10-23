<script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'
  import { notify } from '@/utils/notify'

  definePage({ meta: { layout: 'auth', public: true } })

  const auth = useAuthStore()
  const router = useRouter()

  const matricula = ref('')
  const name = ref('')
  const email = ref('')
  const password = ref('')
  const loading = ref(false)

  async function submit (): Promise<void> {
    loading.value = true

    try {
      await auth.register({
        matricula: matricula.value.trim(),
        name: name.value,
        email: email.value,
        password: password.value,
      })
      notify.success('Cadastro realizado. Entre com sua matrícula.')
      await router.push('/login')
    } catch (error: unknown) {
      notify.error(
        error instanceof Error
          ? error.message
          : 'Não foi possível criar a conta.',
      )
    } finally {
      loading.value = false
    }
  }
</script>
<template>
  <v-card class="pa-6">
    <h1 class="text-h5 mb-4">Criar conta</h1>

    <v-form @submit.prevent="submit">
      <v-text-field
        v-model="matricula"
        autocomplete="username"
        label="Matrícula"
        required
      />

      <v-text-field v-model="name" label="Nome" required />

      <v-text-field
        v-model="email"
        autocomplete="email"
        label="E-mail"
        required
        type="email"
      />

      <v-text-field
        v-model="password"
        autocomplete="new-password"
        label="Senha"
        required
        type="password"
      />

      <v-btn block color="primary" :loading="loading" type="submit">Cadastrar</v-btn>
    </v-form>

    <v-btn block class="mt-2" to="/login" variant="text">Já tenho conta</v-btn>
  </v-card>
</template>
