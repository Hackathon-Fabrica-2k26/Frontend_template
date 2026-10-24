<template>
  <AppHeader :links="links" />

  <v-main class="app-main">
    <v-container>
      <router-view />
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
  import { menuLinks as links } from '@/config/menu'
</script>

<style scoped>
.app-main {
  padding-top: 24px;
  background: var(--color-background);
}
</style>
