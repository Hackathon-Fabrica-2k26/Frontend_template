# Frontend

SPA com Vue 3 + Vuetify 4 + Vite + TypeScript. Login JWT, rotas por arquivo, layouts, Pinia e exemplo de CRUD ligado ao [Backend_template](https://github.com/Hackathon-Fabrica-2k26/Backend_template).

## Requisitos
- Node.js 22+ (testado no 24)
- Backend rodando em `http://localhost:8000` (veja o README do Backend_template)

## Instalação
```bash
npm install
cp .env.example .env      # define VITE_API_URL
npm run dev               # http://localhost:3000
```

Para desenvolver sem login, no backend use `AUTH_DISABLED=True` (veja o README dele). O front continua pedindo login; crie uma conta em `/register`.

## Comandos
| Comando | Ação |
|---|---|
| `npm run dev` | servidor de desenvolvimento (porta 3000) |
| `npm run build` | checa tipos e gera `dist/` |
| `npm run preview` | serve o build local |
| `npm run lint` / `lint:fix` | ESLint |
| `npm run type-check` | só tipos (`vue-tsc`) |

## Telas de exemplo
| Rota | Descrição |
|---|---|
| `/login`, `/register` | autenticação (layout `auth`, públicas) |
| `/` | início |
| `/items` | CRUD de itens com busca (usa `/api/items/`) |

## Variáveis (`.env`)
| Variável | Exemplo | Uso |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000/api/` | URL base da API (termina com `/`) |

## Deploy
`static.json` e `.buildpacks` seguem o padrão Dokku dos outros projetos (Node + nginx). Defina `VITE_API_URL` no ambiente de build.

Veja [AGENTS.md](AGENTS.md) para os padrões do projeto.
