<template>
  <Teleport to="body">
    <div
      v-if="aberto"
      class="fundo"
      role="presentation"
      @click.self="fechar"
    >
      <div class="painel">
        <!-- Canguru espiando pela borda esquerda: só a cabeça (corte no queixo) e duas patas no painel. -->
        <div aria-hidden="true" class="canguru">
          <svg class="canguru-cabeca" viewBox="25 111 976 651">
            <g class="canguru-corpo">
              <path :d="SIMBOLO" />
            </g>
          </svg>

          <span class="pata pata--acena" />
          <span class="pata pata--apoio" />
        </div>

        <section
          aria-labelledby="aluno-detalhes-titulo"
          aria-modal="true"
          class="cartao"
          role="dialog"
        >
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
            <section class="identificacao">
              <div class="avatar-area">
                <div aria-hidden="true" class="avatar">
                  <img v-if="foto" alt="" :src="foto">
                  <span v-else>{{ iniciais }}</span>
                </div>

                <button
                  aria-label="Trocar foto do aluno"
                  class="btn-foto"
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
              </div>

              <div class="nome-bloco">
                <h3>{{ aluno.nome }}</h3>
                <p>{{ turmaNome }} · {{ turno }}</p>
                <span class="status">Aluno ativo</span>
              </div>
            </section>

            <section v-if="pontosAtencao.length > 0" aria-labelledby="pontos-titulo" class="bloco pontos">
              <h4 id="pontos-titulo">Pontos de atenção</h4>

              <article v-for="ponto in pontosAtencao" :key="ponto.id" class="ponto">
                <span aria-hidden="true" class="ponto-icone">!</span>

                <div>
                  <h5>{{ ponto.titulo || 'Observação' }}</h5>
                  <p>{{ ponto.descricao }}</p>
                  <small>Atenção<template v-if="ponto.visibilidade"> · {{ ponto.visibilidade }}</template> · {{ formatarData(ponto.created_at) }}</small>
                </div>
              </article>
            </section>

            <dl aria-label="Informações do aluno" class="metadados">
              <div>
                <dt>Matrícula</dt>
                <dd>{{ matricula }}</dd>
              </div>

              <div>
                <dt>Nascimento</dt>
                <dd>{{ nascimento }}</dd>
              </div>

              <div>
                <dt>Idade</dt>
                <dd>{{ idade === null ? '—' : `${idade} anos` }}</dd>
              </div>
            </dl>

            <div class="aba-atual">Visão geral</div>

            <section class="bloco">
              <h4>Acompanhamento</h4>

              <p>
                Participa das propostas em sala e demonstra interesse pela leitura, escrita e
                atividades de contagem.
              </p>
            </section>

            <section class="bloco">
              <h4>
                Atividades
                <span class="contador">{{ atividades.length }}</span>
              </h4>

              <p v-if="atividades.length === 0" class="vazio">Nenhuma atividade conectada à turma ainda.</p>

              <article
                v-for="(atividade, i) in atividades"
                :key="atividade.id"
                class="atividade"
                :style="{ '--i': i }"
              >
                <div class="atividade-topo">
                  <FileText class="atividade-icone" :size="26" />

                  <div>
                    <h5>{{ atividade.titulo || atividade.nome }}</h5>
                    <span>Criada em {{ formatarData(atividade.created_at) }}</span>
                  </div>
                </div>

                <p>{{ atividade.descricao }}</p>

                <div class="atividade-rodape">
                  <template v-if="atividade.relatorios && atividade.relatorios.length > 0">
                    <span class="relatorio-ok"><Check :size="14" /> Relatório disponível</span>

                    <button class="btn-link" type="button" @click="abrirRelatorio(atividade.relatorios[0])">
                      <Download :size="15" /> Exportar relatório
                    </button>
                  </template>

                  <span v-else class="relatorio-pendente">Sem relatório ainda</span>
                </div>
              </article>
            </section>
          </div>

          <footer class="rodape">
            <button class="btn-principal" :disabled="!primeiroRelatorio" type="button" @click="primeiroRelatorio && abrirRelatorio(primeiroRelatorio)">
              <Download :size="18" /> Exportar todas as atividades
            </button>

            <button class="btn-secundario" type="button" @click="novoRelatorio">
              Gerar novo relatório
            </button>
          </footer>
        </section>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
  import type { Aluno, Observacao } from '@/interfaces/aluno'
  import type { Atividade } from '@/interfaces/atividade'

  import { Camera, Check, Download, FileText, X } from '@lucide/vue'
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { SIMBOLO } from '@/assets/mascote-simbolo'
  import { observacoesService } from '@/services/alunos'
  import { atividadesService } from '@/services/atividades'

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
  const inputFoto = ref<HTMLInputElement | null>(null)
  const foto = ref('')

  const iniciais = computed(() =>
    props.aluno.nome
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(nome => nome[0])
      .join('')
      .toUpperCase(),
  )

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

  const atividades = ref<Atividade[]>([])
  const pontosAtencao = ref<Observacao[]>([])
  const primeiroRelatorio = computed(() => atividades.value.find(a => a.relatorios && a.relatorios.length > 0)?.relatorios?.[0])

  function formatarData (iso: string): string {
    return iso ? new Date(iso).toLocaleDateString('pt-BR') : '—'
  }

  // Atividades da turma e observações do aluno vêm da API; falha em qualquer uma só esvazia a seção.
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

  function novoRelatorio () {
    void router.push({ path: '/relatorios/novo', query: { aluno: props.aluno.id, turma: props.aluno.turma } })
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

/* Painel flutuante com respiro das bordas, como no design. */
.painel {
  position: absolute;
  inset: 16px 16px 16px auto;
  width: min(520px, calc(100vw - 32px));
  animation: painel-entra 0.45s var(--ease-out-expo, cubic-bezier(.16, 1, .3, 1)) both;
}

.cartao {
  position: relative;
  z-index: 1;
  display: flex;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 16px 48px rgb(22 36 28 / 22%);
  color: #1a3628;
  font-family: Poppins, sans-serif;
}

/* O canguru fica atrás do cartão, com a cabeça (e as orelhas) para fora da borda esquerda. */
.canguru {
  position: absolute;
  z-index: 0;
  top: 52px;
  left: -176px;
  width: 270px;
  animation: canguru-espia 0.6s 0.35s cubic-bezier(.3, 1.5, .5, 1) both;
}

.canguru-cabeca {
  display: block;
  width: 100%;
  height: auto;
  fill: #356b5b;
  overflow: hidden;
}

.canguru-corpo {
  transform-box: fill-box;
  transform-origin: 85% 100%;
  animation: canguru-balanca 3.6s 1.2s ease-in-out infinite;
}

/* Patas agarradas na borda do painel, com contorno na cor do fundo como nos cards. */
.pata {
  position: absolute;
  width: 54px;
  height: 28px;
  border: 3px solid #f7f7f1;
  border-radius: 999px;
  background: #356b5b;
}

.pata--acena {
  top: 168px;
  left: 150px;
  transform-origin: 90% 50%;
  animation: pata-acena 2.8s 1.6s ease-in-out infinite;
}

.pata--apoio {
  top: 176px;
  left: 190px;
}

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
  font-weight: 600;
}

