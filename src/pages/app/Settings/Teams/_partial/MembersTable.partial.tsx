import { FC, useMemo } from 'react';
import {
	createColumnHelper,
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import Icon from '@/components/icon/Icon';
import Dropdown, {
	DropdownItem,
	DropdownMenu,
	DropdownToggle,
} from '@/components/ui/Dropdown';
import Button from '@/components/ui/Button';
import { ROLE_COLORS, ROLE_ICONS, ASSIGNABLE_ROLES, canChangeRole, canRemoveMember } from '../_helper/helper';
import type { TWorkspaceMember, TWorkspaceRole } from '@/types/workspace.type';
import TableTemplate from '@/templates/common/TableParts.template';

interface IMembersTableProps {
	members: TWorkspaceMember[];
	currentUserRole: TWorkspaceRole;
	currentUserId: string;
	onChangeRole: (userId: string, role: TWorkspaceRole) => void;
	onRemove: (userId: string) => void;
}

const columnHelper = createColumnHelper<TWorkspaceMember>();

const MembersTable: FC<IMembersTableProps> = ({
	members,
	currentUserRole,
	currentUserId,
	onChangeRole,
	onRemove,
}) => {
	const columns = useMemo(
		() => [
			columnHelper.accessor('name', {
				cell: (info) => {
					const member = info.row.original;
					return (
						<div className='flex items-center gap-3'>
							<Avatar
								src={member.avatar ?? undefined}
								name={member.name}
								size='w-10'
								color='primary'
							/>
							<div>
								<div className='font-medium text-zinc-900 dark:text-white'>
									{member.name}
									{member.user_id === currentUserId && (
										<span className='ml-2 text-xs text-zinc-400'>(You)</span>
									)}
								</div>
								<div className='text-xs text-zinc-500'>{member.email}</div>
							</div>
						</div>
					);
				},
				header: () => 'Member',
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
			columnHelper.accessor('joined_at', {
				cell: (info) => (
					<span className='text-sm text-zinc-500'>
						{new Date(info.getValue()).toLocaleDateString()}
					</span>
				),
				header: () => 'Joined',
			}),
			columnHelper.display({
				id: 'actions',
				cell: (info) => {
					const member = info.row.original;
					const isCurrentUser = member.user_id === currentUserId;
					const showChangeRole = canChangeRole(currentUserRole, member.role);
					const showRemove = canRemoveMember(currentUserRole, member.role);

					if (isCurrentUser || (!showChangeRole && !showRemove)) return null;

					return (
						<Dropdown>
							<DropdownToggle hasIcon={false}>
								<Button
									variant='outline'
									color='zinc'
									dimension='sm'
									icon='MoreHorizontal'
									aria-label='Actions'
								/>
							</DropdownToggle>
							<DropdownMenu placement='bottom-end'>
								{showChangeRole && (
									<>
										<li className='px-3 py-1.5 text-xs font-semibold text-zinc-400'>
											Change Role
										</li>
										{ASSIGNABLE_ROLES.map((opt) => (
											<DropdownItem
												key={opt.value}
												onClick={() =>
													onChangeRole(
														member.user_id,
														opt.value as TWorkspaceRole,
													)
												}>
												<Icon
													icon={opt.icon}
													color={opt.color}
													className='me-2'
													size='text-lg'
												/>
												{opt.label}
												{member.role === opt.value && (
													<Icon
														icon='Tick02'
														color='primary'
														className='ms-auto'
													/>
												)}
											</DropdownItem>
										))}
									</>
								)}
								{showRemove && (
									<DropdownItem
										onClick={() => onRemove(member.user_id)}
										color='red'>
										<Icon
											icon='Delete02'
											color='red'
											className='me-2'
											size='text-lg'
										/>
										Remove Member
									</DropdownItem>
								)}
							</DropdownMenu>
						</Dropdown>
					);
				},
				header: () => '',
			}),
		],
		[currentUserRole, currentUserId, onChangeRole, onRemove],
	);

	const table = useReactTable({
		data: members,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	return <TableTemplate table={table} hasFooter={false} />;
};

export default MembersTable;
