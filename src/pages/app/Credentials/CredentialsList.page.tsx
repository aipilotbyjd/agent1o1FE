import { useOutletContext } from 'react-router';
import { useEffect, useState, useMemo } from 'react';
import Container from '@/components/layout/Container';
import Subheader, {
	SubheaderLeft,
	SubheaderRight,
	SubheaderSeparator,
} from '@/components/layout/Subheader';
import Input from '@/components/form/Input';
import FieldWrap from '@/components/form/FieldWrap';
import Icon from '@/components/icon/Icon';
import Button from '@/components/ui/Button';
import { SortingState } from '@tanstack/react-table';

import {
	useCreateCredential,
	useFetchCredential,
	useFetchCredentials,
	useDeleteCredential,
	useShareCredential,
	useTestCredential,
	useUnshareCredential,
	useUpdateCredential,
	useUpdateSharingScope,
} from '@/api';
import { useFetchMembers } from '@/api/hooks/useTeam';
import { useAuth } from '@/context/authContext';
import {
	ICredential,
	ICredentialFilters,
	ICreateCredentialDto,
	IUpdateCredentialDto,
	TCredentialType,
	TCredentialSortBy,
	TSortOrder,
	TSharingScope,
} from '@/types/credential.type';
import { toast } from 'react-toastify';
import { useCurrentWorkspaceId } from '@/context/workspaceContext';

// Partials
import FiltersPartial from './_partial/Filters.partial';
import TablePartial from './_partial/Table.partial';
import EmptyStatePartial from './_partial/EmptyState.partial';
import { LoadingStatePartial, ErrorStatePartial } from './_partial/States.partial';
import CredentialModalPartial from './_partial/CredentialModal.partial';
import CredentialShareModalPartial from './_partial/CredentialShareModal.partial';

export interface OutletContextType {
	headerLeft?: React.ReactNode;
	setHeaderLeft: (value: React.ReactNode) => void;
}

