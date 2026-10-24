<template>
  <div class="pagina-turma">
    <nav aria-label="Navegação estrutural" class="breadcrumbs">
      <router-link class="crumb-link" to="/turmas">Minhas turmas</router-link>
      <span>/</span>
      <strong>{{ turma.nome }}</strong>
    </nav>

    <section class="banner-turma">
      <div class="banner-conteudo">
        <span class="badge-nivel">{{ turma.nivel }}</span>
        <h1>{{ turma.nome }}</h1>
        <p class="banner-info">{{ turma.turno }} · {{ turma.totalEstudantes }} estudantes</p>
        <small>{{ turma.slogan }}</small>
      </div>

      <div aria-hidden="true" class="banner-grafismo">
        <span class="dot dot-1" />
        <span class="dot dot-2" />

        <div class="bloco-numero">
          <div class="circulo-outline">{{ turma.codigoNumero }}</div>
          <span>Aprender juntos</span>
        </div>

        <div class="forma-organica-laranja" />
        <div class="forma-organica-verde" />
      </div>
    </section>

    <nav aria-label="Seções da turma" class="abas-navegacao" role="tablist">
      <button
        v-for="aba in abas"
        :key="aba.id"
        :aria-selected="abaAtiva === aba.id"
        class="aba-item"
        :class="{ ativa: abaAtiva === aba.id }"
        role="tab"
        type="button"
        @click="abaAtiva = aba.id"
      >
        {{ aba.rotulo }}
      </button>
    </nav>

    <template v-if="abaAtiva === 'estudantes'">
      <header class="seccao-header">
        <div>
          <h2>Estudantes da turma</h2>
          <p>Acompanhe os perfis e registros da turma.</p>
        </div>

        <v-btn
          class="btn-adicionar-alunos"
          color="primary"
          prepend-icon="mdi-account-plus"
          @click="adicionarAlunos"
        >
          Adicionar alunos
        </v-btn>
      </header>

      <div class="grelha-conteudo">
        <MascoteCard ref="mascote" :intervalo="9000" lado="dir" saudar>
          <section v-if="estudantes.length > 0" class="cartao-lista">
            <button
              v-for="(estudante, index) in estudantesVisiveis"
              :key="estudante.id"
              class="cartao-estudante"
              type="button"
              @click="abrirDetalhes(estudante)"
            >
              <div aria-hidden="true" class="estudante-avatar">
                {{ iniciais(estudante.nome) }}
              </div>

              <div class="estudante-info">
                <h3>{{ estudante.nome }}</h3>
                <p>{{ descricaoEstudante(estudante, index) }}</p>
              </div>

              <v-icon color="primary" icon="mdi-chevron-right" />
            </button>

            <button class="ver-todos" type="button" @click="mostrarTodos = !mostrarTodos">
              {{ mostrarTodos ? 'Mostrar menos' : `Ver todos os ${turma.totalEstudantes} estudantes` }}
            </button>
          </section>

          <section v-else class="cartao-vazio">
            <div class="icone-vazio-container">
              <v-icon color="primary" icon="mdi-image-outline" size="30" />
            </div>

            <h3>Nenhum aluno cadastrado</h3>
            <p>Adicione os alunos para começar a acompanhar a turma.</p>
            <small>Os estudantes da turma aparecerão aqui.</small>
          </section>
        </MascoteCard>

        <aside class="cartao-apoio">
          <div>
            <h3>Apoio para sua turma</h3>
            <p>Crie uma atividade e registre os avanços de cada estudante.</p>
          </div>

          <div aria-hidden="true" class="apoio-ilustracao">
            <img alt="" class="icone-notebook" :src="iconeNotebookUrl">
          </div>

          <v-btn block color="primary" @click="adicionarAtividade">
            Adicionar atividade
          </v-btn>
        </aside>
      </div>

      <AlunoDetalhesModal
        v-if="estudanteSelecionado"
        :aberto="Boolean(estudanteSelecionado)"
        :aluno="estudanteSelecionado"
        :turma-nome="turma.nome"
        :turno="turma.turno"
        @fechar="estudanteSelecionado = null"
      />
    </template>

    <section v-else class="cartao-vazio estado-aba">
      <v-icon color="primary" icon="mdi-progress-clock" size="40" />
      <h3>{{ abaAtiva === 'atividades' ? 'Atividades' : 'Registros' }}</h3>
      <p>Esta seção estará disponível em breve.</p>
    </section>
  </div>
