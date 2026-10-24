import type { Atividade, AtividadeExtracao, AtividadePayload } from '@/interfaces/atividade'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { atividadesService } from '@/services/atividades'

export const useAtividadesStore = defineStore('atividades', () => {
  const atividades = ref<Atividade[]>([])
  const extraindo = ref(false)
  const salvando = ref(false)
  const dadosExtraidos = ref<AtividadeExtracao | null>(null)

  async function extrairAtividade (arquivo: File): Promise<AtividadeExtracao> {
    extraindo.value = true
    try {
      const resultado = await atividadesService.extrair(arquivo)
      dadosExtraidos.value = resultado
      return resultado
    } finally {
      extraindo.value = false
    }
  }

  async function criarAtividade (payload: AtividadePayload): Promise<Atividade> {
    salvando.value = true
    try {
      const nova = await atividadesService.create(payload)
      atividades.value.unshift(nova)
      return nova
    } finally {
      salvando.value = false
    }
  }

  function limparExtracao (): void {
    dadosExtraidos.value = null
    extraindo.value = false
  }

  return {
    atividades,
    extraindo,
    salvando,
    dadosExtraidos,
    extrairAtividade,
    criarAtividade,
    limparExtracao,
  }
})
