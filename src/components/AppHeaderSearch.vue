<template>
  <div ref="raiz" class="busca">
    <form
      class="flex h-10 w-36 items-center overflow-hidden rounded-[18px] border border-primary bg-background text-primary transition-[box-shadow,width] duration-300 focus-within:ring-[3px] focus-within:ring-accent/30 sm:h-11 sm:w-56 md:w-72"
      role="search"
      @submit.prevent="abrirSelecionado"
    >
      <button
        aria-label="Buscar"
        class="grid size-9 shrink-0 cursor-pointer appearance-none place-items-center border-0! bg-transparent p-0 text-primary outline-none! focus-visible:outline-none! sm:size-[42px]"
        type="submit"
      >
        <LoaderCircle v-if="carregando" aria-hidden="true" class="busca__giro" :size="18" />
        <Search v-else aria-hidden="true" :size="18" />
      </button>

      <input
        ref="campo"
        v-model="termo"
        :aria-activedescendant="ativo >= 0 ? `busca-item-${ativo}` : undefined"
        aria-autocomplete="list"
        aria-controls="busca-resultados"
        :aria-expanded="painelAberto"
        aria-label="Buscar turmas e alunos"
        autocomplete="off"
        class="min-w-0 flex-1 appearance-none border-0! bg-transparent p-0 text-[14px] text-text shadow-none! outline-none! placeholder:text-primary/80 focus:outline-none! focus-visible:outline-none! sm:text-[15px]"
        placeholder="Buscar"
        role="combobox"
        type="search"
        @focus="aberto = true"
        @keydown="aoTeclar"
      >

      <kbd v-if="!termo" aria-hidden="true" class="busca__atalho">{{ atalho }}</kbd>
    </form>

    <Transition name="painel">
      <div
        v-if="painelAberto"
        id="busca-resultados"
        class="busca__painel"
        role="listbox"
        :style="{ right: `${deslocamento}px` }"
      >
        <!-- Carregando a primeira vez: esqueleto no formato dos itens -->
        <div v-if="carregando && totalItens === 0" aria-hidden="true" class="busca__esqueleto">
          <span v-for="n in 3" :key="n" class="busca__esqueleto-linha" :style="{ '--n': n }" />
        </div>

        <p v-else-if="erro" class="busca__aviso">
          {{ erro }}
        </p>

        <div v-else-if="totalItens === 0" class="busca__vazio">
          <SearchX aria-hidden="true" :size="26" :stroke-width="1.6" />
          <p>Nada encontrado para <strong>“{{ termoLimpo }}”</strong>.</p>
          <small>Tente o nome da turma ou de um aluno.</small>
        </div>

        <template v-else>
          <section v-if="turmas.length > 0" aria-label="Turmas" class="busca__grupo">
            <h3>Turmas</h3>

            <button
              v-for="(turma, i) in turmas"
              :id="`busca-item-${i}`"
              :key="`t${turma.id}`"
              :aria-selected="ativo === i"
              class="busca__item"
              :class="{ 'busca__item--ativo': ativo === i }"
              role="option"
              :style="{ '--i': i }"
              type="button"
              @click="abrir(itens[i])"
              @mousemove="ativo = i"
            >
              <span aria-hidden="true" class="busca__icone"><GraduationCap :size="18" /></span>

              <span class="busca__texto">
                <strong>
                  <template v-for="(parte, p) in destacar(turma.nome)" :key="p">
                    <mark v-if="parte.achou">{{ parte.texto }}</mark>
                    <template v-else>{{ parte.texto }}</template>
                  </template>
                </strong>

                <small>{{ descricaoTurma(turma) }}</small>
              </span>

              <ArrowUpRight aria-hidden="true" class="busca__seta" :size="16" />
            </button>
          </section>

          <section v-if="alunos.length > 0" aria-label="Alunos" class="busca__grupo">
            <h3>Alunos</h3>

            <button
              v-for="(aluno, j) in alunos"
              :id="`busca-item-${turmas.length + j}`"
              :key="`a${aluno.id}`"
              :aria-selected="ativo === turmas.length + j"
              class="busca__item"
              :class="{ 'busca__item--ativo': ativo === turmas.length + j }"
              role="option"
              :style="{ '--i': turmas.length + j }"
              type="button"
              @click="abrir(itens[turmas.length + j])"
              @mousemove="ativo = turmas.length + j"
            >
              <span aria-hidden="true" class="busca__avatar">{{ iniciais(aluno.nome) }}</span>

              <span class="busca__texto">
                <strong>
                  <template v-for="(parte, p) in destacar(aluno.nome)" :key="p">
                    <mark v-if="parte.achou">{{ parte.texto }}</mark>
                    <template v-else>{{ parte.texto }}</template>
                  </template>
                </strong>

                <small>{{ nomeDaTurma(aluno.turma) }}</small>
              </span>

              <ArrowUpRight aria-hidden="true" class="busca__seta" :size="16" />
            </button>
          </section>
        </template>

        <footer v-if="totalItens > 0" aria-hidden="true" class="busca__rodape">
          <span><kbd>↑</kbd><kbd>↓</kbd> navegar</span>
          <span><kbd>Enter</kbd> abrir</span>
          <span><kbd>Esc</kbd> fechar</span>
        </footer>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import type { Aluno } from '@/interfaces/aluno'
  import type { Turma } from '@/interfaces/escola'
  import { ArrowUpRight, GraduationCap, LoaderCircle, Search, SearchX } from '@lucide/vue'
  import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { alunosService } from '@/services/alunos'
  import { turmasService } from '@/services/escolas'

  type Item = { tipo: 'turma', turma: Turma } | { tipo: 'aluno', aluno: Aluno }

  const LIMITE = 5
  const MINIMO = 2

  const router = useRouter()
  const raiz = ref<HTMLElement | null>(null)
  const campo = ref<HTMLInputElement | null>(null)

  const termo = ref('')
  const aberto = ref(false)
  const carregando = ref(false)
  const erro = ref('')
  const turmas = ref<Turma[]>([])
  const alunos = ref<Aluno[]>([])
  const ativo = ref(-1)
  // Nomes das turmas para mostrar em qual turma cada aluno está.
  const nomesTurmas = ref(new Map<number, string>())

  const termoLimpo = computed(() => termo.value.trim())
  const itens = computed<Item[]>(() => [
    ...turmas.value.map(turma => ({ tipo: 'turma' as const, turma })),
    ...alunos.value.map(aluno => ({ tipo: 'aluno' as const, aluno })),
  ])
  const totalItens = computed(() => itens.value.length)
  const painelAberto = computed(() => aberto.value && termoLimpo.value.length >= MINIMO)

  const atalho = /mac/i.test(navigator.userAgent) ? '⌘K' : 'Ctrl K'

  // Busca enquanto digita, com uma pequena pausa; respostas antigas são descartadas.
  let timer = 0
  let pedido = 0

  watch(termoLimpo, valor => {
    window.clearTimeout(timer)
    ativo.value = -1
    erro.value = ''
    if (valor.length < MINIMO) {
      turmas.value = []
      alunos.value = []
      carregando.value = false
      return
    }
    carregando.value = true
    timer = window.setTimeout(() => buscar(valor), 250)
  })

  async function buscar (valor: string) {
    const meu = ++pedido
    const [respTurmas, respAlunos] = await Promise.allSettled([
      turmasService.list({ search: valor }),
      alunosService.list({ search: valor }),
    ])
    if (meu !== pedido) return

    if (respTurmas.status === 'rejected' && respAlunos.status === 'rejected') {
      erro.value = 'Não foi possível buscar agora. Tente de novo em instantes.'
      turmas.value = []
      alunos.value = []
    } else {
      turmas.value = respTurmas.status === 'fulfilled' ? respTurmas.value.results.slice(0, LIMITE) : []
      alunos.value = respAlunos.status === 'fulfilled' ? respAlunos.value.results.slice(0, LIMITE) : []
      for (const turma of turmas.value) nomesTurmas.value.set(turma.id, turma.nome)
      ativo.value = totalItens.value > 0 ? 0 : -1
    }
    carregando.value = false
  }

  async function carregarNomesTurmas () {
    try {
      const { results } = await turmasService.list()
      nomesTurmas.value = new Map(results.map(turma => [turma.id, turma.nome]))
    } catch {
      // Sem os nomes, o aluno aparece só com o nome dele.
    }
  }

  function nomeDaTurma (id: number): string {
    return nomesTurmas.value.get(id) ?? 'Aluno da turma'
  }

  function descricaoTurma (turma: Turma): string {
    const partes = [turma.turno_display, typeof turma.total_estudantes === 'number' ? `${turma.total_estudantes} estudantes` : '']
    return partes.filter(Boolean).join(' · ') || 'Turma'
  }

  function iniciais (nome: string): string {
    return nome.trim().split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase()
  }

  // Divide o texto para destacar o trecho buscado (sem diferenciar acentos e maiúsculas).
  function destacar (texto: string): Array<{ texto: string, achou: boolean }> {
    const normalizar = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
    const alvo = normalizar(termoLimpo.value)
    const inicio = alvo ? normalizar(texto).indexOf(alvo) : -1
    if (inicio === -1) return [{ texto, achou: false }]
    return [
      { texto: texto.slice(0, inicio), achou: false },
      { texto: texto.slice(inicio, inicio + alvo.length), achou: true },
      { texto: texto.slice(inicio + alvo.length), achou: false },
    ].filter(parte => parte.texto)
  }

  // Posição do painel: alinhado à direita do campo, mas sem passar das bordas da tela (celular).
  const deslocamento = ref(0)

  function posicionar () {
    const caixa = raiz.value?.getBoundingClientRect()
    if (!caixa) return
    const margem = 12
    const largura = Math.min(420, window.innerWidth - margem * 2)
    const direita = caixa.right - largura < margem ? Math.min(window.innerWidth - margem, margem + largura) : caixa.right
    deslocamento.value = Math.round(caixa.right - direita)
  }

  watch(painelAberto, aberto => {
    if (aberto) posicionar()
  })

  function fechar () {
    aberto.value = false
    ativo.value = -1
  }

  function abrir (item?: Item) {
    if (!item) return
    if (item.tipo === 'turma') {
      void router.push(`/turmas/${item.turma.id}`)
    } else {
      // A página da turma abre o painel do aluno quando recebe ?aluno=<id>.
      void router.push({ path: `/turmas/${item.aluno.turma}`, query: { aluno: item.aluno.id } })
    }
    termo.value = ''
    fechar()
    campo.value?.blur()
  }

  function abrirSelecionado () {
    abrir(itens.value[Math.max(ativo.value, 0)])
  }

  function aoTeclar (event: KeyboardEvent) {
    if (event.key === 'Escape') {
      fechar()
      campo.value?.blur()
      return
    }
    if (!painelAberto.value || totalItens.value === 0) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      ativo.value = (ativo.value + 1) % totalItens.value
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      ativo.value = (ativo.value - 1 + totalItens.value) % totalItens.value
    }
  }

  function cliqueFora (event: PointerEvent) {
    if (!raiz.value?.contains(event.target as Node)) fechar()
  }

  // Ctrl+K / ⌘K foca a busca de qualquer tela.
  function atalhoGlobal (event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault()
      campo.value?.focus()
      aberto.value = true
    }
  }

  onMounted(() => {
    document.addEventListener('pointerdown', cliqueFora)
    window.addEventListener('keydown', atalhoGlobal)
    window.addEventListener('resize', posicionar)
    void carregarNomesTurmas()
  })

  onBeforeUnmount(() => {
    document.removeEventListener('pointerdown', cliqueFora)
    window.removeEventListener('keydown', atalhoGlobal)
    window.removeEventListener('resize', posicionar)
    window.clearTimeout(timer)
  })
