<template>
  <Teleport to="body">
    <div
      v-if="aberto"
      class="fundo"
      role="presentation"
      @click.self="fechar"
    >
      <div class="painel">
        <section
          aria-labelledby="aluno-detalhes-titulo"
          aria-modal="true"
          class="cartao"
          role="dialog"
        >
          <!-- Cabeçalho do modal -->
          <header class="topo">
            <h2 id="aluno-detalhes-titulo">Detalhes do aluno</h2>

            <button
              aria-label="Fechar detalhes do aluno"
              class="btn-fechar"
              type="button"
              @click="fechar"
            >
              <X :size="20" />
            </button>
          </header>

          <div class="corpo">
            <!-- Seção de Identificação do Aluno -->
            <section class="identificacao">
              <!-- Aluno não tem foto (privacidade): sempre o avatar padrão da Marsupi -->
              <div class="aluno-avatar-bloco">
                <div class="avatar-caixa">
                  <img
                    alt=""
                    class="avatar-img avatar-img--padrao"
                    :src="avatarPadraoUrl"
                  >
                </div>
              </div>

              <!-- Dados textuais do aluno -->
              <div class="aluno-dados-bloco">
                <h3 class="aluno-nome">{{ aluno.nome }}</h3>
                <p class="aluno-sub">{{ turmaNome }} · {{ turno }}</p>

                <div class="aluno-acoes-linha">
                  <span class="status-pilula">
                    {{ isFeminino ? 'Aluna ativa' : 'Aluno ativo' }}
                  </span>
                </div>
              </div>
            </section>

            <!-- Pontos de atenção no Desktop (visível no topo no desktop conforme print de referência) -->
            <section
              v-show="abaAtiva === 'visao_geral'"
              aria-labelledby="pontos-titulo-desktop"
              class="bloco pontos-bloco pontos-bloco--desktop"
            >
              <div class="pontos-topo">
                <h4 id="pontos-titulo-desktop">Pontos de atenção</h4>

                <button
                  class="btn-copiar-link-laudo"
                  :title="linkCopiado ? 'Link copiado!' : 'Copiar link de envio de laudo para os pais'"
                  type="button"
                  @click="copiarLinkLaudo"
                >
                  <component :is="linkCopiado ? Check : Copy" :size="13" />
                  {{ linkCopiado ? 'Link copiado!' : 'Copiar link de envio de laudo' }}
                </button>
              </div>

              <div v-if="pontosAtencaoLista.length > 0" class="pontos-lista">
                <article
                  v-for="ponto in pontosAtencaoLista"
                  :key="ponto.id"
                  class="ponto"
                >
                  <span aria-hidden="true" class="ponto-icone">!</span>

                  <div class="ponto-info">
                    <h5>{{ ponto.titulo }}</h5>
                    <p>{{ ponto.descricao }}</p>
                    <small v-if="ponto.subtexto">{{ ponto.subtexto }}</small>
                  </div>
                </article>
              </div>

              <p v-else class="texto-vazio">
                Nenhum ponto de atenção identificado no momento.
              </p>
            </section>

            <!-- LGPD: o painel não exibe matrícula, data de nascimento nem idade do aluno; só o nome. -->

            <!-- Abas Visão Geral / Registros -->
            <div aria-label="Seções do aluno" class="abas-navegacao" role="tablist">
              <button
                id="tab-visao-geral"
                aria-controls="painel-visao-geral"
                :aria-selected="abaAtiva === 'visao_geral'"
                class="aba-btn"
                :class="{ 'aba-btn--ativa': abaAtiva === 'visao_geral' }"
                role="tab"
                type="button"
                @click="abaAtiva = 'visao_geral'"
              >
                Visão geral
              </button>

              <button
                id="tab-registros"
                aria-controls="painel-registros"
                :aria-selected="abaAtiva === 'registros'"
                class="aba-btn"
                :class="{ 'aba-btn--ativa': abaAtiva === 'registros' }"
                role="tab"
                type="button"
                @click="abaAtiva = 'registros'"
              >
                Registros
              </button>
            </div>

            <!-- Conteúdo da Aba Visão Geral -->
            <div
              v-show="abaAtiva === 'visao_geral'"
              id="painel-visao-geral"
              aria-labelledby="tab-visao-geral"
              class="painel-aba"
              role="tabpanel"
            >
              <!-- Seção de Acompanhamento -->
              <section class="bloco acompanhamento">
                <h4>Acompanhamento</h4>

                <p v-if="perfilApoio?.observacoes">
                  {{ perfilApoio.observacoes }}
                </p>

                <div
                  v-if="perfilApoio?.estrategias && perfilApoio.estrategias.length > 0"
                  class="acompanhamento-estrategias"
                >
                  <strong>Estratégias pedagógicas recomendadas:</strong>

                  <ul>
                    <li v-for="(est, idx) in perfilApoio.estrategias" :key="idx">
                      {{ est }}
                    </li>
                  </ul>
                </div>

                <p
                  v-if="!perfilApoio?.observacoes && (!perfilApoio?.estrategias || perfilApoio.estrategias.length === 0)"
                  class="texto-vazio"
                >
                  Sem registros de acompanhamento específicos para este aluno.
                </p>
              </section>

              <!-- Bloco de Habilidades a reforçar -->
              <section aria-labelledby="habilidades-aluno-titulo" class="bloco habilidades-bloco">
                <div class="habilidades-topo">
                  <h4 id="habilidades-aluno-titulo">
                    Habilidades a reforçar
                    <span v-if="habilidadesAReforcar.length > 0" class="badge-contador">
                      {{ habilidadesAReforcar.length }}
                    </span>
                  </h4>
                </div>

                <div v-if="carregandoHabilidades" class="texto-vazio">
                  Carregando habilidades...
                </div>

                <div v-else-if="erroConsentimento" class="texto-vazio">
                  Análise pedagógica indisponível: autorização pendente dos responsáveis (LGPD Art. 14).
                </div>

                <div v-else-if="temHabilidades" class="habilidades-conteudo">
                  <!-- Habilidades a reforçar identificadas -->
                  <div v-if="habilidadesAReforcar.length > 0" class="habilidades-grupo">
                    <ul class="habilidades-lista">
                      <li
                        v-for="hab in habilidadesAReforcar"
                        :key="hab.codigo"
                        class="habilidade-item habilidade-item--reforcar"
                      >
                        <div class="habilidade-info">
                          <div class="habilidade-tags">
                            <span class="habilidade-codigo">{{ hab.codigo }}</span>
                            <span class="habilidade-area">{{ hab.area }}</span>
                            <span v-if="hab.em_reforco" class="habilidade-status-reforco">Em reforço</span>
                          </div>

                          <span class="habilidade-nome">{{ hab.nome }}</span>
                        </div>

                        <div class="habilidade-contagem">
                          <span class="habilidade-badge">
                            {{ hab.trabalhos_a_reforcar }} {{ hab.trabalhos_a_reforcar === 1 ? 'trabalho mostrou' : 'trabalhos mostraram' }}
                          </span>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <!-- Habilidades já demonstradas -->
                  <div v-if="habilidadesDemonstradas.length > 0" class="habilidades-grupo mt-4">
                    <h5 class="habilidades-subtitulo">Habilidades já demonstradas</h5>

                    <ul class="habilidades-lista">
                      <li
                        v-for="hab in habilidadesDemonstradas"
                        :key="hab.codigo"
                        class="habilidade-item habilidade-item--demonstrada"
                      >
                        <div class="habilidade-info">
                          <div class="habilidade-tags">
                            <span class="habilidade-codigo">{{ hab.codigo }}</span>
                            <span class="habilidade-area">{{ hab.area }}</span>
                          </div>

                          <span class="habilidade-nome">{{ hab.nome }}</span>
                        </div>

                        <div class="habilidade-contagem">
                          <span class="habilidade-badge habilidade-badge--demonstrada">
                            {{ hab.trabalhos_demonstrada }} {{ hab.trabalhos_demonstrada === 1 ? 'trabalho demonstrou' : 'trabalhos demonstraram' }}
                          </span>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>

                <p v-else class="texto-vazio">
                  Envie pelo menos 2 trabalhos para ver as habilidades.
                </p>
              </section>

              <!-- Seção de Atividades -->
              <section class="bloco atividades-bloco">
                <div class="atividades-topo">
                  <h4>
                    Atividades
                    <span class="badge-contador">{{ atividades.length }}</span>
                  </h4>
                </div>

                <div v-if="atividades.length > 0" class="atividades-lista">
                  <article
                    v-for="atividade in atividades"
                    :key="atividade.id"
                    class="atividade-card"
                  >
                    <div class="atividade-cabecalho">
                      <FileText class="atividade-icone" :size="20" />

                      <div class="atividade-titulos">
                        <h5>{{ atividade.titulo || atividade.nome }}</h5>
                        <span class="atividade-data">Enviada em {{ formatarData(atividade.created_at) }}</span>
                      </div>
                    </div>

                    <p class="atividade-desc">{{ atividade.descricao }}</p>

                    <div class="atividade-rodape">
                      <span class="relatorio-ok">
                        <Check :size="15" /> Relatório disponível
                      </span>

                      <button
                        class="btn-exportar-relatorio"
                        type="button"
                        @click="exportarRelatorio(atividade)"
                      >
                        <Download :size="15" /> Exportar relatório
                      </button>
                    </div>
                  </article>
                </div>

                <p v-else class="texto-vazio">
                  Nenhuma atividade cadastrada para esta turma.
                </p>
              </section>
            </div>

            <!-- Conteúdo da Aba Registros -->
            <div
              v-show="abaAtiva === 'registros'"
              id="painel-registros"
              aria-labelledby="tab-registros"
              class="painel-aba"
              role="tabpanel"
            >
              <section aria-labelledby="pontos-titulo-registros" class="bloco pontos-bloco">
                <div class="pontos-topo">
                  <h4 id="pontos-titulo-registros">Pontos de atenção</h4>

                  <button
                    class="btn-copiar-link-laudo"
                    :title="linkCopiado ? 'Link copiado!' : 'Copiar link de envio de laudo para os pais'"
                    type="button"
                    @click="copiarLinkLaudo"
                  >
                    <component :is="linkCopiado ? Check : Copy" :size="13" />
                    {{ linkCopiado ? 'Link copiado!' : 'Copiar link de envio de laudo' }}
                  </button>
                </div>

                <div v-if="pontosAtencaoLista.length > 0" class="pontos-lista">
                  <article
                    v-for="ponto in pontosAtencaoLista"
                    :key="ponto.id"
                    class="ponto"
                  >
                    <span aria-hidden="true" class="ponto-icone">!</span>

                    <div class="ponto-info">
                      <h5>{{ ponto.titulo }}</h5>
                      <p>{{ ponto.descricao }}</p>
                      <small v-if="ponto.subtexto">{{ ponto.subtexto }}</small>
                    </div>
                  </article>
                </div>

                <p v-else class="texto-vazio">
                  Nenhum ponto de atenção identificado no momento.
                </p>
              </section>
            </div>
          </div>

          <!-- Rodapé de Ações -->
          <footer class="rodape">
            <button class="btn-remover-aluno" type="button" @click="confirmarRemocao = true">
              <Trash2 :size="16" /> Remover da turma
            </button>

            <p class="rodape-aviso">
              {{ atividades.length > 0 ? 'Exporte os relatórios das atividades em conjunto.' : 'Nenhuma atividade disponível para exportação.' }}
            </p>

            <button
              class="btn-principal"
              :disabled="relatorios.length === 0 || exportando"
              type="button"
              @click="exportarTodas"
            >
              <Download :size="18" /> Exportar todas as atividades
            </button>
          </footer>
        </section>

        <!-- Patinha apoiada na borda do painel -->
        <div aria-hidden="true" class="patinha-borda">
          <div class="patinha-animada">
            <svg class="patinha-svg" viewBox="-70 -100 170 200">
              <g transform="rotate(-90)">
                <MascotePata :x="0" :y="0" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <v-dialog v-model="confirmarRemocao" max-width="440">
    <v-card class="pa-6" rounded="lg">
      <h2 class="text-h6 mb-2">Remover {{ aluno.nome }} da turma?</h2>
      <p class="mb-5">O estudante sai da lista, dos grupos e das próximas versões de atividade.</p>

      <div class="d-flex justify-end ga-2">
        <v-btn :disabled="removendo" variant="text" @click="confirmarRemocao = false">Cancelar</v-btn>
        <v-btn color="error" :loading="removendo" @click="removerAluno">Remover</v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import type { Aluno, HabilidadeAluno, Observacao, PerfilApoio, PontoAtencaoItem } from '@/interfaces/aluno'
  import type { Atividade } from '@/interfaces/atividade'

  import { Check, Copy, Download, FileText, Trash2, X } from '@lucide/vue'
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
  import avatarPadraoUrl from '@/assets/mascotes/avatar.svg'
  import { alunosService, observacoesService, type RelatorioDoAluno } from '@/services/alunos'
  import { atividadesService } from '@/services/atividades'
  import { pedagogicoService } from '@/services/pedagogico'
  import { useAlunosStore } from '@/stores'
  import { notify } from '@/utils/notify'

  interface PontoExibicao {
    id: string | number
    titulo: string
    descricao: string
    subtexto?: string
  }

  const props = defineProps<{
    aluno: Aluno
    aberto: boolean
    turmaNome: string
    turno: string
  }>()

  const emit = defineEmits<{
    fechar: []
    removido: [id: number]
  }>()

  const abaAtiva = ref<'visao_geral' | 'registros'>('visao_geral')

  const isFeminino = computed(() => {
    if (props.aluno.genero === 'F') return true
    const primeiroNome = props.aluno.nome.trim().split(' ', 1)[0].toLowerCase()
    return primeiroNome.endsWith('a') || primeiroNome === 'alice' || primeiroNome === 'beatriz'
  })

  const atividades = ref<Atividade[]>([])
  const observacoes = ref<Observacao[]>([])
  const perfilApoio = ref<PerfilApoio | null>(null)
  const pontosIa = ref<PontoAtencaoItem[]>([])
  const habilidades = ref<HabilidadeAluno[]>([])
  const carregandoHabilidades = ref(false)
  const erroConsentimento = ref(false)

  const habilidadesAReforcar = computed(() =>
    habilidades.value.filter(h => h.trabalhos_a_reforcar > 0),
  )

  const habilidadesDemonstradas = computed(() =>
    habilidades.value.filter(h => h.trabalhos_demonstrada > 0),
  )

  const temHabilidades = computed(() =>
    habilidadesAReforcar.value.length > 0 || habilidadesDemonstradas.value.length > 0,
  )

  const pontosAtencaoLista = computed<PontoExibicao[]>(() => {
    const lista: PontoExibicao[] = []

    // 1. Necessidades vindas do perfil de apoio (laudo cadastrado)
    if (perfilApoio.value?.necessidades) {
      for (const [idx, nec] of perfilApoio.value.necessidades.entries()) {
        lista.push({
          id: `perfil-${idx}-${nec}`,
          titulo: nec,
          descricao: 'Necessidade identificada para adaptação pedagógica.',
          subtexto: 'Perfil de apoio',
        })
      }
    }

    // 2. Pontos de atenção pedagógicos calculados pela IA a partir dos trabalhos
    if (pontosIa.value.length > 0) {
      for (const [idx, p] of pontosIa.value.entries()) {
        lista.push({
          id: `ia-${idx}-${p.padrao}`,
          titulo: p.padrao,
          descricao: p.texto,
          subtexto: p.base_pedagogica ? `Pedagógico · ${p.base_pedagogica}` : 'Análise pedagógica',
        })
      }
    }

    // 3. Observações registradas pelo professor
    for (const obs of observacoes.value) {
      const parts = [
        obs.visibilidade,
        formatarData(obs.created_at),
      ].filter(Boolean)
      lista.push({
        id: `obs-${obs.id}`,
        titulo: obs.titulo || 'Observação',
        descricao: obs.descricao,
        subtexto: parts.length > 0 ? parts.join(' · ') : undefined,
      })
    }

    return lista
  })

  function formatarData (iso?: string | null): string {
    return iso ? new Date(iso).toLocaleDateString('pt-BR') : '—'
  }

  async function carregar () {
    carregandoHabilidades.value = true
    erroConsentimento.value = false

    const [ativ, obs, perfil, pontos, rels, habs] = await Promise.allSettled([
      atividadesService.list({ turma: props.aluno.turma }),
      observacoesService.list({ aluno: props.aluno.id }),
      pedagogicoService.obterPerfilApoio(props.aluno.id),
      alunosService.obterPontosAtencao(props.aluno.id),
      alunosService.listarRelatorios(props.aluno.id),
      alunosService.obterHabilidades(props.aluno.id),
    ])

    atividades.value = ativ.status === 'fulfilled' ? ativ.value.results : []
    observacoes.value = obs.status === 'fulfilled' ? obs.value.results : []
    perfilApoio.value = perfil.status === 'fulfilled' ? perfil.value : null
    pontosIa.value = pontos.status === 'fulfilled' ? (pontos.value.pontos ?? []) : []
    relatorios.value = rels.status === 'fulfilled' ? rels.value : []

    if (habs.status === 'fulfilled') {
      habilidades.value = habs.value
    } else {
      habilidades.value = []
      const err = habs.reason as { status?: number, response?: { status?: number } } | undefined
      if (err?.status === 403 || err?.response?.status === 403) {
        erroConsentimento.value = true
      }
    }
    carregandoHabilidades.value = false
  }

  // Relatórios do aluno vêm de /alunos/{id}/relatorios/; a API de atividade não os traz.
  const relatorios = ref<RelatorioDoAluno[]>([])
  const exportando = ref(false)

  async function exportarRelatorio (ativ: Atividade) {
    const relatorio = relatorios.value.find(r => r.atividade === ativ.id)
    if (!relatorio) {
      notify.info('Ainda não há relatório desta atividade para este aluno.')
      return
    }
    try {
      await pedagogicoService.downloadPdf(relatorio.id, `relatorio-${ativ.titulo || ativ.id}`)
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Não foi possível baixar o relatório.')
    }
  }

  async function exportarTodas () {
    if (relatorios.value.length === 0) {
      notify.info('Este aluno ainda não tem relatórios para exportar.')
      return
    }
    exportando.value = true
    try {
      await alunosService.baixarRelatoriosPdf(props.aluno.id, `relatorios-aluno-${props.aluno.id}`)
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Não foi possível baixar os relatórios.')
    } finally {
      exportando.value = false
    }
  }

  const linkCopiado = ref(false)
  const gerandoLink = ref(false)

  // O link leva só o código de acesso (sem id nem nome do aluno na URL). Cada cópia gera um
  // código novo e invalida o anterior; o responsável usa uma vez e ganha uma sessão de 24h.
  async function copiarLinkLaudo () {
    if (gerandoLink.value || typeof window === 'undefined') return
    gerandoLink.value = true
    try {
      const codigo = await alunosService.gerarCodigoAcesso(props.aluno.id)
      const url = `${window.location.origin}/apoio/concordar?${new URLSearchParams({ codigo })}`
      await navigator.clipboard.writeText(url)
      linkCopiado.value = true
      notify.success('Link para envio de laudo copiado! Ele vale 7 dias e pode ser usado uma vez.')
      setTimeout(() => {
        linkCopiado.value = false
      }, 3000)
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Não foi possível copiar o link.')
    } finally {
      gerandoLink.value = false
    }
  }

  function fechar () {
    emit('fechar')
  }

  // Remove o estudante da turma (exclusão lógica no back; some da lista e dos grupos).
  const alunosStore = useAlunosStore()
  const confirmarRemocao = ref(false)
  const removendo = ref(false)

  async function removerAluno () {
    if (removendo.value) return
    removendo.value = true
    try {
      await alunosStore.removeAluno(props.aluno.id)
      notify.success(`${props.aluno.nome} saiu da turma.`)
      confirmarRemocao.value = false
      emit('removido', props.aluno.id)
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Não foi possível remover o estudante.')
    } finally {
      removendo.value = false
    }
  }

  function aoTeclar (evento: KeyboardEvent) {
    if (evento.key === 'Escape') fechar()
  }

  onMounted(() => {
    document.addEventListener('keydown', aoTeclar)
    void carregar()
  })

  onBeforeUnmount(() => {
    document.removeEventListener('keydown', aoTeclar)
  })
