export type FinalidadeConsentimento = 'analise_pedagogica_ia' | string

export type StatusConsentimento = 'ativo' | 'pendente' | 'revogado'

export interface Consentimento {
  id: number
  aluno: number
  responsavel: number | null
  finalidade: FinalidadeConsentimento
  versao_texto: string
  aceito_em: string
  revogado_em: string | null
  ativo: boolean
  created_at?: string
  updated_at?: string
}

export interface ConsentimentoPayload {
  aluno: number
  finalidade?: FinalidadeConsentimento
  versao_texto?: string
}

export interface TermoInformativoLGPD {
  versao: string
  titulo: string
  baseLegal: string
  resumo: string
  topicos: {
    titulo: string
    descricao: string
  }[]
  garantias: string[]
}

export const TERMO_PADRAO_LGPD: TermoInformativoLGPD = {
  versao: 'v1',
  titulo: 'Termo de Consentimento para Uso Pedagógico Assistido por IA',
  baseLegal: 'Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - Art. 14, § 1º e Art. 11)',
  resumo:
    'Autorização concedida pelos pais ou responsáveis legais para o tratamento de produções escolares e necessidades pedagógicas do estudante através de tecnologias de apoio pedagógico inclusivo.',
  topicos: [
    {
      titulo: 'Finalidade Estritamente Pedagógica',
      descricao:
        'Os dados são utilizados exclusivamente para apoiar a equipe escolar a identificar pontos fortes de aprendizagem e sugerir atividades adaptadas ao ritmo do estudante. Não são emitidos laudos ou diagnósticos médicos.',
    },
    {
      titulo: 'Privacidade e Anonimização',
      descricao:
        'Nenhum dado pessoal identificável (como nome completo ou endereço) é utilizado para treinamento público de modelos de inteligência artificial externa. O processamento respeita o princípio da minimização.',
    },
    {
      titulo: 'Direito de Revogação e Exclusão',
      descricao:
        'O responsável legal pode revogar esta autorização a qualquer momento. Conforme a LGPD, a revogação acarreta a exclusão definitiva dos relatórios e dados derivados gerados por inteligência artificial.',
    },
  ],
  garantias: [
    'Consentimento específico para apoio pedagógico inclusivo.',
    'Tratamento no melhor interesse da criança e do adolescente.',
    'Revogação facilitada com exclusão imediata de dados derivados.',
  ],
}

export { type Paginated } from '@/interfaces/item'
