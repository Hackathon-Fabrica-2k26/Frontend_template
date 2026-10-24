<template>
  <router-view />
</template>

<script setup lang="ts">
  definePage({
    meta: {
      layout: false,
      public: true,
    },
  })
</script>