</template>

<script setup lang="ts">
  import type { Aluno } from '@/interfaces/aluno'

  import { computed, ref, useTemplateRef } from 'vue'
  import iconeNotebookUrl from '@/assets/icone-notebook.svg'

  const turma = {
    nome: '1º ano A',
    nivel: 'Ensino fundamental',
    turno: 'Manhã',
    totalEstudantes: 25,
    slogan: 'Cada descoberta começa aqui.',
    codigoNumero: '01',
  }

  const abas = [
    { id: 'estudantes', rotulo: 'Estudantes' },
  ] as const

  const abaAtiva = ref<(typeof abas)[number]['id']>('estudantes')
  const mascote = useTemplateRef<{ acenar: (ms?: number) => void }>('mascote')
  const estudantes = ref<Aluno[]>([
    { id: 14, nome: 'Alice Santos', turma: 1, meta_dados: null, responsavel: null },
    { id: 15, nome: 'Bruno Oliveira', turma: 1, meta_dados: null, responsavel: null },
    { id: 16, nome: 'Clara Souza', turma: 1, meta_dados: 1, responsavel: null },
    { id: 17, nome: 'Davi Costa', turma: 1, meta_dados: null, responsavel: null },
    { id: 18, nome: 'Elisa Martins', turma: 1, meta_dados: null, responsavel: null },
    { id: 19, nome: 'Felipe Rocha', turma: 1, meta_dados: null, responsavel: null },
    { id: 20, nome: 'Gabriela Alves', turma: 1, meta_dados: 1, responsavel: null },
    { id: 21, nome: 'Henrique Lima', turma: 1, meta_dados: null, responsavel: null },
    { id: 22, nome: 'Isabela Moraes', turma: 1, meta_dados: null, responsavel: null },
    { id: 23, nome: 'João Pedro', turma: 1, meta_dados: null, responsavel: null },
    { id: 24, nome: 'Laura Mendes', turma: 1, meta_dados: 1, responsavel: null },
    { id: 25, nome: 'Miguel Castro', turma: 1, meta_dados: null, responsavel: null },
    { id: 26, nome: 'Nina Ferreira', turma: 1, meta_dados: null, responsavel: null },
    { id: 27, nome: 'Otávio Souza', turma: 1, meta_dados: null, responsavel: null },
    { id: 28, nome: 'Paula Freitas', turma: 1, meta_dados: 1, responsavel: null },
    { id: 29, nome: 'Rafael Gomes', turma: 1, meta_dados: null, responsavel: null },
    { id: 30, nome: 'Sofia Nunes', turma: 1, meta_dados: null, responsavel: null },
    { id: 31, nome: 'Tiago Martins', turma: 1, meta_dados: null, responsavel: null },
    { id: 32, nome: 'Valentina Dias', turma: 1, meta_dados: 1, responsavel: null },
    { id: 33, nome: 'William Costa', turma: 1, meta_dados: null, responsavel: null },
    { id: 34, nome: 'Yasmin Cardoso', turma: 1, meta_dados: null, responsavel: null },
    { id: 35, nome: 'Arthur Mendes', turma: 1, meta_dados: null, responsavel: null },
    { id: 36, nome: 'Beatriz Lopes', turma: 1, meta_dados: 1, responsavel: null },
    { id: 37, nome: 'Caio Andrade', turma: 1, meta_dados: null, responsavel: null },
    { id: 38, nome: 'Manuela Reis', turma: 1, meta_dados: null, responsavel: null },
  ])
  const mostrarTodos = ref(false)
  const estudantesVisiveis = computed(() =>
    mostrarTodos.value ? estudantes.value : estudantes.value.slice(0, 4))
  const descricoesEstudantes = [
    'Perfil pedagógico atualizado',
    '2 registros recentes',
    'Perfil pedagógico atualizado',
    '1 observação pendente',
  ]
  const estudanteSelecionado = ref<Aluno | null>(null)

  function iniciais (nome: string) {
    return nome
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(parte => parte[0])
      .join('')
      .toUpperCase()
  }

  function descricaoEstudante (estudante: Aluno, index: number) {
    return descricoesEstudantes[index] ?? (
      estudante.meta_dados ? 'Perfil pedagógico atualizado' : 'Sem registros recentes'
    )
  }

  function abrirDetalhes (aluno: Aluno) {
    estudanteSelecionado.value = aluno
  }

  function adicionarAlunos () {
    // TODO: abrir o fluxo de cadastro de alunos. Por enquanto o canguru só reage ao clique.
    mascote.value?.acenar()
  }

  function adicionarAtividade () {
    // TODO: abrir o fluxo de nova atividade. Por enquanto o canguru só reage ao clique.
    mascote.value?.acenar()
  }
