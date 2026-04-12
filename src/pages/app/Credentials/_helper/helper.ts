import { TCredentialType, TCredentialSortBy, TSharingScope } from '@/types/credential.type';

export const TYPE_COLORS: Record<
	TCredentialType,
	'blue' | 'violet' | 'amber' | 'emerald' | 'zinc'
> = {
	api_key: 'blue',
	oauth2: 'violet',
	basic: 'amber',
	bearer: 'emerald',
	custom: 'zinc',
};

export const TYPE_OPTIONS: {
	value: TCredentialType | '';
	label: string;
	icon: string;
	color?: 'blue' | 'violet' | 'amber' | 'emerald' | 'zinc';
}[] = [
	{ value: '', label: 'All Types', icon: 'Menu01' },
	{ value: 'api_key', label: 'API Key', icon: 'Key01', color: 'blue' },
	{ value: 'oauth2', label: 'OAuth2', icon: 'PassportValid', color: 'violet' },
	{ value: 'basic', label: 'Basic Auth', icon: 'UserCircle', color: 'amber' },
	{ value: 'bearer', label: 'Bearer Token', icon: 'Ticket02', color: 'emerald' },
	{ value: 'custom', label: 'Custom', icon: 'Settings02', color: 'zinc' },
];

export const SORT_OPTIONS: { value: TCredentialSortBy; label: string; icon: string }[] = [
	{ value: 'created_at', label: 'Created', icon: 'Calendar03' },
	{ value: 'name', label: 'Name', icon: 'TextFont' },
	{ value: 'type', label: 'Type', icon: 'Key01' },
	{ value: 'last_used_at', label: 'Last Used', icon: 'Clock01' },
];

export const SHARING_SCOPE_CONFIG: Record<
	TSharingScope,
	{ label: string; icon: string; color: string; textColor: string }
> = {
	private: {
		label: 'Private',
		icon: 'Lock',
		color: 'zinc',
		textColor: 'text-zinc-500',
	},
	workspace: {
		label: 'Workspace',
		icon: 'UserGroup',
		color: 'blue',
		textColor: 'text-blue-500',
	},
	specific: {
		label: 'Shared',
		icon: 'UserMultiple',
		color: 'emerald',
		textColor: 'text-emerald-500',
	},
};
