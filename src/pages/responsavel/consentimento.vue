<template>
  <main class="consentimento-page">
    <div class="consentimento-card">
      <header class="card-header">
        <div class="logo-wrapper">
          <span
            aria-label="Marsupi"
            class="logo-marsupi"
            role="img"
            :style="{ maskImage: `url(${logoUrl})` }"
          />
        </div>

        <div class="badge-tag">
          <ShieldCheck :size="16" />
          <span>LGPD · Artigo 14</span>
        </div>

        <h1 class="titulo-principal">
          Autorização dos Pais e Responsáveis
        </h1>

        <p class="subtitulo">
          Apoio pedagógico inclusivo com tecnologia para o estudante
        </p>
      </header>

      <!-- Estado de Carregamento -->
      <div v-if="carregando" class="estado-carregando">
        <MarsupiLoading label="Carregando dados da autorização..." />
      </div>

      <!-- Estado: Já Autorizado -->
      <section v-else-if="statusAtual === 'ativo'" class="estado-sucesso">
        <div class="icone-sucesso-wrapper">
          <Check :size="32" />
        </div>

        <h2>Autorização ativa!</h2>

        <p class="aluno-destaque">
          Estudante: <strong>{{ aluno?.nome || `Aluno #${alunoId}` }}</strong>
        </p>

        <p class="mensagem-sucesso">
          O consentimento para o tratamento pedagógico assistido por IA está registrado e em pleno vigor.
          <span v-if="consentimentoExistente?.aceito_em" class="data-registro">
            Registrado em {{ formatarData(consentimentoExistente.aceito_em) }}.
          </span>
        </p>

        <div class="caixa-garantias">
          <h3>Garantias ativas para o seu filho:</h3>

          <ul>
            <li v-for="(garantia, i) in termo.garantias" :key="i">
              <Check :size="14" />
              <span>{{ garantia }}</span>
            </li>
          </ul>
        </div>

        <div class="acoes-revogacao">
          <v-btn
            v-if="!confirmandoRevogacao"
            color="error"
            size="small"
            variant="text"
            @click="confirmandoRevogacao = true"
          >
            Desejo revogar esta autorização
          </v-btn>

          <div v-else class="painel-confirmar-revogacao">
            <p>
              Ao revogar, todos os relatórios pedagógicos e dados derivados de IA do estudante serão excluídos permanentemente.
            </p>

            <div class="botoes-revogacao">
              <v-btn
                color="error"
                :loading="salvando"
                size="small"
                @click="executarRevogacao"
              >
                Confirmar revogação e exclusão
              </v-btn>

              <v-btn
                :disabled="salvando"
                size="small"
                variant="outlined"
                @click="confirmandoRevogacao = false"
              >
                Voltar
              </v-btn>
            </div>
          </div>
        </div>
      </section>

      <!-- Estado: Formulário de Consentimento -->
      <section v-else class="formulario-consentimento">
        <!-- Identificação do Estudante -->
        <div class="identificacao-bloco">
          <span class="rotulo-campo">Estudante:</span>
          <strong class="nome-estudante">{{ aluno?.nome || `Estudante #${alunoId}` }}</strong>
        </div>

        <!-- Termos em Linguagem Clara (Legal Design) -->
        <div class="termos-informativos">
          <div
            v-for="(topico, idx) in termo.topicos"
            :key="idx"
            class="topico-card"
          >
            <h3 class="topico-titulo">
              {{ topico.titulo }}
            </h3>

            <p class="topico-descricao">
              {{ topico.descricao }}
            </p>
          </div>
        </div>

        <!-- Formulário de Aceite -->
        <form class="form-aceite" @submit.prevent="concluirConsentimento">
          <v-text-field
            v-model="nomeResponsavel"
            color="primary"
            :disabled="salvando"
            label="Seu nome completo (Responsável legal)"
            placeholder="Ex: Maria dos Santos"
            required
            variant="outlined"
          />

          <v-select
            v-model="parentesco"
            color="primary"
            :disabled="salvando"
            :items="opcoesParentesco"
            label="Grau de parentesco"
            required
            variant="outlined"
          />

          <div class="checkbox-termo">
            <input
              id="concordo-check"
              v-model="concordou"
              :disabled="salvando"
              required
              type="checkbox"
            >

            <label for="concordo-check">
              Declaro que sou responsável legal pelo estudante e concordo com o uso pedagógico assistido por tecnologia nos termos da Lei Geral de Proteção de Dados (Art. 14 da LGPD).
            </label>
          </div>

          <v-btn
            block
            class="btn-autorizar"
            color="primary"
            :disabled="!formularioValido"
            :loading="salvando"
            size="large"
            type="submit"
          >
            Concordar e autorizar
          </v-btn>
        </form>
      </section>

      <footer class="card-footer">
        <small>
          Marsupi · Plataforma Pedagógica Inclusiva · Respeito à LGPD e ao Estatuto da Criança e do Adolescente.
        </small>
      </footer>
    </div>
  </main>