</script>

<style scoped>
/* Sai do v-container para usar a largura da tela, com as mesmas laterais do header. */
.pagina-turma {
  margin-inline: calc(50% - 50vw);
  padding: 0 16px 1rem;
  color: #1f3a2c;
}

@media (min-width: 640px) {
  .pagina-turma {
    padding-inline: 32px;
  }
}

@media (min-width: 1024px) {
  .pagina-turma {
    padding-inline: 112px;
  }
}

.breadcrumbs {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 1.4rem;
  color: #557063;
  font-size: 0.85rem;
}

.crumb-link {
  color: inherit;
  text-decoration: none;
}

.banner-turma {
  position: relative;
  display: flex;
  min-height: 195px;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  padding: 2.2rem 2.8rem;
  border-radius: 20px;
  background: #386754;
  color: #fff;
}

.banner-conteudo {
  position: relative;
  z-index: 2;
}

.badge-nivel {
  display: inline-block;
  margin-bottom: 0.85rem;
  padding: 0.36rem 1rem;
  border-radius: 20px;
  background: #fff;
  color: #386754;
  font-size: 0.78rem;
  font-weight: 600;
}

.banner-turma h1 {
  margin: 0 0 0.35rem;
  font-size: 2.2rem;
}

.banner-turma p {
  margin: 0 0 1.25rem;
  opacity: 0.92;
}

.banner-info {
  color: #fff;
  font-weight: 600;
  opacity: 1 !important;
}

.banner-turma small {
  font-size: 0.95rem;
  opacity: 0.85;
}

.banner-grafismo {
  position: absolute;
  inset: 0 0 0 auto;
  width: 320px;
}

.banner-grafismo::before {
  position: absolute;
  top: -150px;
  right: -28px;
  width: 290px;
  height: 290px;
  border-radius: 50%;
  background: rgb(255 255 255 / 24%);
  content: '';
  transform: rotate(-24deg);
}

.dot {
  position: absolute;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #e5a463;
}

.dot-1 { top: 35px; left: 20px; }
.dot-2 { top: 65px; left: 80px; }

.bloco-numero {
  position: absolute;
  top: 50%;
  right: 45px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  transform: translateY(-50%);
}

.circulo-outline {
  display: grid;
  width: 155px;
  height: 155px;
  place-items: center;
  border: 1.5px solid rgb(255 255 255 / 45%);
  border-radius: 50%;
  font-size: 5.4rem;
  font-weight: 700;
}

.bloco-numero span {
  position: absolute;
  bottom: 0;
  width: max-content;
  padding: 0.45rem 1.4rem;
  border-radius: 20px;
  background: #fff;
  color: #2f5646;
  font-size: 0.75rem;
  font-weight: 700;
}

.forma-organica-laranja,
.forma-organica-verde {
  position: absolute;
  border-radius: 50%;
}

.forma-organica-laranja {
  right: -25px;
  bottom: -45px;
  width: 140px;
  height: 140px;
  background: #e5a463;
}

.forma-organica-verde {
  right: 50px;
  bottom: -60px;
  width: 170px;
  height: 120px;
  background: #4b7d68;
  opacity: 0.6;
}

