import type {
  Aluno,
  AlunoPayload,
  MetaDados,
  MetaDadosPayload,
  Responsavel,
  ResponsavelPayload,
} from '@/interfaces/aluno'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { alunosService, metaDadosService, responsaveisService } from '@/services/alunos'

export const useAlunosStore = defineStore('alunos', () => {
  const alunos = ref<Aluno[]>([])
  const responsaveis = ref<Responsavel[]>([])
  const metaDados = ref<MetaDados[]>([])
  const totalAlunos = ref(0)
  const totalResponsaveis = ref(0)
  const totalMetaDados = ref(0)
  const loading = ref(false)

  async function fetchAlunos (params: { turma?: number, search?: string, page?: number } = {}) {
    loading.value = true
    try {
      const data = await alunosService.list(params)
      alunos.value = data.results
      totalAlunos.value = data.count
      return data
    } finally {
      loading.value = false
    }
  }

  async function createAluno (payload: AlunoPayload) {
    const item = await alunosService.create(payload)
    alunos.value.unshift(item)
    totalAlunos.value += 1
    return item
  }

  async function updateAluno (id: number, payload: Partial<AlunoPayload>) {
    const item = await alunosService.update(id, payload)
    const idx = alunos.value.findIndex(a => a.id === id)
    if (idx !== -1) {
      alunos.value[idx] = item
    }
    return item
  }

  async function removeAluno (id: number) {
    await alunosService.remove(id)
    alunos.value = alunos.value.filter(a => a.id !== id)
    totalAlunos.value = Math.max(0, totalAlunos.value - 1)
  }

  async function fetchResponsaveis (params: { search?: string, page?: number } = {}) {
    loading.value = true
    try {
      const data = await responsaveisService.list(params)
      responsaveis.value = data.results
      totalResponsaveis.value = data.count
      return data
    } finally {
      loading.value = false
    }
  }

  async function createResponsavel (payload: ResponsavelPayload) {
    const item = await responsaveisService.create(payload)
    responsaveis.value.unshift(item)
    totalResponsaveis.value += 1
    return item
  }

  async function updateResponsavel (id: number, payload: Partial<ResponsavelPayload>) {
    const item = await responsaveisService.update(id, payload)
    const idx = responsaveis.value.findIndex(r => r.id === id)
    if (idx !== -1) {
      responsaveis.value[idx] = item
    }
    return item
  }

  async function removeResponsavel (id: number) {
    await responsaveisService.remove(id)
    responsaveis.value = responsaveis.value.filter(r => r.id !== id)
    totalResponsaveis.value = Math.max(0, totalResponsaveis.value - 1)
  }

  async function fetchMetaDados (params: { page?: number } = {}) {
    loading.value = true
    try {
      const data = await metaDadosService.list(params)
      metaDados.value = data.results
      totalMetaDados.value = data.count
      return data
    } finally {
      loading.value = false
    }
  }

  async function createMetaDados (payload: MetaDadosPayload) {
    const item = await metaDadosService.create(payload)
    metaDados.value.unshift(item)
    totalMetaDados.value += 1
    return item
  }

  async function updateMetaDados (id: number, payload: Partial<MetaDadosPayload>) {
    const item = await metaDadosService.update(id, payload)
    const idx = metaDados.value.findIndex(m => m.id === id)
    if (idx !== -1) {
      metaDados.value[idx] = item
    }
    return item
  }

  async function removeMetaDados (id: number) {
    await metaDadosService.remove(id)
    metaDados.value = metaDados.value.filter(m => m.id !== id)
    totalMetaDados.value = Math.max(0, totalMetaDados.value - 1)
  }

  return {
    alunos,
    responsaveis,
    metaDados,
    totalAlunos,
    totalResponsaveis,
    totalMetaDados,
    loading,
    fetchAlunos,
    createAluno,
    updateAluno,
    removeAluno,
    fetchResponsaveis,
    createResponsavel,
    updateResponsavel,
    removeResponsavel,
    fetchMetaDados,
    createMetaDados,
    updateMetaDados,
    removeMetaDados,
  }
})
