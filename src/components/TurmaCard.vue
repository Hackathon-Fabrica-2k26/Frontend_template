<template>
  <v-card class="turma-card" variant="outlined">
    <!-- Canto decorativo com o ícone da turma -->
    <div aria-hidden="true" class="turma-card__canto">
      <TurmaIcone class="turma-card__icone" :tipo="icone" />
      <span class="turma-card__ponto" />
    </div>

    <h2 class="turma-card__nome">{{ nome }}</h2>

    <div class="turma-card__rodape">
      <dl class="turma-card__dados">
        <div>
          <dt>Turno</dt>
          <dd>{{ turno }}</dd>
        </div>

        <div>
          <dt>Estudantes</dt>
          <dd>{{ estudantes }}</dd>
        </div>
      </dl>

      <v-btn class="turma-card__acessar" :to="to" variant="flat">
        Acessar turma
        <ArrowRight class="ml-2" :size="14" />
      </v-btn>
    </div>
  </v-card>
</template>

<script setup lang="ts">
  import { ArrowRight } from '@lucide/vue'

  withDefaults(defineProps<{
    nome: string
    turno: string
    estudantes: number | string
    to: string
    icone?: 'lapis' | 'caderno' | 'carteira'
  }>(), { icone: 'lapis' })
</script>

<style scoped>
.turma-card {
  position: relative;
  flex-shrink: 0;
  overflow: hidden;
  width: 100%;
  max-width: 540px;
  margin-inline: auto;
  padding: 26px 36px 22px;
  background: #fdfdfb;
  border: 1px solid var(--color-support);
  border-radius: 12px;
  color: var(--color-text);
  transition: transform 0.25s var(--ease-out-expo, ease), box-shadow 0.25s var(--ease-out-expo, ease);
}

.turma-card:hover {
  transform: scale(1.03);
  box-shadow: 0 12px 24px -12px rgb(38 61 53 / 0.25);
}

.turma-card__canto {
  position: absolute;
  top: -6px;
  right: -6px;
  display: grid;
  width: 96px;
  height: 96px;
  place-items: center;
  background: #e1eae0;
  border-radius: 50%;
}

.turma-card__icone {
  width: 60px;
  height: 60px;
  margin: 14px 0 0 -2px;
}

.turma-card__ponto {
  position: absolute;
  right: 12px;
  bottom: 12px;
  width: 14px;
  height: 14px;
  background: #deae72;
  border-radius: 50%;
}

.turma-card__nome {
  padding-bottom: 38px;
  border-bottom: 1px solid #e6e9e3;
  font-size: 1.75rem;
  font-weight: 600;
  line-height: 1.3;
}

.turma-card__rodape {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-top: 26px;
}

.turma-card__dados {
  display: flex;
  margin: 0;
  gap: 44px;
}

.turma-card__dados dt {
  font-size: 0.8125rem;
  color: var(--color-primary);
  line-height: 1.4;
}

.turma-card__dados dd {
  margin: 2px 0 0;
  font-size: 1rem;
  font-weight: 500;
}

.turma-card__acessar {
  min-width: 210px;
  height: 46px;
  background: #e6eee6;
  border-radius: 8px;
  color: var(--color-primary);
  font-size: 0.9375rem;
  font-weight: 500;
  transition: background-color 0.2s var(--ease-out-expo, ease);
}

.turma-card__acessar:hover {
  background: #d8e5da;
}

@media (max-width: 480px) {
  .turma-card__rodape {
    flex-direction: column;
    align-items: stretch;
  }

  .turma-card__acessar {
    width: 100%;
  }
}
</style>
