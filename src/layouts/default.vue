<template>
  <v-navigation-drawer v-model="drawer">
    <v-list-item
      :subtitle="auth.user?.email"
      :title="auth.user?.name || 'Usuário'"
    />

    <v-divider />

    <v-list nav>
      <v-list-item
        v-for="link in links"
        :key="link.to"
        :prepend-icon="link.icon"
        :title="link.title"
        :to="link.to"
      />
    </v-list>

    <template #append>
      <v-list nav>
        <v-list-item prepend-icon="mdi-logout" title="Sair" @click="logout" />
      </v-list>
    </template>
  </v-navigation-drawer>

  <v-app-bar flat>
    <v-app-bar-nav-icon @click="drawer = !drawer" />
    <v-app-bar-title>Hackathon Fábrica</v-app-bar-title>

    <v-btn
      :icon="isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
      @click="toggleTheme"
    />
  </v-app-bar>

  <v-main>
    <v-container>
      <router-view />
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useTheme } from 'vuetify'
  import { useAuthStore } from '@/stores/auth'

  const auth = useAuthStore()
  const router = useRouter()
  const theme = useTheme()

  const drawer = ref(true)
  // Adicione aqui os links do menu.
  const links = [
    { title: 'Início', icon: 'mdi-home', to: '/' },
    { title: 'Itens', icon: 'mdi-format-list-checks', to: '/items' },
  ]

  const isDark = computed(() => theme.current.value.dark)
  function toggleTheme () {
    theme.change(isDark.value ? 'light' : 'dark')
  }

  function logout () {
    auth.logout()
    router.push('/login')
  }
</script>
