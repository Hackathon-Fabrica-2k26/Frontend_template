# AGENTS.md
Contexto do produto: docs/contexto_projeto_ia.md.

Frontend Vue 3 + Vuetify 4 (Vite, TypeScript). Consome a API do `Marsupi_Backend` (Django + DRF + JWT). Siga estes padrões ao adicionar código.

## Estrutura
- `src/pages/`: rotas por arquivo (`unplugin-vue-router`). `pages/items/index.vue` vira `/items`; `[id].vue` vira `/items/:id`
- `src/layouts/`: `default.vue` (menu + barra) e `auth.vue` (telas de login). A página escolhe o layout com `definePage({ meta: { layout: 'auth' } })`
- `src/components/`: componentes reutilizáveis, registrados automaticamente (não precisa importar)
- `src/services/`: um arquivo por recurso do backend (classe com métodos `list`, `create`, `update`, `remove`)
- `src/stores/`: Pinia. Um arquivo por domínio, reexportado em `stores/index.ts`
- `src/interfaces/`: tipos TypeScript dos dados da API
- `src/plugins/`: `api.ts` (axios com JWT e refresh), `vuetify.ts` (tema), `index.ts`
- `src/utils/`: `apiError.ts` (mensagem de erro do DRF), `notify.ts` (toast)
- `src/styles/settings.scss`: ajustes globais do Vuetify

## Comandos
- `npm install`: instala dependências e ativa o hook `.githooks`
- `cp .env.example .env`: primeira execução (defina `VITE_API_URL`)
- `npm run dev`: servidor em http://localhost:3000
- `npm run lint` / `npm run lint:fix`: ESLint
- `npm run build`: checa tipos e gera `dist/`

## Convenções
- Componentes Vuetify (`v-btn`, `v-card`...) são importados sozinhos. Não instale outra biblioteca de UI.
- Tailwind v4 sem preflight (`src/styles/tailwind.css`, só theme+utilities) pode ser usado para layout; nunca importe tailwindcss completo (o preflight quebra o Vuetify). Componentes continuam sendo Vuetify.
- Ícones: Lucide (`@lucide/vue`), importe só o que usar: `import { House } from '@lucide/vue'` e `<House :size="20" />`. Em props do Vuetify passe o componente: `:prepend-icon="House"`. Não misture com outra biblioteca de ícones em código novo (o template ainda usa `mdi-*` em `layouts/default.vue`).
- Toda chamada à API passa por um service em `src/services/` usando `@/plugins/api`. Nunca use `axios` direto em páginas.
- Service lança `Error` com mensagem pronta (`buildApiError`). A página captura e mostra com `notify.error(...)`.
- Rotas exigem login por padrão. Libere uma rota com `definePage({ meta: { public: true } })`.
- Um novo link de menu vai no array `links` de `layouts/default.vue`.
- Listas da API vêm paginadas: `{ count, next, previous, results }` (tipo `Paginated<T>`).
- Token JWT fica no store `auth` (localStorage). A API renova o `access` sozinha em caso de 401.
- URL da API vem de `VITE_API_URL` (`.env`). Nunca coloque URL ou segredo no código.
- Importe com o alias `@/` (ex.: `@/services/items`). Imports explícitos de `vue` (`ref`, `computed`...).
- Textos da interface em português do Brasil.

## Adicionar um recurso novo (ex.: `tarefas`)
1. `src/interfaces/tarefa.ts` com os campos devolvidos pela API
2. `src/services/tarefas.ts` copiando `services/items.ts` e ajustando a rota (`tarefas/`)
3. `src/pages/tarefas/index.vue` copiando `pages/items/index.vue`
4. Link no `links` de `src/layouts/default.vue`
5. `npm run lint && npm run build`

## Git
- Branch a partir de `dev`: `feat/<tarefa>`, `fix/<bug>`. PR sempre para `dev`; `main` só recebe de `dev`.
- Commits em português, no formato `feat: ...`, `fix: ...`, `refactor: ...`.
- `.env` nunca vai para o git (hook `pre-commit` bloqueia). Só `.env.example`.
