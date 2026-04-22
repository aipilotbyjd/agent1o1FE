# Project Structure — Authoritative Reference

> This is the single source of truth for **where code goes** in `agent1o1FE`. Both humans and AI coding assistants should read and follow it.
>
> Two scopes are covered:
>
> 1. **API layer** (`src/api/`) — the module-per-resource pattern.
> 2. **App pages** (`src/pages/app/`) — the slot-based feature pattern.
>
> Everything outside those two scopes (`src/Providers/`, `src/Routes/`, `src/Protected/`, `src/context/`, `src/components/`, `src/hooks/`, `src/utils/`, `src/layouts/`, `src/types/`) stays as it is today and is **not covered** by this document.

---

## 0. How To Use This Doc With An AI Assistant

When prompting an AI to add or modify code in this repo:

1. Paste (or link) this file into the conversation as context.
2. Tell the AI: *"Follow the rules in `docs/Structure.md` exactly. Do not invent new folders or suffixes."*
3. Reference the exact section the AI should follow, e.g. *"Add a new API module per §3.3."* or *"Add this partial per the slot matrix in §4.2."*
4. If the AI proposes a change that breaks these rules, reject it and point to the rule number.

The doc is deliberately strict and mechanical. Every decision has one right answer.

---

## 1. Glossary

Common terms used throughout this doc:

| Term              | Meaning |
|-------------------|---------|
| **Module**        | A self-contained folder for one backend resource under `src/api/modules/`. Example: `src/api/modules/workflows/`. |
| **Feature**       | A self-contained folder for one product area under `src/pages/app/`. Example: `src/pages/app/Workflows/`. |
| **Slot**          | A pre-defined subfolder inside a feature whose name dictates what files live in it (`_partial/`, `_helper/`, `_layouts/`, `_hooks/`, `_types/`, `_context/`). See §4.2. |
| **Suffix**        | The filename ending that identifies a file's kind (`.page.tsx`, `.partial.tsx`, `.helper.ts`, `.layout.tsx`, `.constants.ts`, `.hook.ts`, `.type.ts`, `.context.tsx`). Every suffix maps to exactly one slot. |
| **Barrel**        | An `index.ts` that re-exports other files in the same folder, typically with `export *`. Lets consumers import from the folder path instead of deep file paths. |
| **Envelope**      | The wrapper object Laravel returns around every response: `{ success, statusCode, message, data }`. See §3.4. |
| **Unwrap**        | The act of peeling the `data.data` out of the envelope so consumers see only the domain payload. |
| **Endpoint**      | A URL path on the backend. In this codebase they are defined as arrow functions returning strings, grouped in `<module>.endpoints.ts`. |
| **Service**       | A pure async object of functions that call the backend using `axiosClient` + endpoints and return unwrapped domain types. Framework-agnostic. |
| **Hook**          | A React Query `useQuery` / `useMutation` wrapper around a service function. Lives in `<module>.hooks.ts`. |
| **Query key**     | The array React Query uses to identify a cached query. Co-located per module in `<module>.keys.ts`. |
| **Interceptor**   | An axios request or response middleware — in this repo: attach auth, refresh token on 401, normalize errors. |
| **Pattern A / B** | Two acceptable layouts for multi-page features under `pages/app/`. See §4.4. |

---

## 2. Top-Level Layout

```
src/
├── api/            # API layer — covered in §3
├── pages/
│   ├── app/        # Product pages — covered in §4
│   ├── editor/     # Workflow editor — out of scope
│   ├── apps/       # Template leftovers — out of scope
│   ├── ...
├── components/     # Out of scope
├── hooks/          # Out of scope
├── context/        # Out of scope
├── ... (all other dirs are out of scope for this doc)
```

---

# 3. API Layer (`src/api/`)

## 3.1 Philosophy

**Group by domain, not by layer.** Every backend resource owns its endpoints, service, hooks, and query keys in one folder (a **module**). Nothing is split across `src/api/http/`, `src/api/services/`, `src/api/hooks/` anymore.

## 3.2 Directory Tree

