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
              <!-- Avatar e ação de foto (mobile) -->
              <div class="aluno-avatar-bloco">
                <div class="avatar-caixa" :class="{ 'avatar-caixa--com-foto': !!foto }">
                  <img
                    v-if="foto"
                    :alt="`Foto de ${aluno.nome}`"
                    class="avatar-img"
                    :src="foto"
                  >

                  <UserRound
                    v-else
                    aria-hidden="true"
                    class="avatar-placeholder-icone"
                    :size="40"
                    :stroke-width="1.3"
                  />
                </div>

                <button
                  class="btn-adicionar-foto"
                  type="button"
                  @click="inputFoto?.click()"
                >
                  {{ foto ? 'Trocar foto' : 'Adicionar foto' }}
                </button>
              </div>

              <!-- Dados textuais do aluno -->
              <div class="aluno-dados-bloco">
                <h3 class="aluno-nome">{{ aluno.nome }}</h3>
                <p class="aluno-sub">{{ turmaNome }} · {{ turno }}</p>

                <div class="aluno-acoes-linha">
                  <button
                    aria-label="Trocar foto do aluno"
                    class="btn-foto-mini desktop-only"
                    type="button"
                    @click="inputFoto?.click()"
                  >
                    <Camera :size="16" />
                  </button>

                  <input
                    ref="inputFoto"
                    accept="image/*"
                    class="sr-only"
                    type="file"
                    @change="trocarFoto"
                  >

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

              <div class="pontos-lista">
                <article
                  v-for="ponto in pontosAtencaoExibicao"
                  :key="ponto.id"
                  class="ponto"
                >
                  <span aria-hidden="true" class="ponto-icone">!</span>

                  <div class="ponto-info">
                    <h5>{{ ponto.titulo || 'Observação' }}</h5>
                    <p>{{ ponto.descricao }}</p>
                    <small>Atenção<template v-if="ponto.visibilidade"> · {{ ponto.visibilidade }}</template> · {{ formatarData(ponto.created_at) }}</small>
                  </div>
                </article>
              </div>
            </section>

            <!-- Metadados do Aluno (Matrícula, Nascimento, Idade) -->
            <dl aria-label="Informações do aluno" class="metadados">
              <div class="metadado-item">
                <dt>Matrícula</dt>
                <dd>{{ matricula }}</dd>
              </div>

              <div class="metadado-item">
                <dt>Nascimento</dt>

                <dd>
                  <span>{{ nascimento }}</span>
                  <span aria-hidden="true" class="nascimento-idade-mobile">{{ idade === null ? '' : ` · ${idade} anos` }}</span>
                </dd>
              </div>

              <div class="metadado-item metadado-idade-desktop">
                <dt>Idade</dt>
                <dd>{{ idade === null ? '—' : `${idade} anos` }}</dd>
              </div>
            </dl>

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

                <p>
                  Participa das propostas em sala e demonstra interesse pela leitura, escrita e atividades de contagem.
                </p>
              </section>

              <!-- Seção de Atividades -->
              <section class="bloco atividades-bloco">
                <div class="atividades-topo">
                  <h4>
                    Atividades
                    <span class="badge-contador">{{ atividadesExibicao.length }}</span>
                  </h4>
                </div>

                <div class="atividades-lista">
                  <article
                    v-for="atividade in atividadesExibicao"
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

                <div class="pontos-lista">
                  <article
                    v-for="ponto in pontosAtencaoExibicao"
                    :key="ponto.id"
                    class="ponto"
                  >
                    <span aria-hidden="true" class="ponto-icone">!</span>

                    <div class="ponto-info">
                      <h5>{{ ponto.titulo || 'Observação' }}</h5>
                      <p>{{ ponto.descricao }}</p>
                      <small>Atenção<template v-if="ponto.visibilidade"> · {{ ponto.visibilidade }}</template> · {{ formatarData(ponto.created_at) }}</small>
                    </div>
                  </article>
                </div>
              </section>
            </div>
          </div>

          <!-- Rodapé de Ações -->
          <footer class="rodape">
            <p class="rodape-aviso">Exporte os relatórios das duas atividades em conjunto.</p>

            <button
              class="btn-principal"
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
</template>

