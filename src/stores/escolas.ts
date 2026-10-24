import type {
  Config,
  ConfigPayload,
  Escola,
  EscolaPayload,
  ReconhecimentoChamada,
  Turma,
  TurmaPayload,
} from '@/interfaces/escola'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { configsService, escolasService, turmasService } from '@/services/escolas'

export const useEscolasStore = defineStore('escolas', () => {
  const configs = ref<Config[]>([])
  const escolas = ref<Escola[]>([])
  const turmas = ref<Turma[]>([])
  const turmaAtual = ref<Turma | null>(null)
  const totalConfigs = ref(0)
  const totalEscolas = ref(0)
  const totalTurmas = ref(0)
  const loading = ref(false)

  async function fetchConfigs (params: { page?: number } = {}) {
    loading.value = true
    try {
      const data = await configsService.list(params)
      configs.value = data.results
      totalConfigs.value = data.count
      return data
    } finally {
      loading.value = false
    }
  }

  async function createConfig (payload: ConfigPayload) {
    const item = await configsService.create(payload)
    configs.value.unshift(item)
    totalConfigs.value += 1
    return item
  }

  async function updateConfig (id: number, payload: Partial<ConfigPayload>) {
    const item = await configsService.update(id, payload)
    const idx = configs.value.findIndex(c => c.id === id)
    if (idx !== -1) {
      configs.value[idx] = item
    }
    return item
  }

  async function removeConfig (id: number) {
    await configsService.remove(id)
    configs.value = configs.value.filter(c => c.id !== id)
    totalConfigs.value = Math.max(0, totalConfigs.value - 1)
  }

  async function fetchEscolas (params: { search?: string, page?: number } = {}) {
    loading.value = true
    try {
      const data = await escolasService.list(params)
      escolas.value = data.results
      totalEscolas.value = data.count
      return data
    } finally {
      loading.value = false
    }
  }

  async function createEscola (payload: EscolaPayload) {
    const item = await escolasService.create(payload)
    escolas.value.unshift(item)
    totalEscolas.value += 1
    return item
  }

  async function updateEscola (id: number, payload: Partial<EscolaPayload>) {
    const item = await escolasService.update(id, payload)
    const idx = escolas.value.findIndex(e => e.id === id)
    if (idx !== -1) {
      escolas.value[idx] = item
    }
    return item
  }

  async function removeEscola (id: number) {
    await escolasService.remove(id)
    escolas.value = escolas.value.filter(e => e.id !== id)
    totalEscolas.value = Math.max(0, totalEscolas.value - 1)
  }

  async function fetchTurmas (params: { escola?: number, search?: string, page?: number } = {}) {
    loading.value = true
    try {
      const data = await turmasService.list(params)
      turmas.value = data.results
      totalTurmas.value = data.count
      return data
    } finally {
      loading.value = false
    }
  }

  async function fetchTurma (id: number) {
    loading.value = true
    try {
      const data = await turmasService.get(id)
      turmaAtual.value = data
      const idx = turmas.value.findIndex(t => t.id === id)
      if (idx === -1) {
        turmas.value.push(data)
      } else {
        turmas.value[idx] = data
      }
      return data
    } finally {
      loading.value = false
    }
  }

  async function reconhecerChamada (foto: File): Promise<ReconhecimentoChamada> {
    return turmasService.reconhecer(foto)
  }

  async function createTurma (payload: TurmaPayload) {
    const item = await turmasService.create(payload)
    turmas.value.unshift(item)
    totalTurmas.value += 1
    return item
  }

  async function updateTurma (id: number, payload: Partial<TurmaPayload>) {
    const item = await turmasService.update(id, payload)
    const idx = turmas.value.findIndex(t => t.id === id)
    if (idx !== -1) {
      turmas.value[idx] = item
    }
    return item
  }

  async function removeTurma (id: number) {
    await turmasService.remove(id)
    turmas.value = turmas.value.filter(t => t.id !== id)
    totalTurmas.value = Math.max(0, totalTurmas.value - 1)
  }

  return {
    configs,
    escolas,
    turmas,
    turmaAtual,
    totalConfigs,
    totalEscolas,
    totalTurmas,
    loading,
    fetchConfigs,
    createConfig,
    updateConfig,
    removeConfig,
    fetchEscolas,
    createEscola,
    updateEscola,
    removeEscola,
    fetchTurmas,
    fetchTurma,
    reconhecerChamada,
    createTurma,
    updateTurma,
    removeTurma,
  }
})
