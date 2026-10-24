<template>
  <div
    v-if="aberto"
    class="modal-backdrop"
    role="presentation"
    @click.self="fechar"
  >
    <section
      aria-labelledby="aluno-detalhes-titulo"
      aria-modal="true"
      class="modal-card"
      role="dialog"
    >
      <header class="modal-header">
        <div>
          <span class="modal-eyebrow">Perfil do estudante</span>
          <h2 id="aluno-detalhes-titulo">Detalhes do aluno</h2>
        </div>

        <button
          aria-label="Fechar detalhes do aluno"
          class="btn-fechar"
          type="button"
          @click="fechar"
        >
          <v-icon icon="mdi-close" size="20" />
        </button>
      </header>

      <div class="divisor" />

      <div class="modal-corpo">
        <section class="identificacao">
          <div aria-hidden="true" class="avatar">
            {{ iniciais }}
          </div>

          <div>
            <h3>{{ aluno.nome }}</h3>
            <p>{{ turmaNome }} · {{ turno }}</p>
            <span class="status">Estudante ativo</span>
          </div>
        </section>

        <section aria-label="Informações do estudante" class="metadados">
          <div>
            <span>Matrícula</span>
            <strong>{{ matricula }}</strong>
          </div>

          <div>
            <span>Cadastro</span>
            <strong>{{ dataCadastro }}</strong>
          </div>

          <div>
            <span>Perfil DISC</span>
            <strong>{{ perfilDisc }}</strong>
          </div>
        </section>

        <div class="aba-atual">Visão geral</div>

        <section class="bloco">
          <h4>Acompanhamento</h4>

          <p>
            Participa das propostas em sala e demonstra interesse pela leitura, escrita e
            atividades de contagem.
          </p>
        </section>

        <section class="bloco atividades">
          <div class="bloco-titulo">
            <h4>Atividades</h4>
            <span class="contador">{{ atividades.length }}</span>
          </div>

          <article v-for="atividade in atividades" :key="atividade.id" class="atividade">
            <div class="atividade-cabecalho">
              <v-icon color="primary" icon="mdi-file-document-outline" size="22" />

              <div>
                <h5>{{ atividade.titulo }}</h5>
                <span>Enviada em {{ atividade.data }}</span>
              </div>
            </div>

            <p>{{ atividade.descricao }}</p>

            <div class="atividade-rodape">
              <span class="relatorio-disponivel">
                <v-icon icon="mdi-check" size="15" />
                Relatório disponível
              </span>

              <button class="btn-exportar" type="button">
                <v-icon icon="mdi-download-outline" size="16" />
                Exportar relatório
              </button>
            </div>
          </article>
        </section>
      </div>

      <footer class="modal-footer">
        <p>Exporte os relatórios das duas atividades em conjunto.</p>

        <button class="btn-exportar-todas" type="button">
          <v-icon icon="mdi-download-outline" size="18" />
          Exportar todas as atividades
        </button>
      </footer>
    </section>
  </div>
</template>

<script setup lang="ts">
  import type { Aluno } from '@/interfaces/aluno'

  import { computed } from 'vue'

  const props = defineProps<{
    aluno: Aluno
    aberto: boolean
    turmaNome: string
    turno: string
  }>()

  const emit = defineEmits<{
    fechar: []
  }>()

  const iniciais = computed(() =>
    props.aluno.nome
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(nome => nome[0])
      .join('')
      .toUpperCase(),
  )

  const matricula = computed(() => `AL-${String(props.aluno.id).padStart(4, '0')}`)
  const dataCadastro = computed(() => props.aluno.created_at
    ? new Date(props.aluno.created_at).toLocaleDateString('pt-BR')
    : 'Não informado')
  const perfilDisc = computed(() => props.aluno.meta_dados ? 'Cadastrado' : 'Não informado')
  const atividades = [
    {
      id: 1,
      titulo: 'Explorando as vogais',
      data: '21/10/2026',
      descricao: 'Reconhece as vogais nas palavras trabalhadas.',
    },
    {
      id: 2,
      titulo: 'Contando até 10',
      data: '21/10/2026',
      descricao: 'Associa os números às quantidades apresentadas.',
    },
  ]

  function fechar () {
    emit('fechar')
  }
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: flex;
  align-items: stretch;
  justify-content: flex-end;
  padding: 1.25rem 0 1.25rem 1.25rem;
  background: rgb(22 36 28 / 45%);
}

