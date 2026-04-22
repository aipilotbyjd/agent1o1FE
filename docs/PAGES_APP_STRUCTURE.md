# `pages/app/` — Final Structure

Rules (kept from your existing convention):

- Folders with underscore prefix: `_partial/`, `_helper/`, `_layouts/`, `_hooks/`, `_types/`, `_context/`.
- File suffixes: `.page.tsx`, `.partial.tsx`, `.layout.tsx`, `.helper.ts`, `.constants.ts`, `.hook.ts`, `.type.ts`, `.context.tsx`.
- Feature folders: `PascalCase`.
- Suffix decides the folder. Always.

---

## Full tree

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
├── Executions/
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
├── Agents/
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
├── Settings/
│   │
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

---

## Slot matrix

Create a slot only when you have files for it. Delete empty slots.

| Slot         | Holds                          | Suffix              |
|--------------|--------------------------------|---------------------|
| `_partial/`  | Feature components             | `*.partial.tsx`     |
| `_helper/`   | Pure functions + constants     | `*.helper.ts`, `*.constants.ts` |
| `_layouts/`  | Layout wrappers for the feature| `*.layout.tsx`      |
| `_hooks/`    | UI-only hooks (non-API)        | `*.hook.ts`         |
| `_types/`    | Feature-local types            | `*.type.ts`         |
| `_context/`  | Feature-scoped context         | `*.context.tsx`     |

---

## Pattern choice per feature

| Feature     | Pages | Pattern                                     |
|-------------|:-----:|---------------------------------------------|
| Dashboard   | 1     | Flat                                        |
| Workflows   | 1     | Flat                                        |
| Executions  | 2     | Flat + `List.` / `Detail.` prefix           |
| Credentials | 1     | Flat                                        |
| Variables   | 1     | Flat                                        |
| Templates   | 1     | Flat                                        |
| Webhooks    | 1     | Flat                                        |
| Skills      | 1     | Flat                                        |
| Agents      | 2     | Subfolders per page + `_shared/`            |
| Settings    | 4+1   | Sub-features (already nested)               |
| OAuth       | 1     | Flat                                        |

---

## Changes vs. today

- `Agents/_partial/Builder.constants.ts` → `Agents/AgentBuilder/_helper/Builder.constants.ts`
- `Agents/_partial/Builder.helper.ts` → `Agents/AgentBuilder/_helper/Builder.helper.ts`
- `Agents/AgentsList.page.tsx` → `Agents/AgentsList/AgentsList.page.tsx`
- `Agents/AgentBuilder.page.tsx` → `Agents/AgentBuilder/AgentBuilder.page.tsx`
- `Agents/_partial/Builder*.partial.tsx` (5 files) → `Agents/AgentBuilder/_partial/`
- `Agents/_partial/EmptyState|States|StatsCards.partial.tsx` → `Agents/AgentsList/_partial/`
- `Executions/_partial/*.partial.tsx` → rename with `List.` prefix
- `pages/app/OAuthCallback.page.tsx` → `pages/app/OAuth/OAuthCallback.page.tsx`
- `pages/app/Tags/` → delete (empty)
- `Dashboard/DashboardList.page.tsx` → `Dashboard/Dashboard.page.tsx` (single-page features use the feature name, not `List`)

Route paths in `Routes/pages.ts` update to match.
