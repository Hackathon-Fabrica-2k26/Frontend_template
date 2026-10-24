<template>
  <v-dialog
    v-model="visivel"
    aria-labelledby="termo-titulo"
    aria-modal="true"
    max-width="620"
    role="dialog"
  >
    <div class="termo-card">
      <header class="termo-header">
        <div class="header-icone-titulo">
          <div class="icone-escudo-wrapper">
            <ShieldCheck class="icone-escudo" :size="24" />
          </div>

          <div>
            <h2 id="termo-titulo" class="termo-titulo">
              Consentimento LGPD
            </h2>

            <p class="termo-subtitulo">
              {{ alunoNome }} · Proteção de dados de menores (Art. 14)
            </p>
          </div>
        </div>

        <button
          aria-label="Fechar modal"
          class="btn-fechar"
          type="button"
          @click="fechar"
        >
          <X :size="20" />
        </button>
      </header>

      <div class="termo-corpo">
        <!-- Status Atual -->
        <section class="secao-status">
          <div class="status-cabecalho">
            <span class="status-rotulo">Status da Autorização:</span>
            <ConsentimentoBadge :status="status" />
          </div>

          <p v-if="status === 'ativo'" class="status-detalhe status-detalhe--ativo">
            Autorização registrada e ativa para uso pedagógico assistido por IA.
            <span v-if="consentimento?.aceito_em" class="data-aceite">
              Registrado em {{ formatarData(consentimento.aceito_em) }}.
            </span>
          </p>

          <p v-else-if="status === 'revogado'" class="status-detalhe status-detalhe--revogado">
            A autorização foi revogada pelo responsável. Conforme a LGPD, relatórios e análises de IA deste aluno foram excluídos do sistema.
          </p>

          <p v-else class="status-detalhe status-detalhe--pendente">
            Nenhuma autorização ativa encontrada. O sistema bloqueia a análise de atividades e geração de relatórios por IA para este estudante até que o responsável autorize.
          </p>
        </section>

        <!-- Base Legal e Resumo -->
        <section class="secao-legal">
          <h3 class="legal-titulo">
            {{ termo.titulo }}
          </h3>

          <p class="legal-base">
            {{ termo.baseLegal }}
          </p>

          <p class="legal-resumo">
            {{ termo.resumo }}
          </p>

          <div class="topicos-lgpd">
            <div
              v-for="(topico, idx) in termo.topicos"
              :key="idx"
              class="topico-item"
            >
              <div class="topico-bullet">
                <Check :size="14" />
              </div>

              <div>
                <strong>{{ topico.titulo }}:</strong>
                <span> {{ topico.descricao }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Link para o responsável -->
        <section class="secao-compartilhar">
          <div class="compartilhar-cabecalho">
            <Link :size="16" />
            <span>Link de autorização para o responsável legal:</span>
          </div>

          <div class="compartilhar-input-linha">
            <input
              aria-label="Link para o responsável assinar"
              class="input-link"
              readonly
              :value="linkResponsavel"
            >

            <v-btn
              color="primary"
              :prepend-icon="copiado ? Check : Copy"
              size="small"
              variant="tonal"
              @click="copiarLink"
            >
              {{ copiado ? 'Copiado!' : 'Copiar link' }}
            </v-btn>
          </div>

          <small class="compartilhar-ajuda">
            Envie este link para os pais via WhatsApp ou e-mail para que possam autorizar digitalmente pelo celular.
          </small>
        </section>

        <!-- Confirmação de Revogação -->
        <section v-if="confirmandoRevogacao" class="alerta-revogacao">
          <div class="alerta-cabecalho">
            <AlertTriangle class="icone-alerta" :size="20" />
            <strong>Atenção: exclusão permanente de dados de IA</strong>
          </div>

          <p>
            Ao revogar a autorização, a LGPD determina o expurgo dos dados derivados da IA. Todos os relatórios pedagógicos, análises de trabalhos e variações deste estudante serão excluídos definitivamente.
          </p>

          <div class="alerta-acoes">
            <v-btn
              color="error"
              :loading="salvando"
              size="small"
              variant="flat"
              @click="confirmarRevogacao"
            >
              Sim, revogar e excluir dados
            </v-btn>

            <v-btn
              :disabled="salvando"
              size="small"
              variant="text"
              @click="confirmandoRevogacao = false"
            >
              Cancelar
            </v-btn>
          </div>
        </section>
      </div>

      <footer class="termo-footer">
        <div class="footer-esquerda">
          <v-btn
            v-if="status === 'ativo' && !confirmandoRevogacao"
            color="error"
            :disabled="salvando"
            size="small"
            variant="text"
            @click="confirmandoRevogacao = true"
          >
            Revogar autorização
          </v-btn>
        </div>

        <div class="footer-direita">
          <v-btn
            :disabled="salvando"
            variant="outlined"
            @click="fechar"
          >
            Fechar
          </v-btn>

          <v-btn
            v-if="status !== 'ativo'"
            color="primary"
            :loading="salvando"
            @click="registrarConsentimento"
          >
            Registrar autorização física
          </v-btn>
        </div>
      </footer>
    </div>
  </v-dialog>
</template>

<script setup lang="ts">
  import type { Consentimento, StatusConsentimento } from '@/interfaces/consentimento'
  import { AlertTriangle, Check, Copy, Link, ShieldCheck, X } from '@lucide/vue'
  import { computed, ref, watch } from 'vue'
  import { TERMO_PADRAO_LGPD } from '@/interfaces/consentimento'
  import { useConsentimentoStore } from '@/stores/consentimento'
  import { notify } from '@/utils/notify'

  const props = withDefaults(
    defineProps<{
      modelValue: boolean
      alunoId: number
      alunoNome: string
      turmaId?: number
    }>(),
    {
      turmaId: undefined,
    },
  )

  const emit = defineEmits<{
    (e: 'update:model-value', value: boolean): void
    (e: 'alterado'): void
  }>()

  const store = useConsentimentoStore()
  const termo = TERMO_PADRAO_LGPD

  const salvando = ref(false)
  const confirmandoRevogacao = ref(false)
  const copiado = ref(false)

  const visivel = computed({
    get: () => props.modelValue,
    set: val => emit('update:model-value', val),
  })

  const consentimento = computed<Consentimento | undefined>(() => {
    return store.obterConsentimento(props.alunoId)
  })

  const status = computed<StatusConsentimento>(() => {
    return store.obterStatus(props.alunoId)
  })

  const linkResponsavel = computed(() => {
    if (typeof window === 'undefined') return ''
    const origem = window.location.origin
    const params = new URLSearchParams()
    params.set('aluno', String(props.alunoId))
    if (props.turmaId) {
      params.set('turma', String(props.turmaId))
    }
    return `${origem}/responsavel/consentimento?${params.toString()}`
  })

  watch(
    () => props.alunoId,
    async id => {
      if (id && props.modelValue) {
        confirmandoRevogacao.value = false
        await store.carregarConsentimento(id)
      }
    },
    { immediate: true },
  )

  function fechar () {
    confirmandoRevogacao.value = false
    visivel.value = false
  }

  function formatarData (dataIso?: string | null) {
    if (!dataIso) return '—'
    try {
      const d = new Date(dataIso)
      return d.toLocaleDateString('pt-BR', {
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

  async function copiarLink () {
    if (!linkResponsavel.value) return
    try {
      await navigator.clipboard.writeText(linkResponsavel.value)
      copiado.value = true
      notify.success('Link copiado para a área de transferência!')
      setTimeout(() => {
        copiado.value = false
      }, 3000)
    } catch {
      notify.error('Não foi possível copiar o link.')
    }
  }

  async function registrarConsentimento () {
    salvando.value = true
    try {
      await store.registrarConsentimento(props.alunoId)
      notify.success('Autorização registrada com sucesso!')
      emit('alterado')
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao registrar consentimento.'
      notify.error(msg)
    } finally {
      salvando.value = false
    }
  }

  async function confirmarRevogacao () {
    salvando.value = true
    try {
      await store.revogarConsentimento(props.alunoId)
      confirmandoRevogacao.value = false
      notify.success('Autorização revogada e dados de IA excluídos com sucesso.')
      emit('alterado')
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao revogar consentimento.'
      notify.error(msg)
    } finally {
      salvando.value = false
    }
  }
</script>

<style scoped>
.termo-card {
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  color: #263d35;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.12);
}

.termo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #eef2ef;
  background-color: #fafcfb;
}

.header-icone-titulo {
  display: flex;
  align-items: center;
  gap: 14px;
}

.icone-escudo-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background-color: #e8f3ee;
  color: #356b5b;
  display: flex;
  align-items: center;
  justify-content: center;
}

.termo-titulo {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0;
  color: #263d35;
  line-height: 1.25;
}

.termo-subtitulo {
  font-size: 0.825rem;
  color: #5d756b;
  margin: 2px 0 0;
}

.btn-fechar {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #5d756b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.15s;
}

.btn-fechar:hover {
  background-color: #eef2ef;
  color: #263d35;
}

.termo-corpo {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-height: 65vh;
  overflow-y: auto;
}

.secao-status {
  padding: 14px 16px;
  border-radius: 12px;
  background: #f7f7f1;
  border: 1px solid #e5ebe7;
}

.status-cabecalho {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-rotulo {
  font-size: 0.85rem;
  font-weight: 600;
  color: #3f554c;
}

.status-detalhe {
  font-size: 0.825rem;
  margin: 8px 0 0;
  line-height: 1.4;
}

.status-detalhe--ativo {
  color: #245647;
}

.status-detalhe--revogado {
  color: #8a3434;
}

.status-detalhe--pendente {
  color: #795217;
}

.data-aceite {
  display: block;
  font-size: 0.75rem;
  color: #5d756b;
  margin-top: 4px;
}

.secao-legal {
  padding: 16px;
  border-radius: 12px;
  background: #fafcfb;
  border: 1px solid #e1ebe5;
}

.legal-titulo {
  font-size: 0.95rem;
  font-weight: 700;
  color: #356b5b;
  margin: 0 0 4px;
}

.legal-base {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6a8277;
  margin: 0 0 10px;
}

.legal-resumo {
  font-size: 0.85rem;
  color: #263d35;
  line-height: 1.45;
  margin: 0 0 12px;
}

.topicos-lgpd {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.topico-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.8rem;
  line-height: 1.4;
}

.topico-bullet {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: #356b5b;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.secao-compartilhar {
  padding: 14px 16px;
  border-radius: 12px;
  background: #f7f9f8;
  border: 1px dashed #a9c7b4;
}

.compartilhar-cabecalho {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #356b5b;
  margin-bottom: 8px;
}

.compartilhar-input-linha {
  display: flex;
  gap: 8px;
  align-items: center;
}

.input-link {
  flex: 1;
  padding: 6px 12px;
  font-size: 0.775rem;
  font-family: monospace;
  background: #ffffff;
  border: 1px solid #d4dfd9;
  border-radius: 8px;
  color: #3f554c;
}

.compartilhar-ajuda {
  display: block;
  font-size: 0.725rem;
  color: #6a8277;
  margin-top: 6px;
}

.alerta-revogacao {
  padding: 14px 16px;
  border-radius: 12px;
  background: #fcf2f2;
  border: 1px solid #f0cfcf;
  color: #7d2a2a;
}

.alerta-cabecalho {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.icone-alerta {
  color: #c93b3b;
}

.alerta-revogacao p {
  font-size: 0.8rem;
  line-height: 1.4;
  margin: 0 0 12px;
}

.alerta-acoes {
  display: flex;
  gap: 10px;
}

.termo-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-top: 1px solid #eef2ef;
  background-color: #fafcfb;
}

.footer-direita {
  display: flex;
  gap: 10px;
}
</style>
