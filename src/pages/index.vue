<template>
  <div />
</template>

<script setup lang="ts">
  import { onMounted } from 'vue'
  import { useRouter } from 'vue-router'

  definePage({
    redirect: '/turmas',
  })

  const router = useRouter()

  onMounted(() => {
    router.replace('/turmas')
  })
</script>
