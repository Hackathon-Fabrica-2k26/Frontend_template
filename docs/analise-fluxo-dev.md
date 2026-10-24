# Comparação do frontend com o fluxo Marsupi

Análise em 24/10/2026, baseada na branch `dev`, commit `b0da4e3b7ae69b4545f530731cf720e4525a5e6a`, no código e no mapa de telas fornecido pelo usuário.

O Figma `EDj1MQgpyqyqD7xa9u9PHv`, nó `70:67`, não pôde ser consultado: o conector retornou limite de chamadas do plano Starter. Portanto, não foi possível confirmar a correspondência visual com o Figma. As adições seguem os componentes Vuetify, cores e tipografia existentes. Não foram alterados arquivos em `sources/`.

## Situação encontrada na dev

“Existe” abaixo significa que há implementação no frontend; não comprova funcionamento com o backend em produção.

| Etapa do mapa | Estado na dev analisada | Evidência / lacuna |
| --- | --- | --- |
| Login | Existe | `src/pages/login.vue`, serviço de autenticação. Recuperação de senha é um link sem ação. |
| Verificação OTP | Existe | `src/pages/otp.vue`; verificação, reenvio e proteção de rota. |
| Minhas turmas | Existe | `src/pages/turmas/index.vue`. |
| Nova turma com foto | Existe | `src/pages/turmas/nova.vue`; extração e cadastro. |
| Confirmar nomes lidos | Existe | Segunda etapa no cadastro da turma; edição e confirmação dos nomes. |
| Turma, estudantes e atividades | Existe | `src/pages/turmas/[id].vue`. |
| Adicionar estudante | Existe | Cadastro de integrantes via `/turmas/nova?turma=...`; também existe código de diálogo individual na página. |
| Cadastrar atividade, texto/PDF/DOCX | Parcial | `CriarAtividadeModal.vue` aceita PDF/DOCX e nome/descrição manual; não oferece campo explícito para inserir o texto original. |
| Ver quem precisa adaptar | Faltava tela | Existe contrato de mapa em `atividadesService.mapaVariacoes`, sem consumidor na interface. |
| Gerar variações com IA | Faltava tela | `gerarVariacoes` já estava implementado no service. |
| Revisar e aprovar | Faltava tela | Service de variações com edição e aprovação já existia. |
| Baixar e imprimir | Faltava acesso às variações | Service PDF já existia; faltava chamada na interface. |
| Enviar trabalhos | Existe | `EnviarTrabalhosDialog.vue`, acessível pela turma. |
| Revisar identificação | Existe | Etapa de revisão no mesmo diálogo, com seleção do estudante. |
| Processamento com IA | Parcial | Upload dispara análise antes da revisão; conferir se o backend reprocessa após corrigir o estudante. A ordem difere do mapa. |
| Detalhe da atividade | Faltava | Sem rota dedicada; lista só abria envio. |
| Perfil e relatório do aluno | Parcial | `AlunoDetalhesModal.vue` lista atividades da turma; os relatórios associados à atividade não são filtrados pelo aluno. Texto de acompanhamento é fixo, não uma observação real. |
| Pontos de atenção | Existe parcialmente | Observações são consultadas no modal; não há interface de cadastro/edição. |
| Rascunho de PEI e relatório | Parcial | `/relatorios/novo` e `/relatorios/[id]` geram e exibem relatório, radar e atividades; falta fluxo explícito de revisão/aprovação do PEI. |
| Código do aluno | Ausente | Sem tela ou service para emissão, validade e revogação de código. |
| Acesso do responsável | Ausente | Sem troca do código por sessão restrita; guard exige login de professora nas telas de laudo. |
| Consentimento | Tela existe, integração incompleta | `/apoio/concordar`; checkbox encaminha à próxima tela, sem persistência de consentimento no service. |
| Enviar laudo | Simulação por padrão | `services/laudos.ts`: `VITE_MOCK_LAUDOS !== 'false'`. |
| Perfil de apoio | Parcial | Conferência de necessidades/adaptações existe em `/conferir-dados`; falta apresentar o perfil confirmado no aluno e usá-lo claramente no planejamento. |

## Complemento implementado nesta branch

- Nova rota protegida `/atividades/:id`, acessível por “Revisar versões” na lista de atividades da turma.
- Proposta original, geração das variações, mapa dos estudantes destinatários, edição, aprovação e download de cada PDF aprovado.
- Edição exige salvar antes de aprovar/baixar; salvar devolve a versão ao estado de rascunho para nova aprovação.
- Carrega todas as páginas de variações e estudantes. Apresenta falha com tentativa novamente e erro específico ao consultar destinatários.
- Mantém o diálogo de envio de trabalhos existente e os links para relatórios vinculados à atividade. Atualiza a atividade depois do envio concluído.
- Preserva o comportamento anterior de criação e envio e acrescenta apenas um acesso na lista da turma.

## O que ainda falta para fechar o mapa

1. **Responsável:** definir contrato no backend para código/token com validade, troca por sessão restrita ao aluno, consentimento persistido e revogação. Somente então liberar as rotas com autenticação própria; tornar as atuais públicas sem esse contrato exporia dados.
2. **Laudo real e perfil de apoio:** concluir endpoints, confirmar persistência e exclusão do arquivo pelo backend, desativar simulação e mostrar necessidades/adaptações confirmadas no perfil do estudante.
3. **Trabalhos e relatórios:** listar trabalhos persistidos por atividade, atualizar estados de análise após a revisão e ligar cada trabalho ao relatório correto. A nova tela mostra apenas os IDs de relatórios que a atividade retorna; não inventa endpoints de processamento.
4. **Perfil do aluno/PEI:** filtrar relatórios pelo aluno, substituir acompanhamento fixo por dados reais e definir estados de rascunho/aprovação do PEI. O botão “Exportar todas as atividades” atual abre somente o primeiro relatório.
5. **Seleção antes de gerar:** o mapa existente associa estudantes às versões já geradas. Confirmar com backend se há seleção prévia de alunos/perfis antes da geração; o service atual de geração não recebe seleção.
6. **Cadastro por texto:** oferecer campo de texto original explicitamente, mantendo a extração de PDF/DOCX atual.
7. **Integração completa:** validar com API real as permissões, contratos, geração de IA e PDFs. A compilação e os testes com API interceptada não substituem essa validação.

## Critérios para considerar a jornada concluída

Uma professora deve conseguir cadastrar turma e atividade, gerar versões ligadas aos perfis, revisar/aprovar, baixar PDFs, enviar e confirmar trabalhos e abrir os relatórios individuais corretos. O responsável deve acessar exclusivamente o aluno autorizado, consentir e confirmar um perfil de apoio persistido. Nenhuma simulação deve ser apresentada como resultado real.

## Verificação do complemento

- `npm run build`: passou, incluindo checagem TypeScript e geração de produção.
- `npm run lint`: zero erros; um aviso preexistente em `src/pages/turmas/[id].vue` (`abrirDialogNovoEstudante` sem uso).
- Chromium com Playwright e API interceptada: passou geração, edição de versão aprovada, bloqueio de aprovação/download enquanto há alterações, salvamento como rascunho, nova aprovação, download, abertura do diálogo de envio e recuperação após erro HTTP 500.
- Viewports de 1440 × 1000 e 390 × 844; mobile sem overflow horizontal. Nenhuma exceção JavaScript da página. O HTTP 500 foi provocado pelo teste de recuperação.
- Não foi exercitada API real, IA real ou validade do conteúdo do PDF. O fluxo de responsável permanece pendente das integrações descritas acima.
