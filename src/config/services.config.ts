import { TCredentialType } from '@/types/credential.type';

export type TAuthType = 'oauth' | 'api_key' | 'basic' | 'bearer' | 'custom';

export type TServiceCategory =
	| 'AI'
	| 'Communication'
	| 'CRM'
	| 'Database'
	| 'Development'
	| 'File Storage'
	| 'Payment'
	| 'Productivity'
	| 'Other';

export interface IServiceField {
	name: string;
	label: string;
	type: 'text' | 'password' | 'url' | 'number' | 'email' | 'textarea';
	required: boolean;
	placeholder?: string;
	helpText?: string;
	defaultValue?: string | number;
}

export interface IServiceConfig {
	id: string;
	name: string;
	icon: string;
	category: TServiceCategory;
	authType: TAuthType;
	oauthProvider?: string;
	credentialType: TCredentialType;
	fields?: IServiceField[];
	description?: string;
	helpUrl?: string;
	defaultName?: string;
	tags?: string[];
}

export interface IServiceWithStatus extends IServiceConfig {
	isOAuthConfigured?: boolean;
	isAvailable: boolean;
}

export const SERVICES: IServiceConfig[] = [
	{
		id: 'openai',
		name: 'OpenAI',
		icon: 'AiBrain01',
		category: 'AI',
		authType: 'api_key',
		credentialType: 'api_key',
		description: 'GPT, image, audio, and embeddings APIs',
		defaultName: 'OpenAI API',
		fields: [
			{
				name: 'api_key',
				label: 'API Key',
				type: 'password',
				required: true,
				placeholder: 'sk-proj-...',
				helpText: 'Create an API key in the OpenAI dashboard.',
			},
		],
		helpUrl: 'https://platform.openai.com/api-keys',
		tags: ['ai', 'gpt', 'chatgpt', 'llm'],
	},
	{
		id: 'anthropic',
		name: 'Anthropic',
		icon: 'AiBrain02',
		category: 'AI',
		authType: 'api_key',
		credentialType: 'api_key',
		description: 'Claude model APIs',
		defaultName: 'Anthropic API',
		fields: [
			{
				name: 'api_key',
				label: 'API Key',
				type: 'password',
				required: true,
				placeholder: 'sk-ant-...',
				helpText: 'Create an API key in the Anthropic console.',
			},
		],
		helpUrl: 'https://console.anthropic.com/',
		tags: ['ai', 'claude', 'llm'],
	},
	{
		id: 'google_sheets',
		name: 'Google Sheets',
		icon: 'Table01',
		category: 'Productivity',
		authType: 'oauth',
		oauthProvider: 'google',
		credentialType: 'oauth2',
		description: 'Read and write spreadsheet data',
		defaultName: 'Google Sheets Connection',
		tags: ['google', 'spreadsheet', 'sheets'],
	},
	{
		id: 'google_drive',
		name: 'Google Drive',
		icon: 'Folder01',
		category: 'File Storage',
		authType: 'oauth',
		oauthProvider: 'google',
		credentialType: 'oauth2',
		description: 'Upload, download, and manage files',
		defaultName: 'Google Drive Connection',
		tags: ['google', 'storage', 'files'],
	},
	{
		id: 'gmail',
		name: 'Gmail',
		icon: 'Mail01',
		category: 'Communication',
		authType: 'oauth',
		oauthProvider: 'google',
		credentialType: 'oauth2',
		description: 'Send and read emails',
		defaultName: 'Gmail Connection',
		tags: ['google', 'email', 'mail'],
	},
	{
		id: 'google_calendar',
		name: 'Google Calendar',
		icon: 'Calendar03',
		category: 'Productivity',
		authType: 'oauth',
		oauthProvider: 'google',
		credentialType: 'oauth2',
		description: 'Create and manage calendar events',
		defaultName: 'Google Calendar Connection',
		tags: ['google', 'calendar', 'events'],
	},
	{
		id: 'notion',
		name: 'Notion',
		icon: 'Note01',
		category: 'Productivity',
		authType: 'oauth',
		oauthProvider: 'notion',
		credentialType: 'oauth2',
		description: 'Access pages and databases',
		defaultName: 'Notion Connection',
		helpUrl: 'https://developers.notion.com/',
		tags: ['notion', 'database', 'docs'],
	},
	{
		id: 'airtable',
		name: 'Airtable',
		icon: 'Table02',
		category: 'Productivity',
		authType: 'oauth',
		oauthProvider: 'airtable',
		credentialType: 'oauth2',
		description: 'Access bases and records',
		defaultName: 'Airtable Connection',
		tags: ['airtable', 'database', 'spreadsheet'],
	},
	{
		id: 'slack',
		name: 'Slack',
		icon: 'Message01',
		category: 'Communication',
		authType: 'oauth',
		oauthProvider: 'slack',
		credentialType: 'oauth2',
		description: 'Send messages and use Slack APIs',
		defaultName: 'Slack Connection',
		helpUrl: 'https://api.slack.com/',
		tags: ['slack', 'chat', 'messaging'],
	},
	{
		id: 'discord',
		name: 'Discord',
		icon: 'Message01',
		category: 'Communication',
		authType: 'api_key',
		credentialType: 'api_key',
		description: 'Discord bot integration',
		defaultName: 'Discord Bot',
		fields: [
			{
				name: 'api_key',
				label: 'Bot Token',
				type: 'password',
				required: true,
				placeholder: 'Enter your bot token',
			},
		],
		helpUrl: 'https://discord.com/developers/docs',
		tags: ['discord', 'chat', 'bot'],
	},
	{
		id: 'telegram',
		name: 'Telegram',
		icon: 'Message01',
		category: 'Communication',
		authType: 'api_key',
		credentialType: 'api_key',
		description: 'Telegram bot integration',
		defaultName: 'Telegram Bot',
		fields: [
			{
				name: 'api_key',
				label: 'Bot Token',
				type: 'password',
				required: true,
				placeholder: '123456789:ABCdefGHIjklMNOpqrsTUVwxyz',
				helpText: 'Create a bot token with BotFather.',
			},
		],
		helpUrl: 'https://core.telegram.org/bots',
		tags: ['telegram', 'chat', 'bot'],
	},
	{
		id: 'twilio',
		name: 'Twilio',
		icon: 'Call02',
		category: 'Communication',
		authType: 'basic',
		credentialType: 'basic',
		description: 'SMS, voice, and WhatsApp',
		defaultName: 'Twilio Account',
		fields: [
			{
				name: 'username',
				label: 'Account SID',
				type: 'text',
				required: true,
				placeholder: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
			},
			{
				name: 'password',
				label: 'Auth Token',
				type: 'password',
				required: true,
				placeholder: 'Your auth token',
			},
		],
		helpUrl: 'https://www.twilio.com/docs',
		tags: ['sms', 'voice', 'whatsapp'],
	},
	{
		id: 'sendgrid',
		name: 'SendGrid',
		icon: 'Mail01',
		category: 'Communication',
		authType: 'api_key',
		credentialType: 'api_key',
		description: 'Email delivery API',
		defaultName: 'SendGrid API',
		fields: [
			{
				name: 'api_key',
				label: 'API Key',
				type: 'password',
				required: true,
				placeholder: 'SG.xxxxxx',
			},
		],
		helpUrl: 'https://docs.sendgrid.com/',
		tags: ['email', 'mail', 'transactional'],
	},
	{
		id: 'github_oauth',
		name: 'GitHub OAuth',
		icon: 'SourceCodeCircle',
		category: 'Development',
		authType: 'oauth',
		oauthProvider: 'github',
		credentialType: 'oauth2',
		description: 'Connect GitHub with OAuth',
		defaultName: 'GitHub Connection',
		helpUrl: 'https://docs.github.com/en/rest',
		tags: ['github', 'git', 'repository'],
	},
	{
		id: 'github_token',
		name: 'GitHub Token',
		icon: 'SourceCodeCircle',
		category: 'Development',
		authType: 'api_key',
		credentialType: 'api_key',
		description: 'Personal access token',
		defaultName: 'GitHub Token',
		fields: [
			{
				name: 'api_key',
				label: 'Personal Access Token',
				type: 'password',
				required: true,
				placeholder: 'ghp_xxxxxxxxxxxx',
			},
		],
		helpUrl: 'https://github.com/settings/tokens',
		tags: ['github', 'git', 'repository'],
	},
	{
		id: 'gitlab',
		name: 'GitLab',
		icon: 'SourceCodeCircle',
		category: 'Development',
		authType: 'api_key',
		credentialType: 'api_key',
		description: 'GitLab personal access token',
		defaultName: 'GitLab Token',
		fields: [
			{
				name: 'api_key',
				label: 'Personal Access Token',
				type: 'password',
				required: true,
				placeholder: 'glpat-xxxxxxxxxxxx',
			},
		],
		tags: ['gitlab', 'git', 'repository'],
	},
	{
		id: 'jira',
		name: 'Jira',
		icon: 'Task01',
		category: 'Development',
		authType: 'basic',
		credentialType: 'basic',
		description: 'Jira project management API',
		defaultName: 'Jira Connection',
		fields: [
			{
				name: 'host',
				label: 'Jira URL',
				type: 'url',
				required: true,
				placeholder: 'https://your-company.atlassian.net',
			},
			{
				name: 'username',
				label: 'Email',
				type: 'email',
				required: true,
				placeholder: 'you@company.com',
			},
			{
				name: 'password',
				label: 'API Token',
				type: 'password',
				required: true,
				placeholder: 'Your Jira API token',
			},
		],
		helpUrl: 'https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/',
		tags: ['jira', 'atlassian', 'issues'],
	},
	{
		id: 'stripe',
		name: 'Stripe',
		icon: 'CreditCard',
		category: 'Payment',
		authType: 'api_key',
		credentialType: 'api_key',
		description: 'Payment processing API',
		defaultName: 'Stripe API',
		fields: [
			{
				name: 'api_key',
				label: 'Secret Key',
				type: 'password',
				required: true,
				placeholder: 'sk_live_... or sk_test_...',
			},
		],
		helpUrl: 'https://stripe.com/docs/api',
		tags: ['stripe', 'payment', 'billing'],
	},
	{
		id: 'hubspot',
		name: 'HubSpot',
		icon: 'UserGroup',
		category: 'CRM',
		authType: 'oauth',
		oauthProvider: 'hubspot',
		credentialType: 'oauth2',
		description: 'CRM and marketing automation',
		defaultName: 'HubSpot Connection',
		helpUrl: 'https://developers.hubspot.com/',
		tags: ['hubspot', 'crm', 'marketing'],
	},
	{
		id: 'salesforce',
		name: 'Salesforce',
		icon: 'UserGroup',
		category: 'CRM',
		authType: 'oauth',
		oauthProvider: 'salesforce',
		credentialType: 'oauth2',
		description: 'Salesforce CRM APIs',
		defaultName: 'Salesforce Connection',
		helpUrl: 'https://developer.salesforce.com/',
		tags: ['salesforce', 'crm'],
	},
	{
		id: 'postgresql',
		name: 'PostgreSQL',
		icon: 'Database01',
		category: 'Database',
		authType: 'basic',
		credentialType: 'basic',
		description: 'PostgreSQL database',
		defaultName: 'PostgreSQL Database',
		fields: [
			{ name: 'host', label: 'Host', type: 'text', required: true, placeholder: 'localhost' },
			{ name: 'port', label: 'Port', type: 'number', required: true, defaultValue: 5432 },
			{ name: 'database', label: 'Database', type: 'text', required: true },
			{ name: 'username', label: 'Username', type: 'text', required: true },
			{ name: 'password', label: 'Password', type: 'password', required: true },
		],
		tags: ['postgresql', 'postgres', 'database', 'sql'],
	},
	{
		id: 'mysql',
		name: 'MySQL',
		icon: 'Database01',
		category: 'Database',
		authType: 'basic',
		credentialType: 'basic',
		description: 'MySQL database',
		defaultName: 'MySQL Database',
		fields: [
			{ name: 'host', label: 'Host', type: 'text', required: true, placeholder: 'localhost' },
			{ name: 'port', label: 'Port', type: 'number', required: true, defaultValue: 3306 },
			{ name: 'database', label: 'Database', type: 'text', required: true },
			{ name: 'username', label: 'Username', type: 'text', required: true },
			{ name: 'password', label: 'Password', type: 'password', required: true },
		],
		tags: ['mysql', 'database', 'sql'],
	},
	{
		id: 'mongodb',
		name: 'MongoDB',
		icon: 'Database01',
		category: 'Database',
		authType: 'custom',
		credentialType: 'custom',
		description: 'MongoDB connection string',
		defaultName: 'MongoDB Connection',
		fields: [
			{
				name: 'connectionString',
				label: 'Connection String',
				type: 'password',
				required: true,
				placeholder: 'mongodb+srv://user:pass@cluster.mongodb.net/dbname',
			},
		],
		tags: ['mongodb', 'database', 'nosql'],
	},
	{
		id: 'aws_s3',
		name: 'AWS S3',
		icon: 'CloudServer',
		category: 'File Storage',
		authType: 'custom',
		credentialType: 'custom',
		description: 'Amazon S3 object storage',
		defaultName: 'AWS S3 Credentials',
		fields: [
			{ name: 'access_key_id', label: 'Access Key ID', type: 'text', required: true },
			{ name: 'secret_access_key', label: 'Secret Access Key', type: 'password', required: true },
			{ name: 'region', label: 'Region', type: 'text', required: true, defaultValue: 'us-east-1' },
			{ name: 'bucket', label: 'Default Bucket', type: 'text', required: false },
		],
		helpUrl: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html',
		tags: ['aws', 's3', 'storage'],
	},
	{
		id: 'bearer_token',
		name: 'Bearer Token',
		icon: 'Key01',
		category: 'Other',
		authType: 'bearer',
		credentialType: 'bearer',
		description: 'Generic Authorization bearer token',
		defaultName: 'Bearer Token',
		fields: [
			{
				name: 'token',
				label: 'Token',
				type: 'password',
				required: true,
				placeholder: 'eyJhbGciOi...',
			},
		],
		tags: ['http', 'api', 'bearer'],
	},
	{
		id: 'http_header',
		name: 'HTTP Header Auth',
		icon: 'Globe02',
		category: 'Other',
		authType: 'custom',
		credentialType: 'custom',
		description: 'Custom HTTP header authentication',
		defaultName: 'HTTP Header Auth',
		fields: [
			{
				name: 'header_name',
				label: 'Header Name',
				type: 'text',
				required: true,
				defaultValue: 'Authorization',
				placeholder: 'X-API-Key',
			},
			{
				name: 'header_value',
				label: 'Header Value',
				type: 'password',
				required: true,
				placeholder: 'Bearer your-token',
			},
		],
		tags: ['http', 'api', 'custom'],
	},
	{
		id: 'webhook',
		name: 'Webhook',
		icon: 'Link01',
		category: 'Other',
		authType: 'custom',
		credentialType: 'custom',
		description: 'Webhook endpoint with optional secret',
		defaultName: 'Webhook Config',
		fields: [
			{
				name: 'url',
				label: 'Webhook URL',
				type: 'url',
				required: true,
				placeholder: 'https://example.com/webhook',
			},
			{
				name: 'secret',
				label: 'Secret',
				type: 'password',
				required: false,
				placeholder: 'For signature verification',
			},
		],
		tags: ['webhook', 'http'],
	},
];

export const searchServices = (query: string): IServiceConfig[] => {
	const lowerQuery = query.toLowerCase();
	return SERVICES.filter(
		(service) =>
			service.name.toLowerCase().includes(lowerQuery) ||
			service.description?.toLowerCase().includes(lowerQuery) ||
			service.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)),
	);
};
