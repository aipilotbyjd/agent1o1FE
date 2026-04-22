# Proposed API Layer Structure

> Goal: replace the current `http / services / hooks / utils` split with a **module-based (feature-sliced) layout** that scales linearly as resources grow, removes duplicated barrels, and kills the boilerplate in every CRUD hook.

This document is a concrete plan — directory tree, file templates, migration path, and the rationale behind every decision. It is designed so you can adopt it incrementally: one module at a time, without a big-bang rewrite.

---

## 1. What Is Wrong With The Current Layout

Before proposing anything, the pain points in `src/api/` today:

### 1.1 Horizontal split scales poorly

The current tree groups by **technical layer**:

```
src/api/
├── http/endpoints.ts          (one 228-line file for ALL routes)
├── services/                  (19 files, one per resource)
├── hooks/                     (19 files, one per resource)
└── utils/query.helper.ts      (one file for ALL query keys)
```

Adding a new resource today requires editing **7 different files**:
`endpoints.ts`, `http/index.ts`, `services/<x>.service.ts`, `services/index.ts`, `hooks/use<X>.ts`, `hooks/index.ts`, `utils/query.helper.ts`, and finally the root `api/index.ts`. That is friction, and it is also how things drift out of sync.

### 1.2 Barrels already drifted

`src/api/index.ts` re-exports hooks by name, one by one. This has already gone out of sync:

- `useWorkflows.ts` exports `useExecuteWorkflow`, `useActivateWorkflow`, `useDeactivateWorkflow`, `useDuplicateWorkflow`, `useToggleFavorite`.
- Those names are **missing** from `src/api/index.ts`.
- The file instead re-exports **aliased** versions from `useWorkflowEditor.ts` (`useEditorExecuteWorkflow`, etc.).

So consumers cannot tell which workflow hook is "the" hook. This is a direct symptom of central barrels.

### 1.3 Domain fragmentation

The "workflow" domain is spread across **5 files**:

- `services/workflows.service.ts` + `services/workflow-editor.service.ts` + `services/workflow-share.service.ts`
- `hooks/useWorkflows.ts` + `hooks/useWorkflowEditor.ts` + `hooks/useWorkflowExtras.ts`

Two of them duplicate the same CRUD (`WorkflowService.create` vs `WorkflowEditorService.create`). A new developer cannot know which one to use.

### 1.4 UI coupling inside hooks

Every mutation hook hardcodes `toast.success(...)` / `toast.error(...)`. Side-effects cannot be turned off per call site, and a hook cannot be reused in a non-toast context (tests, background sync, silent retries, optimistic flows).

### 1.5 Copy-pasted CRUD

Every resource has the same five hooks: `useFetchX`, `useFetchXById`, `useCreateX`, `useUpdateX`, `useDeleteX`. That is ~80% of the hook files, rewritten 19 times, with tiny variations that make diffing painful.

### 1.6 Other smaller issues

- `queryKeys` is one 172-line object; adding a key forces a merge target everyone else is also editing.
- `parseApiError` produces a plain object, so `instanceof ApiError` is not possible — error handling in components leans on duck typing.
- No `AbortSignal` plumbing → React Query cannot actually cancel in-flight requests.
- `axios.config.ts` mixes 4 concerns (auth header, refresh queue, toasts, error normalization) in one file.

---

## 2. Proposed Structure — Module Per Resource

Group by **domain** instead of by layer. Each backend resource owns its endpoints, service, hooks, and query keys in one folder.

