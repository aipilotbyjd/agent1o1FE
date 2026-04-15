import { useState, useMemo } from 'react';
import Container from '@/components/layout/Container';
import Subheader, {
	SubheaderLeft,
	SubheaderRight,
	SubheaderSeparator,
} from '@/components/layout/Subheader';
import Button from '@/components/ui/Button';
import Input from '@/components/form/Input';
import Icon from '@/components/icon/Icon';
import Badge from '@/components/ui/Badge';
import Dropdown, { DropdownItem, DropdownMenu, DropdownToggle } from '@/components/ui/Dropdown';
import { useWorkspace } from '@/context/workspaceContext';
import { useAuth } from '@/context/authContext';
import {
	useFetchMembers,
	useUpdateMemberRole,
	useRemoveMember,
	useFetchInvitations,
	useCancelInvitation,
} from '@/api/hooks/useTeam';
import { canManageMembers, ROLE_OPTIONS } from './_helper/helper';
import MembersTable from './_partial/MembersTable.partial';
import InvitationsTable from './_partial/InvitationsTable.partial';
import InviteModal from './_partial/InviteModal.partial';
import LeaveModal from './_partial/LeaveModal.partial';
import type { TWorkspaceRole } from '@/types/workspace.type';

type TTab = 'members' | 'invitations';