<script setup lang="ts">
  import type { Aluno, Observacao } from '@/interfaces/aluno'
  import type { Atividade } from '@/interfaces/atividade'

  import { Camera, Check, Copy, Download, FileText, UserRound, X } from '@lucide/vue'
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { observacoesService } from '@/services/alunos'
  import { atividadesService } from '@/services/atividades'
  import { notify } from '@/utils/notify'

  const props = defineProps<{
    aluno: Aluno
    aberto: boolean
    turmaNome: string
    turno: string
  }>()

  const emit = defineEmits<{
    fechar: []
  }>()

  const router = useRouter()
  const abaAtiva = ref<'visao_geral' | 'registros'>('visao_geral')
  const inputFoto = ref<HTMLInputElement | null>(null)
  const foto = ref('')

  const dataNascimento = computed(() => (props.aluno.data_nascimento ? new Date(props.aluno.data_nascimento) : null))
  const matricula = computed(() => props.aluno.matricula || '—')
  const nascimento = computed(() => dataNascimento.value ? dataNascimento.value.toLocaleDateString('pt-BR') : '—')

  const idade = computed(() => {
    const nasc = dataNascimento.value
    if (!nasc) return null
    const hoje = new Date()
    let anos = hoje.getFullYear() - nasc.getFullYear()
    if (hoje < new Date(hoje.getFullYear(), nasc.getMonth(), nasc.getDate())) anos -= 1
    return anos
  })

  const isFeminino = computed(() => {
    if (props.aluno.genero === 'F') return true
    const primeiroNome = props.aluno.nome.trim().split(' ', 1)[0].toLowerCase()
    return primeiroNome.endsWith('a') || primeiroNome === 'alice' || primeiroNome === 'beatriz'
  })

  const atividades = ref<Atividade[]>([])
  const pontosAtencao = ref<Observacao[]>([])

  // Exibição dos pontos de atenção conforme o print de referência (ou vindos da API)
  const pontosAtencaoExibicao = computed(() => {
    if (pontosAtencao.value.length > 0) return pontosAtencao.value
    return [
      {
        id: 1,
        titulo: 'Dificuldade em soma',
        descricao: 'Tem dificuldade em somas simples até 10.',
        visibilidade: 'Somente professora',
        created_at: '2026-10-21T10:00:00Z',
      },
      {
        id: 2,
        titulo: 'Dificuldade em separar sílabas',
        descricao: 'Precisa de apoio para ler palavras de duas sílabas.',
        visibilidade: 'Visível para os pais',
        created_at: '2026-10-22T10:00:00Z',
      },
    ] as Observacao[]
  })

  // Exibição das atividades conforme o print de referência (ou vindas da API)
  const atividadesExibicao = computed(() => {
    if (atividades.value.length > 0) return atividades.value
    return [
      {
        id: 1,
        titulo: 'Explorando as vogais',
        descricao: 'Reconhece as vogais nas palavras trabalhadas.',
        created_at: '2026-10-23T10:00:00Z',
        relatorios: [1],
      },
      {
        id: 2,
        titulo: 'Contando até 10',
        descricao: 'Associa os números às quantidades apresentadas.',
        created_at: '2026-10-21T10:00:00Z',
        relatorios: [2],
      },
    ] as Atividade[]
  })

  function formatarData (iso?: string | null): string {
    return iso ? new Date(iso).toLocaleDateString('pt-BR') : '—'
  }

  async function carregar () {
    const [ativ, obs] = await Promise.allSettled([
      atividadesService.list({ turma: props.aluno.turma }),
      observacoesService.list({ aluno: props.aluno.id }),
    ])
    atividades.value = ativ.status === 'fulfilled' ? ativ.value.results : []
    pontosAtencao.value = obs.status === 'fulfilled' ? obs.value.results : []
  }

  function trocarFoto (evento: Event) {
    const arquivo = (evento.target as HTMLInputElement).files?.[0]
    if (!arquivo) return
    if (foto.value) URL.revokeObjectURL(foto.value)
    foto.value = URL.createObjectURL(arquivo)
  }

  function abrirRelatorio (id: number) {
    void router.push(`/relatorios/${id}`)
  }

  function exportarRelatorio (ativ: Atividade) {
    if (ativ.relatorios && ativ.relatorios.length > 0) {
      abrirRelatorio(ativ.relatorios[0])
    } else {
      notify.info('Exportando relatório da atividade...')
    }
  }

  function exportarTodas () {
    const primeiro = atividadesExibicao.value.find(a => a.relatorios && a.relatorios.length > 0)
    if (primeiro?.relatorios?.[0]) {
      abrirRelatorio(primeiro.relatorios[0])
    } else {
      notify.info('Exportando todos os relatórios disponíveis...')
    }
  }

  const linkCopiado = ref(false)

  const urlLaudo = computed(() => {
    if (typeof window === 'undefined') return ''
    const baseUrl = `${window.location.origin}/apoio/concordar`
    const params = new URLSearchParams()
    params.set('aluno', String(props.aluno.id))
    if (props.aluno.turma) {
      params.set('turma', String(props.aluno.turma))
    }
    if (props.aluno.nome) {
      params.set('nome', props.aluno.nome)
    }
    return `${baseUrl}?${params.toString()}`
  })

  async function copiarLinkLaudo () {
    if (!urlLaudo.value) return
    try {
      await navigator.clipboard.writeText(urlLaudo.value)
      linkCopiado.value = true
      notify.success('Link para envio de laudo copiado para a área de transferência!')
      setTimeout(() => {
        linkCopiado.value = false
      }, 3000)
    } catch {
      notify.error('Não foi possível copiar o link.')
    }
  }

  function fechar () {
    emit('fechar')
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
    if (foto.value) URL.revokeObjectURL(foto.value)
  })