</script>

<style scoped>
.btn-remover-aluno {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-right: auto;
  padding: 6px 4px;
  border: 0;
  background: none;
  color: #a23b2a;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
}

.btn-remover-aluno:hover,
.btn-remover-aluno:focus-visible {
  text-decoration: underline;
}

.fundo {
  position: fixed;
  z-index: 1000;
  inset: 0;
  background: rgb(22 36 28 / 40%);
  backdrop-filter: blur(2px);
  animation: fundo-entra 0.25s ease both;
}

/* Painel flutuante com respiro das bordas */
.painel {
  position: absolute;
  inset: 16px 16px 16px auto;
  width: min(480px, calc(100vw - 32px));
  animation: painel-entra 0.45s var(--ease-out-expo, cubic-bezier(.16, 1, .3, 1)) both;
}

.cartao {
  position: relative;
  z-index: 1;
  display: flex;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 16px 48px rgb(22 36 28 / 18%);
  color: #1a3628;
  font-family: Poppins, sans-serif;
}

/* Patinha do mascote apoiada na borda do painel */
.patinha-borda {
  position: absolute;
  top: 130px;
  left: -24px;
  width: 58px;
  height: 68px;
  z-index: 2;
  pointer-events: none;
  animation: patinha-entra 0.4s 0.2s cubic-bezier(0.3, 1.5, 0.5, 1) both;
}

