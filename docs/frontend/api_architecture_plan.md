# 🏗️ Boltify — API Architecture Plan (v4 — Enhanced Structure)

> Follows your **existing conventions**: `.type.ts`, `.constant.ts`, `.config.ts`, `use*` prefix, same folders.

---

## 📦 Install

```bash
yarn add axios @tanstack/react-query
yarn add -D @tanstack/react-query-devtools
```

---

## 📁 Complete Structure — Enhanced Organization

```
src/
├── api/                              ← EXISTING folder
│   ├── client/                       ← NEW: HTTP client layer
│   │   ├── axios.client.ts           ← Axios instance with interceptors
│   │   └── api.client.ts             ← Base API client class (optional)
│   │
│   ├── services/                     ← NEW: API call functions (business logic)
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── workflow.service.ts
│   │   ├── execution.service.ts
│   │   ├── credential.service.ts
│   │   ├── node.service.ts
│   │   ├── workspace.service.ts
│   │   ├── product.service.ts
│   │   ├── order.service.ts
│   │   └── index.ts                  ← Export all services
│   │
│   ├── utils/                        ← NEW: API utilities
│   │   ├── error.handler.ts          ← Error handling utility
│   │   ├── token.manager.ts          ← Token management (get/set/remove)
│   │   └── request.helper.ts         ← Request helpers (query params, etc.)
│   │
│   └── index.ts                      ← Main API export
│
├── hooks/                            ← EXISTING folder
│   ├── useAsideStatus.ts               (existing ✓)
│   ├── useDarkMode.ts                  (existing ✓)
│   ├── useDeviceScreen.ts              (existing ✓)
│   ├── ...                             (other existing hooks ✓)
│   └── api/                          ← NEW: API-specific React Query hooks
│       ├── useAuth.ts
│       ├── useUser.ts
│       ├── useWorkflows.ts
│       ├── useExecutions.ts
│       ├── useCredentials.ts
│       ├── useNodes.ts
│       ├── useWorkspaces.ts
│       ├── useProducts.ts
│       ├── useOrders.ts
│       └── index.ts                  ← Export all API hooks
│
├── types/                            ← EXISTING folder
│   ├── colors.type.ts                  (existing ✓)
│   ├── darkMode.type.ts                (existing ✓)
│   ├── ...                             (other existing types ✓)
│   ├── api/                          ← NEW: API-specific types
│   │   ├── common.type.ts            ← Common API types (pagination, error, etc.)
│   │   ├── auth.type.ts
│   │   ├── user.type.ts
│   │   ├── workflow.type.ts
│   │   ├── execution.type.ts
│   │   ├── credential.type.ts
│   │   ├── node.type.ts
│   │   ├── workspace.type.ts
│   │   ├── product.type.ts
│   │   ├── order.type.ts
│   │   └── index.ts                  ← Export all API types
│   │
│   └── api.type.ts                   ← Re-export from types/api/ (backward compat)
│
├── constants/                        ← EXISTING folder
│   ├── darkMode.constant.ts            (existing ✓)
│   ├── ...                             (other existing constants ✓)
│   ├── api.endpoints.constant.ts     ← NEW: All API endpoint URLs (single file)
│   ├── queryKeys.constant.ts         ← NEW: React Query cache keys
│   └── api.constant.ts               ← NEW: API config constants (timeout, retry, etc.)
│
├── config/                           ← EXISTING folder
│   ├── theme.config.ts                 (existing ✓)
│   ├── query.config.ts               ← NEW: React Query global settings
│   └── api.config.ts                 ← NEW: API client configuration
│
├── Providers/                        ← EXISTING folder
│   ├── Providers.tsx                   (existing — will be updated)
│   └── QueryProvider.tsx             ← NEW: React Query provider
│
├── context/                          ← EXISTING folder
│   └── authContext.tsx                 (existing — will be updated)
│
└── .env                                (updated — add VITE_API_BASE_URL)
```

