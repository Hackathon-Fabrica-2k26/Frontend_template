<script setup lang="ts">
  import type { Laudo } from '@/interfaces/laudo'
  import { Info, Lightbulb, List, UserCheck, UserX } from '@lucide/vue'
  import { computed, onMounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import checklistUrl from '@/assets/mascotes/checklist.svg'
  import LaudoBotao from '@/components/laudo/LaudoBotao.vue'
  import LaudoInfo from '@/components/laudo/LaudoInfo.vue'
  import LaudoLista from '@/components/laudo/LaudoLista.vue'
  import LaudoMascote from '@/components/laudo/LaudoMascote.vue'
  import LaudoPagina from '@/components/laudo/LaudoPagina.vue'
  import { useNomeAluno } from '@/composables/useNomeAluno'
  import laudosService from '@/services/laudos'
  import { notify } from '@/utils/notify'

  definePage({
    meta: {
      layout: false,
      public: true,
    },
  })

  const route = useRoute('/conferir-dados')
  const router = useRouter()
  const { nome: nomeAluno } = useNomeAluno('o aluno')

  const laudo = ref<Laudo | null>(null)
  const necessidades = ref<string[]>([])
  const adaptacoes = ref<string[]>([])
  const salvando = ref(false)

  const laudoId = computed(() => Number(route.query.laudo))

  // Mascote: balança "lendo" enquanto o laudo carrega, inclina a cabeça enquanto uma lista
  // está em edição, faz "que sim" quando os dados chegam ou uma lista é concluída e pula ao
  // confirmar.
  const mascote = ref<InstanceType<typeof LaudoMascote> | null>(null)
  const listasEmEdicao = ref(0)
  const pose = computed(() => {
    if (!laudo.value) return 'lendo'
    return listasEmEdicao.value > 0 ? 'inclinado' : 'parado'
  })

  function aoEditar (ativo: boolean) {
    listasEmEdicao.value += ativo ? 1 : -1
  }

  async function confirmar () {
    if (!laudo.value) return
    mascote.value?.reagir('pulo')
    salvando.value = true
    try {
      const { arquivo_apagado_em } = await laudosService.confirmar(laudo.value.id, {
        necessidades: necessidades.value,
        adaptacoes: adaptacoes.value,
        observacao: laudo.value.observacao,
      })
      await router.replace({ path: '/sair-site', query: { apagado_em: arquivo_apagado_em } })
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Não foi possível salvar o laudo.')
      salvando.value = false
    }
  }

  onMounted(async () => {
    if (!Number.isInteger(laudoId.value) || laudoId.value <= 0) {
      notify.error('Envie o laudo antes de conferir.')
      const { laudo: _laudo, ...query } = route.query
      await router.replace({ path: '/enviar-laudo', query })
      return
    }
    try {
      laudo.value = await laudosService.buscar(laudoId.value)
      necessidades.value = [...laudo.value.necessidades]
      adaptacoes.value = [...laudo.value.adaptacoes]
      mascote.value?.reagir('sim')
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Não foi possível carregar o laudo.')
    }
  })
</script>

<template>
  <LaudoPagina
    etapa="conferir"
    subtitulo="Corrija o que precisar. É só isso que fica salvo."
    titulo="Confira o que encontramos"
  >
    <template #mascote>
      <LaudoMascote ref="mascote" entrada="quique" :pose="pose" :src="checklistUrl" />
    </template>

    <Transition mode="out-in" name="conteudo">
      <!-- Altura parecida com a do conteúdo: o cartão não pula quando os dados chegam. -->
      <div v-if="!laudo" key="carregando" aria-busy="true" class="carregando">
        <MarsupiLoading label="Lendo o laudo..." />
      </div>

      <div v-else key="conteudo" class="conteudo">
        <LaudoInfo
          :icone="laudo.nome_confere ? UserCheck : UserX"
          role="status"
          :tom="laudo.nome_confere ? 'destaque' : 'aviso'"
        >
          {{ laudo.nome_confere
            ? `O nome no laudo confere com ${nomeAluno}.`
            : `O nome no laudo não confere com ${nomeAluno}. Confira se é o arquivo certo.` }}
        </LaudoInfo>

        <LaudoLista
          v-model="necessidades"
          :icone="List"
          marcador="ponto"
          titulo="Necessidades do aluno"
          @concluido="mascote?.reagir('sim')"
          @editando="aoEditar"
        />

        <LaudoLista
          v-model="adaptacoes"
          :icone="Lightbulb"
          marcador="check"
          titulo="Adaptações recomendadas"
          @concluido="mascote?.reagir('sim')"
          @editando="aoEditar"
        />

        <p v-if="laudo.observacao" class="observacao">
          <Info aria-hidden="true" :size="14" />
          {{ laudo.observacao }}
        </p>
      </div>
    </Transition>

    <template #acoes>
      <LaudoBotao :disabled="salvando" @click="router.back()">
        Voltar
      </LaudoBotao>

      <LaudoBotao :disabled="!laudo" :loading="salvando" principal @click="confirmar">
        Confirmar
      </LaudoBotao>
    </template>
  </LaudoPagina>
</template>

<style scoped>
.carregando {
  display: grid;
  width: 100%;
  min-height: 26rem;
  place-items: center;
}

.conteudo {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: var(--apoio-gap);
}

.observacao {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0;
  color: var(--apoio-texto-sec);
  font-size: 0.8125rem;
  text-align: left;
}

.observacao svg {
  flex: none;
  margin-top: 3px;
}

.conteudo-enter-active,
.conteudo-leave-active {
  transition: opacity 200ms ease;
}

.conteudo-enter-from,
.conteudo-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .conteudo-enter-active,
  .conteudo-leave-active {
    transition: none;
  }
}
</style>
