<script setup lang="ts">
  import { computed } from 'vue'
  import { useRouter } from 'vue-router'
  import erro404Url from '@/assets/erro-404.pdf'
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

      <button class="botao" type="button" @click="voltar">
        <span aria-hidden="true" class="botao__seta">←</span>
        {{ rotuloBotao }}
      </button>
    </section>
  </main>
</template>

<style scoped>
.not-found {
  --verde-escuro: #2d5a4a;
  --laranja: #eab96b;
  --fundo: #f6f5ee;
  --texto: #3b3b3b;

  position: relative;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem 1.25rem;
  overflow: hidden;
  background: var(--fundo);
  font-family: 'Poppins', system-ui, sans-serif;
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

.botao {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.75rem 2rem;
  border: 0;
  border-radius: 0.5rem;
  background: var(--verde-escuro);
  color: #fff;
  font: inherit;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.botao__seta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1.25em;
  line-height: 1;
  transform: translateY(-0.10em);
}

.botao:hover {
  background: #244a3d;
}

.botao:focus-visible {
  outline: 3px solid var(--laranja);
  outline-offset: 3px;
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
