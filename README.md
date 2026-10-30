# Marsupi: Frontend

Painel web do **Marsupi**, copiloto pedagógico inclusivo para professores dos anos iniciais do Ensino Fundamental, criado no Hackathon Fábrica de Software 2026 (IFC Araquari), desafio *"Do Zero à Autonomia: 24H com IA"*.

SPA com Vue 3 + Vuetify 4 + Vite + TypeScript, Pinia e rotas por arquivo. Consome a API do [backend](https://github.com/Hackathon-Fabrica-2k26/Backend_template).

## Requisitos
- Node.js 22+ (testado no 24)
- [Backend](https://github.com/Hackathon-Fabrica-2k26/Backend_template) rodando em `http://localhost:8000`

## Instalação
```bash
npm install
cp .env.example .env      # define VITE_API_URL
npm run dev               # http://localhost:3000
```

Para desenvolver sem login, no backend use `AUTH_DISABLED=True` (veja o README dele). O front continua pedindo login: entre em `/login` com uma matrícula já cadastrada (não há cadastro pelo front).

## Comandos
| Comando | Ação |
|---|---|
| `npm run dev` | servidor de desenvolvimento (porta 3000) |
| `npm run build` | checa tipos e gera `dist/` |
| `npm run preview` | serve o build local |
| `npm run lint` / `lint:fix` | ESLint |
| `npm run type-check` | só tipos (`vue-tsc`) |

## Telas
| Rota | Descrição |
|---|---|
| `/login`, `/otp` | login por matrícula e código enviado por e-mail |
| `/` | início do professor |
| `/turmas`, `/turmas/nova`, `/turmas/:id` | turmas; a nova turma é criada a partir da foto da chamada |
| `/atividades`, `/atividades/:id` | atividades da turma e variações adaptadas pela IA |
| `/relatorios/novo`, `/relatorios/:id` | geração e leitura de relatórios do aluno |
| `/perfil` | dados do professor |
| `/apoio`, `/apoio/concordar`, `/conferir-dados`, `/enviar-laudo`, `/sair-site` | área pública do responsável (acesso por código, consentimento e laudo) |

## Variáveis (`.env`)
| Variável | Exemplo | Uso |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000/api/` | URL base da API (termina com `/`) |
| `VITE_MOCK_TRABALHOS` | `false` | Se `"true"`, simula envio/análise de trabalhos por foto (padrão: `false`) |
| `VITE_MOCK_ATIVIDADES` | `false` | Se `"true"`, simula extração de atividades por IA (padrão: `false`) |
| `VITE_MOCK_TURMAS` | `false` | Se `"true"`, simula reconhecimento de chamada e turmas locais (padrão: `false`) |

## Deploy (Dokku)
`static.json` e `.buildpacks` seguem o padrão Dokku dos outros projetos (Node + nginx).
Defina `VITE_API_URL` no ambiente de build do Dokku (ex.: `dokku config:set frontend VITE_API_URL=https://api.exemplo.com/api/`).
Todas as variáveis `VITE_MOCK_*` operam por padrão desligadas (`false`), garantindo que o build de produção utilize exclusivamente a API real caso nenhuma variável de mock seja definida.

### Cabeçalhos de segurança
O nginx do buildpack usa `app-nginx.conf.sigil` (o `nginx.conf` vale só para a imagem Docker; mantenha os dois iguais). Ele envia `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` e `Permissions-Policy` (só a câmera liberada). O HSTS vem do nginx do Dokku.
- O `connect-src` da CSP libera a API pela própria `VITE_API_URL`, então ela precisa estar no `dokku config` do app.
- Para liberar outra origem (separe por espaço): `dokku config:set frontend CSP_CONNECT_SRC_EXTRA="https://outra.exemplo.com"`.
- Ao adicionar script, fonte, imagem ou iframe de outro domínio, inclua a origem na CSP; senão o navegador bloqueia (veja o console).

Veja [AGENTS.md](AGENTS.md) para os padrões do projeto.
