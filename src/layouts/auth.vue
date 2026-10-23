<template>
  <v-main class="d-flex align-center justify-center">
    <v-container class="auth-container">
      <router-view />
    </v-container>
  </v-main>
</template>

<style scoped>
.auth-container {
  max-width: 440px;
}
</style>