const CredentialsListPage = () => {
	// Get active workspace from context
	const workspaceId = useCurrentWorkspaceId() || undefined;
	const { userData } = useAuth();

	// Filter state
	const [searchQuery, setSearchQuery] = useState('');
	const [typeFilter, setTypeFilter] = useState<TCredentialType | ''>('');
	const [sortBy, setSortBy] = useState<TCredentialSortBy>('created_at');
	const [sortOrder, setSortOrder] = useState<TSortOrder>('desc');
	const [isCredentialModalOpen, setIsCredentialModalOpen] = useState(false);
	const [editingCredential, setEditingCredential] = useState<ICredential | null>(null);
	const [sharingCredential, setSharingCredential] = useState<ICredential | null>(null);

	// Table sorting state
	const [sorting, setSorting] = useState<SortingState>([{ id: 'created_at', desc: true }]);

	// Check if any filter is active
	const hasFilters = searchQuery || typeFilter;

	// Build filters object for API
	const filters: ICredentialFilters = useMemo(
		() => ({
			...(searchQuery && { search: searchQuery }),
			...(typeFilter && { type: typeFilter }),
			sort_by: sortBy,
			order: sortOrder,
		}),
		[searchQuery, typeFilter, sortBy, sortOrder],
	);

	// API hooks
	const { data: credentials, isLoading, isError, refetch } = useFetchCredentials(workspaceId, filters);
	const { data: credentialDetail, isLoading: isCredentialDetailLoading } = useFetchCredential(
		workspaceId,
		editingCredential?.id,
	);
	const { data: sharingCredentialDetail, isLoading: isSharingCredentialDetailLoading } =
		useFetchCredential(workspaceId, sharingCredential?.id);
	const { data: members = [] } = useFetchMembers(workspaceId);
	const createCredential = useCreateCredential(workspaceId);
	const updateCredential = useUpdateCredential(workspaceId);
	const deleteCredential = useDeleteCredential(workspaceId);
	const testCredential = useTestCredential(workspaceId);
	const shareCredentialMutation = useShareCredential(workspaceId);
	const unshareCredentialMutation = useUnshareCredential(workspaceId);
	const updateSharingScope = useUpdateSharingScope(workspaceId);

	const { setHeaderLeft } = useOutletContext<OutletContextType>();

	// Set breadcrumb
	useEffect(() => {
		setHeaderLeft(<span className='font-semibold'>Credentials</span>);
		return () => setHeaderLeft(undefined);
	}, [setHeaderLeft]);

	const handleTest = async (credential: ICredential) => {
		try {
			await testCredential.mutateAsync(credential.id);
			toast.success('Connection test successful!');
		} catch (error) {
			toast.error('Connection test failed');
		}
	};

	const handleDelete = async (credential: ICredential) => {
		if (confirm(`Are you sure you want to delete "${credential.name}"?`)) {
			try {
				await deleteCredential.mutateAsync(credential.id);
				toast.success('Credential deleted successfully');
			} catch (error) {
				toast.error('Failed to delete credential');
			}
		}
	};

	const handleOpenCreate = () => {
		setEditingCredential(null);
		setIsCredentialModalOpen(true);
	};

	const handleEdit = (credential: ICredential) => {
		setEditingCredential(credential);
		setIsCredentialModalOpen(true);
	};

	const handleCredentialSubmit = async (
		values: ICreateCredentialDto | IUpdateCredentialDto,
	) => {
		if (editingCredential) {
			await updateCredential.mutateAsync({
				id: editingCredential.id,
				dto: values as IUpdateCredentialDto,
			});
		} else {
			await createCredential.mutateAsync(values as ICreateCredentialDto);
		}
		setIsCredentialModalOpen(false);
		setEditingCredential(null);
	};

	const handleShareSubmit = async ({
		sharing_scope,
		user_ids,
		revoke_user_ids,
	}: {
		sharing_scope: TSharingScope;
		user_ids: string[];
		revoke_user_ids: string[];
	}) => {
		if (!sharingCredential) return;

		await updateSharingScope.mutateAsync({
			id: sharingCredential.id,
			dto: { sharing_scope },
		});

		if (sharing_scope === 'specific') {
			if (user_ids.length > 0) {
				await shareCredentialMutation.mutateAsync({
					id: sharingCredential.id,
					dto: { user_ids },
				});
			}
			await Promise.all(
				revoke_user_ids.map((userId) =>
					unshareCredentialMutation.mutateAsync({
						id: sharingCredential.id,
						userId,
					}),
				),
			);
		}

		setSharingCredential(null);
	};

	const clearAllFilters = () => {
		setSearchQuery('');
		setTypeFilter('');
	};

	const filteredData = useMemo(() => credentials || [], [credentials]);

	return (
		<>
			<Subheader>
				<SubheaderLeft>
					<FieldWrap firstSuffix={<Icon icon='Search02' />}>
						<Input
							name='search'
							variant='solid'
							placeholder='Search credentials...'
							dimension='sm'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</FieldWrap>
				</SubheaderLeft>
				<SubheaderRight>
					<FiltersPartial
						typeFilter={typeFilter}
						setTypeFilter={setTypeFilter}
						sortBy={sortBy}
						setSortBy={setSortBy}
						sortOrder={sortOrder}
						setSortOrder={setSortOrder}
					/>
					{hasFilters && (
						<Button
							aria-label='Clear filters'
							variant='outline'
							color='red'
							dimension='sm'
							icon='Cancel01'
							onClick={clearAllFilters}>
							Clear
						</Button>
					)}
					<SubheaderSeparator />
					<Button
						aria-label='New Credential'
						variant='solid'
						icon='PlusSignCircle'
						onClick={handleOpenCreate}>
						New Credential
					</Button>
				</SubheaderRight>
			</Subheader>
			<Container className='flex h-full'>
				<div className='flex min-w-0 flex-1 flex-col'>
					{isLoading ? (
						<LoadingStatePartial />
					) : isError ? (
						<ErrorStatePartial onRetry={() => refetch()} />
					) : filteredData.length === 0 ? (
						<EmptyStatePartial
							hasFilters={!!hasFilters}
							onClearFilters={clearAllFilters}
							onAddNew={handleOpenCreate}
						/>
					) : (
						<TablePartial
							data={filteredData}
							sorting={sorting}
							onSortingChange={setSorting}
							onEdit={handleEdit}
							onTest={handleTest}
							onDelete={handleDelete}
							onShare={(credential) => setSharingCredential(credential)}
						/>
					)}
				</div>
			</Container>
			<CredentialModalPartial
				isOpen={isCredentialModalOpen}
				onClose={() => {
					setIsCredentialModalOpen(false);
					setEditingCredential(null);
				}}
				onSubmit={handleCredentialSubmit}
				credential={credentialDetail}
				isEditing={!!editingCredential}
				isLoading={createCredential.isPending || updateCredential.isPending}
				isDetailLoading={!!editingCredential && isCredentialDetailLoading}
			/>
			<CredentialShareModalPartial
				isOpen={!!sharingCredential}
				onClose={() => setSharingCredential(null)}
				credential={sharingCredentialDetail || sharingCredential}
				members={members}
				currentUserId={userData?.id}
				isLoading={
					isSharingCredentialDetailLoading ||
					shareCredentialMutation.isPending ||
					unshareCredentialMutation.isPending ||
					updateSharingScope.isPending
				}
				onSubmit={handleShareSubmit}
			/>
		</>
	);
};

export default CredentialsListPage;