.abas-navegacao {
  display: flex;
  gap: 2rem;
  margin: 1.8rem 0 2.2rem;
  border-bottom: 1px solid #e2ece5;
}

.aba-item {
  position: relative;
  padding: 0.75rem 0.2rem;
  border: 0;
  background: transparent;
  color: #647d71;
  cursor: pointer;
  font: inherit;
  font-weight: 600;
}

.aba-item.ativa {
  color: #224334;
}

.aba-item.ativa::after {
  position: absolute;
  right: 0;
  bottom: -1px;
  left: 0;
  height: 3px;
  border-radius: 3px 3px 0 0;
  background: #e59f58;
  content: '';
}

.seccao-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.8rem;
}

.seccao-header h2,
.cartao-vazio h3,
.cartao-apoio h3 {
  margin: 0 0 0.3rem;
  color: #1a3629;
}

.seccao-header p,
.cartao-vazio p,
.cartao-apoio p {
  margin: 0;
  color: #6a8276;
  font-size: 0.88rem;
}

.btn-adicionar-alunos {
  min-width: 180px;
  min-height: 44px;
  transform: translateY(4px);
}

.grelha-conteudo {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 1.5rem;
}

.cartao-vazio,
.cartao-estudante,
.cartao-apoio {
  min-height: 280px;
  padding: 2rem;
  border: 1px solid #e1eee6;
  border-radius: 18px;
  background: #fff;
  text-align: center;
}

.cartao-lista {
  display: flex;
  flex-direction: column;
  min-height: 280px;
  padding: 1.15rem;
  border: 1px solid #e1eee6;
  border-radius: 18px;
  background: #fff;
}

.cartao-estudante {
  display: flex;
  min-height: 60px;
  align-items: center;
  gap: 0.7rem;
  width: 100%;
  padding: 0.55rem 0.7rem;
  border: 1px solid #e1eee6;
  border-radius: 10px;
  background: #fff;
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
}

.cartao-estudante + .cartao-estudante {
  margin-top: 0.35rem;
}

.cartao-estudante:hover,
.cartao-estudante:focus-visible {
  border-color: #8ebda2;
  box-shadow: 0 8px 20px rgb(38 61 53 / 10%);
  outline: none;
  transform: translateY(-2px);
}

.estudante-avatar {
  display: grid;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 50%;
  background: #eaf3ed;
  color: #27523f;
  font-size: 0.72rem;
  font-weight: 700;
}

.cartao-estudante h3 {
  margin: 0;
  color: #1b3829;
  font-size: 0.84rem;
}

.cartao-estudante p {
  margin: 0;
  color: #6a8276;
  font-size: 0.7rem;
}

.estudante-info {
  min-width: 0;
  flex: 1;
}

.ver-todos {
  margin-top: auto;
  padding: 0.75rem 0 0.15rem;
  border: 0;
  background: transparent;
  color: #2b6a51;
  cursor: pointer;
  font-size: 0.72rem;
  font-weight: 600;
}

.cartao-vazio {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.icone-vazio-container {
  display: grid;
  width: 58px;
  height: 58px;
  margin-bottom: 1.4rem;
  place-items: center;
  border-radius: 50%;
  background: #eaf3ed;
}

.cartao-vazio small {
  margin-top: 0.25rem;
  color: #8da498;
  font-size: 0.8rem;
}

.cartao-apoio {
  display: flex;
  flex-direction: column;
  align-self: start;
  box-sizing: border-box;
  justify-content: space-between;
  background: #eef5f0;
  border-color: #d9eae0;
  text-align: left;
}

.apoio-ilustracao {
  display: grid;
  min-height: 100px;
  place-items: center;
}

.icone-notebook {
  width: 104px;
  height: 104px;
}

.estado-aba {
  min-height: 240px;
}

@media (max-width: 900px) {
  .grelha-conteudo {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 680px) {
  .btn-adicionar-alunos {
    width: 100%;
  }

  .banner-turma {
    padding: 1.8rem 1.4rem;
  }

  .banner-grafismo {
    display: none;
  }

  .seccao-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