```
src/api/
├── index.ts                          # re-exports client + core + modules
│
├── client/                           # HTTP transport
│   ├── axios.ts                      # axios instance only
│   ├── interceptors/
│   │   ├── attach-auth.ts            # request: Bearer header
│   │   ├── refresh-token.ts          # response: 401 → /auth/refresh queue
│   │   └── normalize-error.ts        # response: ApiError + toasts
│   └── index.ts
│
├── core/                             # Cross-cutting primitives
│   ├── types.ts                      # TApiResponse, TPaginatedResponse, TListParams
│   ├── envelope.ts                   # unwrap() helper
│   ├── errors.ts                     # ApiError class
│   ├── token-manager.ts              # access/refresh token storage
│   ├── query-client.ts               # QueryClient factory
│   ├── notify.ts                     # toast wrapper
│   ├── create-resource.ts            # optional CRUD factory
│   └── index.ts
│
└── modules/                          # ONE folder per backend resource
    ├── auth/
    ├── workspaces/
    ├── workspace-members/
    ├── workflows/                    # owns workflows + editor + shares
    ├── folders/
    ├── tags/
    ├── executions/
    ├── credentials/
    ├── variables/
    ├── templates/
    ├── dashboard/
    ├── node-types/
    ├── notes/
    ├── agents/
    ├── webhooks/
    └── index.ts                      # re-exports every module barrel
```

## 3.3 Module Shape (every module is identical)

```
src/api/modules/<name>/
├── <name>.endpoints.ts               # URL path builders (arrow functions)
├── <name>.service.ts                 # async functions that call axios
├── <name>.keys.ts                    # React Query key factory
├── <name>.hooks.ts                   # useQuery / useMutation wrappers
└── index.ts                          # export * from the 4 files above
```

Large modules (like `workflows/`) may add extra siblings — still inside the same module folder:

```
src/api/modules/workflows/
├── workflows.endpoints.ts
├── workflows.service.ts
├── workflows.keys.ts
├── workflows.hooks.ts
├── editor.service.ts                 # version / validate / pinned-data
├── editor.hooks.ts
├── shares.service.ts
├── shares.hooks.ts
└── index.ts
```

## 3.4 Response Envelope Contract

Laravel always wraps responses:

```json
{ "success": true, "statusCode": 200, "message": "...", "data": { /* payload */ } }
```

Services peel the envelope exactly once using `unwrap()`:

```ts
// core/envelope.ts
import type { AxiosResponse } from 'axios';
import type { TApiResponse } from './types';
export const unwrap = <T>(res: AxiosResponse<TApiResponse<T>>): T => res.data.data;
```

Paginated list endpoints keep the envelope intact (they return `TPaginatedResponse<T>`). Single-resource endpoints unwrap.

## 3.5 File Templates

### endpoints

```ts
// modules/workflows/workflows.endpoints.ts
export const WorkflowEndpoints = {
  list:     (ws: string)             => `/workspaces/${ws}/workflows`,
  create:   (ws: string)             => `/workspaces/${ws}/workflows`,
  detail:   (ws: string, id: string) => `/workspaces/${ws}/workflows/${id}`,
  update:   (ws: string, id: string) => `/workspaces/${ws}/workflows/${id}`,
  delete:   (ws: string, id: string) => `/workspaces/${ws}/workflows/${id}`,
  execute:  (ws: string, id: string) => `/workspaces/${ws}/workflows/${id}/execute`,
} as const;
```

### keys

```ts
// modules/workflows/workflows.keys.ts
import type { TListParams } from '@/api/core';
export const workflowKeys = {
  all:    (ws: string)                 => ['workflows', ws] as const,
  list:   (ws: string, p?: TListParams) => ['workflows', ws, 'list', p] as const,
  detail: (ws: string, id: string)     => ['workflows', ws, 'detail', id] as const,
};
```

### service