</script>

<style scoped>
.busca {
  position: relative;
}

.busca__giro {
  animation: busca-giro 0.8s linear infinite;
}

@keyframes busca-giro {
  to { rotate: 360deg; }
}

.busca__atalho {
  display: none;
  margin-right: 10px;
  padding: 2px 7px;
  border: 1px solid rgb(53 107 91 / 0.25);
  border-radius: 7px;
  color: rgb(53 107 91 / 0.75);
  font: 500 11px/1.4 inherit;
  white-space: nowrap;
}

@media (min-width: 768px) {
  .busca__atalho {
    display: inline-block;
  }
}

/* Painel no mesmo vidro do header (dock). */
.busca__painel {
  position: absolute;
  top: calc(100% + 14px);
  right: 0;
  z-index: 60;
  width: min(420px, calc(100vw - 24px));
  max-height: min(70vh, 520px);
  overflow-y: auto;
  padding: 10px;
  border: 1px solid rgb(53 107 91 / 0.28);
  border-radius: 24px;
  /* Sólido: dentro do header (que já usa backdrop-filter) o desfoque do painel não funcionaria. */
  background: linear-gradient(160deg, #ffffff 0%, #f7f7f1 55%, #eef4ef 100%);
  box-shadow:
    inset 0 1.5px 0 rgb(255 255 255 / 0.9),
    inset 0 -1.5px 0 rgb(53 107 91 / 0.12),
    0 1px 2px rgb(38 61 53 / 0.06),
    0 14px 24px -8px rgb(38 61 53 / 0.18),
    0 32px 56px -22px rgb(53 107 91 / 0.38);
  transform-origin: top right;
  scrollbar-width: thin;
  scrollbar-color: #a9c7b4 transparent;
}

.busca__grupo + .busca__grupo {
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid rgb(53 107 91 / 0.12);
}

.busca__grupo h3 {
  margin: 4px 10px 6px;
  color: rgb(53 107 91 / 0.8);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.busca__item {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 12px;
  padding: 9px 10px;
  border: 0;
  border-radius: 16px;
  background: transparent;
  color: var(--color-text);
  font: inherit;
  text-align: left;
  cursor: pointer;
  animation: item-entra 0.32s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: calc(var(--i) * 30ms);
  transition: background-color 0.15s;
}

.busca__item--ativo {
  background: rgb(169 199 180 / 0.32);
}

.busca__icone,
.busca__avatar {
  display: grid;
  width: 36px;
  height: 36px;
  flex: none;
  place-items: center;
  border-radius: 12px;
  transition: background-color 0.15s, color 0.15s, scale 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.busca__icone {
  background: rgb(169 199 180 / 0.35);
  color: var(--color-primary);
}

.busca__avatar {
  border-radius: 50%;
  background: #e3b477;
  color: #263d35;
  font-size: 12px;
  font-weight: 600;
}

.busca__item--ativo .busca__icone {
  background: var(--color-primary);
  color: #f7f7f1;
  scale: 1.06;
}

.busca__item--ativo .busca__avatar {
  scale: 1.06;
}

.busca__texto {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
}

.busca__texto strong {
  overflow: hidden;
  font-size: 14px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.busca__texto small {
  color: rgb(38 61 53 / 0.65);
  font-size: 12px;
}

.busca__texto mark {
  padding: 0 1px;
  border-radius: 4px;
  background: rgb(227 180 119 / 0.45);
  color: inherit;
}

.busca__seta {
  flex: none;
  color: var(--color-primary);
  opacity: 0;
  translate: -4px 0;
  transition: opacity 0.15s, translate 0.2s;
}

.busca__item--ativo .busca__seta {
  opacity: 1;
  translate: 0 0;
}

.busca__vazio,
.busca__aviso {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin: 0;
  padding: 22px 16px;
  color: var(--color-text);
  font-size: 14px;
  text-align: center;
}

.busca__vazio p {
  margin: 6px 0 0;
}

.busca__vazio svg {
  color: var(--color-primary);
}

.busca__vazio small {
  color: rgb(38 61 53 / 0.6);
}

.busca__esqueleto {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
}

.busca__esqueleto-linha {
  height: 40px;
  border-radius: 14px;
  background: linear-gradient(90deg, rgb(169 199 180 / 0.18), rgb(169 199 180 / 0.42), rgb(169 199 180 / 0.18));
  background-size: 200% 100%;
  animation: brilho 1.1s linear infinite;
  animation-delay: calc(var(--n) * 90ms);
}

.busca__rodape {
  display: flex;
  justify-content: flex-end;
  gap: 14px;
  margin-top: 6px;
  padding: 8px 10px 2px;
  border-top: 1px solid rgb(53 107 91 / 0.12);
  color: rgb(38 61 53 / 0.6);
  font-size: 11px;
}

.busca__rodape kbd {
  margin-right: 3px;
  padding: 0 5px;
  border: 1px solid rgb(53 107 91 / 0.2);
  border-radius: 5px;
  font: inherit;
}

@media (max-width: 640px) {
  .busca__rodape {
    display: none;
  }
}

.painel-enter-active {
  transition: opacity 0.2s ease, transform 0.32s cubic-bezier(0.16, 1, 0.3, 1);
}

.painel-leave-active {
  transition: opacity 0.14s ease, transform 0.14s ease;
}

.painel-enter-from,
.painel-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}

@keyframes item-entra {
  from { opacity: 0; translate: 0 6px; }
}

@keyframes brilho {
  to { background-position: -200% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .busca__giro,
  .busca__item,
  .busca__esqueleto-linha {
    animation: none;
  }

  .painel-enter-active,
  .painel-leave-active {
    transition: none;
  }
}
</style>