> [!NOTE]
> **Clean separation of concerns**: client → services → hooks → components

---

## 🧱 File Details

### 1️⃣ `config/query.config.ts`

React Query global settings — same pattern as your `theme.config.ts`.

```ts
import { QueryClient } from '@tanstack/react-query';

const queryConfig: ConstructorParameters<typeof QueryClient>[0] = {
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,     // Data stays fresh for 5 min
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
};

export default queryConfig;
```

---

### 2️⃣ `api/client/axios.client.ts`

Single Axios instance. Auth token auto-attached. Errors auto-handled.

```ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '@/constants/api.endpoints.constant';
import { getToken, removeToken } from '@/api/utils/token.manager';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Auto-attach token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// Response Interceptor: Global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || 'Something went wrong';

    // Handle different error scenarios
    if (status === 401) {
      removeToken();
      toast.error('Session expired. Please login again.');
      window.location.href = '/login';
    } else if (status === 403) {
      toast.error('Permission denied');
    } else if (status === 404) {
      toast.error('Resource not found');
    } else if (status === 422) {
      toast.error(message || 'Validation error');
    } else if (status && status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (!status) {
      toast.error('Network error. Check your connection.');
    }

    return Promise.reject({
      status,
      message,
      errors: error.response?.data?.errors,
    });
  },
);

export default apiClient;
```

---

### 2️⃣.1 `api/utils/token.manager.ts`

Token management utility.

```ts
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string, remember: boolean = false): void => {
  if (remember) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
  }
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setRefreshToken = (token: string, remember: boolean = false): void => {
  if (remember) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } else {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
  }
};
```

---

### 2️⃣.2 `api/utils/error.handler.ts`

Centralized error handling.

```ts
import { AxiosError } from 'axios';
import type { TApiError } from '@/types/api/common.type';

export const handleApiError = (error: unknown): TApiError => {
  if (error && typeof error === 'object' && 'status' in error) {
    return error as TApiError;
  }

  if (error instanceof AxiosError) {
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message,
      errors: error.response?.data?.errors,
    };
  }

  return {
    status: 500,
    message: 'An unexpected error occurred',
  };
};
```

---

### 2️⃣.3 `api/utils/request.helper.ts`

Request helper utilities.

```ts
import type { TListParams } from '@/types/api/common.type';

export const buildQueryParams = (params?: TListParams): string => {
  if (!params) return '';

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

export const buildFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (value instanceof File || value instanceof Blob) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        value.forEach((item) => formData.append(`${key}[]`, item));
      } else if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    }
  });

  return formData;
};
```

---

### 3️⃣ `constants/api.endpoints.constant.ts` — Complete Endpoints File

All API URLs in one organized file — same pattern as your `darkMode.constant.ts`.