```ts
// modules/workflows/workflows.service.ts
import { axiosClient } from '@/api/client';
import { unwrap } from '@/api/core';
import type { TPaginatedResponse, TListParams } from '@/api/core';
import type { TWorkflow, TCreateWorkflowDto, TUpdateWorkflowDto } from '@/types/workflow.type';
import { WorkflowEndpoints as E } from './workflows.endpoints';

export const WorkflowService = {
  list: (ws: string, params?: TListParams, signal?: AbortSignal) =>
    axiosClient.get<TPaginatedResponse<TWorkflow>>(E.list(ws), { params, signal })
               .then((r) => r.data),

  detail: (ws: string, id: string, signal?: AbortSignal) =>
    axiosClient.get(E.detail(ws, id), { signal }).then(unwrap<TWorkflow>),

  create: (ws: string, body: TCreateWorkflowDto) =>
    axiosClient.post(E.create(ws), body).then(unwrap<TWorkflow>),

  update: (ws: string, id: string, body: TUpdateWorkflowDto) =>
    axiosClient.put(E.update(ws, id), body).then(unwrap<TWorkflow>),

  remove: (ws: string, id: string) =>
    axiosClient.delete(E.delete(ws, id)).then(() => undefined),
};
```

### hooks

```ts
// modules/workflows/workflows.hooks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/api/core';
import type { TListParams } from '@/api/core';
import type { TCreateWorkflowDto } from '@/types/workflow.type';
import { WorkflowService } from './workflows.service';
import { workflowKeys } from './workflows.keys';

export const useWorkflows = (ws: string, params?: TListParams) =>
  useQuery({
    queryKey: workflowKeys.list(ws, params),
    queryFn : ({ signal }) => WorkflowService.list(ws, params, signal),
    enabled : !!ws,
  });

export const useCreateWorkflow = (ws: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: TCreateWorkflowDto) => WorkflowService.create(ws, body),
    onSuccess : (w) => {
      qc.invalidateQueries({ queryKey: workflowKeys.all(ws) });
      notify.success(`Workflow "${w.name}" created`);
    },
    onError: notify.fromError('Failed to create workflow'),
  });
};
```

### barrel

```ts
// modules/workflows/index.ts
export * from './workflows.endpoints';
export * from './workflows.keys';
export * from './workflows.service';
export * from './workflows.hooks';
```

## 3.6 Rules

1. **One module per backend resource.** Never split a resource across two modules.
2. **Services unwrap single responses, preserve paginated ones.** `.then(unwrap<T>)` for detail/create/update. `.then((r) => r.data)` for list.
3. **Hooks never import `toast` directly.** Always go through `@/api/core/notify`.
4. **Hooks always forward `signal`.** `({ signal }) => Service.x(..., signal)`.
5. **Query keys live next to hooks**, not in a shared factory.
6. **All barrels use `export *`.** No named re-export lists.
7. **Endpoint methods are arrow functions returning strings.** Never hand-concatenate URLs in services.
8. **Errors are `ApiError` instances.** Check with `ApiError.is(e)`, read fields via `e.field('name')`.
9. **Public surface is the module barrel.** Consumers do `import { useWorkflows } from '@/api/modules/workflows'`, never deep paths.

## 3.7 Adding A New Module (Recipe)

1. Create `src/api/modules/<name>/`.
2. Add `<name>.endpoints.ts` with the URL builders.
3. Add `<name>.keys.ts` with the React Query key factory.
4. Add `<name>.service.ts` importing `axiosClient`, `unwrap`, and the endpoints.
5. Add `<name>.hooks.ts` importing the service, keys, and `notify`.
6. Add `index.ts` with `export *` from the four files.
7. Add the module to `modules/index.ts` (one line: `export * from './<name>';`).

Done. Zero other files edited.

---

# 4. Pages Layer (`src/pages/app/`)

## 4.1 Philosophy

Every product feature is a folder under `src/pages/app/`. Inside each feature, files are organized into **slots** — underscore-prefixed folders whose names determine what kind of files live in them. **Suffix decides the slot. Always.**

## 4.2 Slot Matrix

