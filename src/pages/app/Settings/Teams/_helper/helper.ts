import type { TWorkspaceRole } from '@/types/workspace.type';
import type { TColors } from '@/types/colors.type';
import type { TIcons } from '@/types/icons.type';

export const ROLE_COLORS: Record<TWorkspaceRole, TColors> = {
	owner: 'amber',
	admin: 'blue',
	editor: 'emerald',
	member: 'emerald',
	viewer: 'zinc',
};

export const ROLE_ICONS: Record<TWorkspaceRole, TIcons> = {
	owner: 'Crown',
	admin: 'Shield02',
	editor: 'Edit02',
	member: 'Edit02',
	viewer: 'View',
};

export const ROLE_OPTIONS: {
	value: TWorkspaceRole | '';
	label: string;
	icon: TIcons;
	color: TColors;
	description: string;
}[] = [
	{ value: '', label: 'All Roles', icon: 'UserMultiple', color: 'zinc', description: '' },
	{ value: 'owner', label: 'Owner', icon: 'Crown', color: 'amber', description: 'Full control' },
	{ value: 'admin', label: 'Admin', icon: 'Shield02', color: 'blue', description: 'Manage workspace, members, workflows' },
	{ value: 'editor', label: 'Editor', icon: 'Edit02', color: 'emerald', description: 'Create and edit workflows' },
	{ value: 'viewer', label: 'Viewer', icon: 'View', color: 'zinc', description: 'View-only access' },
];

export const ASSIGNABLE_ROLES = ROLE_OPTIONS.filter(
	(opt) => opt.value && opt.value !== 'owner',
);

export const getInitials = (name: string): string => {
	return name
		.split(' ')
		.map((w) => w[0])
		.join('')
		.toUpperCase()
		.slice(0, 2);
};

export const getFullName = (firstName?: string, lastName?: string): string => {
	return [firstName, lastName].filter(Boolean).join(' ');
};

export const canManageMembers = (currentRole: TWorkspaceRole): boolean => {
	return ['owner', 'admin'].includes(currentRole);
};

export const canChangeRole = (
	currentUserRole: TWorkspaceRole,
	targetMemberRole: TWorkspaceRole,
): boolean => {
	if (currentUserRole === 'owner') return targetMemberRole !== 'owner';
	if (currentUserRole === 'admin') return !['owner', 'admin'].includes(targetMemberRole);
	return false;
};

export const canRemoveMember = (
	currentUserRole: TWorkspaceRole,
	targetMemberRole: TWorkspaceRole,
): boolean => {
	if (currentUserRole === 'owner') return targetMemberRole !== 'owner';
	if (currentUserRole === 'admin') return !['owner', 'admin'].includes(targetMemberRole);
	return false;
};
