import { useOutletContext } from 'react-router';
import { useEffect, useState, useMemo } from 'react';
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

import { useFetchCredentials, useDeleteCredential, useTestCredential } from '@/api';
import { ICredential, ICredentialFilters, TCredentialType, TCredentialSortBy, TSortOrder } from '@/types/credential.type';
import { toast } from 'react-toastify';

// Partials
import FiltersPartial from './_partial/Filters.partial';
import TablePartial from './_partial/Table.partial';
import EmptyStatePartial from './_partial/EmptyState.partial';
import { LoadingStatePartial, ErrorStatePartial } from './_partial/States.partial';

export interface OutletContextType {
	headerLeft?: React.ReactNode;
	setHeaderLeft: (value: React.ReactNode) => void;
}

const CredentialsListPage = () => {
	// Using a fixed workspace ID for now - this should come from context
	const workspaceId = 'demo-workspace-id';

	// Filter state
	const [searchQuery, setSearchQuery] = useState('');
	const [typeFilter, setTypeFilter] = useState<TCredentialType | ''>('');
	const [sortBy, setSortBy] = useState<TCredentialSortBy>('created_at');
	const [sortOrder, setSortOrder] = useState<TSortOrder>('desc');

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
	const deleteCredential = useDeleteCredential(workspaceId);
	const testCredential = useTestCredential(workspaceId);

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

	const handleEdit = () => {
		toast.info('Edit functionality coming soon');
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
						variant='soft'
						icon='PlusSignCircle'
						onClick={() => toast.info('Add credential coming soon')}>
						New Credential
					</Button>
				</SubheaderRight>
			</Subheader>
			<div className='mx-auto w-full bg-white px-2 pt-4 pb-2 dark:bg-zinc-950'>
				{isLoading ? (
					<LoadingStatePartial />
				) : isError ? (
					<ErrorStatePartial onRetry={() => refetch()} />
				) : filteredData.length === 0 ? (
					<EmptyStatePartial
						hasFilters={!!hasFilters}
						onClearFilters={clearAllFilters}
						onAddNew={() => toast.info('Add credential coming soon')}
					/>
				) : (
					<TablePartial
						data={filteredData}
						sorting={sorting}
						onSortingChange={setSorting}
						onEdit={handleEdit}
						onTest={handleTest}
						onDelete={handleDelete}
					/>
				)}
			</div>
		</>
	);
};

export default CredentialsListPage;
