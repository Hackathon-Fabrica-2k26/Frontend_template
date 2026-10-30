# Contexto do projeto: Marsupi (frontend)

Resumo local (gitignored) para orientar o trabalho neste repositório. Fontes originais: `DESIGN.md` e `contexto_projeto_ia.md` (anexados pelo usuário em 2026-10-23), logo no Figma frame `42:9`: https://www.figma.com/design/EDj1MQgpyqyqD7xa9u9PHv/HACKATHON?node-id=42-9

## Produto
- **Marsupi**: copiloto pedagógico inclusivo com IA para professores dos anos iniciais (alunos de 5 a 9 anos).
- Hackathon Fábrica de Software 2026 (IFC Araquari), desafio "Do Zero à Autonomia: 24H com IA". Prioridade: MVP web demonstrável, fluxo curto.
- O professor decide; a IA apoia. Sem diagnósticos/laudos, sem rótulos clínicos, sem pontuações inventadas, sem afirmar conformidade LGPD.
- Jornada: acesso -> coleta guiada -> revisão de privacidade -> organização pedagógica -> atividades adaptadas (3 a 5) -> refinamento.
- Nunca tratar o que foi só desenhado/descrito como implementado.

## Stack
- Frontend: este repo (Vue 3 + Vuetify 4 + Vite + TS), segue `AGENTS.md`. Backend: `Marsupi_Backend` (Django + DRF + JWT, IA no servidor). Mobile Flutter é opcional, não confirmado.

## Design (resumo de DESIGN.md)
- Cores: primary `#356B5B`, support `#A9C7B4`, accent `#E3B477`, background `#F7F7F1`, text `#263D35`. Não usar a paleta antiga (`#2F4F45`, `#9CAF91`).
- Fonte: Poppins 400/500/600, line-height 1.45. Logo: usar arquivos originais (símbolo canguru verde + lettering "Marsupi"), sem alterar proporção/cores.
- Radius padrão 12px (checkbox 5px, avatar 50%). Sem pill, sem sombras, superfícies planas, bordas finas.
- Espaços: 8 / 12 / 16 / 18 / 20 / 24px. Controles de login 56px de altura, formulário 420px.
- Login desktop (1512x982): formulário à esquerda, formas orgânicas verdes + faixa dourada à direita (vetores, não gradiente/círculos). Sem card branco nem sombra. Textos: "Bem-vindo de volta", "Entre com sua matrícula para continuar.", Matrícula/Senha, "Manter conectado", "Esqueci minha senha", "Entrar", "ou", "Continuar com Google".
- Inputs: fundo background, borda 1px support, radius 12. Botão Entrar: primary com texto background. Botão Google: fundo background, borda support, ícone oficial multicolorido.
- Acessibilidade: WCAG 2.2 AA, foco visível, teclado, alvos >= 44px, botão de mostrar senha com nome acessível, não depender só de cor. Erros/sucesso/alerta precisam de tokens semânticos aprovados e contraste validado. Mobile não foi desenhado: proposta `min(420px, 100%)`.
- Microcopy em pt-BR, concreta e respeitosa ("Descreva o que você observou", "Revise os dados antes de continuar").

## Lacunas do template atual frente ao design
- `src/plugins/vuetify.ts`: tema ainda azul (`#1F8BDD`), sem tokens Marsupi; fonte instalada é `@fontsource/roboto`, falta Poppins.
- Sem logo nem assets Marsupi em `src/`; páginas existentes: `login`, `otp`, `index`, `items/` (exemplo), `[...all]`.
- Login com "matrícula" e Google: autenticação real não verificada; backend hoje usa JWT do template.
- Não existe `src/components/` ainda.

## Fluxo de trabalho
- Issue virá depois do usuário. Branch atual: `FEAT-6`. Commits em português (`feat:`, `fix:`), PR para `dev`.
- Antes de concluir: `npm run lint && npm run build`.