.btn-fechar {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border: 0;
  border-radius: 12px;
  background: #eef5f0;
  color: #1a3628;
  cursor: pointer;
  transition: background-color 0.2s, rotate 0.3s;
}

.btn-fechar:hover {
  background: #dfeae2;
  rotate: 90deg;
}

.corpo {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem 1.5rem;
}

.identificacao {
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
  margin-bottom: 1.25rem;
}

.avatar-area {
  position: relative;
  flex: none;
}

.avatar {
  display: grid;
  width: 84px;
  height: 84px;
  place-items: center;
  overflow: hidden;
  border-radius: 50%;
  background: #a9c7b4;
  font-size: 1.6rem;
  font-weight: 600;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-foto {
  position: absolute;
  right: -4px;
  bottom: -2px;
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border: 3px solid #fff;
  border-radius: 50%;
  background: #356b5b;
  color: #fff;
  cursor: pointer;
  transition: scale 0.2s;
}

.btn-foto:hover {
  scale: 1.12;
}

.nome-bloco h3 {
  margin: 0.4rem 0 0.15rem;
  font-size: 1.5rem;
  font-weight: 600;
}

.nome-bloco p {
  margin: 0 0 0.5rem;
  color: #52695f;
  font-size: 0.85rem;
}

.status {
  padding: 0.2rem 0.7rem;
  border-radius: 999px;
  background: #e3efe7;
  color: #356b5b;
  font-size: 0.72rem;
}

.metadados {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin: 0 0 1.25rem;
}

.metadados dt {
  color: #6c8277;
  font-size: 0.72rem;
}

.metadados dd {
  margin: 0.15rem 0 0;
  font-size: 0.85rem;
  font-weight: 500;
}

.aba-atual {
  margin-bottom: 1.25rem;
  padding: 0.55rem;
  border-radius: 12px;
  background: #f4f8f5;
  box-shadow: inset 0 0 0 2px #e3ece6;
  font-size: 0.85rem;
  font-weight: 600;
  text-align: center;
}

.bloco {
  margin-bottom: 1.25rem;
}

.bloco h4 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.4rem;
  font-size: 1.05rem;
  font-weight: 600;
}