```ts
/**
 * API Endpoints Constants
 * All backend API routes organized by domain
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

const API_ENDPOINTS = {
  // ────────────────────────────────────────────────────────────
  // Authentication & Authorization
  // ────────────────────────────────────────────────────────────
  AUTH: {
    LOGIN:           '/auth/login',
    REGISTER:        '/auth/register',
    LOGOUT:          '/auth/logout',
    REFRESH_TOKEN:   '/auth/refresh-token',
    ME:              '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD:  '/auth/reset-password',
    VERIFY_EMAIL:    '/auth/verify-email',
    RESEND_VERIFY:   '/auth/resend-verification',
  },

  // ────────────────────────────────────────────────────────────
  // User Management
  // ────────────────────────────────────────────────────────────
  USERS: {
    LIST:            '/users',
    PROFILE:         '/users/me',
    UPDATE_PROFILE:  '/users/me',
    CHANGE_PASSWORD: '/users/me/password',
    UPLOAD_AVATAR:   '/users/me/avatar',
    DELETE_AVATAR:   '/users/me/avatar',
    GET_BY_ID:       (id: string) => `/users/${id}`,
    UPDATE:          (id: string) => `/users/${id}`,
    DELETE:          (id: string) => `/users/${id}`,
    ACTIVATE:        (id: string) => `/users/${id}/activate`,
    DEACTIVATE:      (id: string) => `/users/${id}/deactivate`,
  },

  // ────────────────────────────────────────────────────────────
  // Workflows
  // ────────────────────────────────────────────────────────────
  WORKFLOWS: {
    LIST:       '/workflows',
    CREATE:     '/workflows',
    DETAIL:     (id: string) => `/workflows/${id}`,
    UPDATE:     (id: string) => `/workflows/${id}`,
    DELETE:     (id: string) => `/workflows/${id}`,
    EXECUTE:    (id: string) => `/workflows/${id}/execute`,
    ACTIVATE:   (id: string) => `/workflows/${id}/activate`,
    DEACTIVATE: (id: string) => `/workflows/${id}/deactivate`,
    DUPLICATE:  (id: string) => `/workflows/${id}/duplicate`,
    EXPORT:     (id: string) => `/workflows/${id}/export`,
    IMPORT:     '/workflows/import',
    TAGS:       '/workflows/tags',
  },

  // ────────────────────────────────────────────────────────────
  // Executions
  // ────────────────────────────────────────────────────────────
  EXECUTIONS: {
    LIST:   '/executions',
    DETAIL: (id: string) => `/executions/${id}`,
    RETRY:  (id: string) => `/executions/${id}/retry`,
    STOP:   (id: string) => `/executions/${id}/stop`,
    DELETE: (id: string) => `/executions/${id}`,
    LOGS:   (id: string) => `/executions/${id}/logs`,
  },

  // ────────────────────────────────────────────────────────────
  // Credentials
  // ────────────────────────────────────────────────────────────
  CREDENTIALS: {
    LIST:   '/credentials',
    CREATE: '/credentials',
    DETAIL: (id: string) => `/credentials/${id}`,
    UPDATE: (id: string) => `/credentials/${id}`,
    DELETE: (id: string) => `/credentials/${id}`,
    TEST:   (id: string) => `/credentials/${id}/test`,
    TYPES:  '/credentials/types',
  },

  // ────────────────────────────────────────────────────────────
  // Nodes
  // ────────────────────────────────────────────────────────────
  NODES: {
    LIST:       '/nodes',
    DETAIL:     (type: string) => `/nodes/${type}`,
    CATEGORIES: '/nodes/categories',
    SEARCH:     '/nodes/search',
  },

  // ────────────────────────────────────────────────────────────
  // Workspaces
  // ────────────────────────────────────────────────────────────
  WORKSPACES: {
    LIST:          '/workspaces',
    CREATE:        '/workspaces',
    DETAIL:        (id: string) => `/workspaces/${id}`,
    UPDATE:        (id: string) => `/workspaces/${id}`,
    DELETE:        (id: string) => `/workspaces/${id}`,
    MEMBERS:       (id: string) => `/workspaces/${id}/members`,
    ADD_MEMBER:    (id: string) => `/workspaces/${id}/members`,
    REMOVE_MEMBER: (id: string, userId: string) => `/workspaces/${id}/members/${userId}`,
    UPDATE_ROLE:   (id: string, userId: string) => `/workspaces/${id}/members/${userId}/role`,
    INVITE:        (id: string) => `/workspaces/${id}/invite`,
    LEAVE:         (id: string) => `/workspaces/${id}/leave`,
  },

  // ────────────────────────────────────────────────────────────
  // Products (E-commerce example)
  // ────────────────────────────────────────────────────────────
  PRODUCTS: {
    LIST:       '/products',
    CREATE:     '/products',
    DETAIL:     (id: string) => `/products/${id}`,
    UPDATE:     (id: string) => `/products/${id}`,
    DELETE:     (id: string) => `/products/${id}`,
    SEARCH:     '/products/search',
    CATEGORIES: '/products/categories',
    FEATURED:   '/products/featured',
    REVIEWS:    (id: string) => `/products/${id}/reviews`,
    ADD_REVIEW: (id: string) => `/products/${id}/reviews`,
  },

  // ────────────────────────────────────────────────────────────
  // Orders (E-commerce example)
  // ────────────────────────────────────────────────────────────
  ORDERS: {
    LIST:          '/orders',
    CREATE:        '/orders',
    DETAIL:        (id: string) => `/orders/${id}`,
    UPDATE:        (id: string) => `/orders/${id}`,
    CANCEL:        (id: string) => `/orders/${id}/cancel`,
    UPDATE_STATUS: (id: string) => `/orders/${id}/status`,
    TRACKING:      (id: string) => `/orders/${id}/tracking`,
    INVOICE:       (id: string) => `/orders/${id}/invoice`,
  },

  // ────────────────────────────────────────────────────────────
  // Notifications
  // ────────────────────────────────────────────────────────────
  NOTIFICATIONS: {
    LIST:          '/notifications',
    UNREAD:        '/notifications/unread',
    MARK_READ:     (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
    DELETE:        (id: string) => `/notifications/${id}`,
    SETTINGS:      '/notifications/settings',
  },

  // ────────────────────────────────────────────────────────────
  // File Upload
  // ────────────────────────────────────────────────────────────
  FILES: {
    UPLOAD:   '/files/upload',
    DOWNLOAD: (id: string) => `/files/${id}/download`,
    DELETE:   (id: string) => `/files/${id}`,
  },

  // ────────────────────────────────────────────────────────────
  // Analytics & Reports
  // ────────────────────────────────────────────────────────────
  ANALYTICS: {
    DASHBOARD:  '/analytics/dashboard',
    WORKFLOWS:  '/analytics/workflows',
    EXECUTIONS: '/analytics/executions',
    USERS:      '/analytics/users',
  },
} as const;

export default API_ENDPOINTS;
```