```
src/api/
├── index.ts                          # single public barrel
│
├── client/                           # transport (was: http/)
│   ├── axios.ts                      # axios instance only
│   ├── interceptors/
│   │   ├── attach-auth.ts            # request: Bearer header
│   │   ├── refresh-token.ts          # response: 401 → /auth/refresh queue
│   │   └── normalize-error.ts        # response: map to ApiError + toasts
│   └── index.ts
│
├── core/                             # cross-cutting primitives
│   ├── types.ts                      # TApiResponse, TPaginatedResponse, TListParams
│   ├── envelope.ts                   # unwrap(res) helper
│   ├── errors.ts                     # ApiError class + parseApiError + getFieldError
│   ├── token-manager.ts              # (moved from utils/)
│   ├── query-client.ts               # QueryClient factory + defaultOptions
│   ├── notify.ts                     # toast wrapper — the ONLY place hooks import toast
│   ├── create-resource.ts            # CRUD factory (see §5)
│   └── index.ts
│
├── modules/                          # ONE folder per backend resource
│   ├── auth/
│   │   ├── auth.endpoints.ts
│   │   ├── auth.service.ts
│   │   ├── auth.keys.ts
│   │   ├── auth.hooks.ts
│   │   └── index.ts                  # barrel: re-exports the 4 above
│   │
│   ├── workspaces/
│   │   ├── workspaces.endpoints.ts
│   │   ├── workspaces.service.ts
│   │   ├── workspaces.keys.ts
│   │   ├── workspaces.hooks.ts
│   │   └── index.ts
│   │
│   ├── workflows/                    # single owner for all workflow concerns
│   │   ├── workflows.endpoints.ts
│   │   ├── workflows.service.ts
│   │   ├── workflows.keys.ts
│   │   ├── workflows.hooks.ts
│   │   ├── editor.service.ts         # version / validate / pinned-data
│   │   ├── editor.hooks.ts
│   │   ├── shares.service.ts
│   │   ├── shares.hooks.ts
│   │   └── index.ts
│   │
│   ├── executions/
│   ├── credentials/
│   ├── variables/
│   ├── templates/
│   ├── dashboard/
│   ├── folders/
│   ├── tags/
│   ├── notes/
│   ├── agents/
│   ├── webhooks/
│   ├── node-types/
│   ├── workspace-members/
│   └── index.ts                      # re-exports every module barrel
│
└── index.ts                          # export * from './client'; './core'; './modules';
```

### Why this is better

- **Co-location.** Touch one folder to add, rename, or delete a resource.
- **No central barrel to maintain.** Root `src/api/index.ts` becomes four lines:

  ```ts
  export * from './client';
  export * from './core';
  export * from './modules';
  ```

  Each module's `index.ts` is also one-liner glue. Drift is structurally impossible.

- **Domain clarity.** The workflow domain lives in `modules/workflows/`. Editor, share, and base CRUD are three files next to each other, obviously related.

- **Testability.** Each module folder can be unit-tested in isolation. Interceptors split into files are now unit-testable (currently they are closures inside one file).

- **Incremental migration.** Modules can be moved one at a time. During migration the old `src/api/hooks` can co-exist with `src/api/modules`.

---

## 3. File Templates

The point is that **every module looks the same**. Once you have seen one, you have seen all of them.

### 3.1 `modules/workflows/workflows.endpoints.ts`

```ts
export const WorkflowEndpoints = {
  list:      (ws: string)           => `/workspaces/${ws}/workflows`,
  create:    (ws: string)           => `/workspaces/${ws}/workflows`,
  detail:    (ws: string, id: string) => `/workspaces/${ws}/workflows/${id}`,
  update:    (ws: string, id: string) => `/workspaces/${ws}/workflows/${id}`,
  delete:    (ws: string, id: string) => `/workspaces/${ws}/workflows/${id}`,
  execute:   (ws: string, id: string) => `/workspaces/${ws}/workflows/${id}/execute`,
  activate:  (ws: string, id: string) => `/workspaces/${ws}/workflows/${id}/activate`,
  // ...
} as const;
```

Note: endpoint methods are lowercase verbs now. Screaming-snake-case was a leftover from when they were plain string constants.

### 3.2 `modules/workflows/workflows.keys.ts`

```ts
import type { TListParams } from '@/api/core';

export const workflowKeys = {
  all:    (ws: string)                => ['workflows', ws] as const,
  lists:  (ws: string)                => ['workflows', ws, 'list'] as const,
  list:   (ws: string, p?: TListParams) => ['workflows', ws, 'list', p] as const,
  detail: (ws: string, id: string)    => ['workflows', ws, 'detail', id] as const,
  executions: (ws: string, id: string, p?: TListParams) =>
    ['workflows', ws, 'executions', id, p] as const,
};
```