.patinha-animada {
  width: 100%;
  height: 100%;
  transform-origin: 0% 50%;
  animation: pata-acena 3.2s 1s ease-in-out infinite;
}

.patinha-svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}

/* Topo do modal */
.topo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 1.5rem;
  padding: 1.25rem 0 1rem;
  border-bottom: 1px solid #e3ece6;
}

.topo h2 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #1a3628;
}

.btn-fechar {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 0;
  border-radius: 10px;
  background: #eef5f0;
  color: #1a3628;
  cursor: pointer;
  transition: background-color 0.2s, rotate 0.3s;
}

.btn-fechar:hover {
  background: #dfeae2;
  rotate: 90deg;
}

/* Corpo com rolagem suave */
.corpo {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem 1.5rem;
}

/* Seção de Identificação */
.identificacao {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 1.25rem;
}

.aluno-avatar-bloco {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 0.6rem;
}

.avatar-caixa {
  position: relative;
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: #eaf2ed;
  display: grid;
  place-items: center;
  border: 3px solid #fff;
  box-shadow: 0 0 0 1px #dfeae2, 0 8px 18px -10px rgb(38 61 53 / 40%);
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.aluno-dados-bloco {
  display: flex;
  flex-direction: column;
}

.aluno-nome {
  margin: 0.2rem 0 0.15rem;
  font-size: 1.4rem;
  font-weight: 700;
  color: #1a3628;
}

.aluno-sub {
  margin: 0 0 0.65rem;
  color: #52695f;
  font-size: 0.85rem;
}

.aluno-acoes-linha {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.status-pilula {
  background: #eef5f0;
  color: #356b5b;
  border-radius: 16px;
  padding: 5px 14px;
  font-size: 0.76rem;
  font-weight: 600;
}

/* Pontos de atenção */
.pontos-bloco {
  margin-bottom: 1.25rem;
}

.pontos-topo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.65rem;
}

.pontos-topo h4 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #1a3628;
}

