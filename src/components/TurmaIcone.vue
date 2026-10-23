<template>
  <svg aria-hidden="true" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <g stroke="#3F5A4E" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6">
      <!-- Lápis -->
      <template v-if="tipo === 'lapis'">
        <g transform="rotate(-45 24 24)">
          <rect
            fill="#F7F7F1"
            height="12"
            rx="1.5"
            width="30"
            x="9"
            y="18"
          />

          <path d="M9 18l-7 6 7 6" fill="#E8C9A0" />
          <path d="M4 22.4l-2 1.6 2 1.6" fill="#3F5A4E" />
          <path d="M16 18v12" />

          <rect
            fill="#A9C7B4"
            height="12"
            rx="2"
            width="7"
            x="39"
            y="18"
          />
        </g>
      </template>

      <!-- Caderno -->
      <template v-else-if="tipo === 'caderno'">
        <rect
          fill="#F7F7F1"
          height="38"
          rx="3"
          width="26"
          x="14"
          y="5"
        />

        <path d="M6 12h10M6 19h10M6 26h10M6 33h10" />
        <path d="M32 5v10l3-2.4 3 2.4V5" fill="#E8C9A0" />
        <path d="M21 22h12M21 28h12M21 34h8" />
      </template>

      <!-- Carteira -->
      <template v-else>
        <rect
          fill="#E8C9A0"
          height="4"
          rx="1"
          width="38"
          x="5"
          y="9"
        />

        <path d="M9 13v26M41 13v26" />
        <path d="M14 13v6h22v-6" />

        <rect
          fill="#F7F7F1"
          height="9"
          rx="2"
          width="14"
          x="18"
          y="22"
        />

        <rect
          fill="#A9C7B4"
          height="4"
          rx="1"
          width="20"
          x="15"
          y="32"
        />

        <path d="M19 36v5M31 36v5" />
      </template>
    </g>
  </svg>
</template>

<script setup lang="ts">
  defineProps<{ tipo: 'lapis' | 'caderno' | 'carteira' }>()
</script>
