import type {
  Consentimento,
  StatusConsentimento,
} from '@/interfaces/consentimento'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { consentimentoService } from '@/services/consentimento'

export const useConsentimentoStore = defineStore('consentimento', () => {
  const consentimentosPorAluno = ref<Record<number, Consentimento>>({})
  const loading = ref(false)

  function obterConsentimento (alunoId: number): Consentimento | undefined {
    return consentimentosPorAluno.value[alunoId]
  }

  function obterStatus (alunoId: number): StatusConsentimento {
    const c = consentimentosPorAluno.value[alunoId]
    if (!c) {
      return 'pendente'
    }
    if (c.ativo) {
      return 'ativo'
    }
    return 'revogado'
  }

  function temConsentimentoAtivo (alunoId: number): boolean {
    return obterStatus(alunoId) === 'ativo'
  }

  async function carregarConsentimento (alunoId: number, forcar = false): Promise<Consentimento | null> {
    if (!forcar && consentimentosPorAluno.value[alunoId]) {
      return consentimentosPorAluno.value[alunoId]
    }
    try {
      const item = await consentimentoService.obterPorAluno(alunoId)
      if (item) {
        consentimentosPorAluno.value[alunoId] = item
      } else {
        delete consentimentosPorAluno.value[alunoId]
      }
      return item
    } catch {
      return null
    }
  }

  async function carregarParaAlunos (alunoIds: number[]): Promise<void> {
    if (alunoIds.length === 0) {
      return
    }
    loading.value = true
    try {
      await Promise.allSettled(
        alunoIds.map(id => carregarConsentimento(id)),
      )
    } finally {
      loading.value = false
    }
  }

  async function registrarConsentimento (alunoId: number, versaoTexto = 'v1'): Promise<Consentimento> {
    const item = await consentimentoService.registrar({
      aluno: alunoId,
      finalidade: 'analise_pedagogica_ia',
      versao_texto: versaoTexto,
    })
    consentimentosPorAluno.value[alunoId] = item
    return item
  }

  async function revogarConsentimento (alunoId: number): Promise<Consentimento | null> {
    const atual = consentimentosPorAluno.value[alunoId]
    if (!atual || !atual.id) {
      return null
    }
    const item = await consentimentoService.revogar(atual.id)
    consentimentosPorAluno.value[alunoId] = item
    return item
  }

  return {
    consentimentosPorAluno,
    loading,
    obterConsentimento,
    obterStatus,
    temConsentimentoAtivo,
    carregarConsentimento,
    carregarParaAlunos,
    registrarConsentimento,
    revogarConsentimento,
  }
})