.btn-copiar-link-laudo {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: 0;
  background: none;
  padding: 4px 6px;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.74rem;
  font-weight: 600;
  color: #274d3d;
  cursor: pointer;
  transition: color 0.2s, background-color 0.2s;
}

.btn-copiar-link-laudo:hover {
  color: #356b5b;
  background-color: #eef5f0;
  text-decoration: underline;
}

.btn-copiar-link-laudo:focus-visible {
  outline: 2px solid #274d3d;
  outline-offset: 2px;
}

.pontos-lista {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.ponto {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  padding: 0.8rem 1rem;
  border: 1px solid #dfe8e0;
  border-radius: 12px;
  background: #ffffff;
}

.ponto-icone {
  display: grid;
  width: 26px;
  height: 26px;
  flex: none;
  place-items: center;
  border-radius: 50%;
  background: #eef5f0;
  color: #356b5b;
  font-size: 0.82rem;
  font-weight: 700;
  margin-top: 2px;
}

.ponto-info h5 {
  margin: 0;
  font-size: 0.88rem;
  font-weight: 600;
  color: #1a3628;
}

.ponto-info p {
  margin: 0.15rem 0 0.25rem;
  color: #52695f;
  font-size: 0.78rem;
  line-height: 1.4;
}

.ponto-info small {
  color: #7a9489;
  font-size: 0.7rem;
}

.pontos-bloco--desktop {
  display: block;
}

/* Abas de navegação */
.abas-navegacao {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  padding: 4px;
  background: #eef5f0;
  border-radius: 12px;
  margin: 0.75rem 0 1.25rem;
  box-sizing: border-box;
}

.aba-btn {
  border: 0;
  background: transparent;
  padding: 8px 12px;
  border-radius: 9px;
  font-family: inherit;
  font-size: 0.88rem;
  font-weight: 500;
  color: #52695f;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.aba-btn:hover {
  color: #1a3628;
}

.aba-btn--ativa {
  background: #ffffff;
  color: #1a3628;
  font-weight: 600;
  box-shadow: 0 1px 4px rgb(26 54 40 / 8%);
}

.painel-aba {
  display: flex;
  flex-direction: column;
}

/* Acompanhamento */
.acompanhamento {
  margin-bottom: 1.25rem;
}

.acompanhamento h4 {
  margin: 0 0 0.4rem;
  font-size: 1.05rem;
  font-weight: 700;
  color: #1a3628;
}

.acompanhamento p {
  margin: 0;
  font-size: 0.82rem;
  color: #52695f;
  line-height: 1.45;
}

.acompanhamento-estrategias {
  margin-top: 0.6rem;
  font-size: 0.82rem;
  color: #52695f;
}

.acompanhamento-estrategias strong {
  display: block;
  color: #1a3628;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.acompanhamento-estrategias ul {
  margin: 0 0 0 1.2rem;
  padding: 0;
  list-style-type: disc;
}

.acompanhamento-estrategias li {
  margin-bottom: 0.2rem;
  line-height: 1.4;
}

.texto-vazio {
  margin: 0;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  background-color: #f7faf8;
  border: 1px dashed #d5e2d9;
  color: #698276;
  font-size: 0.82rem;
  text-align: center;
}

/* Habilidades */
.habilidades-bloco {
  margin-bottom: 1.25rem;
}

.habilidades-topo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.habilidades-topo h4 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #1a3628;
  display: flex;
  align-items: center;
  gap: 6px;
}

