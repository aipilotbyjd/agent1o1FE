# API Layer Structure

This document describes the architecture of the frontend API layer located in `src/api/`. It covers how HTTP requests, services, React Query hooks, and utilities fit together to talk to the Laravel 12 backend at `https://agent1o1.test/api/v1`.

## 1. High-Level Overview

The API layer is split into **four concentric rings**, each ring depends only on the ones below it:

```
┌─────────────────────────────────────────────────┐
│ Components / Pages                              │
│                ↓ calls                          │
│ Hooks  (React Query wrappers)  ── src/api/hooks │
│                ↓ calls                          │
│ Services  (pure async functions)  src/api/services
│                ↓ uses                           │
│ HTTP  (axios client + endpoints)  src/api/http  │
│                ↓ uses                           │
│ Utils  (tokens, query keys, errors) src/api/utils
└─────────────────────────────────────────────────┘
```

Everything is re-exported from `src/api/index.ts` so consumers can do:

```ts
import { useFetchWorkflows, WorkflowService, axiosClient } from '@/api';
```

## 2. Directory Layout

```
src/api/
├── index.ts              # Public barrel — components import from here
│
├── http/                 # Transport layer
│   ├── axios.config.ts   # Configured axios instance + interceptors
│   ├── endpoints.ts      # All backend route constants
│   └── index.ts          # Barrel
│
├── services/             # One file per backend resource
│   ├── auth.service.ts
│   ├── workflows.service.ts
│   ├── workspace.service.ts
│   ├── execution.service.ts
│   ├── credential.service.ts
│   ├── variable.service.ts
│   ├── template.service.ts
│   ├── dashboard.service.ts
│   ├── agent.service.ts
│   ├── webhook.service.ts
│   ├── ... (one per domain)
│   └── index.ts
│
├── hooks/                # React Query hooks (one file per resource)
│   ├── useAuth.ts
│   ├── useWorkflows.ts
│   ├── useWorkspaces.ts
│   ├── useExecutions.ts
│   ├── useCredentials.ts
│   ├── ...
│   └── index.ts
│
└── utils/
    ├── token.manager.ts  # access / refresh token storage
    ├── query.helper.ts   # React Query key factory + query string helper
    ├── error.parser.ts   # Normalizes error shape
    └── index.ts
```

## 3. The Layers In Detail

### 3.1 HTTP Layer — `src/api/http/`

**`axios.config.ts`** exports a single pre-configured `axiosClient`:

- `baseURL` = `import.meta.env.VITE_API_URL` with fallback `https://agent1o1.test/api/v1`
- Default `Content-Type: application/json`, `Accept: application/json`, 30s timeout
- **Request interceptor** automatically attaches `Authorization: Bearer <access_token>` to every request, except public endpoints (`/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/refresh`).
- **Response interceptor** handles:
  - **401 refresh flow** — catches 401, calls `POST /auth/refresh` with `{ refresh_token }` in body + the expired access token as `Bearer`, stores the new pair via `setToken()`, and retries the original request. Concurrent 401s are queued behind a single refresh via `isRefreshing` / `failedQueue`.
  - **Global toasts** for 403 / 404 / 422 / 429 / 5xx / network errors using `react-toastify`.
  - Rejects with a normalized `{ status, message, errors }` object (matches `ApiError`).

**`endpoints.ts`** is the single source of truth for backend paths. Each resource has its own `const` object with either string literals or path builders:

```ts
export const WorkflowEndpoints = {
  LIST:   (ws: string)          => `/workspaces/${ws}/workflows`,
  DETAIL: (ws: string, id: string) => `/workspaces/${ws}/workflows/${id}`,
  EXECUTE:(ws: string, id: string) => `/workspaces/${ws}/workflows/${id}/execute`,
  // ...
} as const;
```

Most resources are **workspace-scoped** (`/workspaces/{workspaceId}/...`). Only a few are global (`TemplateEndpoints`, `NodeTypeEndpoints`, `AuthEndpoints`, `UserEndpoints`).

### 3.2 Services Layer — `src/api/services/`

Each service is a plain object of `async` functions. They do three things:

1. Call the `axiosClient` with an endpoint from `endpoints.ts`.
2. Pass the raw backend response shape through generics (`TApiResponse<T>` or `TPaginatedResponse<T>`).
3. **Unwrap** the Laravel envelope so callers get the useful payload directly (e.g. return `data.data` for single resources, return `data` untouched for paginated lists).

Example — `src/api/services/workflows.service.ts`:

```ts
export const WorkflowService = {
  fetchAll: async (workspaceId, params) => {
    const { data } = await axiosClient.get<TPaginatedResponse<TWorkflow>>(
      WorkflowEndpoints.LIST(workspaceId),
      { params },
    );
    return data; // keep pagination meta
  },

  fetchById: async (workspaceId, id) => {
    const { data } = await axiosClient.get<TApiResponse<TWorkflow>>(
      WorkflowEndpoints.DETAIL(workspaceId, id),
    );
    return data.data; // unwrap envelope
  },

  create / update / delete / execute / activate / deactivate / duplicate / import / export ...
};
```

Services are **stateless** and **framework-agnostic** — they know nothing about React Query, toasts, or components. They can be used from anywhere (tests, other services, workers).

### 3.3 Hooks Layer — `src/api/hooks/`

Thin React Query wrappers over the services. The pattern is consistent for every resource:

