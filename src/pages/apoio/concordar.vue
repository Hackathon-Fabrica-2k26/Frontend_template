<script setup lang="ts">
  import { Eye, ShieldCheck, Trash2 } from '@lucide/vue'
  import { computed, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import privacidadeUrl from '@/assets/mascotes/privacidade.svg'
  import LaudoBotao from '@/components/laudo/LaudoBotao.vue'
  import LaudoCheckbox from '@/components/laudo/LaudoCheckbox.vue'
  import LaudoInfo from '@/components/laudo/LaudoInfo.vue'
  import LaudoMascote from '@/components/laudo/LaudoMascote.vue'
  import LaudoPagina from '@/components/laudo/LaudoPagina.vue'
  import { useNomeAluno } from '@/composables/useNomeAluno'
  import responsavelAcesso from '@/services/responsavelAcesso'
  import { useAuthStore } from '@/stores/auth'
  import { notify } from '@/utils/notify'

  // Sem o layout da plataforma (header/menu): a moldura é o LaudoPagina, do fluxo do responsável.
  definePage({
    meta: {
      layout: false,
      public: true,
    },
  })

  const route = useRoute('/apoio/concordar')
  const router = useRouter()
  const { nome: nomeAluno } = useNomeAluno()

  const garantias = [
    { icone: ShieldCheck, texto: 'O laudo é um dado sensível. Só segue se você concordar.' },
    { icone: Eye, texto: 'Lemos só necessidades, adaptações e validade.' },
    { icone: Trash2, texto: 'O arquivo é apagado assim que você confirmar.' },
  ]

  const concordo = ref(false)
  const mascote = ref<InstanceType<typeof LaudoMascote> | null>(null)

  // Marcou o aceite: o canguru faz "que sim" com a cabeça.
  watch(concordo, marcado => {
    if (marcado) mascote.value?.reagir('sim')
  })

  // O link da professora traz `?codigo=`: ele vira a sessão do responsável (vale uma vez).
  const auth = useAuthStore()
  const codigo = computed(() => typeof route.query.codigo === 'string' ? route.query.codigo.trim() : '')
  const temSessao = ref(responsavelAcesso.temSessao())
  const precisaEntrar = computed(() => Boolean(codigo.value) && !temSessao.value)
  const nomeResponsavel = ref('')
  const enviando = ref(false)
  const podeAceitar = computed(() =>
    concordo.value
    && !enviando.value
    && (!precisaEntrar.value || nomeResponsavel.value.trim().length >= 3),
  )

  async function aceitar () {
    if (!podeAceitar.value) return
    if (!codigo.value && !temSessao.value && !auth.isLogged) {
      notify.error('Link inválido. Peça um novo link à professora.')
      return
    }
    enviando.value = true
    try {
      if (precisaEntrar.value) {
        await responsavelAcesso.acessar(codigo.value, nomeResponsavel.value)
        temSessao.value = true
      }
      if (temSessao.value) {
        const aluno = await responsavelAcesso.aluno()
        if (!aluno.consentimento_ativo) {
          await responsavelAcesso.consentir()
        }
      }
      // O código já foi usado: segue sem ele na URL.
      const { codigo: _codigo, ...query } = route.query
      void router.push({ path: '/enviar-laudo', query })
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Não foi possível continuar.')
    } finally {
      enviando.value = false
    }
  }
</script>

<template>
  <LaudoPagina
    etapa="consentimento"
    :subtitulo="`Guardamos só o que ajuda a professora a apoiar ${nomeAluno} em sala de aula.`"
    titulo="Antes de começar"
  >
    <template #mascote>
      <LaudoMascote ref="mascote" entrada="espiar" :src="privacidadeUrl" />
    </template>

    <ul class="garantias">
      <li v-for="g in garantias" :key="g.texto">
        <LaudoInfo :icone="g.icone" tom="plano">{{ g.texto }}</LaudoInfo>
      </li>
    </ul>

    <label v-if="precisaEntrar" class="campo-nome">
      <span>Seu nome&nbsp;<span aria-hidden="true">*</span></span>

      <input
        v-model="nomeResponsavel"
        aria-required="true"
        autocomplete="name"
        maxlength="100"
        placeholder="Nome do responsável"
        type="text"
      >
    </label>

    <LaudoCheckbox v-model="concordo" aria-required="true">
      Li e concordo com o uso do laudo para apoio pedagógico.&nbsp;<span aria-hidden="true">*</span>
    </LaudoCheckbox>

    <template #acoes>
      <LaudoBotao @click="router.back()">
        Agora não
      </LaudoBotao>

      <LaudoBotao :disabled="!podeAceitar" principal @click="aceitar">
        {{ enviando ? 'Validando...' : 'Aceitar e continuar' }}
      </LaudoBotao>
    </template>
  </LaudoPagina>
</template>

<style scoped>
.campo-nome {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 6px;
  font-size: 0.9rem;
  font-weight: 600;
}

.campo-nome input {
  padding: 10px 12px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  background: #fff;
  font: inherit;
  font-weight: 400;
}

.campo-nome input:focus-visible {
  outline: 2px solid #356b5b;
  outline-offset: 1px;
}

.garantias {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 14px 16px;
  border-radius: 12px;
  background: var(--apoio-caixa);
  list-style: none;
}
</style>
