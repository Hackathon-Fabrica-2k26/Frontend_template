<script setup lang="ts">
  // Pai das rotas /apoio/*. O plugin de layouts só olha a rota de cima: sem `layout: false`
  // aqui, /apoio ganharia o layout padrão (header e menu da professora), mesmo com as filhas
  // pedindo `layout: false`.
  definePage({
    meta: {
      layout: false,
    },
  })
</script>

<template>
  <router-view />
</template>
