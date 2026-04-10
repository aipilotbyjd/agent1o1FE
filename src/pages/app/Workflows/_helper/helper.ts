import type { TWorkflowStatus } from '@/types/workflow.type';
import type { TColors } from '@/types/colors.type';

export const STATUS_COLORS: Record<TWorkflowStatus, string> = {
	active: 'emerald',
	inactive: 'amber',
	draft: 'zinc',
	archived: 'red',
};

export const STATUS_OPTIONS: { value: string; label: string; icon: string; color: TColors }[] = [
	{ value: '', label: 'All Status', icon: 'FilterList', color: 'zinc' },
	{ value: 'active', label: 'Active', icon: 'CheckmarkCircle02', color: 'emerald' },
	{ value: 'inactive', label: 'Inactive', icon: 'PauseCircle', color: 'amber' },
	{ value: 'draft', label: 'Draft', icon: 'Clock01', color: 'zinc' },
	{ value: 'archived', label: 'Archived', icon: 'Archive', color: 'red' },
];

export const SORT_OPTIONS = [
	{ value: 'updated_at', label: 'Last Updated', icon: 'Calendar01' },
	{ value: 'created_at', label: 'Date Created', icon: 'CalendarAdd01' },
	{ value: 'name', label: 'Name', icon: 'TextFont' },
	{ value: 'execution_count', label: 'Most Runs', icon: 'PlayCircle' },
	{ value: 'last_executed_at', label: 'Last Run', icon: 'Clock01' },
];

export const TAG_OPTIONS: { value: string; label: string; icon: string; color: TColors }[] = [
	{ value: 'email', label: 'Email', icon: 'Mail01', color: 'blue' },
	{ value: 'crm', label: 'CRM', icon: 'UserAdd01', color: 'emerald' },
	{ value: 'social', label: 'Social Media', icon: 'Share01', color: 'violet' },
	{ value: 'analytics', label: 'Analytics', icon: 'Analytics01', color: 'amber' },
	{ value: 'automation', label: 'Automation', icon: 'Zap', color: 'red' },
	{ value: 'data', label: 'Data', icon: 'Database', color: 'blue' },
	{ value: 'notification', label: 'Notification', icon: 'Notification03', color: 'emerald' },
	{ value: 'integration', label: 'Integration', icon: 'Api', color: 'violet' },
];
