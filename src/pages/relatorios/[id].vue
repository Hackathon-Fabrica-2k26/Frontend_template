<script setup lang="ts">
  import type { AtividadeAdaptada, Relatorio, RelatorioDados } from '@/interfaces/pedagogico'
  import { Check, ChevronLeft, Download, Lightbulb, Sparkles } from '@lucide/vue'
  import { computed, onMounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import pensandoUrl from '@/assets/mascotes/pensando-ia.svg'
  import semResultadosUrl from '@/assets/mascotes/sem-resultados.svg'
  import pedagogicoService from '@/services/pedagogico'
  import { notify } from '@/utils/notify'

  const route = useRoute('/relatorios/[id]')
  const router = useRouter()

  const relatorio = ref<Relatorio | null>(null)
  const carregando = ref(true)
  const erro = ref('')

  // Refinamento: o professor escreve o ajuste e vê o prompt melhorado.
  const refinando = ref<number | null>(null)
  const ajustes = ref<Record<number, string>>({})
  const prompts = ref<Record<number, string>>({})

  const dados = computed(() => relatorio.value?.dados as unknown as RelatorioDados | undefined)

  const DISCLAIMER_PADRAO = 'Este relatório tem finalidade estritamente pedagógica. Sinais atípicos persistentes '
    + 'devem ser encaminhados à coordenação pedagógica e profissionais de saúde.'

  async function carregar () {
    carregando.value = true
    erro.value = ''
    try {
      relatorio.value = await pedagogicoService.get(Number(route.params.id))
    } catch (error) {
      erro.value = error instanceof Error ? error.message : 'Não foi possível carregar o relatório.'
    } finally {
      carregando.value = false
    }
  }

  async function refinar (indice: number) {
    const ajuste = (ajustes.value[indice] ?? '').trim()
    if (!ajuste || !relatorio.value) {
      notify.error('Conte o que você gostaria de adaptar.')
      return
    }
    refinando.value = indice
    try {
      const resposta = await pedagogicoService.refinar(relatorio.value.id, ajuste)
      prompts.value[indice] = resposta.prompt_melhorado
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Não foi possível refinar.')
    } finally {
      refinando.value = null
    }
  }

  async function copiar (texto: string) {
    try {
      await navigator.clipboard.writeText(texto)
      notify.success('Prompt copiado!')
    } catch {
      notify.error('Não foi possível copiar. Selecione o texto manualmente.')
    }
  }

  // Exportar PDF: abre o diálogo de impressão do navegador ("Salvar como PDF").
  function exportarPdf () {
    window.print()
  }

  function duracaoDe (atividade: AtividadeAdaptada) {
    return atividade.duracao || '—'
  }

  onMounted(carregar)
</script>

<template>
  <div class="relatorio">
    <header class="topo no-print">
      <button class="voltar" type="button" @click="router.back()">
        <ChevronLeft :size="18" /> Voltar
      </button>

      <v-btn color="primary" :disabled="!dados" :prepend-icon="Download" @click="exportarPdf">
        Exportar PDF
      </v-btn>
    </header>

    <div v-if="carregando" class="estado">
      <img alt="" :src="pensandoUrl">
      <MarsupiLoading label="Montando o relatório..." />
    </div>

    <div v-else-if="erro" class="estado">
      <img alt="" :src="semResultadosUrl">
      <h2>Não conseguimos abrir o relatório</h2>
      <p>{{ erro }}</p>
      <v-btn color="primary" @click="carregar">Tentar de novo</v-btn>
    </div>

    <template v-else-if="dados">
      <section class="hero">
        <span class="eyebrow">Relatório pedagógico</span>
        <h1>Perfil de aprendizagem</h1>
        <p>{{ dados.resumo_perfil }}</p>
      </section>

      <section class="grade">
        <article class="cartao radar-cartao">
          <h2>Radar de habilidades</h2>
          <RadarHabilidades :metricas="dados.radar" />
        </article>

        <div class="coluna">
          <article class="cartao fortes">
            <h2><Sparkles :size="18" /> Pontos fortes</h2>

            <ul>
              <li v-for="item in dados.pontos_fortes" :key="item">
                <Check :size="16" /> {{ item }}
              </li>
            </ul>
          </article>

          <article class="cartao suporte">
            <h2><Lightbulb :size="18" /> Áreas de suporte</h2>

            <ul>
              <li v-for="item in dados.areas_suporte" :key="item">
                <span class="ponto" /> {{ item }}
              </li>
            </ul>
          </article>
        </div>
      </section>

      <section class="atividades">
        <h2>Atividades adaptadas</h2>

        <article v-for="(atividade, i) in dados.atividades" :key="atividade.titulo" class="cartao atividade">
          <header>
            <span class="numero">{{ i + 1 }}</span>

            <div>
              <h3>{{ atividade.titulo }}</h3>
              <p class="objetivo">{{ atividade.objetivo }} · {{ duracaoDe(atividade) }}</p>
            </div>
          </header>

          <ol>
            <li v-for="passo in atividade.instrucoes" :key="passo">{{ passo }}</li>
          </ol>

          <p class="dica"><strong>Dica inclusiva:</strong> {{ atividade.dica_inclusiva }}</p>

          <div class="refinar no-print">
            <label :for="`ajuste-${i}`">É viável na sua sala com 30 alunos? O que você gostaria de adaptar?</label>

            <v-textarea
              :id="`ajuste-${i}`"
              v-model="ajustes[i]"
              auto-grow
              hide-details
              placeholder="Ex.: tenho pouco material e só 20 minutos de aula"
              rows="2"
              variant="outlined"
            />

            <v-btn
              class="mt-3"
              color="primary"
              :loading="refinando === i"
              variant="tonal"
              @click="refinar(i)"
            >
              Melhorar meu pedido
            </v-btn>

            <div v-if="prompts[i]" class="prompt">
              <strong>Prompt melhorado — use em qualquer IA:</strong>
              <p>{{ prompts[i] }}</p>
              <v-btn size="small" variant="text" @click="copiar(prompts[i])">Copiar prompt</v-btn>
            </div>
          </div>
        </article>
      </section>

      <aside class="cartao autonomia">
        <img alt="" :src="pensandoUrl">

        <div>
          <h2>Dica de autonomia</h2>
          <p>{{ dados.dica_autonomia }}</p>
        </div>
      </aside>

      <footer class="disclaimer" role="note">
        {{ relatorio?.disclaimer || DISCLAIMER_PADRAO }}
      </footer>
    </template>
  </div>
</template>

<style scoped>
.relatorio { max-width: 1040px; margin: 0 auto; color: #263d35; font-family: Poppins, sans-serif; }
.topo { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.voltar { display: inline-flex; align-items: center; gap: .25rem; background: none; border: 0; color: #356b5b; font: inherit; font-weight: 500; cursor: pointer; }
.estado { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 3rem 1rem; text-align: center; }
.estado img { width: min(260px, 70vw); }
.hero { padding: 2rem; border-radius: 24px; background: #356b5b; color: #f7f7f1; margin-bottom: 1.25rem; }
.hero h1 { margin: .25rem 0 .5rem; font-size: clamp(1.5rem, 4vw, 2rem); font-weight: 600; }
.hero p { margin: 0; max-width: 62ch; line-height: 1.6; opacity: .92; }
.eyebrow { font-size: .75rem; letter-spacing: .08em; text-transform: uppercase; color: #e3b477; font-weight: 600; }
.grade { display: grid; gap: 1.25rem; grid-template-columns: 1fr; margin-bottom: 1.25rem; }
@media (min-width: 840px) { .grade { grid-template-columns: 1.1fr 1fr; } }
.coluna { display: grid; gap: 1.25rem; align-content: start; }
.cartao { padding: 1.25rem 1.5rem; border-radius: 20px; background: #fff; border: 1px solid #dfe8e0; break-inside: avoid; }
.cartao h2 { display: flex; align-items: center; gap: .5rem; margin: 0 0 .75rem; font-size: 1.05rem; font-weight: 600; }
.cartao ul { margin: 0; padding: 0; list-style: none; display: grid; gap: .5rem; }
.cartao li { display: flex; align-items: flex-start; gap: .5rem; line-height: 1.5; }
.fortes { background: #eef5f0; border-color: #a9c7b4; }
.fortes li svg { color: #356b5b; flex: none; margin-top: .2rem; }
.suporte { background: #fbf3e6; border-color: #e3b477; }
.ponto { flex: none; width: 8px; height: 8px; margin-top: .55rem; border-radius: 50%; background: #e3b477; }
.atividades { display: grid; gap: 1rem; margin-bottom: 1.25rem; }
.atividades > h2 { margin: 0; font-size: 1.25rem; font-weight: 600; }
.atividade header { display: flex; gap: .85rem; align-items: center; margin-bottom: .75rem; }
.atividade h3 { margin: 0; font-size: 1rem; font-weight: 600; }
.objetivo { margin: 0; font-size: .85rem; color: #52695f; }
.numero { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 50%; background: #356b5b; color: #fff; font-weight: 600; flex: none; }
.atividade ol { margin: 0 0 .75rem; padding-left: 1.25rem; list-style: decimal; line-height: 1.6; }
.dica { margin: 0; padding: .75rem 1rem; border-radius: 12px; background: #f7f7f1; font-size: .9rem; }
.refinar { margin-top: 1rem; padding-top: 1rem; border-top: 1px dashed #a9c7b4; }
.refinar label { display: block; margin-bottom: .5rem; font-size: .875rem; font-weight: 500; }
.prompt { margin-top: 1rem; padding: 1rem; border-radius: 12px; background: #eef5f0; font-size: .875rem; line-height: 1.55; }
.prompt p { margin: .35rem 0; }
.autonomia { display: flex; align-items: center; gap: 1rem; background: #f7f7f1; margin-bottom: 1.25rem; }
.autonomia img { width: 96px; flex: none; }
.autonomia h2 { margin-bottom: .25rem; }
.autonomia p { margin: 0; line-height: 1.6; }
.disclaimer { padding: 1rem 1.25rem; border-radius: 12px; background: #fff; border-left: 4px solid #e3b477; font-size: .85rem; line-height: 1.5; margin-bottom: 2rem; }

@media print {
  .no-print { display: none !important; }
  .hero { background: #fff; color: #263d35; border: 1px solid #a9c7b4; }
  .hero p { opacity: 1; }
  .cartao { break-inside: avoid; }
}
</style>