.habilidades-conteudo {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.habilidades-subtitulo {
  margin: 0 0 0.5rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: #356b5b;
}

.habilidades-lista {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.habilidade-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 0.9rem;
  border-radius: 12px;
  border: 1px solid #e1eee6;
  background-color: #fff;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.habilidade-item:hover {
  border-color: #b5d7c3;
  box-shadow: 0 2px 6px rgb(53 107 91 / 6%);
}

.habilidade-item--reforcar {
  border-left: 4px solid #d97706;
}

.habilidade-item--demonstrada {
  border-left: 4px solid #356b5b;
  background-color: #fafcfb;
}

.habilidade-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.habilidade-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.habilidade-codigo {
  font-family: monospace;
  font-size: 0.75rem;
  font-weight: 700;
  color: #356b5b;
  background-color: #eef5f0;
  padding: 1px 6px;
  border-radius: 4px;
}

.habilidade-area {
  font-size: 0.72rem;
  color: #698276;
}

.habilidade-status-reforco {
  font-size: 0.7rem;
  font-weight: 600;
  color: #b45309;
  background-color: #fef3c7;
  padding: 1px 6px;
  border-radius: 4px;
}

.habilidade-nome {
  font-size: 0.82rem;
  color: #1a3628;
  font-weight: 600;
  line-height: 1.35;
}

.habilidade-contagem {
  flex-shrink: 0;
}

.habilidade-badge {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 8px;
  background-color: #fef3c7;
  color: #92400e;
}

.habilidade-badge--demonstrada {
  background-color: #eef7f2;
  color: #274d3d;
}

/* Atividades */
.atividades-bloco {
  margin-bottom: 1.25rem;
}

.atividades-topo {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
}

.atividades-topo h4 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #1a3628;
  display: flex;
  align-items: center;
  gap: 6px;
}

