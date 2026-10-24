
<script setup lang="ts">
const links = [
  { title: 'Início', to: '/' },
  { title: 'Minhas turmas', to: '/turmas' },
]
</script>

<template>
  <AppHeader :links="links" />

  <v-main class="app-main">
    <v-container class="app-container" fluid>
      <router-view />
    </v-container>
  </v-main>
</template>

<style scoped>
.app-main {
  min-height: 100dvh;
  padding-top: 16px;
  background: var(--color-background);
}

.app-container {
  width: 100%;
  max-width: 1480px;
  margin: 0 auto;
  padding: 0 32px 48px;
}

@media (max-width: 768px) {
  .app-container {
    padding: 0 16px 32px;
  }
}
</style>
