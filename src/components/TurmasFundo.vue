<template>
  <div aria-hidden="true" class="turmas-fundo">
    <!-- Pontilhado -->
    <div class="turmas-fundo__pontos" />

    <!-- Manchas verdes nos cantos inferiores -->
    <svg class="turmas-fundo__mancha turmas-fundo__mancha--esq" fill="none" viewBox="0 0 363 260" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 40C70 0 190 10 262 90c52 58 95 120 101 170H0V40Z" fill="#DCE6DC" />
      <path d="M0 130c60-40 150-44 214 12 38 33 62 78 66 118H0V130Z" fill="#C1D5C5" />
    </svg>

    <svg class="turmas-fundo__mancha turmas-fundo__mancha--dir" fill="none" viewBox="0 0 352 290" xmlns="http://www.w3.org/2000/svg">
      <path d="M352 0C230 0 110 70 40 150 15 180 5 230 0 290h352V0Z" fill="#DCE6DC" />
      <path d="M352 120c-120-10-240 50-266 170h266V120Z" fill="#C1D5C5" />
    </svg>

    <!-- Detalhes soltos -->
    <svg class="turmas-fundo__circulo" fill="none" viewBox="0 0 74 74" xmlns="http://www.w3.org/2000/svg">
      <circle
        cx="37"
        cy="37"
        r="36"
        stroke="#BFD3C4"
        stroke-width="1.5"
      />
    </svg>

    <svg class="turmas-fundo__onda" fill="none" viewBox="0 0 236 28" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 8C50 20 110 24 150 16s60-12 86 4" stroke="#EBCBA0" stroke-linecap="round" stroke-width="1.6" />
    </svg>

    <svg class="turmas-fundo__mais" style="left: 6.5%; top: 372px" viewBox="0 0 14 14"><path d="M7 1v12M1 7h12" /></svg>
    <svg class="turmas-fundo__mais" style="left: 20.5%; top: 419px" viewBox="0 0 14 14"><path d="M7 1v12M1 7h12" /></svg>
    <svg class="turmas-fundo__mais" style="left: 25%; top: 531px" viewBox="0 0 14 14"><path d="M7 1v12M1 7h12" /></svg>
    <svg class="turmas-fundo__mais" style="left: 73.8%; top: 75px" viewBox="0 0 14 14"><path d="M7 1v12M1 7h12" /></svg>
    <svg class="turmas-fundo__mais" style="left: 95.5%; top: 114px" viewBox="0 0 14 14"><path d="M7 1v12M1 7h12" /></svg>
    <svg class="turmas-fundo__mais" style="left: 77.5%; top: 464px" viewBox="0 0 14 14"><path d="M7 1v12M1 7h12" /></svg>

    <span class="turmas-fundo__ponto" style="left: 17.3%; top: 177px" />
    <span class="turmas-fundo__ponto" style="left: 78%; top: 295px; background: #E3B477" />
    <span class="turmas-fundo__ponto" style="left: 21%; top: 383px; background: #A9C7B4" />
    <span class="turmas-fundo__ponto" style="left: 90%; top: 395px; background: #A9C7B4" />

    <!-- Ilustrações -->
    <IlustracaoCaderno class="turmas-fundo__ilustracao" style="left: 7.5%; top: 366px; width: 19%" />
    <IlustracaoQuadro class="turmas-fundo__ilustracao" style="right: 4.5%; top: 127px; width: 18.5%" />
    <IlustracaoMesa class="turmas-fundo__ilustracao" style="right: 5%; top: 395px; width: 18.5%" />
  </div>
</template>

<style scoped>
.turmas-fundo {
  position: fixed;
  inset: 164px 0 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.turmas-fundo__pontos {
  position: absolute;
  top: 0;
  left: 0;
  width: 58%;
  height: 260px;
  background-image: radial-gradient(circle, rgb(255 255 255 / 0.85) 1.4px, transparent 1.8px);
  background-size: 9px 9px;
  mask-image: linear-gradient(to bottom, #000 0%, transparent 100%);
}

.turmas-fundo__mancha {
  position: absolute;
  bottom: 0;
  height: auto;
}

.turmas-fundo__mancha--esq {
  left: 0;
  width: 29%;
  min-width: 220px;
}

.turmas-fundo__mancha--dir {
  right: 0;
  width: 28%;
  min-width: 220px;
}

.turmas-fundo__circulo {
  position: absolute;
  top: 84px;
  left: 17.7%;
  width: 74px;
}

.turmas-fundo__onda {
  position: absolute;
  top: 232px;
  left: 0;
  width: 18.8%;
}

.turmas-fundo__mais {
  position: absolute;
  width: 13px;
  height: 13px;
  fill: none;
  stroke: #a9c7b4;
  stroke-linecap: round;
  stroke-width: 1.4;
}

.turmas-fundo__ponto {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #e3b477;
  border-radius: 50%;
}

.turmas-fundo__ilustracao {
  position: absolute;
  height: auto;
  animation: fundo-entra 0.9s var(--ease-out-expo, ease) 0.3s backwards;
}

.turmas-fundo__mancha {
  animation: mancha-sobe 1s var(--ease-out-expo, ease) backwards;
}

.turmas-fundo__pontos,
.turmas-fundo__circulo,
.turmas-fundo__onda {
  animation: fundo-fade 1.2s ease 0.2s backwards;
}

@keyframes fundo-entra {
  from {
    opacity: 0;
    translate: 0 24px;
  }
}

@keyframes mancha-sobe {
  from {
    translate: 0 40%;
  }
}

@keyframes fundo-fade {
  from {
    opacity: 0;
  }
}

/* Telas estreitas: só o pontilhado e as manchas, sem as ilustrações. */
@media (max-width: 1023px) {
  .turmas-fundo__ilustracao,
  .turmas-fundo__circulo,
  .turmas-fundo__onda,
  .turmas-fundo__mais,
  .turmas-fundo__ponto {
    display: none;
  }
}
</style>
