<template>
  <AppHeader :links="links" />

  <v-main class="app-main">
    <v-container>
      <router-view />
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
  const links = [
    { title: 'Início', to: '/' },
    { title: 'Minhas turmas', to: '/turmas' },
  ]
</script>

<style scoped>
.app-main {
  padding-top: 24px;
  background: var(--color-background);
}
</style>
