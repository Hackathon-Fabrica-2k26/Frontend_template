<script setup lang="ts">
  import { Eye, ShieldCheck, Trash2 } from '@lucide/vue'
  import { ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import privacidadeUrl from '@/assets/mascotes/privacidade.svg'
  import LaudoBotao from '@/components/laudo/LaudoBotao.vue'
  import LaudoCheckbox from '@/components/laudo/LaudoCheckbox.vue'
  import LaudoInfo from '@/components/laudo/LaudoInfo.vue'
  import LaudoMascote from '@/components/laudo/LaudoMascote.vue'
  import LaudoPagina from '@/components/laudo/LaudoPagina.vue'
  import { useNomeAluno } from '@/composables/useNomeAluno'

  // Sem o layout da plataforma (header/menu): a moldura é o LaudoPagina, do fluxo do responsável.
  definePage({
    meta: {
      layout: false,
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

  function aceitar () {
    if (!concordo.value) return
    // Leva o aluno e a turma da URL adiante.
    void router.push({ path: '/enviar-laudo', query: route.query })
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

    <LaudoCheckbox v-model="concordo" aria-required="true">
      Li e concordo com o uso do laudo para apoio pedagógico.&nbsp;<span aria-hidden="true">*</span>
    </LaudoCheckbox>

    <template #acoes>
      <LaudoBotao @click="router.back()">
        Agora não
      </LaudoBotao>

      <LaudoBotao :disabled="!concordo" principal @click="aceitar">
        Aceitar e continuar
      </LaudoBotao>
    </template>
  </LaudoPagina>
</template>

<style scoped>
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