Co-locating keys next to the hooks means you refactor keys + hooks + service in the same PR, without scrolling through a 172-line factory.

### 3.3 `modules/workflows/workflows.service.ts`

```ts
import { axiosClient } from '@/api/client';
import { unwrap } from '@/api/core';
import type { TPaginatedResponse, TListParams } from '@/api/core';
import type { TWorkflow, TCreateWorkflowDto, TUpdateWorkflowDto } from '@/types/workflow.type';
import { WorkflowEndpoints as E } from './workflows.endpoints';

export const WorkflowService = {
  list: (ws: string, params?: TListParams, signal?: AbortSignal) =>
    axiosClient
      .get<TPaginatedResponse<TWorkflow>>(E.list(ws), { params, signal })
      .then((r) => r.data),

  detail: (ws: string, id: string, signal?: AbortSignal) =>
    axiosClient.get(E.detail(ws, id), { signal }).then(unwrap<TWorkflow>),

  create: (ws: string, body: TCreateWorkflowDto) =>
    axiosClient.post(E.create(ws), body).then(unwrap<TWorkflow>),

  update: (ws: string, id: string, body: TUpdateWorkflowDto) =>
    axiosClient.put(E.update(ws, id), body).then(unwrap<TWorkflow>),

  remove: (ws: string, id: string) =>
    axiosClient.delete(E.delete(ws, id)).then(() => undefined),

  execute:    (ws: string, id: string) => axiosClient.post(E.execute(ws, id)).then(() => undefined),
  activate:   (ws: string, id: string) => axiosClient.post(E.activate(ws, id)).then(() => undefined),
  deactivate: (ws: string, id: string) => axiosClient.post(E.deactivate(ws, id)).then(() => undefined),
};
```

Where `unwrap` in `core/envelope.ts` is:

```ts
import type { AxiosResponse } from 'axios';
import type { TApiResponse } from './types';
export const unwrap = <T>(res: AxiosResponse<TApiResponse<T>>): T => res.data.data;
```

Result: services become a list of one-liners. The envelope unwrap appears exactly once in the codebase.

### 3.4 `modules/workflows/workflows.hooks.ts`

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/api/core';
import type { TListParams } from '@/api/core';
import type { TCreateWorkflowDto, TUpdateWorkflowDto } from '@/types/workflow.type';
import { WorkflowService } from './workflows.service';
import { workflowKeys } from './workflows.keys';

export const useWorkflows = (ws: string, params?: TListParams) =>
  useQuery({
    queryKey: workflowKeys.list(ws, params),
    queryFn : ({ signal }) => WorkflowService.list(ws, params, signal),
    enabled : !!ws,
  });

