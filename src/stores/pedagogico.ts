import type {
  GerarRelatorioPayload,
  GerarRelatorioResponse,
  Relatorio,
  RelatorioPayload,
} from '@/interfaces/pedagogico'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import pedagogicoService from '@/services/pedagogico'

export const usePedagogicoStore = defineStore('pedagogico', () => {
  const relatorios = ref<Relatorio[]>([])
  const ultimoPayloadEnviado = ref<Record<string, unknown> | null>(null)
  const totalRelatorios = ref(0)
  const loading = ref(false)

  async function listRelatorios (params: { aluno?: number, page?: number } = {}) {
    loading.value = true
    try {
      const data = await pedagogicoService.list(params)
      relatorios.value = data.results
      totalRelatorios.value = data.count
      return data
    } finally {
      loading.value = false
    }
  }

  async function createRelatorio (payload: RelatorioPayload) {
    const item = await pedagogicoService.create(payload)
    relatorios.value.unshift(item)
    totalRelatorios.value += 1
    return item
  }

  async function updateRelatorio (id: number, payload: Partial<RelatorioPayload>) {
    const item = await pedagogicoService.update(id, payload)
    const index = relatorios.value.findIndex(r => r.id === id)
    if (index !== -1) {
      relatorios.value[index] = item
    }
    return item
  }

  async function removeRelatorio (id: number) {
    await pedagogicoService.remove(id)
    relatorios.value = relatorios.value.filter(r => r.id !== id)
    totalRelatorios.value = Math.max(0, totalRelatorios.value - 1)
  }

  async function gerarRelatorio (payload: GerarRelatorioPayload): Promise<GerarRelatorioResponse> {
    loading.value = true
    try {
      const resposta = await pedagogicoService.gerar(payload)
      ultimoPayloadEnviado.value = resposta.payload_enviado

      const index = relatorios.value.findIndex(item => item.id === resposta.relatorio.id)
      if (index === -1) {
        relatorios.value.unshift(resposta.relatorio)
        totalRelatorios.value += 1
      } else {
        relatorios.value[index] = resposta.relatorio
      }

      return resposta
    } finally {
      loading.value = false
    }
  }

  return {
    relatorios,
    ultimoPayloadEnviado,
    totalRelatorios,
    loading,
    listRelatorios,
    createRelatorio,
    updateRelatorio,
    removeRelatorio,
    gerarRelatorio,
  }
})