| Slot         | File suffix                         | Purpose                              |
|--------------|-------------------------------------|--------------------------------------|
| *(root)*     | `*.page.tsx`                        | Route-level page components          |
| `_partial/`  | `*.partial.tsx`                     | Feature-scoped sub-components        |
| `_helper/`   | `*.helper.ts`, `*.constants.ts`     | Pure functions and constants         |
| `_layouts/`  | `*.layout.tsx`                      | Feature-scoped layout wrappers       |
| `_hooks/`    | `*.hook.ts`                         | UI-only hooks (NOT React Query)      |
| `_types/`    | `*.type.ts`                         | Feature-local types                  |
| `_context/`  | `*.context.tsx`                     | Feature-scoped context providers     |

Rules:

- A file with suffix `.X` lives only in slot `_X/`. No exceptions.
- Create a slot only when it has files. Do not create empty slots.
- React Query hooks do **not** go in `_hooks/` — they go in `src/api/modules/<name>/`.
- Domain types used by the API live in `src/types/`. Only feature-local types go in `_types/`.

## 4.3 Feature Folder Shape

```
pages/app/<Feature>/
├── <Feature>.page.tsx          # (or <Feature>List.page.tsx, etc.)
├── _partial/
│   └── *.partial.tsx
├── _helper/
│   ├── *.helper.ts
│   └── *.constants.ts
├── _layouts/
│   └── *.layout.tsx
├── _hooks/                     # only if needed
│   └── *.hook.ts
├── _types/                     # only if needed
│   └── *.type.ts
└── _context/                   # only if needed
    └── *.context.tsx
```

## 4.4 Multi-Page Features — Two Allowed Patterns

### Pattern A — Flat with page prefix (small multi-page features)

All partials share one `_partial/`, prefixed with the page they serve.

```
Executions/
├── ExecutionsList.page.tsx
├── ExecutionDetail.page.tsx
├── _partial/
│   ├── List.Table.partial.tsx
│   ├── List.Filters.partial.tsx
│   ├── List.EmptyState.partial.tsx
│   ├── List.States.partial.tsx
│   └── Detail.Header.partial.tsx
├── _helper/
└── _layouts/
```

Use when: ≤ 5 partials per page, and both pages are structurally similar.

### Pattern B — Per-page subfolders (large multi-page features)

Each page gets its own full feature-shape subfolder. Truly shared code goes in `_shared/`.

```
Agents/
├── AgentsList/
│   ├── AgentsList.page.tsx
│   └── _partial/
├── AgentBuilder/
│   ├── AgentBuilder.page.tsx
│   ├── _partial/
│   ├── _helper/
│   ├── _hooks/
│   └── _context/
├── _shared/
│   └── _partial/
└── _layouts/
```

Use when: pages are structurally different (list vs. builder), one page has its own state/context, or partials would never be reused.

## 4.5 Authoritative Tree (Every Feature)