---

### 4️⃣ `constants/queryKeys.constant.ts`

React Query cache keys — deterministic, invalidation-friendly.

```ts
const QUERY_KEYS = {
  AUTH: {
    ME: ['auth', 'me'],
  },
  WORKFLOWS: {
    ALL:    ['workflows'],
    LIST:   (filters?: object) => ['workflows', 'list', filters],
    DETAIL: (id: string)       => ['workflows', 'detail', id],
  },
  EXECUTIONS: {
    ALL:    ['executions'],
    LIST:   (filters?: object) => ['executions', 'list', filters],
    DETAIL: (id: string)       => ['executions', 'detail', id],
  },
  CREDENTIALS: {
    ALL:    ['credentials'],
    LIST:   () => ['credentials', 'list'],
    DETAIL: (id: string) => ['credentials', 'detail', id],
  },
  NODES: {
    ALL:    ['nodes'],
    LIST:   () => ['nodes', 'list'],
    DETAIL: (type: string) => ['nodes', 'detail', type],
  },
  WORKSPACES: {
    ALL:     ['workspaces'],
    LIST:    () => ['workspaces', 'list'],
    DETAIL:  (id: string) => ['workspaces', 'detail', id],
    MEMBERS: (id: string) => ['workspaces', 'members', id],
  },
  USERS: {
    PROFILE: ['users', 'profile'],
  },
  PRODUCTS: {
    ALL:    ['products'],
    LIST:   (filters?: object) => ['products', 'list', filters],
    DETAIL: (id: string) => ['products', 'detail', id],
  },
  ORDERS: {
    ALL:    ['orders'],
    LIST:   (filters?: object) => ['orders', 'list', filters],
    DETAIL: (id: string) => ['orders', 'detail', id],
  },
} as const;

export default QUERY_KEYS;
```

---

### 5️⃣ `types/api/common.type.ts`

Common API response shapes — same `.type.ts` naming as your existing types.