.bloco > p {
  margin: 0;
  max-width: 44ch;
  color: #3d5a4c;
  font-size: 0.85rem;
  line-height: 1.55;
}

.contador {
  display: grid;
  min-width: 22px;
  height: 22px;
  place-items: center;
  border-radius: 999px;
  background: #e3efe7;
  font-size: 0.72rem;
}

.atividade {
  margin-top: 0.75rem;
  padding: 0.9rem 1rem;
  border: 1px solid #dfe8e0;
  border-radius: 16px;
  animation: item-entra 0.45s calc(0.3s + var(--i) * 0.08s) both;
}

.atividade-topo {
  display: flex;
  gap: 0.6rem;
  align-items: center;
}

.atividade-icone {
  color: #356b5b;
  flex: none;
}

.atividade h5 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 500;
}

.atividade-topo span {
  color: #6c8277;
  font-size: 0.7rem;
}

.atividade > p {
  margin: 0.5rem 0;
  color: #3d5a4c;
  font-size: 0.8rem;
}

.atividade-rodape {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
}

.relatorio-ok {
  display: inline-flex;
  gap: 0.3rem;
  align-items: center;
}

.btn-link {
  display: inline-flex;
  gap: 0.3rem;
  align-items: center;
  border: 0;
  background: none;
  color: #1a3628;
  font: inherit;
  cursor: pointer;
}

.btn-link:hover {
  color: #356b5b;
  text-decoration: underline;
}

.rodape {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin: 0 1.5rem;
  padding: 1rem 0 1.25rem;
  border-top: 1px solid #e3ece6;
}

.rodape p {
  margin: 0;
  color: #52695f;
  font-size: 0.72rem;
}

.btn-principal,
.btn-secundario {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
  width: 100%;
  border-radius: 12px;
  font: inherit;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
}

.btn-principal {
  padding: 0.8rem;
  border: 0;
  background: #274d3d;
  color: #fff;
  transition: background-color 0.2s;
}

.btn-principal:hover {
  background: #356b5b;
}

.btn-secundario {
  padding: 0.65rem;
  border: 1px solid #a9c7b4;
  background: #fff;
  color: #274d3d;
}

.btn-secundario:hover {
  background: #f4f8f5;
}

.pontos-topo {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
}

.btn-link--forte {
  font-size: 0.75rem;
  font-weight: 600;
}

.ponto {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  margin-top: 0.6rem;
  padding: 0.8rem 1rem;
  border: 1px solid #dfe8e0;
  border-radius: 16px;
}

.ponto-icone {
  display: grid;
  width: 28px;
  height: 28px;
  flex: none;
  place-items: center;
  border-radius: 50%;
  background: #eef5f0;
  color: #356b5b;
  font-size: 0.8rem;
  font-weight: 700;
}

.ponto h5 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 500;
}

.ponto p {
  margin: 0.15rem 0;
  color: #3d5a4c;
  font-size: 0.78rem;
}

.ponto small {
  color: #6c8277;
  font-size: 0.7rem;
}

.vazio,
.relatorio-pendente {
  margin: 0.4rem 0 0;
  color: #6c8277;
  font-size: 0.78rem;
}

.btn-principal:disabled {
  background: #a9c7b4;
  cursor: not-allowed;
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

@keyframes item-entra {
  from { opacity: 0; translate: 0 10px; }
}

/* Sai de trás do painel, depois balança de leve como quem espia. */
@keyframes canguru-espia {
  from { opacity: 0; translate: 60px 0; }
}

@keyframes canguru-balanca {
  0%, 100% { rotate: 0deg; }
  40% { rotate: 4deg; }
  60% { rotate: -2deg; }
}

@keyframes pata-acena {
  0%, 60%, 100% { rotate: 0deg; }
  70%, 90% { rotate: -22deg; }
  80% { rotate: -6deg; }
}

@media (max-width: 640px) {
  .canguru {
    display: none;
  }

  .painel {
    inset: 8px;
    width: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .fundo,
  .painel,
  .atividade,
  .canguru,
  .canguru-corpo,
  .pata {
    animation: none;
  }
}
</style>
