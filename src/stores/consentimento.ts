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
        if (typeof window !== 'undefined') {
          localStorage.setItem(`marsupi_consentimento_${alunoId}`, JSON.stringify(item))
        }
      } else {
        // Tenta fallback do localStorage (preenchido pelo responsável na demo)
        if (typeof window !== 'undefined') {
          const local = localStorage.getItem(`marsupi_consentimento_${alunoId}`)
          if (local) {
            try {
              consentimentosPorAluno.value[alunoId] = JSON.parse(local)
              return consentimentosPorAluno.value[alunoId]
            } catch {
              /* ignora parse inválido */
            }
          }
        }
        delete consentimentosPorAluno.value[alunoId]
      }
      return consentimentosPorAluno.value[alunoId] ?? null
    } catch {
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem(`marsupi_consentimento_${alunoId}`)
        if (local) {
          try {
            const parsed = JSON.parse(local)
            consentimentosPorAluno.value[alunoId] = parsed
            return parsed
          } catch {
            /* ignora parse inválido */
          }
        }
      }
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
    try {
      const item = await consentimentoService.registrar({
        aluno: alunoId,
        finalidade: 'analise_pedagogica_ia',
        versao_texto: versaoTexto,
      })
      consentimentosPorAluno.value[alunoId] = item
      if (typeof window !== 'undefined') {
        localStorage.setItem(`marsupi_consentimento_${alunoId}`, JSON.stringify(item))
      }
      return item
    } catch {
      // Fallback local se backend não estiver autenticado ou responder 401
      const item: Consentimento = {
        id: Date.now(),
        aluno: alunoId,
        finalidade: 'analise_pedagogica_ia',
        versao_texto: versaoTexto,
        aceito_em: new Date().toISOString(),
        revogado_em: null,
        ativo: true,
      }
      consentimentosPorAluno.value[alunoId] = item
      if (typeof window !== 'undefined') {
        localStorage.setItem(`marsupi_consentimento_${alunoId}`, JSON.stringify(item))
      }
      return item
    }
  }

  async function revogarConsentimento (alunoId: number): Promise<Consentimento | null> {
    const atual = consentimentosPorAluno.value[alunoId]
    if (!atual) {
      return null
    }
    if (atual.id && atual.id < 1_000_000_000) {
      try {
        const item = await consentimentoService.revogar(atual.id)
        consentimentosPorAluno.value[alunoId] = item
        if (typeof window !== 'undefined') {
          localStorage.setItem(`marsupi_consentimento_${alunoId}`, JSON.stringify(item))
        }
        return item
      } catch {
        /* ignora falha na API se for mock/local */
      }
    }
    const item: Consentimento = {
      ...atual,
      ativo: false,
      revogado_em: new Date().toISOString(),
    }
    consentimentosPorAluno.value[alunoId] = item
    if (typeof window !== 'undefined') {
      localStorage.setItem(`marsupi_consentimento_${alunoId}`, JSON.stringify(item))
    }
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
