import { TExecutionStatus, TExecutionTrigger } from '@/types/execution.type';

export type TExecutionSortBy = 'queued_at' | 'started_at' | 'completed_at' | 'duration';
export type TSortOrder = 'asc' | 'desc';

export const STATUS_COLORS: Record<
	TExecutionStatus | 'timeout',
	'amber' | 'blue' | 'emerald' | 'red' | 'zinc' | 'violet'
> = {
	running: 'blue',
	completed: 'emerald',
	failed: 'red',
	timeout: 'violet',
};

export const STATUS_OPTIONS: {
	value: TExecutionStatus | 'timeout' | '';
	label: string;
	icon: string;
	color?: 'amber' | 'blue' | 'emerald' | 'red' | 'zinc' | 'violet';
}[] = [
	{ value: '', label: 'All Status', icon: 'Menu01' },
	{ value: 'running', label: 'Running', icon: 'Loading03', color: 'blue' },
	{ value: 'completed', label: 'Completed', icon: 'CheckmarkCircle02', color: 'emerald' },
	{ value: 'failed', label: 'Failed', icon: 'Cancel01', color: 'red' },
];

export const TRIGGER_OPTIONS: {
	value: TExecutionTrigger | '';
	label: string;
	icon: string;
	color?: 'blue' | 'emerald' | 'amber';
}[] = [
	{ value: '', label: 'All Triggers', icon: 'Menu01' },
	{ value: 'manual', label: 'Manual', icon: 'Cursor02', color: 'blue' },
	{ value: 'webhook', label: 'Webhook', icon: 'Webhook', color: 'emerald' },
	{ value: 'schedule', label: 'Schedule', icon: 'Calendar03', color: 'amber' },
];

export const SORT_OPTIONS: { value: TExecutionSortBy; label: string; icon: string }[] = [
	{ value: 'started_at', label: 'Started', icon: 'Play' },
	{ value: 'completed_at', label: 'Completed', icon: 'CheckmarkCircle02' },
	{ value: 'duration', label: 'Duration', icon: 'Time01' },
];

export const formatDuration = (ms?: number): string => {
	if (!ms) return '-';
	if (ms < 1000) return `${ms}ms`;
	if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
	return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
};