```
src/pages/app/
│
├── Dashboard/
│   ├── Dashboard.page.tsx
│   ├── _partial/
│   ├── _helper/
│   └── _layouts/
│       └── DashboardLayout.layout.tsx
│
├── Workflows/
│   ├── WorkflowsList.page.tsx
│   ├── _partial/
│   │   ├── Table.partial.tsx
│   │   ├── Filters.partial.tsx
│   │   ├── BulkActions.partial.tsx
│   │   ├── ViewToggle.partial.tsx
│   │   ├── PreviewPanel.partial.tsx
│   │   ├── StatsCards.partial.tsx
│   │   ├── EmptyState.partial.tsx
│   │   ├── States.partial.tsx
│   │   ├── FolderModal.partial.tsx
│   │   └── MoveToFolderModal.partial.tsx
│   ├── _helper/
│   │   └── workflows.helper.ts
│   ├── _hooks/
│   │   └── useWorkflowFilters.hook.ts
│   └── _layouts/
│       └── WorkflowsLayout.layout.tsx
│
├── Executions/                                # Pattern A
│   ├── ExecutionsList.page.tsx
│   ├── ExecutionDetail.page.tsx
│   ├── _partial/
│   │   ├── List.Table.partial.tsx
│   │   ├── List.Filters.partial.tsx
│   │   ├── List.EmptyState.partial.tsx
│   │   ├── List.States.partial.tsx
│   │   └── Detail.Header.partial.tsx
│   ├── _helper/
│   │   └── executions.helper.ts
│   └── _layouts/
│       └── ExecutionsLayout.layout.tsx
│
├── Credentials/
│   ├── CredentialsList.page.tsx
│   ├── _partial/
│   │   ├── Table.partial.tsx
│   │   ├── Filters.partial.tsx
│   │   ├── EmptyState.partial.tsx
│   │   ├── States.partial.tsx
│   │   ├── CredentialModal.partial.tsx
│   │   └── CredentialShareModal.partial.tsx
│   ├── _helper/
│   │   └── credentials.helper.ts
│   └── _layouts/
│       └── CredentialsLayout.layout.tsx
│
├── Variables/
│   ├── VariablesList.page.tsx
│   ├── _partial/
│   │   ├── Table.partial.tsx
│   │   ├── Filters.partial.tsx
│   │   ├── EmptyState.partial.tsx
│   │   ├── States.partial.tsx
│   │   └── VariableModal.partial.tsx
│   ├── _helper/
│   │   └── variables.helper.ts
│   └── _layouts/
│       └── VariablesLayout.layout.tsx
│
├── Templates/
│   ├── TemplatesList.page.tsx
│   ├── _partial/
│   │   ├── TemplateCard.partial.tsx
│   │   ├── TemplateDetailModal.partial.tsx
│   │   ├── Filters.partial.tsx
│   │   ├── EmptyState.partial.tsx
│   │   └── States.partial.tsx
│   ├── _helper/
│   │   └── templates.helper.ts
│   └── _layouts/
│       └── TemplatesLayout.layout.tsx
│
├── Webhooks/
│   ├── WebhooksList.page.tsx
│   ├── _partial/
│   │   ├── Table.partial.tsx
│   │   ├── Filters.partial.tsx
│   │   ├── EmptyState.partial.tsx
│   │   └── WebhookModal.partial.tsx
│   ├── _helper/
│   └── _layouts/
│       └── WebhooksLayout.layout.tsx
│
├── Skills/
│   ├── SkillsList.page.tsx
│   ├── _partial/
│   │   ├── SkillCard.partial.tsx
│   │   ├── SkillModal.partial.tsx
│   │   ├── EmptyState.partial.tsx
│   │   └── States.partial.tsx
│   ├── _helper/
│   └── _layouts/
│       └── SkillsLayout.layout.tsx
│
├── Agents/                                    # Pattern B
│   │
│   ├── AgentsList/
│   │   ├── AgentsList.page.tsx
│   │   └── _partial/
│   │       ├── StatsCards.partial.tsx
│   │       ├── EmptyState.partial.tsx
│   │       └── States.partial.tsx
│   │
│   ├── AgentBuilder/
│   │   ├── AgentBuilder.page.tsx
│   │   ├── _partial/
│   │   │   ├── BuilderHero.partial.tsx
│   │   │   ├── BuilderForm.partial.tsx
│   │   │   ├── BuilderChat.partial.tsx
│   │   │   ├── SectionCard.partial.tsx
│   │   │   └── SkillsModal.partial.tsx
│   │   ├── _helper/
│   │   │   ├── Builder.helper.ts
│   │   │   └── Builder.constants.ts
│   │   ├── _hooks/
│   │   │   └── useBuilderState.hook.ts
│   │   └── _context/
│   │       └── BuilderContext.context.tsx
│   │
│   ├── _shared/
│   │   └── _partial/
│   │       └── AgentCard.partial.tsx
│   │
│   └── _layouts/
│       └── AgentsLayout.layout.tsx
│
├── Settings/                                  # Sub-features (nested Pattern B)
│   ├── Settings.page.tsx
│   │
│   ├── General/
│   │   ├── SettingsGeneral.page.tsx
│   │   ├── _partial/
│   │   └── _helper/
│   │
│   ├── Profile/
│   │   ├── SettingsProfile.page.tsx
│   │   ├── _partial/
│   │   └── _helper/
│   │
│   ├── Workspaces/
│   │   ├── SettingsWorkspaces.page.tsx
│   │   ├── _partial/
│   │   └── _helper/
│   │
│   ├── Teams/
│   │   ├── SettingsTeams.page.tsx
│   │   ├── _partial/
│   │   │   ├── MembersTable.partial.tsx
│   │   │   ├── InvitationsTable.partial.tsx
│   │   │   ├── InviteModal.partial.tsx
│   │   │   └── LeaveModal.partial.tsx
│   │   └── _helper/
│   │       └── teams.helper.ts
│   │
│   └── _layouts/
│       └── SettingsLayout.layout.tsx
│
└── OAuth/
    ├── OAuthCallback.page.tsx
    └── _layouts/
```

