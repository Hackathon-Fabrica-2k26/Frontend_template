<template>
  <div class="relative left-1/2 w-screen -translate-x-1/2 px-3 pb-10 sm:px-8 lg:px-28">
    <nav aria-label="Você está em" class="mb-4 flex items-center gap-1.5 text-xs text-text/80">
      <router-link class="text-text/80 no-underline hover:text-primary hover:underline" to="/">Início</router-link>
      <span aria-hidden="true">/</span>
      <span aria-current="page" class="font-semibold text-text">Perfil</span>
    </nav>

    <h1 class="sr-only">Perfil</h1>

    <div class="grid items-stretch gap-4 lg:grid-cols-[clamp(284px,21vw,340px)_1fr] lg:gap-5">
      <div class="entra min-w-0 [&>section]:h-full">
        <PerfilCartao :carregando="carregandoTudo" :usuario="usuario" @sair="sairAberto = true" />
      </div>

      <div class="flex min-w-0 flex-col gap-4 lg:gap-5">
        <div class="entra [animation-delay:70ms]">
          <PerfilResumo :carregando="estadoResumo === 'carregando'" :erro="estadoResumo === 'erro'" :resumo="resumo" />
        </div>

        <div class="entra [animation-delay:140ms]">
          <PerfilAbas
            :atividades="atividades"
            :estado-atividades="estadoAtividades"
            :estado-turmas="estadoTurmas"
            :turmas="turmas"
            @atualizada="carregar"
            @excluida="carregar"
            @recarregar="carregar"
          />
        </div>
      </div>
    </div>

    <SairContaDialog v-model="sairAberto" @confirmar="sair" />
  </div>
</template>

<script setup lang="ts">
  import type { Turma } from '@/interfaces/escola'
  import type { AtividadeRecente, PerfilResumo } from '@/interfaces/perfil'
  import { computed, onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import perfilService from '@/services/perfil'
  import { useAuthStore } from '@/stores/auth'

  type Estado = 'carregando' | 'erro' | 'ok'

  const auth = useAuthStore()
  const router = useRouter()

  const estadoUsuario = ref<Estado>('carregando')
  const estadoResumo = ref<Estado>('carregando')
  const estadoTurmas = ref<Estado>('carregando')
  const estadoAtividades = ref<Estado>('carregando')
  const resumo = ref<PerfilResumo | null>(null)
  const turmas = ref<Turma[]>([])
  const atividades = ref<AtividadeRecente[]>([])
  const sairAberto = ref(false)

  const usuario = computed(() => auth.user)
  const carregandoTudo = computed(() => !auth.user && estadoUsuario.value === 'carregando')

  async function carregar (): Promise<void> {
    estadoUsuario.value = estadoResumo.value = estadoTurmas.value = estadoAtividades.value = 'carregando'

    await Promise.all([
      auth.fetchUser().then(() => {
        estadoUsuario.value = 'ok'
      }, () => {
        estadoUsuario.value = auth.user ? 'ok' : 'erro'
      }),
      perfilService.resumo().then(dados => {
        resumo.value = dados
        estadoResumo.value = 'ok'
      }, () => {
        estadoResumo.value = 'erro'
      }),
      perfilService.turmas().then(dados => {
        turmas.value = dados
        estadoTurmas.value = 'ok'
      }, () => {
        estadoTurmas.value = 'erro'
      }),
      perfilService.atividadesRecentes().then(dados => {
        atividades.value = dados
        estadoAtividades.value = 'ok'
      }, () => {
        estadoAtividades.value = 'erro'
      }),
    ])
  }

  function sair (): void {
    sairAberto.value = false
    auth.logout()
    router.push('/login')
  }

  onMounted(carregar)
</script>

<style scoped>
.entra {
  animation: entra 560ms var(--ease-out-expo) both;
}

@keyframes entra {
  from {
    opacity: 0;
    translate: 0 12px;
  }
}
</style>