- **Queries** (`useQuery`) for reads, keyed by `queryKeys.*`, gated with `enabled: !!workspaceId`.
- **Mutations** (`useMutation`) for writes, with `onSuccess` invalidating the relevant query keys and firing a `toast.success(...)`, and `onError` firing a `toast.error(...)`.

Example — `src/api/hooks/useWorkflows.ts`:

```ts
export const useFetchWorkflows = (workspaceId, params) =>
  useQuery({
    queryKey: queryKeys.workflows.list(workspaceId, params),
    queryFn : () => WorkflowService.fetchAll(workspaceId, params),
    enabled : !!workspaceId,
    staleTime: 5 * 60 * 1000,
  });

export const useCreateWorkflow = (workspaceId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => WorkflowService.create(workspaceId, data),
    onSuccess : (w) => {
      qc.invalidateQueries({ queryKey: queryKeys.workflows.all(workspaceId) });
      toast.success(`Workflow "${w.name}" created!`);
    },
    onError: () => toast.error('Failed to create workflow'),
  });
};
```

Components only ever touch hooks — never axios or services directly.

### 3.4 Utils Layer — `src/api/utils/`

**`token.manager.ts`** — storage abstraction for auth tokens.

- Keys: `a1o1_access_token`, `a1o1_refresh_token`, `a1o1_token_expiry`, `a1o1_remember_me`.
- Storage is `localStorage` when "remember me" is on, else `sessionStorage`.
- Exposes `getAccessToken`, `getRefreshToken`, `getTokenExpiry`, `setToken`, `clearTokens`, `isTokenExpired`, `hasValidToken`, `isRememberMe`.
- `setToken()` computes expiry (`now + expires_in`) and dispatches a `a1o1_token_change` window event for same-tab reactivity (`TOKEN_CHANGE_EVENT`).

**`query.helper.ts`** — centralized **query key factory** so every hook uses consistent, cache-friendly keys. Organized per resource:

```ts
queryKeys.workflows.list(workspaceId, params)     // ['workflows','list', ws, params]
queryKeys.workflows.detail(workspaceId, id)       // ['workflows', ws,'detail', id]
queryKeys.executions.logs(id)                     // ['executions','logs', id]
queryKeys.auth.user()                             // ['auth','user']
```

Also exports `buildQueryParams(params)` for ad-hoc query string building.

**`error.parser.ts`** — normalizes whatever axios rejects with into a typed shape:

```ts
interface ApiError {
  message: string;
  status? : number;
  errors? : Record<string, string[]>;  // Laravel 422 field errors
}

parseApiError(err)                 // ApiError
getFieldError(err, 'email')        // first message for field, or undefined
getFieldErrors(err)                // { email: '...', password: '...' }  (for Formik setErrors)
```

## 4. Backend Response Contract

Every Laravel response is wrapped in a consistent envelope. Services account for this so hooks/components see clean domain types.

**Success (single):**
```json
{ "success": true, "statusCode": 200, "message": "...", "data": { /* T */ } }
```

**Success (paginated list):** same envelope but `data` contains items + pagination meta (kept intact by services that return `TPaginatedResponse<T>`).

**Auth token payload:**
```json
{ "token_type": "Bearer", "expires_in": 3600,
  "access_token": "...", "refresh_token": "..." }
```

**Error:**
```json
{ "success": false, "statusCode": 422, "message": "...",
  "errors": { "email": ["The email has already been taken."] } }
```

After the response interceptor, callers always receive either the unwrapped `data` on success, or a rejected `{ status, message, errors }` on failure.

## 5. Request Lifecycle (End-to-End)

Example: a component creates a workflow.

1. Component calls `const { mutate } = useCreateWorkflow(workspaceId);` then `mutate(payload)`.
2. Hook's `mutationFn` calls `WorkflowService.create(workspaceId, payload)`.
3. Service calls `axiosClient.post(WorkflowEndpoints.CREATE(workspaceId), payload)`.
4. **Request interceptor** attaches `Bearer <access_token>` (from `token.manager`).
5. Backend returns `{ success, statusCode, message, data: TWorkflow }`.
6. Service returns `data.data` (unwrapped `TWorkflow`).
7. Hook `onSuccess` invalidates `queryKeys.workflows.all(workspaceId)` and shows a toast.
8. Any `useFetchWorkflows(...)` in the tree refetches automatically.

If step 4's token is expired, the response interceptor catches the 401, refreshes via `/auth/refresh`, stores new tokens with `setToken()`, and replays the original request — all transparent to the component.

## 6. Adding a New Resource

1. Add path builders to `src/api/http/endpoints.ts` and re-export from `src/api/http/index.ts`.
2. Create `src/api/services/<resource>.service.ts` using `axiosClient` + the endpoints, unwrap `data.data` for single, return `data` for lists.
3. Add a `queryKeys.<resource>` block to `src/api/utils/query.helper.ts`.
4. Create `src/api/hooks/use<Resource>.ts` with `useQuery`/`useMutation` wrappers.
5. Re-export the new service and hooks from `src/api/services/index.ts`, `src/api/hooks/index.ts`, and finally from `src/api/index.ts`.

## 7. Current Resources

Auth · User · Workspace · Workspace Members / Invitations / Settings · Workflow · Workflow Share · Workflow Editor (versions, validation, pinned data) · Folder · Tag · Execution · Credential · Variable · Template · OAuth · Dashboard · Node Type · Note · Agent · Agent Skill · Webhook.

Each one follows the exact same HTTP → Service → Hook → queryKey pattern described above.