const SettingsTeamsPage = () => {
	const { currentWorkspace } = useWorkspace();
	const { userData } = useAuth();
	const workspaceId = currentWorkspace?.id;
	const currentUserRole = currentWorkspace?.role ?? 'viewer';
	const currentUserId = userData?.id ?? '';

	const [activeTab, setActiveTab] = useState<TTab>('members');
	const [search, setSearch] = useState('');
	const [roleFilter, setRoleFilter] = useState<TWorkspaceRole | ''>('');
	const [isInviteOpen, setIsInviteOpen] = useState(false);
	const [isLeaveOpen, setIsLeaveOpen] = useState(false);

	const { data: members = [], isLoading: membersLoading } = useFetchMembers(workspaceId);
	const { data: invitations = [], isLoading: invitationsLoading } = useFetchInvitations(workspaceId);

	const updateRole = useUpdateMemberRole();
	const removeMember = useRemoveMember();
	const cancelInvitation = useCancelInvitation();

	const filteredMembers = useMemo(() => {
		let result = members;
		if (search) {
			const q = search.toLowerCase();
			result = result.filter(
				(m) =>
					m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q),
			);
		}
		if (roleFilter) {
			result = result.filter((m) => m.role === roleFilter);
		}
		return result;
	}, [members, search, roleFilter]);

	const filteredInvitations = useMemo(() => {
		if (!search) return invitations;
		const q = search.toLowerCase();
		return invitations.filter((i) => i.email.toLowerCase().includes(q));
	}, [invitations, search]);

	const handleChangeRole = (userId: string, role: TWorkspaceRole) => {
		if (!workspaceId) return;
		updateRole.mutate({ workspaceId, userId, data: { role } });
	};

	const handleRemoveMember = (userId: string) => {
		if (!workspaceId) return;
		removeMember.mutate({ workspaceId, userId });
	};

	const handleCancelInvitation = (invitationId: string) => {
		if (!workspaceId) return;
		cancelInvitation.mutate({ workspaceId, invitationId });
	};

	if (!workspaceId) {
		return (
			<Container>
				<div className='flex items-center justify-center py-20'>
					<p className='text-zinc-500'>No workspace selected.</p>
				</div>
			</Container>
		);
	}

	const currentRoleOption = ROLE_OPTIONS.find((o) => o.value === roleFilter);
	const hasFilters = search || roleFilter;

	return (
		<>
			<Subheader>
				<SubheaderLeft>
					<div className='flex gap-2'>
						<Button
							variant={activeTab === 'members' ? 'solid' : 'outline'}
							dimension='sm'
							onClick={() => setActiveTab('members')}>
							Members
							<Badge variant='solid' color='zinc' className='ms-2'>
								{members.length}
							</Badge>
						</Button>
						<Button
							variant={activeTab === 'invitations' ? 'solid' : 'outline'}
							dimension='sm'
							onClick={() => setActiveTab('invitations')}>
							Invitations
							{invitations.length > 0 && (
								<Badge variant='solid' color='amber' className='ms-2'>
									{invitations.length}
								</Badge>
							)}
						</Button>
					</div>
				</SubheaderLeft>
				<SubheaderRight>
					<Input
						placeholder='Search...'
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className='!w-56'
						name='search'
						dimension='sm'
					/>
					{activeTab === 'members' && (
						<Dropdown>
							<DropdownToggle hasIcon={false}>
								<Button
									variant={roleFilter ? 'solid' : 'outline'}
									color={roleFilter ? 'primary' : undefined}
									dimension='sm'
									rightIcon='ChevronDown'>
									{currentRoleOption?.icon && (
										<Icon icon={currentRoleOption.icon} className='me-1' />
									)}
									{currentRoleOption?.label || 'Role'}
								</Button>
							</DropdownToggle>
							<DropdownMenu placement='bottom-end'>
								{ROLE_OPTIONS.map((opt) => (
									<DropdownItem
										key={opt.value}
										onClick={() =>
											setRoleFilter(opt.value as TWorkspaceRole | '')
										}>
										<Icon
											icon={opt.icon}
											color={opt.color}
											className='me-2'
											size='text-lg'
										/>
										{opt.label}
										{roleFilter === opt.value && (
											<Icon icon='Tick02' color='primary' className='ms-auto' />
										)}
									</DropdownItem>
								))}
							</DropdownMenu>
						</Dropdown>
					)}
					{hasFilters && (
						<Button
							variant='outline'
							color='red'
							dimension='sm'
							icon='Cancel01'
							onClick={() => {
								setSearch('');
								setRoleFilter('');
							}}>
							Clear
						</Button>
					)}
					<SubheaderSeparator />
					{canManageMembers(currentUserRole) && (
						<Button
							variant='solid'
							icon='UserAdd02'
							onClick={() => setIsInviteOpen(true)}>
							Invite
						</Button>
					)}
					{currentUserRole !== 'owner' && (
						<Button
							variant='outline'
							color='red'
							icon='Logout04'
							onClick={() => setIsLeaveOpen(true)}>
							Leave
						</Button>
					)}
				</SubheaderRight>
			</Subheader>
			<Container className='flex h-full'>
				<div className='flex min-w-0 flex-1 flex-col'>
					{activeTab === 'members' && (
						<>
							{membersLoading ? (
								<div className='flex items-center justify-center py-10'>
									<p className='text-zinc-500'>Loading members...</p>
								</div>
							) : filteredMembers.length === 0 ? (
								<div className='flex flex-col items-center justify-center py-10'>
									<Icon icon='UserMultiple' size='text-5xl' color='zinc' />
									<p className='mt-4 text-zinc-500'>
										{hasFilters
											? 'No members match your filters.'
											: 'No members yet.'}
									</p>
								</div>
							) : (
								<MembersTable
									members={filteredMembers}
									currentUserRole={currentUserRole}
									currentUserId={currentUserId}
									onChangeRole={handleChangeRole}
									onRemove={handleRemoveMember}
								/>
							)}
						</>
					)}
					{activeTab === 'invitations' && (
						<>
							{invitationsLoading ? (
								<div className='flex items-center justify-center py-10'>
									<p className='text-zinc-500'>Loading invitations...</p>
								</div>
							) : filteredInvitations.length === 0 ? (
								<div className='flex flex-col items-center justify-center py-10'>
									<Icon icon='Mail02' size='text-5xl' color='zinc' />
									<p className='mt-4 text-zinc-500'>
										{hasFilters
											? 'No invitations match your search.'
											: 'No pending invitations.'}
									</p>
								</div>
							) : (
								<InvitationsTable
									invitations={filteredInvitations}
									currentUserRole={currentUserRole}
									onCancel={handleCancelInvitation}
									isCancelling={cancelInvitation.isPending}
								/>
							)}
						</>
					)}
				</div>
			</Container>

			<InviteModal
				isOpen={isInviteOpen}
				setIsOpen={setIsInviteOpen}
				workspaceId={workspaceId}
			/>
			<LeaveModal
				isOpen={isLeaveOpen}
				setIsOpen={setIsLeaveOpen}
				workspaceId={workspaceId}
				workspaceName={currentWorkspace?.name ?? ''}
			/>
		</>
	);
};

export default SettingsTeamsPage;
