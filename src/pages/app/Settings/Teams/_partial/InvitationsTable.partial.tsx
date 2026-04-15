import { FC, useMemo } from 'react';
import {
	createColumnHelper,
	getCoreRowModel,
	useReactTable,
} from '@tanstack/react-table';
import Badge from '@/components/ui/Badge';
import Icon from '@/components/icon/Icon';
import Button from '@/components/ui/Button';
import { ROLE_COLORS, ROLE_ICONS, canManageMembers } from '../_helper/helper';
import type { TWorkspaceInvitation, TWorkspaceRole } from '@/types/workspace.type';
import TableTemplate from '@/templates/common/TableParts.template';

interface IInvitationsTableProps {
	invitations: TWorkspaceInvitation[];
	currentUserRole: TWorkspaceRole;
	onCancel: (invitationId: string) => void;
	isCancelling: boolean;
}

const columnHelper = createColumnHelper<TWorkspaceInvitation>();

const InvitationsTable: FC<IInvitationsTableProps> = ({
	invitations,
	currentUserRole,
	onCancel,
	isCancelling,
}) => {
	const columns = useMemo(
		() => [
			columnHelper.accessor('email', {
				cell: (info) => (
					<div className='flex items-center gap-2'>
						<Icon icon='Mail02' size='text-lg' color='zinc' />
						<span className='font-medium'>{info.getValue()}</span>
					</div>
				),
				header: () => 'Email',
			}),
			columnHelper.accessor('role', {
				cell: (info) => {
					const role = info.getValue();
					return (
						<Badge variant='outline' color={ROLE_COLORS[role]}>
							<Icon icon={ROLE_ICONS[role]} className='me-1' size='text-sm' />
							{role.charAt(0).toUpperCase() + role.slice(1)}
						</Badge>
					);
				},
				header: () => 'Role',
			}),
			columnHelper.accessor('invited_by', {
				cell: (info) => (
					<span className='text-sm text-zinc-500'>{info.getValue()}</span>
				),
				header: () => 'Invited By',
			}),
			columnHelper.accessor('expires_at', {
				cell: (info) => {
					const date = new Date(info.getValue());
					const now = new Date();
					const isExpired = date < now;
					return (
						<span
							className={`text-sm ${isExpired ? 'text-red-500' : 'text-zinc-500'}`}>
							{isExpired ? 'Expired' : date.toLocaleDateString()}
						</span>
					);
				},
				header: () => 'Expires',
			}),
			columnHelper.display({
				id: 'actions',
				cell: (info) => {
					if (!canManageMembers(currentUserRole)) return null;
					return (
						<Button
							variant='outline'
							color='red'
							dimension='sm'
							icon='Cancel01'
							isLoading={isCancelling}
							onClick={() => onCancel(info.row.original.id)}>
							Cancel
						</Button>
					);
				},
				header: () => '',
			}),
		],
		[currentUserRole, onCancel, isCancelling],
	);

	const table = useReactTable({
		data: invitations,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return <TableTemplate table={table} hasFooter={false} isSortable={false} />;
};

export default InvitationsTable;
