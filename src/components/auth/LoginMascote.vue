<template>
  <div aria-hidden="true" class="mascote-login">
    <!-- Cabeça e braços ficam atrás do formulário; as patas, na frente. Mesmo viewBox nos dois. -->
    <svg class="m m-tras" viewBox="0 90 1263 672">
      <defs>
        <clipPath id="lm-cabeca"><rect height="762" width="1263" x="0" y="0" /></clipPath>
        <clipPath id="lm-olho"><ellipse cx="0" cy="0" rx="42.5" ry="48.5" /></clipPath>
      </defs>

      <g ref="cabeca">
        <g clip-path="url(#lm-cabeca)">
          <path :d="CABECA_LOGIN" fill="#356B5B" fill-rule="evenodd" />
        </g>

        <g transform="translate(537.5 570.5)">
          <g ref="olhoAberto">
            <ellipse fill="#F7F7F1" rx="40" ry="46" />

            <g clip-path="url(#lm-olho)">
              <g ref="pupila">
                <circle fill="#356B5B" r="26" />
                <circle cx="-9" cy="-10" fill="#F7F7F1" r="8" />
              </g>

              <rect
                ref="palpebra"
                fill="#356B5B"
                height="90"
                width="140"
                x="-70"
                y="-90"
              />

              <ellipse
                ref="bochecha"
                cx="0"
                cy="50"
                fill="#356B5B"
                rx="66"
                ry="40"
              />
            </g>
          </g>

          <path
            ref="sobrancelha"
            fill="none"
            stroke="#F7F7F1"
            stroke-linecap="round"
            stroke-width="11"
          />

          <g ref="olhoX" opacity="0">
            <path
              d="M-30 -30 L30 30 M30 -30 L-30 30"
              fill="none"
              stroke="#F7F7F1"
              stroke-linecap="round"
              stroke-width="13"
            />
          </g>

          <path ref="lagrima" d="M0 -12 C9 1 12 8 0 14 C-12 8 -9 1 0 -12Z" fill="#A9C7B4" opacity="0" />

          <path
            ref="olhoFeliz"
            :d="OLHO_FELIZ"
            fill="#F7F7F1"
            opacity="0"
            transform="translate(-537.5 -570.5)"
          />
        </g>
      </g>

      <path
        ref="bracoA"
        fill="none"
        stroke="#356B5B"
        stroke-linecap="round"
        stroke-width="62"
      />

      <path
        ref="bracoB"
        fill="none"
        stroke="#356B5B"
        stroke-linecap="round"
        stroke-width="62"
      />
    </svg>

    <svg class="m m-frente" viewBox="0 90 1263 672">
      <text
        ref="interrogacao"
        fill="#E3B477"
        font-family="Poppins, system-ui, sans-serif"
        font-size="170"
        font-weight="700"
        opacity="0"
        x="120"
        y="400"
      >?</text>

      <g ref="pensamento" opacity="0">
        <circle
          ref="p1"
          cx="215"
          cy="440"
          fill="#E3B477"
          r="17"
        />

        <circle
          ref="p2"
          cx="160"
          cy="370"
          fill="#E3B477"
          r="28"
        />

        <circle
          ref="p3"
          cx="82"
          cy="260"
          fill="#E3B477"
          r="46"
        />
      </g>

      <g ref="confete" />

      <path
        ref="ondas"
        d="M 120 400 C 80 445 80 505 120 550 M 72 355 C 10 430 10 520 72 590"
        fill="none"
        opacity="0"
        stroke="#A9C7B4"
        stroke-linecap="round"
        stroke-width="14"
      />

      <!-- Pata de canguru gordinha: palma larga + 3 dedos redondos dobrados sobre a borda.
           O contorno vai por baixo do preenchimento e vira uma silhueta só. -->
      <g v-for="lado in ['A', 'B']" :key="lado" :ref="el => (patas[lado] = el as SVGGElement)">
        <g fill="#F7F7F1" stroke="#F7F7F1" stroke-width="12">
          <ellipse cx="0" cy="-6" rx="46" ry="34" />

          <circle
            v-for="x in DEDOS"
            :key="x"
            :cx="x"
            cy="14"
            r="18"
          />
        </g>

        <g fill="#356B5B">
          <ellipse cx="0" cy="-6" rx="46" ry="34" />

          <circle
            v-for="x in DEDOS"
            :key="x"
            :cx="x"
            cy="14"
            r="18"
          />
        </g>

        <path
          d="M-14 6q1 9 0 16M14 6q-1 9 0 16"
          fill="none"
          opacity="0.5"
          stroke="#1F4237"
          stroke-linecap="round"
          stroke-width="4"
        />

        <ellipse
          cx="-14"
          cy="-20"
          fill="#F7F7F1"
          opacity="0.18"
          rx="14"
          ry="8"
          transform="rotate(-18 -14 -20)"
        />
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
  import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
  import { CABECA_LOGIN, OLHO_FELIZ } from '@/assets/mascote-login'

  const DEDOS = [-28, 0, 28]

  export type EstadoMascote = 'idle' | 'sleepy' | 'watch' | 'hide' | 'peek' | 'think' | 'error' | 'success' | 'wave'

  const props = defineProps<{
    estado: EstadoMascote
  }>()

  // Elementos do SVG (atualizados direto no quadro de animação, sem passar pela reatividade).
  const cabeca = ref<SVGGElement>()
  const olhoAberto = ref<SVGGElement>()
  const pupila = ref<SVGGElement>()
  const palpebra = ref<SVGRectElement>()
  const bochecha = ref<SVGEllipseElement>()
  const sobrancelha = ref<SVGPathElement>()
  const olhoX = ref<SVGGElement>()
  const lagrima = ref<SVGPathElement>()
  const olhoFeliz = ref<SVGPathElement>()
  const bracoA = ref<SVGPathElement>()
  const bracoB = ref<SVGPathElement>()
  const interrogacao = ref<SVGTextElement>()
  const pensamento = ref<SVGGElement>()
  const p1 = ref<SVGCircleElement>()
  const p2 = ref<SVGCircleElement>()
  const p3 = ref<SVGCircleElement>()
  const confete = ref<SVGGElement>()
  const ondas = ref<SVGPathElement>()
  const patas: Record<string, SVGGElement> = {}

  const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const limitar = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
  const f1 = (n: number) => n.toFixed(1)

  // Molas: tudo vai ao alvo com inércia (é o que dá o jeito "gelatina" do mascote).
  class Mola {
    v: number
    t: number
    vel = 0
    constructor (v: number, private k = 120, private d = 14) {
      this.v = v
      this.t = v
    }

    passo (dt: number) {
      if (reduzido) {
        this.v = this.t
        this.vel = 0
        return
      }
      this.vel += (this.k * (this.t - this.v) - this.d * this.vel) * dt
      this.v += this.vel * dt
    }
  }

  const S = {
    headY: new Mola(240, 70, 11), headR: new Mola(0, 90, 9), squash: new Mola(0, 220, 11),
    pupX: new Mola(0, 260, 26), pupY: new Mola(0, 260, 26), pupS: new Mola(1, 200, 20), blink: new Mola(0, 700, 45),
    lidY: new Mola(-36, 170, 19), lidR: new Mola(0, 170, 19), cheek: new Mola(0.3, 160, 18), happy: new Mola(0, 220, 24),
    bL: new Mola(-72, 200, 20), bC: new Mola(-81, 200, 20), bR: new Mola(-72, 200, 20),
    arcs: new Mola(0, 120, 16), thought: new Mola(0, 110, 15), xeye: new Mola(0, 220, 22), tear: new Mola(0, 90, 14), ques: new Mola(0, 110, 15),
  }

  function novaPata (x: number, y: number) {
    return { x: new Mola(x, 150, 15), y: new Mola(y, 150, 15), s: new Mola(1.25, 150, 15), r: new Mola(0, 150, 15), b: new Mola(x, 150, 15), bow: new Mola(0, 130, 14), bx: x }
  }
  type Pata = ReturnType<typeof novaPata>
  const pata: Record<'A' | 'B', Pata> = { A: novaPata(330, 756), B: novaPata(800, 756) }

  let modo: EstadoMascote = 'idle'
  let acenando: false | 'wave' | 'cheer' = false
  let mouse: { x: number, y: number } | null = null
  let ultimaAcao = performance.now()
  let tempo = 0
  let raf = 0
  const timers = new Set<number>()
  const REST_Y = 756
  const REST_S = 1.55

  function depois (fn: () => void, ms: number) {
    const id = window.setTimeout(() => {
      timers.delete(id)
      fn()
    }, ms)
    timers.add(id)
    return id
  }

  function poePata (p: Pata, x: number, y: number, s: number, r: number) {
    p.x.t = x
    p.y.t = y
    p.s.t = s
    p.r.t = r
  }

  function descansaPata (p: Pata) {
    poePata(p, p.bx, REST_Y, REST_S, 0)
    p.b.t = p.bx
    p.bow.t = 0
  }

  function olhaPara (dx: number, dy: number) {
    const d = Math.hypot(dx, dy) || 1
    const k = Math.min(1, d / 320)
    S.pupX.t = limitar(dx / d * 16 * k, -16, 16)
    S.pupY.t = limitar(dy / d * 20 * k, -20, 20)
  }

  function centroOlho () {
    const r = olhoAberto.value?.getBoundingClientRect()
    return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: 0, y: 0 }
  }

  function campoMatricula (): HTMLInputElement | null {
    return document.querySelector<HTMLInputElement>('input[autocomplete="username"]')
  }

  let medidor: CanvasRenderingContext2D | null = null

  // O olhar acompanha o cursor de texto enquanto a pessoa digita a matrícula.
  function olhaCursor () {
    const campo = campoMatricula()
    if (!campo) return
    const c = centroOlho()
    const cs = getComputedStyle(campo)
    const r = campo.getBoundingClientRect()
    medidor ??= document.createElement('canvas').getContext('2d')
    if (!medidor) return
    medidor.font = cs.font
    const largura = medidor.measureText(campo.value.slice(0, campo.selectionStart ?? campo.value.length)).width
    const dx = r.left + Number.parseFloat(cs.paddingLeft) + largura - c.x
    S.pupX.t = limitar(dx * 0.07, -16, 16)
    S.pupY.t = 16
    S.headR.t = limitar(dx * 0.012, -4, 0.5) - 1.5
  }

  function olhaMouse () {
    if (!mouse) return
    const c = centroOlho()
    olhaPara(mouse.x - c.x, mouse.y - c.y)
  }

  // Expressões: pálpebra de cima, bochecha (sorriso), sobrancelha [esq, meio, dir] e tamanho da pupila.
  const EXP: Record<EstadoMascote, { lid: number, lidR: number, cheek: number, b: [number, number, number], ps: number }> = {
    idle: { lid: -36, lidR: 0, cheek: 0.3, b: [-72, -81, -72], ps: 1 },
    sleepy: { lid: -4, lidR: 0, cheek: 0.15, b: [-62, -64, -60], ps: 1 },
    watch: { lid: -52, lidR: 0, cheek: 0, b: [-84, -96, -84], ps: 1.12 },
    hide: { lid: -52, lidR: 0, cheek: 0, b: [-78, -86, -78], ps: 1 },
    peek: { lid: -52, lidR: 0, cheek: 0, b: [-66, -82, -106], ps: 1.12 },
    think: { lid: -40, lidR: -6, cheek: 0.1, b: [-66, -80, -96], ps: 0.95 },
    error: { lid: -52, lidR: 0, cheek: 0, b: [-98, -86, -62], ps: 1 },
    success: { lid: -52, lidR: 0, cheek: 0, b: [-82, -96, -82], ps: 1 },
    wave: { lid: -44, lidR: 0, cheek: 0.45, b: [-80, -92, -80], ps: 1.05 },
  }

  function defineModo (m: EstadoMascote) {
    modo = m
    if (m !== 'wave' && m !== 'success') {
      acenando = false
      S.arcs.t = 0
    }
    const e = EXP[m]
    S.lidY.t = e.lid
    S.lidR.t = e.lidR
    S.cheek.t = e.cheek
    S.bL.t = e.b[0]
    S.bC.t = e.b[1]
    S.bR.t = e.b[2]
    S.pupS.t = e.ps
    S.happy.t = 0
    S.headR.t = 0
    S.headY.t = 0
    S.squash.t = 0
    S.thought.t = 0
    S.xeye.t = 0
    S.tear.t = 0
    S.ques.t = 0
    descansaPata(pata.A)
    descansaPata(pata.B)

    switch (m) {
      case 'idle': {
        if (mouse) {
          olhaMouse()
        } else {
          S.pupX.t = 0
          S.pupY.t = 0
        }
        break
      }
      case 'sleepy': {
        S.pupX.t = 0
        S.pupY.t = 12
        S.headR.t = 3
        break
      }
      case 'watch': {
        olhaCursor()
        break
      }
      case 'hide': {
        S.pupX.t = 0
        S.pupY.t = 0
        S.headR.t = 1
        poePata(pata.A, 488, 590, 1.7, 168)
        poePata(pata.B, 596, 606, 1.7, 192)
        break
      }
      case 'peek': {
        S.pupX.t = -9
        S.pupY.t = 12
        S.headR.t = -3.5
        S.ques.t = 1
        poePata(pata.A, 418, 630, 1.9, 168)
        break
      }
      case 'think': {
        S.pupX.t = -12
        S.pupY.t = -15
        S.headR.t = 2.5
        S.thought.t = 1
        poePata(pata.A, 340, 672, 1.8, -6)
        break
      }
      case 'error': {
        S.xeye.t = 1
        S.tear.t = 1
        S.headY.t = 18
        S.headR.t = 2
        if (!reduzido) S.headR.vel += 360
        break
      }
      case 'success': {
        S.happy.t = 1
        S.pupX.t = 0
        S.pupY.t = 0
        if (!reduzido) {
          S.squash.vel += -14
          S.headY.vel += -260
          confetes()
        }
        comecaAcenar(2800, 'cheer')
        break
      }
      case 'wave': {
        S.pupX.t = -6
        S.pupY.t = 2
        comecaAcenar(2600, 'wave')
        break
      }
    }
  }

  // Acena com a pata da frente (a do lado do focinho), dedos para cima.
  let timerAcenar = 0

  function comecaAcenar (ms: number, tipo: 'wave' | 'cheer') {
    if (reduzido) return
    acenando = tipo
    S.arcs.t = tipo === 'wave' ? 1 : 0
    window.clearTimeout(timerAcenar)
    timerAcenar = window.setTimeout(() => {
      if (!acenando) return
      acenando = false
      S.arcs.t = 0
      if (modo === 'wave' || modo === 'success') {
        descansaPata(pata.A)
        descansaPata(pata.B)
      }
    }, ms)
  }

  // Confete dourado e verde no sucesso.
  const confetes_: Array<{ n: SVGElement, x: number, y: number, vx: number, vy: number, r: number, vr: number, vida: number }> = []
  const NS = 'https://www.w3.org/2000/svg'

  function confetes () {
    const g = confete.value
    if (!g || reduzido) return
    const cores = ['#E3B477', '#A9C7B4', '#E3B477', '#356B5B']
    for (let i = 0; i < 18; i++) {
      const forma = i % 3 ? 'rect' : 'circle'
      const n = document.createElementNS(NS, forma)
      if (forma === 'rect') {
        n.setAttribute('width', '40')
        n.setAttribute('height', '20')
        n.setAttribute('x', '-20')
        n.setAttribute('y', '-10')
        n.setAttribute('rx', '7')
      } else {
        n.setAttribute('r', '14')
      }
      n.setAttribute('fill', cores[i % cores.length] as string)
      g.append(n)
      confetes_.push({ n, x: 560 + Math.random() * 140, y: 420, vx: (Math.random() - 0.5) * 760, vy: -(380 + Math.random() * 380), r: Math.random() * 360, vr: (Math.random() - 0.5) * 720, vida: 0 })
    }
  }

  function passoConfetes (dt: number) {
    for (let i = confetes_.length - 1; i >= 0; i--) {
      const c = confetes_[i]
      if (!c) continue
      c.vida += dt
      c.vy += 1100 * dt
      c.x += c.vx * dt
      c.y += c.vy * dt
      c.r += c.vr * dt
      if (c.y > 700 || c.vida > 1.6) {
        c.n.remove()
        confetes_.splice(i, 1)
        continue
      }
      c.n.setAttribute('transform', `translate(${c.x.toFixed(0)} ${c.y.toFixed(0)}) rotate(${c.r.toFixed(0)})`)
      c.n.setAttribute('opacity', Math.min(1, (1.6 - c.vida) * 2).toFixed(2))
    }
  }

  function bracoPath (p: Pata) {
    const x = p.x.v
    const y = p.y.v
    const bx = p.b.v
    const bw = p.bow.v
    return `M${f1(bx)} 880 C${f1(bx + bw)} ${f1(y + 330)} ${f1(x + bw * 0.7)} ${f1(y + 190)} ${f1(x)} ${f1(y + 8)}`
  }

  const pataT = (p: Pata) => `translate(${f1(p.x.v)} ${f1(p.y.v)}) rotate(${f1(p.r.v)}) scale(${f1(p.s.v)})`

  function desenha () {
    const sq = S.squash.v
    cabeca.value?.setAttribute('transform',
                               `translate(0 ${f1(S.headY.v)}) rotate(${f1(S.headR.v)} 630 762) translate(630 762) scale(${(1 - sq * 0.02).toFixed(3)} ${(1 + sq * 0.04).toFixed(3)}) translate(-630 -762)`)
    const hp = limitar(S.happy.v, 0, 1)
    olhoFeliz.value?.setAttribute('opacity', hp.toFixed(2))
    const xe = limitar(S.xeye.v, 0, 1)
    olhoAberto.value?.setAttribute('opacity', ((1 - hp) * (1 - xe)).toFixed(2))
    olhoX.value?.setAttribute('opacity', xe.toFixed(2))
    const tr = limitar(S.tear.v, 0, 1)
    const tp = reduzido ? 0.3 : (tempo * 0.9) % 1
    lagrima.value?.setAttribute('opacity', (tr * (1 - tp * tp)).toFixed(2))
    lagrima.value?.setAttribute('transform', `translate(-22 ${f1(46 + tp * 46)})`)
    const qs = limitar(S.ques.v, 0, 1)
    interrogacao.value?.setAttribute('opacity', qs.toFixed(2))
    interrogacao.value?.setAttribute('transform', `translate(0 ${f1((1 - qs) * 30 + (reduzido ? 0 : Math.sin(tempo * 3) * 6))}) rotate(-14 120 400)`)
    olhoAberto.value?.setAttribute('transform', `scale(1 ${Math.max(0.06, 1 - S.blink.v).toFixed(3)})`)
    pupila.value?.setAttribute('transform', `translate(${f1(S.pupX.v * 0.72)} ${f1(S.pupY.v * 0.72)}) scale(${S.pupS.v.toFixed(2)})`)
    palpebra.value?.setAttribute('transform', `translate(0 ${f1(S.lidY.v)}) rotate(${f1(S.lidR.v)})`)
    bochecha.value?.setAttribute('transform', `translate(0 ${f1((1 - limitar(S.cheek.v, 0, 1.2)) * 50)})`)
    const esq = S.bL.v
    const dir = S.bR.v
    sobrancelha.value?.setAttribute('d', `M-34 ${f1(esq)} Q0 ${f1(S.bC.v * 2 - (esq + dir) / 2)} 34 ${f1(dir)}`)
    ondas.value?.setAttribute('opacity', limitar(S.arcs.v, 0, 1).toFixed(2))
    const th = limitar(S.thought.v, 0, 1)
    pensamento.value?.setAttribute('opacity', th.toFixed(2))
    if (th > 0.02) {
      for (const [i, c] of [p1.value, p2.value, p3.value].entries()) {
        if (!c) continue
        const cx = c.getAttribute('cx')
        const cy = c.getAttribute('cy')
        const escala = th * (1 + (reduzido ? 0 : 0.18 * Math.sin(tempo * 4 - i * 1.1)))
        c.setAttribute('transform', `translate(${cx} ${cy}) scale(${escala.toFixed(3)}) translate(-${cx} -${cy})`)
      }
    }
    patas.A?.setAttribute('transform', pataT(pata.A))
    patas.B?.setAttribute('transform', pataT(pata.B))
    bracoA.value?.setAttribute('d', bracoPath(pata.A))
    bracoB.value?.setAttribute('d', bracoPath(pata.B))
  }

  let anterior = performance.now()

  function quadro (agora: number) {
    const dt = Math.min(0.033, (agora - anterior) / 1000)
    anterior = agora
    const t = agora / 1000
    tempo = t

    if (acenando === 'wave' && !reduzido) {
      const w = Math.sin(t * 7.5)
      poePata(pata.A, 246 + w * 14, 452, 1.9, 180 + Math.sin(t * 7.5 + 1) * 24)
      pata.A.b.t = 270
      pata.A.bow.t = -46 + w * 14
      S.arcs.t = 0.55 + 0.45 * Math.sin(t * 7.5)
    } else if (acenando === 'cheer' && !reduzido) {
      const w = Math.sin(t * 9)
      const u = Math.abs(Math.cos(t * 9)) * 26
      poePata(pata.A, 236 + w * 10, 452 - u, 1.9, 180 + w * 16)
      pata.A.b.t = 300
      pata.A.bow.t = -78
      poePata(pata.B, 1018 - w * 10, 452 - (26 - u), 1.9, 180 + w * 16)
      pata.B.b.t = 960
      pata.B.bow.t = 78
    }

    if (!reduzido && ['idle', 'watch', 'sleepy'].includes(modo)) {
      S.squash.t = Math.sin(t * (modo === 'sleepy' ? 1.1 : 1.8)) * (modo === 'sleepy' ? 0.55 : 0.3)
    }

    // Parado por muito tempo, o mascote cochila.
    if (modo === 'idle' && agora - ultimaAcao > 14_000) defineModo('sleepy')

    for (const m of Object.values(S)) m.passo(dt)
    for (const p of Object.values(pata)) {
      p.x.passo(dt)
      p.y.passo(dt)
      p.s.passo(dt)
      p.r.passo(dt)
      p.b.passo(dt)
      p.bow.passo(dt)
    }
    passoConfetes(dt)
    desenha()
    raf = requestAnimationFrame(quadro)
  }

  function pisca () {
    depois(() => {
      if (S.happy.t < 0.5 && !reduzido && modo !== 'hide' && modo !== 'sleepy') {
        S.blink.t = 1
        depois(() => {
          S.blink.t = 0
        }, 120)
      }
      pisca()
    }, 2200 + Math.random() * 3200)
  }

  function acordar () {
    ultimaAcao = performance.now()
    if (modo === 'sleepy') defineModo(props.estado)
  }

  function aoMoverMouse (e: PointerEvent) {
    mouse = { x: e.clientX, y: e.clientY }
    acordar()
    if (modo === 'idle') olhaMouse()
  }

  function aoDigitar (e: Event) {
    if (modo === 'watch' && e.target === campoMatricula()) olhaCursor()
  }

  watch(() => props.estado, novo => {
    acordar()
    defineModo(novo)
  })

  onMounted(() => {
    window.addEventListener('pointermove', aoMoverMouse, { passive: true })
    window.addEventListener('keydown', acordar)
    for (const ev of ['input', 'keyup', 'click', 'select']) window.addEventListener(ev, aoDigitar, true)
    anterior = performance.now()
    raf = requestAnimationFrame(quadro)
    pisca()

    // Entrada: sobe de trás do formulário, acena e relaxa para o estado atual.
    if (reduzido) {
      S.headY.v = 0
      S.headY.t = 0
      defineModo(props.estado)
      return
    }
    depois(() => {
      S.headY.t = 0
    }, 250)
    depois(() => {
      S.squash.vel += -12
    }, 780)
    depois(() => defineModo('wave'), 1000)
    depois(() => {
      if (modo === 'wave') defineModo(props.estado)
    }, 3200)
  })

  onBeforeUnmount(() => {
    cancelAnimationFrame(raf)
    window.removeEventListener('pointermove', aoMoverMouse)
    window.removeEventListener('keydown', acordar)
    for (const ev of ['input', 'keyup', 'click', 'select']) window.removeEventListener(ev, aoDigitar, true)
    window.clearTimeout(timerAcenar)
    for (const id of timers) window.clearTimeout(id)
    timers.clear()
  })
</script>

<style scoped>
.mascote-login {
  position: relative;
  width: clamp(200px, 56%, 280px);
  aspect-ratio: 1263 / 672;
  margin-left: auto;
  pointer-events: none;
}

.m {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.m-tras {
  z-index: 0;
  /* Os braços descem por trás do formulário: corta só o que passa da borda de baixo. */
  clip-path: inset(-100% -100% 0 -100%);
}

.m-frente {
  z-index: 3;
}
</style>
