import pages from '@/Routes/pages';
import { Navigate } from 'react-router';
import { lazy } from 'react';

const DashboardLayout = lazy(() => import('@/pages/app/Dashboard/_layouts/Dashboard.layout'));
const DashboardListPage = lazy(() => import('@/pages/app/Dashboard/DashboardList.page'));

const WorkflowsLayout = lazy(() => import('@/pages/app/Workflows/_layouts/Workflows.layout'));
const WorkflowsListPage = lazy(() => import('@/pages/app/Workflows/WorkflowsList.page'));

const AgentsLayout = lazy(() => import('@/pages/app/Agents/_layouts/Agents.layout'));
const AgentsListPage = lazy(() => import('@/pages/app/Agents/AgentsList.page'));
const AgentBuilderPage = lazy(() => import('@/pages/app/Agents/AgentBuilder.page'));

const SkillsLayout = lazy(() => import('@/pages/app/Skills/_layouts/Skills.layout'));
const SkillsListPage = lazy(() => import('@/pages/app/Skills/SkillsList.page'));

const WebhooksLayout = lazy(() => import('@/pages/app/Webhooks/_layouts/Webhooks.layout'));
const WebhooksListPage = lazy(() => import('@/pages/app/Webhooks/WebhooksList.page'));

const CredentialsLayout = lazy(() => import('@/pages/app/Credentials/_layouts/Credentials.layout'));
const CredentialsListPage = lazy(() => import('@/pages/app/Credentials/CredentialsList.page'));
const OAuthCallbackPage = lazy(() => import('@/pages/app/OAuthCallback.page'));

const ExecutionsLayout = lazy(() => import('@/pages/app/Executions/_layouts/Executions.layout'));
const ExecutionsListPage = lazy(() => import('@/pages/app/Executions/ExecutionsList.page'));

const VariablesLayout = lazy(() => import('@/pages/app/Variables/_layouts/Variables.layout'));
const VariablesListPage = lazy(() => import('@/pages/app/Variables/VariablesList.page'));

const TemplatesLayout = lazy(() => import('@/pages/app/Templates/_layouts/Templates.layout'));
const TemplatesListPage = lazy(() => import('@/pages/app/Templates/TemplatesList.page'));

const SettingsLayout = lazy(() => import('@/pages/app/Settings/_layouts/Settings.layout'));
const SettingsGeneralPage = lazy(() => import('@/pages/app/Settings/General/SettingsGeneral.page'));
const SettingsProfilePage = lazy(() => import('@/pages/app/Settings/Profile/SettingsProfile.page'));
const SettingsWorkspacesPage = lazy(
	() => import('@/pages/app/Settings/Workspaces/SettingsWorkspaces.page'),
);
const SettingsTeamsPage = lazy(() => import('@/pages/app/Settings/Teams/SettingsTeams.page'));

const AppRoutes = [
	{
		path: pages.app.appMain.to,
		element: <DashboardLayout />,
		children: [
			{
				index: true,
				element: <DashboardListPage />,
			},
		],
	},
	{
		path: pages.app.appMain.subPages.workflows.to,
		element: <WorkflowsLayout />,
		children: [
			{
				index: true,
				element: <WorkflowsListPage />,
			},
		],
	},
	{
		path: pages.app.appMain.subPages.agents.to,
		element: <AgentsLayout />,
		children: [
			{
				index: true,
				element: <AgentsListPage />,
			},
			{
				path: pages.app.appMain.subPages.agents.subPages.new.to,
				element: <AgentBuilderPage />,
			},
			{
				path: pages.app.appMain.subPages.agents.subPages.edit.to,
				element: <AgentBuilderPage />,
			},
		],
	},
	{
		path: pages.app.appMain.subPages.skills.to,
		element: <SkillsLayout />,
		children: [
			{
				index: true,
				element: <SkillsListPage />,
			},
		],
	},
	{
		path: pages.app.appMain.subPages.webhooks.to,
		element: <WebhooksLayout />,
		children: [
			{
				index: true,
				element: <WebhooksListPage />,
			},
		],
	},
	{
		path: pages.app.appMain.subPages.credentials.to,
		element: <CredentialsLayout />,
		children: [
			{
				index: true,
				element: <CredentialsListPage />,
			},
		],
	},
	{
		path: pages.app.appMain.subPages.oauthCallback.to,
		element: <OAuthCallbackPage />,
	},
	{
		path: pages.app.appMain.subPages.executions.to,
		element: <ExecutionsLayout />,
		children: [
			{
				index: true,
				element: <ExecutionsListPage />,
			},
		],
	},
	{
		path: pages.app.appMain.subPages.variables.to,
		element: <VariablesLayout />,
		children: [
			{
				index: true,
				element: <VariablesListPage />,
			},
		],
	},
	{
		path: pages.app.appMain.subPages.templates.to,
		element: <TemplatesLayout />,
		children: [
			{
				index: true,
				element: <TemplatesListPage />,
			},
		],
	},
	{
		path: pages.app.appMain.subPages.settings.to,
		element: <SettingsLayout />,
		children: [
			{
				index: true,
				element: (
					<Navigate
						to={pages.app.appMain.subPages.settings.subPages.general.to}
						replace
					/>
				),
			},
			{
				path: pages.app.appMain.subPages.settings.subPages.general.to,
				element: <SettingsGeneralPage />,
			},
			{
				path: pages.app.appMain.subPages.settings.subPages.profile.to,
				element: <SettingsProfilePage />,
			},
			{
				path: pages.app.appMain.subPages.settings.subPages.workspaces.to,
				element: <SettingsWorkspacesPage />,
			},
			{
				path: pages.app.appMain.subPages.settings.subPages.teams.to,
				element: <SettingsTeamsPage />,
			},
		],
	},
];

export default AppRoutes;
