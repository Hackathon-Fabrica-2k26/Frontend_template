<script setup lang="ts">
  import { Trash2 } from '@lucide/vue'
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import sucessoUrl from '@/assets/mascotes/sucesso.svg'
  import LaudoBotao from '@/components/laudo/LaudoBotao.vue'
  import LaudoInfo from '@/components/laudo/LaudoInfo.vue'
  import LaudoMascote from '@/components/laudo/LaudoMascote.vue'
  import LaudoPagina from '@/components/laudo/LaudoPagina.vue'

  definePage({
    meta: {
      layout: false,
    },
  })

  const route = useRoute('/sair-site')
  const segundosRestantes = ref(2)
  let timerFechar: ReturnType<typeof setInterval> | null = null

  const isPopup = computed(() => typeof window !== 'undefined' && (!!window.opener || route.query.popup === '1'))

  // "24/10/2026 às 14:32". Sem data válida na URL, usa a hora em que a tela abriu.
  const apagadoEm = computed(() => {
    const data = new Date(String(route.query.apagado_em ?? ''))
    const valida = Number.isNaN(data.getTime()) ? new Date() : data
    const dia = valida.toLocaleDateString('pt-BR')
    const hora = valida.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    return `${dia} às ${hora}`
  })

  function fecharJanela () {
    if (timerFechar) {
      clearInterval(timerFechar)
      timerFechar = null
    }
    window.close()
  }

  onMounted(() => {
    if (isPopup.value) {
      if (window.opener) {
        try {
          window.opener.postMessage({
            tipo: 'laudo_concluido',
            alunoId: Number(route.query.aluno) || undefined,
            turmaId: Number(route.query.turma) || undefined,
            sucesso: true,
          }, window.location.origin)
        } catch {
          // Ignora caso bloqueado por CORS/política
        }
      }

      timerFechar = setInterval(() => {
        segundosRestantes.value -= 1
        if (segundosRestantes.value <= 0) {
          if (timerFechar) {
            clearInterval(timerFechar)
            timerFechar = null
          }
          window.close()
        }
      }, 1000)
    }
  })

  onBeforeUnmount(() => {
    if (timerFechar) {
      clearInterval(timerFechar)
      timerFechar = null
    }
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

    <div v-if="isPopup" class="fechar-bloco">
      <p class="fechar">Você já pode fechar esta janela.</p>
      <p class="fechar-contagem">Fechando automaticamente em {{ segundosRestantes }}s...</p>

      <LaudoBotao class="btn-fechar-popup" principal @click="fecharJanela">
        Fechar agora
      </LaudoBotao>
    </div>

    <p v-else class="fechar">Você já pode fechar esta página.</p>
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

.fechar-bloco {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.fechar-contagem {
  margin: 0;
  color: var(--apoio-texto-sec);
  font-size: 0.8125rem;
  text-align: center;
}

.btn-fechar-popup {
  margin-top: 8px;
}
</style>
