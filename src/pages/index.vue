<template>
  <div>
    <h1 class="text-h4 mb-2">Olá, {{ auth.user?.name || 'visitante' }}</h1>

    <p class="text-medium-emphasis">
      Template pronto. Edite <code>src/pages/index.vue</code> para começar.
    </p>
  </div>
</template>

<script setup lang="ts">
  import { useAuthStore } from '@/stores/auth'

  const auth = useAuthStore()
</script>
