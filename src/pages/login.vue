<template>
  <v-card class="pa-6">
    <h1 class="text-h5 mb-4">Entrar</h1>

    <v-form @submit.prevent="submit">
      <v-text-field
        v-model="email"
        autocomplete="email"
        label="E-mail"
        required
        type="email"
      />

      <v-text-field
        v-model="password"
        autocomplete="current-password"
        label="Senha"
        required
        type="password"
      />

      <v-btn block color="primary" :loading="loading" type="submit">Entrar</v-btn>
    </v-form>

    <v-btn block class="mt-2" to="/register" variant="text">Criar conta</v-btn>
  </v-card>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'
  import { notify } from '@/utils/notify'

  definePage({ meta: { layout: 'auth', public: true } })

  const auth = useAuthStore()
  const router = useRouter()
  const route = useRoute()

  const email = ref('')
  const password = ref('')
  const loading = ref(false)

  async function submit () {
    loading.value = true
    try {
      await auth.login(email.value, password.value)
      router.push(String(route.query.redirect || '/'))
    } catch (error) {
      notify.error((error as Error).message)
    } finally {
      loading.value = false
    }
  }
</script>
