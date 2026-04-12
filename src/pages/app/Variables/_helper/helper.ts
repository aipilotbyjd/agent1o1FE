import { TVariableSortBy } from '@/types/variable.type';

export const SORT_OPTIONS: { value: TVariableSortBy; label: string; icon: string }[] = [
	{ value: 'created_at', label: 'Created', icon: 'Calendar03' },
	{ value: 'updated_at', label: 'Updated', icon: 'Clock01' },
	{ value: 'key', label: 'Name', icon: 'TextFont' },
];

export const VISIBILITY_OPTIONS: { value: boolean | null; label: string; icon: string }[] = [
	{ value: null, label: 'All', icon: 'Menu01' },
	{ value: false, label: 'Plain Text', icon: 'Eye' },
	{ value: true, label: 'Secret', icon: 'EyeOff' },
];
