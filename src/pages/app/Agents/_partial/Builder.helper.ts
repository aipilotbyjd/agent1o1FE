import type { TColors } from '@/types/colors.type';
import type { TAgentSkill } from '@/types/agent.type';

export type TBuilderSection = 'basics' | 'instructions' | 'tools' | 'skills' | 'triggers' | 'test';

export type TToolOption = {
	id: string;
	name: string;
	description: string;
	icon: string;
	color: TColors;
	group: 'built-in' | 'integration' | 'workflow';
};

/**
 * Returns the default system prompt for new agents
 */
export const getDefaultSystemPrompt = (): string => `You are a focused operations agent.

Use the available tools only when they are relevant.
Ask for confirmation before sending messages, editing records, deleting data, or making irreversible changes.
When you are uncertain, ask one clear question before proceeding.
Keep responses concise and include the next best action.`;

/**
 * Returns the list of supported AI models
 */
export const getAIModels = () => [
	{ value: 'gpt-4o', label: 'GPT-4o' },
	{ value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
	{ value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
	{ value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet' },
	{ value: 'claude-3-opus', label: 'Claude 3 Opus' },
	{ value: 'claude-3-haiku', label: 'Claude 3 Haiku' },
	{ value: 'gemini-pro', label: 'Gemini Pro' },
	{ value: 'gemini-flash', label: 'Gemini Flash' },
];

/**
 * Returns the list of available tool options
 */
export const getToolOptions = (): TToolOption[] => [
	{
		id: 'code_sandbox',
		name: 'Code Sandbox',
		description: 'Run code for analysis, files, and calculations.',
		icon: 'Code',
		color: 'amber',
		group: 'built-in',
	},
	{
		id: 'search_past_conversations',
		name: 'Search Past Conversations',
		description: 'Use previous chats as working context.',
		icon: 'Search01',
		color: 'blue',
		group: 'built-in',
	},
	{
		id: 'skill_editing',
		name: 'Skill Editing',
		description: 'Create and refine skills during conversations.',
		icon: 'Tools',
		color: 'violet',
		group: 'built-in',
	},
	{
		id: 'gmail',
		name: 'Gmail',
		description: 'Read, search, and draft email actions.',
		icon: 'Mail01',
		color: 'red',
		group: 'integration',
	},
	{
		id: 'salesforce',
		name: 'Salesforce',
		description: 'Look up accounts, leads, and CRM records.',
		icon: 'Database',
		color: 'sky',
		group: 'integration',
	},
	{
		id: 'notion',
		name: 'Notion',
		description: 'Read team docs, policies, and databases.',
		icon: 'Notion01',
		color: 'zinc',
		group: 'integration',
	},
	{
		id: 'workflow_tool',
		name: 'Workflow Tool',
		description: 'Call a workflow as a reliable task step.',
		icon: 'GitMerge',
		color: 'emerald',
		group: 'workflow',
	},
];

/**
 * Returns the default tool IDs for new agents
 */
export const getDefaultToolIds = (): string[] => ['code_sandbox', 'skill_editing'];

/**
 * Returns metadata for a specific skill type
 */
export const getSkillMeta = (type: TAgentSkill['type']) => {
	const meta: Record<TAgentSkill['type'], { color: TColors; icon: string }> = {
		api_call: { color: 'blue', icon: 'Link01' },
		vector_search: { color: 'violet', icon: 'Search01' },
		workflow: { color: 'emerald', icon: 'GitMerge' },
		script: { color: 'amber', icon: 'Code' },
	};
	return meta[type];
};

/**
 * Returns the list of activation trigger options
 */
export const getTriggerOptions = () => [
	{
		id: 'manual',
		name: 'Manual Chat',
		description: 'Start from the agent chat whenever work is needed.',
		icon: 'Message02',
	},
	{
		id: 'scheduled',
		name: 'Scheduled Run',
		description: 'Run on a recurring schedule after the agent is saved.',
		icon: 'Calendar02',
	},
	{
		id: 'event',
		name: 'Event-Based',
		description: 'Run when email, Slack, CRM, or database events arrive.',
		icon: 'Webhook',
	},
];

/**
 * Returns the section navigation configuration
 */
export const getSectionNav = () => [
	{ id: 'basics', label: 'Basics', description: 'Name, model & access', icon: 'Bot' },
	{
		id: 'instructions',
		label: 'Instructions',
		description: 'System prompt & rules',
		icon: 'EditUser02',
	},
	{ id: 'tools', label: 'Tools', description: 'Built-ins & integrations', icon: 'Tools' },
	{ id: 'skills', label: 'Skills', description: 'Playbooks & workflows', icon: 'Puzzle' },
	{ id: 'triggers', label: 'Triggers', description: 'When it runs', icon: 'Flash' },
	{ id: 'test', label: 'Test', description: 'Live preview', icon: 'Message02' },
];