</template>

<script setup lang="ts">
  import type { Consentimento, StatusConsentimento } from '@/interfaces/consentimento'
  import { Check, ShieldCheck } from '@lucide/vue'
  import { computed, onMounted, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import logoUrl from '@/assets/logoBaseTexto.webp'
  import { TERMO_PADRAO_LGPD } from '@/interfaces/consentimento'
  import { consentimentoService } from '@/services/consentimento'
  import { notify } from '@/utils/notify'

  definePage({
    meta: {
      public: true,
      layout: false,
    },
  })

  const route = useRoute()
  const termo = TERMO_PADRAO_LGPD

  const alunoId = computed(() => {
    const raw = route.query.aluno
    return raw ? Number(raw) : 0
  })

  const aluno = ref<{ id: number, nome: string } | null>(null)
  const consentimentoExistente = ref<Consentimento | null>(null)
  const carregando = ref(true)
  const salvando = ref(false)
  const confirmandoRevogacao = ref(false)

  const nomeResponsavel = ref('')
  const parentesco = ref('Mãe/Pai')
  const concordou = ref(false)

  const opcoesParentesco = [
    'Mãe/Pai',
    'Tutor(a) Legal',
    'Avô/Avó Responsável',
    'Outro Responsável Legal',
  ]

  const statusAtual = computed<StatusConsentimento>(() => {
    if (!consentimentoExistente.value) return 'pendente'
    return consentimentoExistente.value.ativo ? 'ativo' : 'revogado'
  })

  const formularioValido = computed(() => {
    return (
      nomeResponsavel.value.trim().length >= 3
      && Boolean(parentesco.value)
      && concordou.value
    )
  })

  function formatarData (dataIso?: string | null) {
    if (!dataIso) return '—'
    try {
      return new Date(dataIso).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dataIso
    }
  }

  async function carregarDados () {
    if (!alunoId.value) {
      carregando.value = false
      return
    }

    carregando.value = true
    try {
      const c = await consentimentoService.obterPorAluno(alunoId.value)
      consentimentoExistente.value = c
    } catch {
      // Ignora erro inicial
    } finally {
      carregando.value = false
    }
  }

  async function concluirConsentimento () {
    if (!alunoId.value) {
      notify.error('Identificador do estudante não informado.')
      return
    }

    salvando.value = true
    try {
      const criado = await consentimentoService.registrar({
        aluno: alunoId.value,
        finalidade: 'analise_pedagogica_ia',
        versao_texto: 'v1',
      })
      consentimentoExistente.value = criado
      notify.success('Autorização registrada com sucesso!')
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao registrar consentimento.'
      notify.error(msg)
    } finally {
      salvando.value = false
    }
  }

  async function executarRevogacao () {
    if (!consentimentoExistente.value?.id) return
    salvando.value = true
    try {
      const revogado = await consentimentoService.revogar(consentimentoExistente.value.id)
      consentimentoExistente.value = revogado
      confirmandoRevogacao.value = false
      notify.success('Autorização revogada e dados excluídos com sucesso.')
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao revogar consentimento.'
      notify.error(msg)
    } finally {
      salvando.value = false
    }
  }

  onMounted(() => {
    carregarDados()
  })
</script>

<style scoped>
.consentimento-page {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  background-color: #f7f7f1;
  color: #263d35;
}

.consentimento-card {
  width: 100%;
  max-width: 600px;
  background: #ffffff;
  border-radius: 16px;
  padding: 32px 28px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5ebe7;
}

.card-header {
  text-align: center;
  margin-bottom: 24px;
}

.logo-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}