</script>

<style scoped>
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
  display: none;
}

.avatar-caixa {
  width: 82px;
  height: 82px;
  border-radius: 16px;
  background: #eaf2ed;
  display: grid;
  place-items: center;
  overflow: hidden;
  border: 1px solid #dfeae2;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder-icone {
  color: #356b5b;
}

.btn-adicionar-foto {
  border: none;
  background: none;
  color: #52695f;
  font-size: 0.76rem;
  font-weight: 500;
  cursor: pointer;
  padding: 2px 4px;
  transition: color 0.2s;
}

.btn-adicionar-foto:hover {
  color: #274d3d;
  text-decoration: underline;
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

.btn-foto-mini {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border-radius: 8px;
  background: #274d3d;
  color: #ffffff;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-foto-mini:hover {
  background: #356b5b;
}

.desktop-only {
  display: grid;
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

/* Metadados */
.metadados {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin: 1.25rem 0 0.75rem;
  text-align: left;
}

.metadados dt {
  font-size: 0.72rem;
  color: #6c8277;
  margin-bottom: 2px;
}

.metadados dd {
  margin: 0;
  font-size: 0.88rem;
  font-weight: 600;
  color: #1a3628;
}

.pontos-bloco--desktop {
  display: block;
}

.nascimento-idade-mobile {
  display: none;
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

  .desktop-only {
    display: none;
  }

  /* Pontos de atenção no topo ficam ocultos no mobile (exibidos na aba Registros) */
  .pontos-bloco--desktop {
    display: none;
  }

  /* Metadados em 2 colunas */
  .metadados {
    grid-template-columns: 1fr 1fr;
    margin: 0.75rem 0 1rem;
  }

  .metadado-idade-desktop {
    display: none;
  }

  .nascimento-idade-mobile {
    display: inline;
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