## 4.6 Pattern-Per-Feature Matrix

| Feature     | Pages | Pattern                                |
|-------------|:-----:|----------------------------------------|
| Dashboard   | 1     | Flat                                   |
| Workflows   | 1     | Flat                                   |
| Executions  | 2     | A — flat with `List.` / `Detail.` prefix |
| Credentials | 1     | Flat                                   |
| Variables   | 1     | Flat                                   |
| Templates   | 1     | Flat                                   |
| Webhooks    | 1     | Flat                                   |
| Skills      | 1     | Flat                                   |
| Agents      | 2     | B — subfolders per page + `_shared/`   |
| Settings    | 4+1   | Sub-features (nested B)                |
| OAuth       | 1     | Flat                                   |

## 4.7 Rules

1. **Suffix ⇒ slot.** `.partial.tsx` → `_partial/`, `.helper.ts` → `_helper/`, `.layout.tsx` → `_layouts/`, `.constants.ts` → `_helper/`, `.hook.ts` → `_hooks/`, `.type.ts` → `_types/`, `.context.tsx` → `_context/`.
2. **Pages live at the feature root** (or at the sub-feature root for Pattern B).
3. **PascalCase folder names, underscore prefix only for slots.** `Workflows/`, `AgentBuilder/`, `_partial/`, `_shared/`.
4. **Page file name = feature name + purpose.** `WorkflowsList.page.tsx`, `AgentBuilder.page.tsx`. Never `Page.tsx` or `index.tsx`.
5. **No loose files at the feature root** other than `.page.tsx` and optional `index.ts`.
6. **Shared (between sibling pages) goes in `_shared/`** — never dump into one sibling's slot.
7. **React Query hooks do NOT live here.** They live in `src/api/modules/`.

## 4.8 Adding Code To A Feature (Recipe)

| Adding…                                | Where it goes                                            |
|----------------------------------------|----------------------------------------------------------|
| A new page                             | `<Feature>/<PageName>.page.tsx` (or Pattern B subfolder) |
| A new sub-component used by a page     | `<Feature>/_partial/<Name>.partial.tsx`                  |
| A helper function                      | `<Feature>/_helper/<name>.helper.ts`                     |
| A constants file                       | `<Feature>/_helper/<name>.constants.ts`                  |
| A UI-only hook (filter state, etc.)    | `<Feature>/_hooks/use<Name>.hook.ts`                     |
| A feature-local type                   | `<Feature>/_types/<name>.type.ts`                        |
| A feature context provider             | `<Feature>/_context/<Name>Context.context.tsx`           |
| A layout wrapper for this feature      | `<Feature>/_layouts/<Name>.layout.tsx`                   |
| A React Query hook                     | `src/api/modules/<name>/<name>.hooks.ts` (see §3)        |
| A generic UI component reused elsewhere| `src/components/` (out of scope)                         |

---

# 5. Enforcement Summary (For AI Agents)

When generating or modifying code, you **must**:

- Place every file according to its suffix (§3.5 for API, §4.2 for pages).
- Use `export *` in barrels.
- Unwrap API envelopes via `unwrap()` in services.
- Forward `AbortSignal` in every React Query hook.
- Route toasts through `@/api/core/notify`, not `react-toastify` directly.
- Follow Pattern A or B consistently (§4.4, §4.6).
- Never invent new suffixes or new slot folders.
- Never split a backend resource across multiple API modules.
- Never place React Query hooks inside `pages/app/`.

When unsure, re-read the relevant section above. If a situation is not covered, ask the human before inventing structure.
