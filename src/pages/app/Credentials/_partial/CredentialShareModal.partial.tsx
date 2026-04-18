import { FC, useEffect, useMemo, useState } from 'react';
import Modal, { ModalBody, ModalFooter, ModalHeader } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Select from '@/components/form/Select';
import Label from '@/components/form/Label';
import Badge from '@/components/ui/Badge';
import Icon from '@/components/icon/Icon';
import type { ICredential, TSharingScope } from '@/types/credential.type';
import type { TWorkspaceMember } from '@/types/workspace.type';

interface ICredentialShareModalPartialProps {
	isOpen: boolean;
	onClose: () => void;
	credential: ICredential | null;
	members: TWorkspaceMember[];
	currentUserId?: string;
	isLoading?: boolean;
	onSubmit: (values: {
		sharing_scope: TSharingScope;
		user_ids: string[];
		revoke_user_ids: string[];
	}) => Promise<void>;
}

const SHARING_SCOPE_OPTIONS: { value: TSharingScope; label: string; helper: string }[] = [
	{
		value: 'private',
		label: 'Private',
		helper: 'Only the owner can use this credential.',
	},
	{
		value: 'workspace',
		label: 'Workspace',
		helper: 'Everyone in the workspace can use this credential.',
	},
	{
		value: 'specific',
		label: 'Specific members',
		helper: 'Choose individual members who can use this credential.',
	},
];

const CredentialShareModalPartial: FC<ICredentialShareModalPartialProps> = ({
	isOpen,
	onClose,
	credential,
	members,
	currentUserId,
	isLoading,
	onSubmit,
}) => {
	const initialSharedUserIds = useMemo(
		() => credential?.shares?.map((share) => share.user_id) || [],
		[credential],
	);

	const [sharingScope, setSharingScope] = useState<TSharingScope>('private');
	const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

	useEffect(() => {
		if (credential && isOpen) {
			setSharingScope(credential.sharing_scope);
			setSelectedUserIds(initialSharedUserIds);
		}
	}, [credential, initialSharedUserIds, isOpen]);

	const selectedScope = SHARING_SCOPE_OPTIONS.find((scope) => scope.value === sharingScope);
	const shareableMembers = members.filter((member) => member.user_id !== currentUserId);

	const toggleMember = (userId: string) => {
		setSelectedUserIds((current) =>
			current.includes(userId)
				? current.filter((id) => id !== userId)
				: [...current, userId],
		);
	};

	const handleSubmit = async () => {
		const addedUserIds = selectedUserIds.filter((id) => !initialSharedUserIds.includes(id));
		const removedUserIds = initialSharedUserIds.filter((id) => !selectedUserIds.includes(id));

		await onSubmit({
			sharing_scope: sharingScope,
			user_ids: sharingScope === 'specific' ? addedUserIds : [],
			revoke_user_ids: sharingScope === 'specific' ? removedUserIds : [],
		});
	};

	if (!credential) return null;

	return (
		<Modal isOpen={isOpen} setIsOpen={onClose} size='lg'>
			<ModalHeader>
				<div className='flex items-center gap-3'>
					<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30'>
						<Icon icon='Share01' color='emerald' />
					</div>
					<div>
						<span>Share Credential</span>
						<p className='text-sm font-normal text-zinc-500'>{credential.name}</p>
					</div>
				</div>
			</ModalHeader>
			<ModalBody>
				<div className='space-y-5'>
					<div>
						<Label htmlFor='credential-share-scope'>Access</Label>
						<Select
							id='credential-share-scope'
							name='sharing_scope'
							value={sharingScope}
							onChange={(e) => setSharingScope(e.target.value as TSharingScope)}>
							{SHARING_SCOPE_OPTIONS.map((scope) => (
								<option key={scope.value} value={scope.value}>
									{scope.label}
								</option>
							))}
						</Select>
						<p className='mt-1 text-xs text-zinc-500'>{selectedScope?.helper}</p>
					</div>

					{sharingScope === 'specific' && (
						<div>
							<div className='mb-3 flex items-center justify-between'>
								<Label htmlFor='credential-share-members'>Members</Label>
								<Badge variant='soft' color='zinc'>
									{selectedUserIds.length} selected
								</Badge>
							</div>
							{shareableMembers.length === 0 ? (
								<div className='rounded-lg border border-zinc-200 p-4 text-sm text-zinc-500 dark:border-zinc-800'>
									Invite workspace members before sharing credentials with specific users.
								</div>
							) : (
								<div className='max-h-80 space-y-2 overflow-auto'>
									{shareableMembers.map((member) => {
										const isSelected = selectedUserIds.includes(member.user_id);
										return (
											<button
												key={member.user_id}
												type='button'
												className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors ${
													isSelected
														? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
														: 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'
												}`}
												onClick={() => toggleMember(member.user_id)}>
												<div>
													<p className='font-medium text-zinc-900 dark:text-white'>{member.name}</p>
													<p className='text-xs text-zinc-500'>{member.email}</p>
												</div>
												<div className='flex items-center gap-2'>
													<Badge variant='outline' color='zinc'>
														{member.role}
													</Badge>
													{isSelected && <Icon icon='CheckmarkCircle02' color='emerald' />}
												</div>
											</button>
										);
									})}
								</div>
							)}
						</div>
					)}
				</div>
			</ModalBody>
			<ModalFooter>
				<Button variant='outline' onClick={onClose} isDisable={isLoading}>
					Cancel
				</Button>
				<Button variant='solid' icon='FloppyDisk' onClick={handleSubmit} isLoading={isLoading}>
					Save Sharing
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default CredentialShareModalPartial;