.modal-card {
  display: flex;
  width: min(100%, 530px);
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border-radius: 20px 0 0 20px;
  background: #fff;
  box-shadow: 0 16px 40px rgb(0 0 0 / 18%);
  color: #1a3628;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.3rem 1.6rem 1rem;
}

.modal-eyebrow {
  color: #739082;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.modal-header h2 {
  margin: 0.25rem 0 0;
  color: #173627;
  font-size: 1.2rem;
}

.btn-fechar {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: #f1f6f3;
  color: #3b5b4c;
  cursor: pointer;
}

.divisor {
  height: 1px;
  margin: 0 1.6rem;
  background: #e6eee9;
}

.modal-corpo {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  overflow-y: auto;
  padding: 1.4rem 1.6rem;
}

.identificacao {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  display: grid;
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 18px;
  background: #e8f3ed;
  color: #2b5643;
  font-size: 1.15rem;
  font-weight: 700;
}

.identificacao h3 {
  margin: 0 0 0.25rem;
  color: #193627;
  font-size: 1.35rem;
}

.identificacao p {
  margin: 0 0 0.45rem;
  color: #557264;
  font-size: 0.85rem;
}

.status {
  display: inline-block;
  padding: 0.2rem 0.7rem;
  border-radius: 14px;
  background: #e8f3ed;
  color: #2b5643;
  font-size: 0.72rem;
  font-weight: 600;
}

.metadados {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  padding: 0.9rem 1rem;
  border: 1px solid #edf4f0;
  border-radius: 12px;
  background: #fafcfb;
}

.metadados div {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.metadados span {
  color: #668375;
  font-size: 0.72rem;
}

.metadados strong {
  color: #1b3829;
  font-size: 0.85rem;
}

.aba-atual {
  padding: 0.45rem;
  border: 1px solid #e6f0e9;
  border-radius: 9px;
  box-shadow: 0 1px 4px rgb(38 61 53 / 7%);
  color: #2b5643;
  font-size: 0.78rem;
  font-weight: 700;
  text-align: center;
}

.bloco h4 {
  margin: 0 0 0.4rem;
  color: #1a3829;
  font-size: 0.98rem;
}

.bloco p {
  margin: 0;
  color: #4b6859;
  font-size: 0.85rem;
  line-height: 1.45;
}

.bloco-titulo {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.bloco-titulo h4 {
  margin-bottom: 0;
}

.contador {
  display: grid;
  width: 18px;
  height: 18px;
  place-items: center;
  border-radius: 50%;
  background: #eaf3ed;
  color: #27523f;
  font-size: 0.68rem;
  font-weight: 700;
}

.atividades {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.atividade {
  padding: 0.75rem 0.8rem 0.6rem;
  border: 1px solid #e1eee6;
  border-radius: 10px;
}

.atividade-cabecalho {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
}

.atividade h5 {
  margin: 0;
  color: #1b3829;
  font-size: 0.84rem;
}

.atividade-cabecalho span {
  color: #7b9487;
  font-size: 0.66rem;
}

.atividade > p {
  margin: 0.65rem 0;
  font-size: 0.75rem;
}

.atividade-rodape {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding-top: 0.55rem;
  border-top: 1px dashed #e8f0ec;
}

.relatorio-disponivel {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  color: #2b5643;
  font-size: 0.68rem;
}

.btn-exportar,
.btn-exportar-todas {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  border: 0;
  background: transparent;
  color: #274f3c;
  cursor: pointer;
  font-size: 0.68rem;
  font-weight: 600;
}

.modal-footer {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding: 0.85rem 1.6rem 1.1rem;
  border-top: 1px solid #e7efe9;
}

.modal-footer p {
  margin: 0;
  color: #637d71;
  font-size: 0.68rem;
}

.btn-exportar-todas {
  justify-content: center;
  width: 100%;
  padding: 0.65rem;
  border-radius: 9px;
  background: #274d3d;
  color: #fff;
  font-size: 0.78rem;
}

@media (max-width: 480px) {
  .modal-backdrop {
    padding: 0;
  }

  .modal-card {
    width: 100%;
    border-radius: 0;
  }

  .metadados {
    grid-template-columns: 1fr;
  }
}
</style>
