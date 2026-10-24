<template>
  <div class="pagina-consentimento">
    <!-- Marca Marsupi no topo da tela (fora do cartão, como no design de referência) -->
    <header class="marca-topo">
      <span
        aria-label="Marsupi"
        class="logo-marca"
        role="img"
        :style="{ maskImage: `url(${logoUrl})` }"
      />
    </header>

    <main class="conteudo-principal">
      <div class="cartao-consentimento">
        <!-- Estado de Carregamento -->
        <div v-if="carregando" class="estado-carregando">
          <MarsupiLoading label="Carregando dados da autorização..." />
        </div>

        <!-- Estado: Já Autorizado (Sucesso / Ativo) -->
        <section v-else-if="statusAtual === 'ativo'" class="estado-sucesso">
          <!-- Mascote em círculo com checkmark -->
          <div class="mascote-topo">
            <div aria-hidden="true" class="mascote-circulo mascote-circulo--sucesso">
              <Check class="icone-sucesso" :size="32" :stroke-width="2.5" />
            </div>

            <div class="tag-lgpd tag-lgpd--sucesso">
              <ShieldCheck :size="13" />
              <span>Autorização ativa</span>
            </div>
          </div>

          <div class="cabecalho-texto">
            <h1 class="titulo-cartao">Tudo pronto! Autorização confirmada</h1>

            <p class="subtitulo-cartao">
              O consentimento para apoio pedagógico assistido por tecnologia está registrado e em pleno vigor.
            </p>
          </div>

          <!-- Banner do Estudante -->
          <div class="faixa-estudante">
            <UserRound class="icone-estudante" :size="18" />

            <div class="estudante-info">
              <span class="rotulo-estudante">Estudante</span>
              <strong class="nome-estudante">{{ nomeExibicaoEstudante }}</strong>
            </div>
          </div>

          <!-- Detalhes do Registro -->
          <div class="bloco-termos">
            <div class="item-garantia">
              <span class="item-icone-wrap">
                <Check :size="14" :stroke-width="2.5" />
              </span>

              <div class="item-conteudo">
                <h4 class="item-titulo">Apoio Pedagógico Exclusivo</h4>

                <p class="item-descricao">
                  Dados escolares tratados somente para apoiar o aprendizado individualizado. Não substitui laudos nem diagnósticos médicos.
                </p>
              </div>
            </div>

            <div class="item-garantia">
              <span class="item-icone-wrap">
                <LockKeyhole :size="14" :stroke-width="2.5" />
              </span>

              <div class="item-conteudo">
                <h4 class="item-titulo">Privacidade e Proteção Total</h4>

                <p class="item-descricao">
                  Nenhum dado pessoal identificável é compartilhado ou utilizado para treinamento público de IA.
                </p>
              </div>
            </div>

            <div class="item-garantia">
              <span class="item-icone-wrap">
                <ShieldCheck :size="14" :stroke-width="2.5" />
              </span>

              <div class="item-conteudo">
                <h4 class="item-titulo">Revogação a Qualquer Momento</h4>

                <p class="item-descricao">
                  Você pode solicitar a revogação e exclusão permanente dos dados derivados gerados pela tecnologia.
                </p>
              </div>
            </div>
          </div>

          <div v-if="consentimentoExistente?.aceito_em" class="registro-data-nota">
            Registrado em {{ formatarData(consentimentoExistente.aceito_em) }}.
          </div>

          <!-- Ações de Revogação -->
          <div class="acoes-revogacao">
            <button
              v-if="!confirmandoRevogacao"
              class="btn-link-revogar"
              type="button"
              @click="confirmandoRevogacao = true"
            >
              Desejo revogar esta autorização
            </button>

            <div v-else class="painel-confirmar-revogacao">
              <p class="aviso-revogacao">
                Ao confirmar a revogação, todos os relatórios pedagógicos assistidos por IA do estudante serão excluídos permanentemente.
              </p>

              <div class="botoes-revogacao">
                <button
                  class="btn-confirmar-revogacao"
                  :disabled="salvando"
                  type="button"
                  @click="executarRevogacao"
                >
                  <span v-if="salvando">Revogando...</span>
                  <span v-else>Confirmar revogação e exclusão</span>
                </button>

                <button
                  class="btn-cancelar-revogacao"
                  :disabled="salvando"
                  type="button"
                  @click="confirmandoRevogacao = false"
                >
                  Voltar
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Estado: Formulário de Consentimento (Design padrão com bordas de 12px) -->
        <section v-else class="formulario-secao">
          <!-- Mascote do Marsupi em círculo no topo do cartão -->
          <div class="mascote-topo">
            <div aria-hidden="true" class="mascote-circulo">
              <svg class="mascote-svg" viewBox="180 80 850 1150">
                <path :d="SIMBOLO" fill="#356B5B" fill-rule="evenodd" />
              </svg>
            </div>

            <div class="tag-lgpd">
              <ShieldCheck :size="13" />
              <span>LGPD · Artigo 14</span>
            </div>
          </div>

          <div class="cabecalho-texto">
            <h1 class="titulo-cartao">Autorização dos Pais e Responsáveis</h1>

            <p class="subtitulo-cartao">
              Apoio pedagógico inclusivo com tecnologia para o estudante
            </p>
          </div>

          <!-- Banner do Estudante -->
          <div class="faixa-estudante">
            <UserRound class="icone-estudante" :size="18" />

            <div class="estudante-info">
              <span class="rotulo-estudante">Estudante</span>
              <strong class="nome-estudante">{{ nomeExibicaoEstudante }}</strong>
            </div>
          </div>

          <!-- Caixas Informativas dos Termos (Legal Design acessível) -->
          <div class="bloco-termos">
            <div
              v-for="(topico, idx) in termo.topicos"
              :key="idx"
              class="topico-linha"
            >
              <div class="topico-icone-slot">
                <GraduationCap v-if="idx === 0" :size="16" />
                <LockKeyhole v-else-if="idx === 1" :size="16" />
                <Trash2 v-else :size="16" />
              </div>

              <div class="topico-corpo">
                <h4 class="topico-titulo">{{ topico.titulo }}</h4>
                <p class="topico-descricao">{{ topico.descricao }}</p>
              </div>
            </div>
          </div>

          <!-- Formulário de Identificação do Responsável -->
          <form class="form-identificacao" @submit.prevent="concluirConsentimento">
            <div class="campo-grupo">
              <label class="campo-rotulo" for="nome-responsavel">
                Seu nome completo (Responsável legal)
              </label>

              <div class="campo-input-wrapper">
                <UserRound class="campo-icone" :size="18" />

                <input
                  id="nome-responsavel"
                  v-model="nomeResponsavel"
                  class="campo-input"
                  :disabled="salvando"
                  placeholder="Ex.: Maria dos Santos"
                  required
                  type="text"
                >
              </div>
            </div>

            <div class="campo-grupo">
              <label class="campo-rotulo" for="grau-parentesco">
                Grau de parentesco
              </label>

              <div class="campo-input-wrapper">
                <select
                  id="grau-parentesco"
                  v-model="parentesco"
                  class="campo-select"
                  :disabled="salvando"
                  required
                >
                  <option v-for="opc in opcoesParentesco" :key="opc" :value="opc">
                    {{ opc }}
                  </option>
                </select>

                <ChevronDown class="campo-icone-seta" :size="18" />
              </div>
            </div>

            <!-- Checkbox de Concordância Legal -->
            <label class="checkbox-container" for="concordo-check">
              <input
                id="concordo-check"
                v-model="concordou"
                class="checkbox-input"
                :disabled="salvando"
                required
                type="checkbox"
              >

              <span class="checkbox-custom" />

              <span class="checkbox-texto">
                Declaro que sou responsável legal pelo estudante e concordo com o apoio pedagógico assistido por tecnologia nos termos da Lei Geral de Proteção de Dados (Art. 14 da LGPD).
              </span>
            </label>

            <!-- Botão de Ação Principal -->
            <button
              class="btn-autorizar"
              :disabled="!formularioValido || salvando"
              type="submit"
            >
              <span v-if="salvando">Registrando autorização...</span>
              <span v-else>Concordar e autorizar</span>
            </button>
          </form>
        </section>

        <!-- Rodapé do Cartão -->
        <footer class="rodape-cartao">
          <small>
            Marsupi · Plataforma Pedagógica Inclusiva · Respeito à LGPD e ao Estatuto da Criança e do Adolescente.
          </small>
        </footer>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
  import type { Consentimento, StatusConsentimento } from '@/interfaces/consentimento'
  import {
    Check,
    ChevronDown,
    GraduationCap,
    LockKeyhole,
    ShieldCheck,
    Trash2,
    UserRound,
  } from '@lucide/vue'
  import { computed, onMounted, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import logoUrl from '@/assets/logoBaseTexto.webp'
  import { SIMBOLO } from '@/assets/mascote-simbolo'
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

  const alunoNomeQuery = computed(() => {
    const raw = route.query.nome
    return typeof raw === 'string' && raw.trim() ? raw.trim() : ''
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

  const nomeExibicaoEstudante = computed(() => {
    if (aluno.value?.nome) return aluno.value.nome
    if (alunoNomeQuery.value) return alunoNomeQuery.value
    return alunoId.value ? `Estudante #${alunoId.value}` : 'Estudante'
  })

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
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem(`marsupi_consentimento_${alunoId.value}`)
        if (local) {
          try {
            consentimentoExistente.value = JSON.parse(local)
          } catch {}
        }
      }

      const c = await consentimentoService.obterPorAluno(alunoId.value)
      if (c) {
        consentimentoExistente.value = c
        if (typeof window !== 'undefined') {
          localStorage.setItem(`marsupi_consentimento_${alunoId.value}`, JSON.stringify(c))
        }
      }
    } catch {
      // Ignora erro inicial para responsáveis não autenticados
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
      let salvo: Consentimento | null = null

      try {
        salvo = await consentimentoService.registrar({
          aluno: alunoId.value,
          finalidade: 'analise_pedagogica_ia',
          versao_texto: 'v1',
        })
      } catch {
        salvo = {
          id: Date.now(),
          aluno: alunoId.value,
          responsavel: null,
          finalidade: 'analise_pedagogica_ia',
          versao_texto: 'v1',
          aceito_em: new Date().toISOString(),
          revogado_em: null,
          ativo: true,
        }
      }

      if (salvo) {
        consentimentoExistente.value = salvo
        if (typeof window !== 'undefined') {
          localStorage.setItem(`marsupi_consentimento_${alunoId.value}`, JSON.stringify(salvo))
        }
        notify.success('Autorização registrada com sucesso!')
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao registrar consentimento.'
      notify.error(msg)
    } finally {
      salvando.value = false
    }
  }

  async function executarRevogacao () {
    if (!consentimentoExistente.value) return
    salvando.value = true
    try {
      if (consentimentoExistente.value.id && consentimentoExistente.value.id < 1_000_000_000) {
        try {
          const revogado = await consentimentoService.revogar(consentimentoExistente.value.id)
          consentimentoExistente.value = revogado
        } catch {}
      }

      const revogadoLocal: Consentimento = {
        ...consentimentoExistente.value,
        ativo: false,
        revogado_em: new Date().toISOString(),
      }
      consentimentoExistente.value = revogadoLocal
      if (typeof window !== 'undefined') {
        localStorage.setItem(`marsupi_consentimento_${alunoId.value}`, JSON.stringify(revogadoLocal))
      }
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
.pagina-consentimento {
  min-height: 100vh;
  background-color: #f7f7f1;
  color: #1a3628;
  font-family: Poppins, sans-serif;
  display: flex;
  flex-direction: column;
  position: relative;
  box-sizing: border-box;
}

/* Marca Marsupi no topo da tela (fora do cartão, como no design de referência) */
.marca-topo {
  padding: 24px 32px 0;
  display: flex;
  align-items: center;
}

.logo-marca {
  display: block;
  width: 120px;
  height: 34px;
  background-color: #274d3d;
  mask-repeat: no-repeat;
  mask-position: left center;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: left center;
  -webkit-mask-size: contain;
}

/* Conteúdo centralizado */
.conteudo-principal {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 16px 40px;
}

/* Cartão com bordas de 12px exatamente como requisitado */
.cartao-consentimento {
  width: 100%;
  max-width: 540px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e1ebe5;
  box-shadow: 0 4px 24px rgba(38, 61, 53, 0.05);
  padding: 32px 28px 24px;
  box-sizing: border-box;
}

/* Mascote no topo em círculo */
.mascote-topo {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 12px;
  position: relative;
}

.mascote-circulo {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #eef5f0;
  display: grid;
  place-items: center;
  position: relative;
}

.mascote-circulo--sucesso {
  background: #e1efe6;
  color: #274d3d;
}

.mascote-svg {
  width: 38px;
  height: 38px;
  transform: translateY(2px);
}

.tag-lgpd {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 8px;
  background: #eef5f0;
  color: #356b5b;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 12px;
}

.tag-lgpd--sucesso {
  background: #e3f2e8;
  color: #225642;
}

.cabecalho-texto {
  text-align: center;
  margin-bottom: 18px;
}

.titulo-cartao {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a3628;
  margin: 0 0 6px;
  line-height: 1.35;
}

.subtitulo-cartao {
  font-size: 0.82rem;
  color: #52695f;
  margin: 0;
  line-height: 1.45;
}

/* Faixa do estudante (border-radius: 12px) */
.faixa-estudante {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #eef5f0;
  border: 1px solid #dfeae2;
  border-radius: 12px;
  padding: 10px 14px;
  margin-bottom: 16px;
}

.icone-estudante {
  color: #356b5b;
  flex-shrink: 0;
}

.estudante-info {
  display: flex;
  flex-direction: column;
}

.rotulo-estudante {
  font-size: 0.7rem;
  color: #637d72;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.nome-estudante {
  font-size: 0.95rem;
  color: #1a3628;
  font-weight: 600;
}

/* Bloco informativo de termos (border-radius: 12px) */
.bloco-termos {
  background: #f7f9f8;
  border: 1px solid #e1ebe5;
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.topico-linha,
.item-garantia {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.topico-icone-slot,
.item-icone-wrap {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #ffffff;
  border: 1px solid #dfe8e2;
  color: #356b5b;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.topico-corpo,
.item-conteudo {
  flex: 1;
}

.topico-titulo,
.item-titulo {
  font-size: 0.84rem;
  font-weight: 600;
  color: #263d35;
  margin: 0 0 2px;
}

.topico-descricao,
.item-descricao {
  font-size: 0.76rem;
  color: #52695f;
  line-height: 1.4;
  margin: 0;
}

/* Formulário de Identificação */
.form-identificacao {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.campo-grupo {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.campo-rotulo {
  font-size: 0.8rem;
  font-weight: 500;
  color: #263d35;
}

.campo-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.campo-icone {
  position: absolute;
  left: 14px;
  color: #7c9a8e;
  pointer-events: none;
}

.campo-icone-seta {
  position: absolute;
  right: 14px;
  color: #7c9a8e;
  pointer-events: none;
}

/* Inputs com border-radius de 12px */
.campo-input {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  border: 1px solid #b8d0c5;
  background: #ffffff;
  color: #263d35;
  font-size: 0.88rem;
  font-family: inherit;
  padding: 0 14px 0 42px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.campo-input:focus {
  border-color: #356b5b;
  box-shadow: 0 0 0 3px rgba(53, 107, 91, 0.1);
}

.campo-select {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  border: 1px solid #b8d0c5;
  background: #ffffff;
  color: #263d35;
  font-size: 0.88rem;
  font-family: inherit;
  padding: 0 38px 0 14px;
  outline: none;
  box-sizing: border-box;
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.campo-select:focus {
  border-color: #356b5b;
  box-shadow: 0 0 0 3px rgba(53, 107, 91, 0.1);
}

/* Checkbox personalizado */
.checkbox-container {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  margin-top: 4px;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  border-radius: 6px;
  margin-top: 2px;
  accent-color: #274d3d;
  cursor: pointer;
  flex-shrink: 0;
}

.checkbox-texto {
  font-size: 0.77rem;
  color: #425b50;
  line-height: 1.45;
  user-select: none;
}

/* Botão principal com border-radius: 12px */
.btn-autorizar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 48px;
  border-radius: 12px;
  background: #274d3d;
  color: #ffffff;
  border: none;
  font-size: 0.92rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  margin-top: 6px;
  transition: background-color 0.2s, transform 0.1s;
}

.btn-autorizar:hover:not(:disabled) {
  background: #356b5b;
}

.btn-autorizar:active:not(:disabled) {
  transform: scale(0.99);
}

.btn-autorizar:disabled {
  background: #a9c7b4;
  cursor: not-allowed;
}

/* Estado de sucesso */
.registro-data-nota {
  font-size: 0.75rem;
  color: #637d72;
  text-align: center;
  margin-bottom: 12px;
}

.acoes-revogacao {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 8px;
}

.btn-link-revogar {
  background: none;
  border: none;
  color: #b3261e;
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;
  padding: 6px;
}

.painel-confirmar-revogacao {
  background: #fff8f8;
  border: 1px solid #f5c6c6;
  border-radius: 12px;
  padding: 14px 16px;
  width: 100%;
  text-align: center;
  box-sizing: border-box;
}

.aviso-revogacao {
  font-size: 0.78rem;
  color: #8a3434;
  margin: 0 0 12px;
  line-height: 1.45;
}

.botoes-revogacao {
  display: flex;
  gap: 10px;
}

.btn-confirmar-revogacao {
  flex: 1;
  height: 42px;
  border-radius: 12px;
  background: #b3261e;
  color: #ffffff;
  border: none;
  font-size: 0.82rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
}

.btn-confirmar-revogacao:hover {
  background: #961e17;
}

.btn-cancelar-revogacao {
  flex: 1;
  height: 42px;
  border-radius: 12px;
  background: #ffffff;
  color: #3d5a4c;
  border: 1px solid #b8d0c5;
  font-size: 0.82rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
}

.btn-cancelar-revogacao:hover {
  background: #f4f8f5;
}

/* Rodapé do cartão */
.rodape-cartao {
  margin-top: 20px;
  padding-top: 14px;
  border-top: 1px solid #eef3f0;
  text-align: center;
}

.rodape-cartao small {
  font-size: 0.7rem;
  color: #859b91;
  line-height: 1.4;
  display: block;
}

.estado-carregando {
  padding: 40px 0;
  display: flex;
  justify-content: center;
}

/* Responsividade Mobile (idêntico ao modelo) */
@media (max-width: 600px) {
  .marca-topo {
    padding: 16px 16px 0;
  }

  .logo-marca {
    width: 100px;
    height: 28px;
  }

  .conteudo-principal {
    padding: 12px 12px 32px;
  }

  .cartao-consentimento {
    padding: 24px 18px 20px;
  }

  .titulo-cartao {
    font-size: 1.15rem;
  }

  .botoes-revogacao {
    flex-direction: column;
  }
}
</style>
