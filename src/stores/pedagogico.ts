import type {
  Atividade,
  AtividadePayload,
  Relatorio,
  RelatorioPayload,
} from '@/interfaces/pedagogico'
import type {
  AtividadesFilters,
  RelatoriosFilters,
} from '@/services/pedagogico'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  atividadesService,
  relatoriosService,
} from '@/services/pedagogico'

export const usePedagogicoStore = defineStore('pedagogico', () => {
  const relatorios = ref<Relatorio[]>([])
  const atividades = ref<Atividade[]>([])

  const totalRelatorios = ref(0)
  const totalAtividades = ref(0)

  const loadingRelatorios = ref(false)
  const loadingAtividades = ref(false)

  const errorRelatorios = ref<string | null>(null)
  const errorAtividades = ref<string | null>(null)

  async function listRelatorios (filters: RelatoriosFilters = {}) {
    loadingRelatorios.value = true
    errorRelatorios.value = null

    try {
      const page = await relatoriosService.list(filters)

      relatorios.value = page.results
      totalRelatorios.value = page.count

      return page
    } catch (error) {
      errorRelatorios.value = error instanceof Error
        ? error.message
        : 'Erro ao carregar relatórios.'

      throw error
    } finally {
      loadingRelatorios.value = false
    }
  }

  async function createRelatorio (payload: RelatorioPayload) {
    const item = await relatoriosService.create(payload)

    relatorios.value.unshift(item)
    totalRelatorios.value += 1

    return item
  }

  async function updateRelatorio (
    id: number,
    payload: Partial<RelatorioPayload>,
  ) {
    const item = await relatoriosService.update(id, payload)
    const index = relatorios.value.findIndex(value => value.id === id)

    if (index !== -1) {
      relatorios.value[index] = item
    }

    return item
  }

  async function removeRelatorio (id: number) {
    await relatoriosService.remove(id)

    const index = relatorios.value.findIndex(value => value.id === id)

    if (index !== -1) {
      relatorios.value.splice(index, 1)
      totalRelatorios.value = Math.max(0, totalRelatorios.value - 1)
    }
  }

  async function listAtividades (filters: AtividadesFilters = {}) {
    loadingAtividades.value = true
    errorAtividades.value = null

    try {
      const page = await atividadesService.list(filters)

      atividades.value = page.results
      totalAtividades.value = page.count

      return page
    } catch (error) {
      errorAtividades.value = error instanceof Error
        ? error.message
        : 'Erro ao carregar atividades.'

      throw error
    } finally {
      loadingAtividades.value = false
    }
  }

  async function createAtividade (payload: AtividadePayload) {
    const item = await atividadesService.create(payload)

    atividades.value.unshift(item)
    totalAtividades.value += 1

    return item
  }

  async function updateAtividade (
    id: number,
    payload: Partial<AtividadePayload>,
  ) {
    const item = await atividadesService.update(id, payload)
    const index = atividades.value.findIndex(value => value.id === id)

    if (index !== -1) {
      atividades.value[index] = item
    }

    return item
  }

  async function removeAtividade (id: number) {
    await atividadesService.remove(id)

    const index = atividades.value.findIndex(value => value.id === id)

    if (index !== -1) {
      atividades.value.splice(index, 1)
      totalAtividades.value = Math.max(0, totalAtividades.value - 1)
    }
  }

  return {
    relatorios,
    atividades,
    totalRelatorios,
    totalAtividades,
    loadingRelatorios,
    loadingAtividades,
    errorRelatorios,
    errorAtividades,
    listRelatorios,
    createRelatorio,
    updateRelatorio,
    removeRelatorio,
    listAtividades,
    createAtividade,
    updateAtividade,
    removeAtividade,
  }
})