.logo-marsupi {
  display: block;
  width: 130px;
  height: 40px;
  background-color: #356b5b;
  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: contain;
}

.badge-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #e8f3ee;
  color: #356b5b;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 12px;
}

.titulo-principal {
  font-size: 1.35rem;
  font-weight: 700;
  color: #263d35;
  margin: 0 0 6px;
}

.subtitulo {
  font-size: 0.875rem;
  color: #5d756b;
  margin: 0;
}

.identificacao-bloco {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f7f9f8;
  border: 1px solid #e1ebe5;
  border-radius: 10px;
  margin-bottom: 20px;
}

.rotulo-campo {
  font-size: 0.85rem;
  color: #5d756b;
}

.nome-estudante {
  font-size: 0.95rem;
  color: #263d35;
}

.termos-informativos {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.topico-card {
  padding: 14px 16px;
  border-radius: 10px;
  background: #fafcfb;
  border-left: 3px solid #356b5b;
  border-top: 1px solid #edf2ef;
  border-right: 1px solid #edf2ef;
  border-bottom: 1px solid #edf2ef;
}

.topico-titulo {
  font-size: 0.875rem;
  font-weight: 700;
  color: #356b5b;
  margin: 0 0 4px;
}

.topico-descricao {
  font-size: 0.8rem;
  color: #3f554c;
  line-height: 1.45;
  margin: 0;
}

.form-aceite {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.checkbox-termo {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 4px 0 12px;
}

.checkbox-termo input[type="checkbox"] {
  width: 18px;
  height: 18px;
  margin-top: 2px;
  accent-color: #356b5b;
  cursor: pointer;
}

.checkbox-termo label {
  font-size: 0.8rem;
  color: #263d35;
  line-height: 1.4;
  cursor: pointer;
}

.btn-autorizar {
  font-weight: 600;
}

/* Sucesso */
.estado-sucesso {
  text-align: center;
  padding: 16px 8px;
}

.icone-sucesso-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #e8f3ee;
  color: #356b5b;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.estado-sucesso h2 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #263d35;
  margin-bottom: 6px;
}

.aluno-destaque {
  font-size: 0.95rem;
  color: #3f554c;
  margin-bottom: 8px;
}

.mensagem-sucesso {
  font-size: 0.85rem;
  color: #5d756b;
  line-height: 1.45;
  margin-bottom: 20px;
}

.data-registro {
  display: block;
  font-size: 0.775rem;
  color: #7a9489;
  margin-top: 4px;
}

.caixa-garantias {
  text-align: left;
  background: #f7f9f8;
  border: 1px solid #e1ebe5;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.caixa-garantias h3 {
  font-size: 0.85rem;
  font-weight: 700;
  color: #356b5b;
  margin: 0 0 10px;
}

.caixa-garantias ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.caixa-garantias li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: #3f554c;
}

.painel-confirmar-revogacao {
  background: #fcf2f2;
  border: 1px solid #f0cfcf;
  border-radius: 10px;
  padding: 14px;
  margin-top: 10px;
  font-size: 0.8rem;
  color: #7d2a2a;
}

.botoes-revogacao {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 10px;
}

.card-footer {
  text-align: center;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #eef2ef;
  color: #7a9489;
}
</style>
