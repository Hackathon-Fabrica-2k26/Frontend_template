<script setup lang="ts">
  import { computed } from 'vue'
  import { useRouter } from 'vue-router'
  import erro404Url from '@/assets/erro-404.svg'
  import ondaDireitaUrl from '@/assets/onda-direita.svg'
  import ondaEsquerdaUrl from '@/assets/onda-esquerda.svg'
  import { useAuthStore } from '@/stores/auth'

  definePage({
    meta: {
      layout: false,
      public: true,
    },
  })

  const router = useRouter()
  const auth = useAuthStore()

  const logado = computed(() => auth.isLogged)
  const rotuloBotao = computed(() =>
    logado.value ? 'Voltar ao início' : 'Voltar ao login',
  )
  const descricao = computed(() =>
    logado.value
      ? 'Volte ao início para continuar com o Marsupi.'
      : 'Volte ao login para continuar com o Marsupi.',
  )

  function voltar () {
    router.push(logado.value ? '/' : '/login')
  }
</script>

<template>
  <main class="not-found">
    <img alt="" class="onda onda--esquerda" :src="ondaEsquerdaUrl">
    <img alt="" class="onda onda--direita" :src="ondaDireitaUrl">

    <section class="conteudo">
      <img alt="Erro 404" class="codigo" :src="erro404Url">

      <h1>Parece que saímos do caminho.</h1>

      <p>
        Não encontramos essa página.<br>
        {{ descricao }}
      </p>

      <v-btn
        color="primary"
        prepend-icon="mdi-arrow-left"
        @click="voltar"
      >
        {{ rotuloBotao }}
      </v-btn>
    </section>

    <span class="assinatura">Marsupi</span>
  </main>
</template>

<style scoped>
.not-found {
  --verde-escuro: #356b5b;
  --laranja: #e3b477;
  --fundo: #f7f7f1;
  --texto: #263d35;

  position: relative;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem 1.25rem;
  overflow: hidden;
  background: var(--fundo);
  font-family: 'Poppins', sans-serif;
}

.conteudo {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.75rem;
}

.codigo {
  display: block;
  width: clamp(240px, 42vw, 420px);
  height: auto;
  margin-bottom: 1.5rem;
}

h1 {
  margin: 0;
  color: var(--verde-escuro);
  font-size: clamp(1.125rem, 3vw, 1.5rem);
  font-weight: 600;
}

p {
  margin: 0;
  max-width: 36ch;
  color: var(--texto);
  font-size: 0.9375rem;
  line-height: 1.6;
}

.assinatura {
  position: absolute;
  bottom: 1.5rem;
  left: 1.5rem;
  color: var(--verde-escuro);
  font-size: 1rem;
  font-weight: 600;
}

.onda {
  position: absolute;
  bottom: 0;
  height: auto;
  pointer-events: none;
}

.onda--esquerda {
  left: 0;
  width: clamp(110px, 13vw, 260px);
}

.onda--direita {
  right: 0;
  width: clamp(140px, 21vw, 400px);
}
</style>