export const useWorkflow = (ws: string, id: string) =>
  useQuery({
    queryKey: workflowKeys.detail(ws, id),
    queryFn : ({ signal }) => WorkflowService.detail(ws, id, signal),
    enabled : !!ws && !!id,
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

Two wins:

- `signal` is forwarded, so React Query can actually cancel the request when the component unmounts or the query key changes.
- Hooks never import `react-toastify` directly. They go through `core/notify.ts`, which means you can swap the toast library, silence toasts in tests, or add an `{ silent: true }` option on a per-call basis without editing 100 hooks.

### 3.5 `modules/workflows/index.ts`

```ts
export * from './workflows.endpoints';
export * from './workflows.keys';
export * from './workflows.service';
export * from './workflows.hooks';

export * from './editor.service';
export * from './editor.hooks';
export * from './shares.service';
export * from './shares.hooks';
```

Adding a new hook to the workflow module requires editing **zero** barrels: `export *` picks it up.

### 3.6 `modules/index.ts`

```ts
export * from './auth';
export * from './workspaces';
export * from './workflows';
export * from './executions';
export * from './credentials';
// ... one line per module
```

### 3.7 Root `src/api/index.ts`

```ts
export * from './client';
export * from './core';
export * from './modules';
```

That is the whole public surface definition.

---

## 4. Refactored Client Layer

Split `axios.config.ts` into four small files. Today it is one 176-line file doing four separate jobs.

### 4.1 `client/axios.ts` — instance only

```ts
import axios from 'axios';
import { attachAuth } from './interceptors/attach-auth';
import { refreshOn401 } from './interceptors/refresh-token';
import { normalizeError } from './interceptors/normalize-error';

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://agent1o1.test/api/v1',
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

attachAuth(axiosClient);
refreshOn401(axiosClient);
normalizeError(axiosClient);
```

### 4.2 `client/interceptors/refresh-token.ts`

The refresh queue logic lives in its own file. Now it can be unit-tested with a mocked axios instance. The public endpoints list is a single array constant — easy to extend when the backend adds new public routes.

### 4.3 `client/interceptors/normalize-error.ts`

Responsible for one thing: rejecting with a typed `ApiError`. Toasts for 403/404/422/429/5xx live here too, but go through `core/notify` (so they can be silenced in tests).

---

## 5. Eliminate CRUD Boilerplate With A Factory

~80% of every `use<X>.ts` file is the same five hooks. A `createResource` helper in `core/create-resource.ts` collapses them.

Sketch:

```ts
// core/create-resource.ts
export function createResource<T, CreateDto, UpdateDto>(cfg: {
  service: {
    list  : (ws: string, p?: TListParams, s?: AbortSignal) => Promise<TPaginatedResponse<T>>;
    detail: (ws: string, id: string, s?: AbortSignal)      => Promise<T>;
    create: (ws: string, body: CreateDto)                  => Promise<T>;
    update: (ws: string, id: string, body: UpdateDto)      => Promise<T>;
    remove: (ws: string, id: string)                       => Promise<void>;
  };
  keys: {
    all:    (ws: string)                     => readonly unknown[];
    list:   (ws: string, p?: TListParams)    => readonly unknown[];
    detail: (ws: string, id: string)         => readonly unknown[];
  };
  label: { singular: string; plural: string };
}) {
  return {
    useList   : (ws: string, p?: TListParams) => useQuery({ ... }),
    useDetail : (ws: string, id: string)      => useQuery({ ... }),
    useCreate : (ws: string)                  => useMutation({ ... }),
    useUpdate : (ws: string)                  => useMutation({ ... }),
    useDelete : (ws: string)                  => useMutation({ ... }),
  };
}
```

A module then looks like:

```ts
// modules/tags/tags.hooks.ts
import { createResource } from '@/api/core';
import { TagService }    from './tags.service';
import { tagKeys }       from './tags.keys';

export const Tags = createResource({
  service: TagService,
  keys   : tagKeys,
  label  : { singular: 'Tag', plural: 'Tags' },
});

// Usage:
// const { data } = Tags.useList(ws);
// const create  = Tags.useCreate(ws);
```

For the 70% of resources that are pure CRUD, the hooks file shrinks from ~120 lines to ~10 lines. Domain-specific actions (e.g. `execute`, `activate`, `share`) stay as hand-written hooks in the same file, alongside the factory output.

This is an **optional layer** — you can adopt modules first and introduce the factory afterwards.

---

## 6. Typed Errors

Replace the plain-object `ApiError` with a class so consumers can use `instanceof` and narrow:

```ts
// core/errors.ts
export class ApiError extends Error {
  constructor(
    public readonly status: number | undefined,
    message: string,
    public readonly fields?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
  field(name: string): string | undefined {
    return this.fields?.[name]?.[0];
  }
  static is(e: unknown): e is ApiError {
    return e instanceof ApiError;
  }
}
```

The `normalizeError` interceptor rejects with `new ApiError(status, message, errors)`. Consumers:

```ts
try { await login(...) }
catch (e) {
  if (ApiError.is(e) && e.status === 422) setFormErrors({ email: e.field('email') });
}
```

---

## 7. Notify Abstraction

A 10-line file that hooks depend on instead of `react-toastify`:

```ts
// core/notify.ts
import { toast } from 'react-toastify';
import { ApiError } from './errors';

export const notify = {
  success: (msg: string)  => toast.success(msg),
  error  : (msg: string)  => toast.error(msg),
  fromError: (fallback: string) => (e: unknown) =>
    toast.error(ApiError.is(e) ? e.message : fallback),
  silent : false, // toggle in tests
};
```

Benefits: swap toast lib once, silence globally in Jest/Vitest, add log shipping in one place.

---

## 8. Migration Plan — Incremental, Safe

You do not rewrite everything at once. Run old and new in parallel until each module is moved.

**Step 1 — Scaffolding (half a day).**
Create `src/api/client/`, `src/api/core/`, `src/api/modules/`. Move `axios.config.ts` → `client/axios.ts` + 3 interceptor files. Move `utils/token.manager.ts` → `core/token-manager.ts`, `utils/error.parser.ts` → `core/errors.ts`, `utils/query.helper.ts` → leave in place for now. Add `core/envelope.ts`, `core/notify.ts`. Re-export everything from the new locations through shims in the old paths so nothing breaks.

**Step 2 — Move modules one at a time (1–2 hours each).**
Start with the simplest (`notes`, `tags`, `folders`). For each:

1. Create `modules/<x>/`.
2. Copy endpoint constants from `http/endpoints.ts` into `<x>.endpoints.ts`.
3. Move the service file into `<x>.service.ts`, switch to `unwrap()` helper.
4. Move the relevant block from `query.helper.ts` into `<x>.keys.ts`.
5. Move the hook file into `<x>.hooks.ts`, switch `toast` imports to `notify`, and add `signal` to query fns.
6. Make `<x>/index.ts` re-export everything with `export *`.
7. Delete the old files. Grep for old import paths, fix.

**Step 3 — Consolidate workflows.**
Merge `workflows.service.ts` + `workflow-editor.service.ts` and the three workflow hook files into `modules/workflows/` as described in §2. Decide which CRUD wins (I recommend the one currently at `WorkflowEditorService` because it supports filters and null-safe inputs) and delete the other.

**Step 4 — Collapse barrels.**
Once all modules are moved, replace `src/api/index.ts` with the three-line `export *` version. Delete `src/api/hooks/index.ts`, `src/api/services/index.ts`, `src/api/http/endpoints.ts`, `src/api/utils/query.helper.ts`.

**Step 5 — Optional: introduce `createResource`.**
Go back through pure-CRUD modules and shrink them. Non-trivial modules (workflows, credentials, agents) stay hand-written.

At every step the app compiles and runs. No freeze window needed.

---

## 9. Conventions Cheat Sheet

- **One module per backend resource.** If you are writing the word "extras" or "misc" in a filename, split the module.
- **`export *` everywhere.** No named re-export lists, ever. The barrel is the filesystem.
- **Services return unwrapped domain types.** Lists keep pagination meta (return `data` raw), single resources return `data.data` via `unwrap`.
- **Hooks forward `signal`.** Always `({ signal }) => Service.xxx(..., signal)`.
- **Hooks never import `toast` directly.** Always `notify.*`.
- **Errors are `ApiError`.** Check with `ApiError.is(e)`, read fields via `e.field('...')`.
- **Query keys live next to hooks.** Never in a shared factory.
- **Endpoint builders are arrow functions returning strings.** Never hand-concatenate URLs in services.

---

## 10. Decision Points For You

Before I start the refactor, pick one answer for each:

1. **`createResource` factory — yes or no?** Saves ~1200 lines but adds one indirection. My recommendation: yes, but introduce it only after the module move.
2. **Fold `workflow-shares` and `workflow-editor` into `modules/workflows/` or keep as sibling modules?** My recommendation: fold. They are strictly dependent on a workflow id.
3. **Where should DTO types live?** Today they are in `src/types/`. Option A: leave them there. Option B: move domain types into each module (`modules/workflows/workflows.types.ts`). My recommendation: leave in `src/types/` — components import types too, and co-locating them in `api/modules` would force non-API code to depend on the API layer.
4. **Keep `TokenManager` default export for back-compat, or drop it?** It is used in a handful of places (`src/api/index.ts` re-exports it). My recommendation: drop, replace call sites with named imports.

Once you choose, I can execute the migration module by module.
