# Agent1o1 UX Direction

Date: 2026-04-09
Issue: AGEAA-4

## Executive Summary

The purchased template is still organized like a generic admin demo. The current `/app` automation product area is only partially wired: route definitions exist, but the referenced product pages do not, so the build currently fails before the automation UX can be evaluated.

The right move is not to keep polishing the demo navigation. First, align the shell around workflow automation jobs-to-be-done. Then reuse the template's strongest interaction patterns for list management, detail editing, and empty states while reserving bespoke work for the workflow builder itself.

## Product Goal

Users should be able to:

1. connect tools quickly,
2. start from a template or blank workflow,
3. build and test a workflow with low ambiguity,
4. publish it confidently,
5. monitor executions and recover from failures,
6. manage shared credentials, variables, and team access without losing context.

## Current Frontend Audit

### What is already useful

- The table system is strong enough for workflow lists, execution history, credentials, variables, and templates.
- The project Kanban and off-canvas task detail patterns are strong references for side-panel editing, inspector behavior, and secondary workflow metadata.
- The dashboard card system can support overview metrics, recent runs, failure alerts, and quick-start entry points.
- The app already has a route vocabulary for `workflows`, `credentials`, `executions`, `variables`, `templates`, `settings`, and editor pages.

### What is currently misaligned

- The main aside still exposes sales, CRM, products, invoices, mail, examples, and documentation instead of the automation product IA.
- The `/app` route group points to missing files under `src/pages/app/**` and `src/pages/editor/**`, so the automation section is not implemented yet.
- The router mounts `AppRoutes`, but `editorRoutes` is not mounted, so the builder path is incomplete even at route level.
- `App.layout.tsx` still imports the generic aside and contains stray text that should be cleaned up while the shell is rebuilt.

## Recommended Information Architecture

### Primary nav

- Overview
- Workflows
- Executions
- Connections
- Variables
- Templates
- Settings

### Secondary / contextual nav

- Workflow editor
- Story builder or AI generation flow
- Workspace switcher
- Team and role controls inside Settings, not as top-level primary nav

### Navigation rules

- Keep primary nav focused on persistent user jobs.
- Remove template demo sections from the authenticated product shell.
- Keep docs/examples outside the product app entirely.
- Put editor routes in a focused builder shell, not inside the same mental bucket as admin lists.

## Core User Flows

### 1. First-run onboarding

- Choose workspace or create one.
- Connect first app/account.
- Pick `Start from template`, `Import`, or `Build from scratch`.
- Land directly in a guided builder state with one success criterion: create a runnable workflow.

### 2. Workflow management

- Workflows list should prioritize status, last run, owner, trigger type, and failure state.
- The dominant actions are `New workflow`, `Duplicate`, `Open`, `Test`, and `Activate/Deactivate`.
- Empty states should route users to templates or quick-start recipes, not blank admin tables.

### 3. Workflow builder

- Center canvas for nodes and edges.
- Left rail for trigger/actions/searchable node library.
- Right inspector for node config, credentials, variables, validation, and test output.
- Sticky top bar for workflow name, save state, test action, publish state, and last run feedback.
- Node-level errors and missing credentials must be visible before publish.

### 4. Execution monitoring

- Executions should behave like an operational inbox, not a generic analytics page.
- Default list view should prioritize status, started time, duration, workflow, trigger source, and rerun/debug actions.
- Failed runs need a fast path to the exact node or config that caused the issue.

### 5. Connections and variables

- Credentials and variables should use list/detail patterns with strong trust and safety cues.
- Make scope explicit: personal vs workspace.
- Surface usage references so users know which workflows depend on a connection or variable.

### 6. Templates

- Templates need category, outcome, app stack, setup difficulty, and trust cues.
- The key CTA is `Use template`, followed immediately by a lightweight adaptation flow.

## Keep / Adapt / Redesign

### Keep

- Data table infrastructure
- Card, badge, progress, dropdown, and filter components
- Off-canvas detail panels
- Header/subheader composition

### Adapt

- Project list -> Workflows and Executions lists
- Project dashboard cards -> Overview dashboard and recent activity
- Integrations quick actions -> Connections gallery and template categories
- Kanban card metadata patterns -> node side panel summaries and execution debug details

### Redesign

- Authenticated product navigation
- Terminology, icons, and empty states
- Workflow builder layout and interactions
- Template selection and onboarding
- Operational feedback loops around testing, publishing, failures, and reruns

## Delivery Sequence For CTO

1. Stabilize the `/app` shell by removing dead imports, mounting only real routes, and replacing the generic aside with product IA.
2. Build the workflows list, executions list, connections list, and templates list first using existing table/card patterns.
3. Introduce a dedicated builder shell with left library, center canvas, and right inspector.
4. Add first-run onboarding and template adaptation once the core CRUD and execution loop are working.

## Risks

- If the team keeps the generic dashboard/demo navigation, the product will feel like a reskinned template instead of an automation tool.
- If the builder ships before execution/debug feedback is clear, users will create workflows but fail to trust or maintain them.
- If credentials and variables are treated like plain settings tables, users will miss dependency and security context.

## Staffing Note

No additional design hire is necessary before shell alignment. Reassess after the builder shell exists; that is the point where deeper node-interaction polish or onboarding copy support may become worthwhile.
