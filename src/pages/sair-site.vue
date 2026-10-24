<script setup lang="ts">
  import { Trash2 } from '@lucide/vue'
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'
  import sucessoUrl from '@/assets/mascotes/sucesso.svg'
  import LaudoInfo from '@/components/laudo/LaudoInfo.vue'
  import LaudoMascote from '@/components/laudo/LaudoMascote.vue'
  import LaudoPagina from '@/components/laudo/LaudoPagina.vue'

  definePage({
    meta: {
      layout: false,
      public: true,
    },
  })

  const route = useRoute('/sair-site')

  // "24/10/2026 às 14:32". Sem data válida na URL, usa a hora em que a tela abriu.
  const apagadoEm = computed(() => {
    const data = new Date(String(route.query.apagado_em ?? ''))
    const valida = Number.isNaN(data.getTime()) ? new Date() : data
    const dia = valida.toLocaleDateString('pt-BR')
    const hora = valida.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    return `${dia} às ${hora}`
  })
</script>

<template>
  <LaudoPagina
    etapa="concluido"
    subtitulo="Seu arquivo foi apagado. Guardamos só o que você confirmou."
    titulo="Tudo certo! Obrigado."
  >
    <!-- sucesso.svg já pula com confete; aqui ele entra com "pop" e o anel se abre uma vez. -->
    <template #mascote>
      <LaudoMascote celebrar entrada="pop" :src="sucessoUrl" />
    </template>

    <LaudoInfo :icone="Trash2">
      Arquivo excluído em {{ apagadoEm }}
    </LaudoInfo>

    <p class="fechar">Você já pode fechar esta página.</p>
  </LaudoPagina>
</template>

<style scoped>
.fechar {
  margin: 8px 0 0;
  color: var(--apoio-texto);
  font-size: 0.9375rem;
  font-weight: var(--font-weight-medium);
  text-align: center;
}
</style>
