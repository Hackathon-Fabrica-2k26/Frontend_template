<template>
  <div class="pagina-criar-atividade">
    <!-- Fundo contextual inspirado no design de turma -->
    <div class="turma-contexto">
      <nav aria-label="Navegação" class="breadcrumbs">
        <router-link class="crumb-link" to="/turmas">Minhas turmas</router-link>
        <span class="divisor-crumb">/</span>
        <span class="crumb-atual">1º ano A</span>
      </nav>

      <section class="banner-turma">
        <div class="banner-conteudo">
          <span class="badge-nivel">Ensino fundamental</span>
          <h1 class="banner-titulo">1º ano A</h1>
          <p class="banner-info">Manhã · 0 estudantes</p>
          <small class="banner-sub">Cada descoberta começa aqui.</small>
        </div>

        <div aria-hidden="true" class="banner-grafismo">
          <div class="bloco-numero">
            <span class="numero-destaque">01</span>
            <span class="numero-legenda">Aprender juntos</span>
          </div>
        </div>
      </section>

      <div class="abas-turma">
        <button class="aba-item ativa" type="button">Estudantes</button>
      </div>

      <div class="layout-conteudo">
        <section class="secao-estudantes">
          <header class="estudantes-header">
            <div>
              <h2 class="estudantes-titulo">Estudantes da turma</h2>
              <p class="estudantes-subtitulo">Acompanhe os perfis e registros da turma.</p>
            </div>

            <button class="btn-adicionar-foto" type="button">
              <Camera :size="18" />
              <span>Adicionar foto</span>
            </button>
          </header>

          <div class="lista-estudantes-mock">
            <div
              v-for="(estudante, index) in estudantesExemplo"
              :key="estudante.nome"
              class="item-estudante"
            >
              <div class="avatar-estudante" :class="`avatar-tom-${index % 4}`">
                {{ estudante.inicial }}
              </div>

              <div class="info-estudante">
                <span class="nome-estudante">{{ estudante.nome }}</span>
                <span class="status-estudante">{{ estudante.status }}</span>
              </div>
            </div>

            <div class="ver-todos-container">
              <span class="ver-todos-texto">Ver todos os 25 estudantes</span>
            </div>
          </div>
        </section>

        <aside class="card-atividades-turma">
          <div class="atividades-cabecalho">
            <h3 class="apoio-titulo">Atividades da turma</h3>
            <p class="apoio-subtitulo">Acompanhe os envios e os relatórios individuais dos seus alunos.</p>
          </div>

          <div class="atividades-meta">
            <span class="atividades-contador">1 atividade cadastrada</span>

            <button
              class="link-nova-atividade"
              type="button"
              @click="modalAberto = true"
            >
              + Nova atividade
            </button>
          </div>

          <div class="lista-atividades-resumo">
            <div
              class="item-atividade-card"
              role="button"
              tabindex="0"
              @click="modalAberto = true"
              @keydown.enter="modalAberto = true"
            >
              <div aria-hidden="true" class="atividade-icone">
                <FileText :size="20" />
              </div>

              <div class="atividade-dados">
                <strong>Explorando as vogais</strong>
                <small>25 relatórios disponíveis</small>
              </div>

              <ChevronRight aria-hidden="true" class="atividade-seta" :size="18" />
            </div>
          </div>

          <button
            class="btn-ver-atividades"
            type="button"
            @click="modalAberto = true"
          >
            <span>Ver todas as atividades</span>
            <ArrowRight :size="16" />
          </button>
        </aside>
      </div>
    </div>

    <!-- Modal Principal de Criar Atividade -->
    <CriarAtividadeModal
      v-model="modalAberto"
      turma-id="1"
      turma-nome="1º ano A"
      @created="tratarAtividadeCriada"
    />
  </div>
</template>

<script setup lang="ts">
  import type { Atividade } from '@/interfaces/atividade'
  import { ArrowRight, Camera, ChevronRight, FileText } from '@lucide/vue'
  import { ref } from 'vue'
  import { notify } from '@/utils/notify'

  const modalAberto = ref(true)

  const estudantesExemplo = [
    { inicial: 'A', nome: 'Alice Santos', status: 'Perfil pedagógico atualizado' },
    { inicial: 'B', nome: 'Bruno Oliveira', status: '2 registros recentes' },
    { inicial: 'C', nome: 'Clara Souza', status: 'Perfil pedagógico atualizado' },
    { inicial: 'D', nome: 'Davi Costa', status: '1 observação pendente' },
  ]

  function tratarAtividadeCriada (atividade: Atividade): void {
    notify.success(`Atividade "${atividade.nome}" criada com sucesso!`)
  }
</script>

<style scoped>
.pagina-criar-atividade {
  position: relative;
  min-height: calc(100vh - 100px);
  padding: 8px 16px 40px;
  font-family: var(--font-sans, 'Poppins', sans-serif);
}

