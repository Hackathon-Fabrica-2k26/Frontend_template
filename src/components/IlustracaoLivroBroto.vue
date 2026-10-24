<template>
  <svg
    aria-hidden="true"
    class="livro-broto"
    fill="none"
    viewBox="0 0 240 150"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="96"
      cy="86"
      fill="#a9c7b4"
      opacity="0.35"
      r="46"
    />

    <circle
      class="sol"
      cx="178"
      cy="30"
      fill="#e3b477"
      r="11"
    />

    <path
      class="trilha"
      d="M6 128c16-12 28 6 46-4s28-14 46-4"
      stroke="#a9c7b4"
      stroke-dasharray="3 5"
      stroke-linecap="round"
      stroke-width="2"
    />

    <path d="M150 124c24-4 44-22 62-42" stroke="#e3b477" stroke-linecap="round" stroke-width="2" />

    <g stroke="#356b5b" stroke-linecap="round" stroke-linejoin="round" stroke-width="3">
      <path d="M48 70 98 82v54L48 124Z" fill="#f7f7f1" />
      <path d="M148 70 98 82v54l50-12Z" fill="#f7f7f1" />
      <path d="M58 86l30 7M58 98l30 7M58 110l30 7M138 86l-30 7M138 98l-30 7M138 110l-30 7" opacity="0.55" />

      <g class="broto">
        <path d="M98 82V52" />
        <path d="M98 62c-14 0-22-8-22-20 14 0 22 8 22 20Z" fill="#a9c7b4" />
        <path d="M98 56c0-14 8-22 22-22 0 14-8 22-22 22Z" fill="#a9c7b4" />
      </g>
    </g>

    <g class="broto-pequeno" stroke="#356b5b" stroke-linecap="round" stroke-width="2.5">
      <path d="M208 124V98" />
      <path d="M208 106c-9 0-14-5-14-12 9 0 14 5 14 12ZM208 100c0-9 5-14 13-14 0 9-5 14-13 14Z" fill="#a9c7b4" />
    </g>

    <path d="M20 26h8M24 22v8M214 56h8M218 52v8" stroke="#e3b477" stroke-linecap="round" stroke-width="2" />
  </svg>
</template>

<style scoped>
.livro-broto { width: 100%; height: auto; overflow: visible; }

.broto,
.broto-pequeno {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: broto-balanca 4s ease-in-out infinite;
}

.broto-pequeno { animation-delay: -1.6s; }

.sol { animation: sol-pulsa 3.2s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }

@keyframes broto-balanca {
  0%, 100% { rotate: -3deg; }
  50% { rotate: 4deg; }
}

@keyframes sol-pulsa {
  0%, 100% { scale: 1; }
  50% { scale: 1.12; }
}

@media (prefers-reduced-motion: reduce) {
  .broto, .broto-pequeno, .sol { animation: none; }
}
</style>