```ts
/**
 * Common API Types
 * Shared types used across all API services
 */

// Pagination
export type TPaginatedResponse<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

export type TListParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
};

// API Response
export type TApiResponse<T = any> = {
  success: boolean;
  message?: string;
  data: T;
};

// API Error
export type TApiError = {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
};

// Common Status
export type TStatus = 'active' | 'inactive' | 'pending' | 'archived';

// Timestamps
export type TTimestamps = {
  createdAt: string;
  updatedAt: string;
};

// ID Types
export type TId = string | number;

// File Upload
export type TFileUpload = {
  file: File;
  progress?: number;
};

export type TUploadedFile = {
  id: string;
  url: string;
  name: string;
  size: number;
  mimeType: string;
  createdAt: string;
};
```

---

## 🔄 Data Flow

```
  Component
      │
      │  import { useWorkflows } from '@/hooks/api/useWorkflows'
      ▼
  hooks/api/useWorkflows.ts        ← React Query wrapper
      │
      │  uses workflowService + QUERY_KEYS
      ▼
  api/services/workflow.service.ts  ← Pure API calls
      │
      │  uses apiClient + API_ENDPOINTS
      ▼
  api/client/axios.client.ts        ← Axios (auto auth, auto errors)
      │
      ▼
  Your Backend
```

---

## 📋 Implementation Order

| # | What | Where | Depends On |
|---|------|-------|------------|
| 1 | Install packages | terminal | — |
| 2 | Add env variable | `.env` | — |
| 3 | Token manager | `api/utils/token.manager.ts` | — |
| 4 | Error handler | `api/utils/error.handler.ts` | — |
| 5 | Request helper | `api/utils/request.helper.ts` | — |
| 6 | API endpoints | `constants/api.endpoints.constant.ts` | — |
| 7 | Query keys | `constants/queryKeys.constant.ts` | — |
| 8 | Common types | `types/api/common.type.ts` | — |
| 9 | Axios client | `api/client/axios.client.ts` | 3, 6 |
| 10 | Query config | `config/query.config.ts` | — |
| 11 | Domain types | `types/api/*.type.ts` | 8 |
| 12 | Services | `api/services/*.service.ts` | 9, 11 |
| 13 | API hooks | `hooks/api/*.ts` | 7, 12 |
| 14 | QueryProvider | `Providers/QueryProvider.tsx` | 10 |
| 15 | Update Providers | `Providers/Providers.tsx` | 14 |

---

## 🧩 Adding a New Feature Checklist

When you need to add a new API (e.g. "Tags"):

```
1. types/api/tag.type.ts                ← Define TTag, TCreateTagPayload
2. constants/api.endpoints.constant.ts  ← Add TAGS: { LIST, DETAIL, ... }
3. constants/queryKeys.constant.ts      ← Add TAGS: { ALL, LIST, DETAIL }
4. api/services/tag.service.ts          ← tagService.getAll(), .create(), ...
5. hooks/api/useTags.ts                 ← useTags(), useCreateTag(), ...
6. Use in component                     ← import { useTags } from '@/hooks/api'
```

---

## 💡 Usage Example

```tsx
// In your component
import { useWorkflows, useCreateWorkflow } from '@/hooks/api';

function WorkflowsPage() {
  const { data, isLoading } = useWorkflows({ page: 1, limit: 10 });
  const createMutation = useCreateWorkflow();

  const handleCreate = () => {
    createMutation.mutate({ name: 'New Workflow' });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {data?.data.map(workflow => (
        <div key={workflow.id}>{workflow.name}</div>
      ))}
      <button onClick={handleCreate}>Create</button>
    </div>
  );
}
```

---

## ❓ Next Steps

1. **Your backend API base URL?** (e.g. `http://localhost:3000/api/v1`)
2. **JWT auth with Bearer token?** (yes/no)
3. **Which modules to build first?** (auth, workflows, products, etc.)