.badge-contador {
  background: #eef5f0;
  color: #356b5b;
  border-radius: 12px;
  padding: 1px 7px;
  font-size: 0.75rem;
  font-weight: 600;
}

.atividades-lista {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.atividade-card {
  border: 1px solid #dfe8e0;
  border-radius: 12px;
  padding: 0.95rem 1.1rem;
  background: #ffffff;
}

.atividade-cabecalho {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.atividade-icone {
  color: #274d3d;
  flex-shrink: 0;
  margin-top: 1px;
}

.atividade-titulos h5 {
  margin: 0;
  font-size: 0.92rem;
  font-weight: 600;
  color: #1a3628;
}

.atividade-data {
  font-size: 0.7rem;
  color: #7a9489;
}

.atividade-desc {
  margin: 0.5rem 0 0.75rem;
  font-size: 0.8rem;
  color: #52695f;
  line-height: 1.4;
}

.atividade-rodape {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.4rem;
}

.relatorio-ok {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.78rem;
  font-weight: 500;
  color: #274d3d;
}

.btn-exportar-relatorio {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: none;
  color: #3d5a4c;
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  padding: 2px 4px;
  transition: color 0.2s;
}

.btn-exportar-relatorio:hover {
  color: #274d3d;
  text-decoration: underline;
}

/* Rodapé */
.rodape {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin: 0 1.5rem;
  padding: 1rem 0 1.25rem;
  border-top: 1px solid #e3ece6;
  text-align: center;
}

.rodape-aviso {
  margin: 0;
  color: #6c8277;
  font-size: 0.75rem;
}

.btn-principal {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 48px;
  border-radius: 12px;
  border: 0;
  background: #274d3d;
  color: #fff;
  font: inherit;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-principal:hover {
  background: #356b5b;
}

.btn-principal:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #739083;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}

@keyframes fundo-entra {
  from { opacity: 0; }
}

@keyframes painel-entra {
  from { opacity: 0; translate: 48px 0; }
}

@keyframes patinha-entra {
  from {
    opacity: 0;
    translate: 16px 0;
  }
  to {
    opacity: 1;
    translate: 0 0;
  }
}

@keyframes pata-acena {
  0%, 60%, 100% {
    rotate: 0deg;
  }
  70%, 90% {
    rotate: -10deg;
  }
  80% {
    rotate: -3deg;
  }
}

@media (max-width: 640px) {
  .patinha-borda {
    display: none;
  }

  .painel {
    inset: 8px;
    width: auto;
  }

  /* Identificação lado a lado com avatar (conforme print mobile) */
  .identificacao {
    flex-direction: row;
    align-items: flex-start;
    text-align: left;
    gap: 16px;
    margin-bottom: 1rem;
  }

  .aluno-avatar-bloco {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }

  .aluno-avatar-bloco .avatar-caixa {
    width: 82px;
    height: 82px;
  }

  .aluno-dados-bloco {
    justify-content: center;
    min-height: 82px;
  }

  .aluno-nome {
    font-size: 1.25rem;
    margin: 0 0 2px;
  }

  .aluno-sub {
    font-size: 0.82rem;
    margin: 0 0 8px;
  }

  .aluno-acoes-linha {
    justify-content: flex-start;
  }

  /* Pontos de atenção no topo ficam ocultos no mobile (exibidos na aba Registros) */
  .pontos-bloco--desktop {
    display: none;
  }

  /* Atividades no mobile conforme referência */
  .relatorio-ok {
    display: none;
  }

  .atividade-rodape {
    padding-top: 0.6rem;
    border-top: 1px solid #f0f4f1;
  }

  .btn-exportar-relatorio {
    padding: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .fundo,
  .painel,
  .patinha-borda,
  .patinha-animada {
    animation: none;
  }
}
</style>