.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  margin-bottom: 20px;
}

.crumb-link {
  color: #356b5b;
  text-decoration: none;
  font-weight: 500;
}

.divisor-crumb {
  color: #718278;
}

.crumb-atual {
  color: #263d35;
  font-weight: 600;
}

/* Banner da Turma */
.banner-turma {
  background: linear-gradient(135deg, #285444 0%, #1f4236 100%);
  border-radius: 24px;
  padding: 32px 40px;
  color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;
  margin-bottom: 24px;
}

.badge-nivel {
  display: inline-block;
  padding: 4px 14px;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 12px;
}

.banner-titulo {
  font-size: 38px;
  font-weight: 700;
  line-height: 1.15;
  margin-bottom: 8px;
}

.banner-info {
  font-size: 16px;
  opacity: 0.9;
  margin-bottom: 4px;
}

.banner-sub {
  font-size: 14px;
  opacity: 0.75;
}

.banner-grafismo {
  position: relative;
}

.bloco-numero {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.25);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: rgba(255, 255, 255, 0.08);
}

.numero-destaque {
  font-size: 42px;
  font-weight: 700;
  line-height: 1;
}

.numero-legenda {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.85;
}

/* Abas */
.abas-turma {
  display: flex;
  border-bottom: 1px solid #dbe5df;
  margin-bottom: 24px;
}

.aba-item {
  padding: 12px 24px;
  background: none;
  border: none;
  font-size: 16px;
  font-weight: 600;
  color: #718278;
  position: relative;
  cursor: pointer;
}

.aba-item.ativa {
  color: #1f382b;
}

.aba-item.ativa::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 3px;
  background-color: #d18d45;
  border-radius: 3px 3px 0 0;
}

/* Layout */
.layout-conteudo {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 24px;
}

@media (max-width: 960px) {
  .layout-conteudo {
    grid-template-columns: 1fr;
  }
}

/* Estudantes */
.estudantes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.estudantes-titulo {
  font-size: 22px;
  font-weight: 700;
  color: #1f382b;
}

.estudantes-subtitulo {
  font-size: 14px;
  color: #5b7566;
  margin-top: 2px;
}

.btn-adicionar-foto {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 12px;
  background-color: #285444;
  color: #ffffff;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.lista-estudantes-mock {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e5ede8;
  overflow: hidden;
}

.item-estudante {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f4f1;
}

.avatar-estudante {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 15px;
}

.avatar-tom-0 { background: #d7e8dd; color: #234f38; }
.avatar-tom-1 { background: #e3eedd; color: #3b5a2b; }
.avatar-tom-2 { background: #dbe4ea; color: #2c4a63; }
.avatar-tom-3 { background: #eedfd3; color: #6e4620; }

.info-estudante {
  display: flex;
  flex-direction: column;
}

.nome-estudante {
  font-size: 15px;
  font-weight: 600;
  color: #1f382b;
}

.status-estudante {
  font-size: 13px;
  color: #718278;
}

.ver-todos-container {
  padding: 16px;
  text-align: center;
  background: #fafcfb;
}

.ver-todos-texto {
  font-size: 14px;
  font-weight: 600;
  color: #356b5b;
  cursor: pointer;
}

/* Card Atividades da Turma */
.card-atividades-turma {
  background: #eef5f0;
  border-radius: 18px;
  border: 1px solid #d9eae0;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
  min-height: 280px;
}

.atividades-cabecalho h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1a3629;
  margin-bottom: 6px;
}

.atividades-cabecalho p {
  font-size: 14px;
  color: #6a8276;
  line-height: 1.4;
  margin: 0;
}

.atividades-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
}

.atividades-contador {
  color: #6a8276;
  font-weight: 500;
}

.link-nova-atividade {
  background: none;
  border: none;
  color: #274e3c;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s;
}

.link-nova-atividade:hover {
  color: #1a3629;
  text-decoration: underline;
}

.lista-atividades-resumo {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.item-atividade-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid #e1eee6;
  border-radius: 12px;
  background: #ffffff;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
}

.item-atividade-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(39, 78, 60, 0.08);
  border-color: #c7ded2;
}

.atividade-icone {
  display: grid;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 8px;
  background: #f0f7f3;
  color: #274e3c;
}

.atividade-dados {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  text-align: left;
}

.atividade-dados strong {
  font-size: 14px;
  font-weight: 600;
  color: #1a3629;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.atividade-dados small {
  font-size: 12px;
  color: #7b9084;
  margin-top: 1px;
}

.atividade-seta {
  color: #386754;
  flex-shrink: 0;
}

.btn-ver-atividades {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  background-color: #274e3c;
  color: #ffffff;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-top: auto;
  transition: background-color 0.2s;
}

.btn-ver-atividades:hover {
  background-color: #1a3629;
}
</style>
