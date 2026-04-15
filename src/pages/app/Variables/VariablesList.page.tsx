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
import { toast } from 'react-toastify';

import { useFetchVariables, useDeleteVariable } from '@/api';
import { IVariable, TVariableSortBy, TSortOrder } from '@/types/variable.type';
import { useCurrentWorkspaceId } from '@/context/workspaceContext';

// Partials
import FiltersPartial from './_partial/Filters.partial';
import TablePartial from './_partial/Table.partial';
import EmptyStatePartial from './_partial/EmptyState.partial';
import { LoadingStatePartial, ErrorStatePartial } from './_partial/States.partial';

export interface OutletContextType {
	headerLeft?: React.ReactNode;
	setHeaderLeft: (value: React.ReactNode) => void;
}

const VariablesListPage = () => {
	// Get active workspace ID
	const workspaceId = useCurrentWorkspaceId() || undefined;

	// Filter state
	const [searchQuery, setSearchQuery] = useState('');
	const [scopeFilter, setScopeFilter] = useState<string | null>(null);
	const [sortBy, setSortBy] = useState<TVariableSortBy>('created_at');
	const [sortOrder, setSortOrder] = useState<TSortOrder>('desc');

	// Table sorting state
	const [sorting, setSorting] = useState<SortingState>([{ id: 'created_at', desc: true }]);

	// Check if any filter is active
	const hasFilters = searchQuery || scopeFilter !== null;

	// Build filters object for API
	const filters = useMemo(
		() => ({
			...(searchQuery && { search: searchQuery }),
			...(scopeFilter && { scope: scopeFilter }),
			sort_by: sortBy,
			order: sortOrder,
		} as Record<string, unknown>),
		[searchQuery, scopeFilter, sortBy, sortOrder],
	);

	// API hooks
	const { data: variables, isLoading, isError, refetch } = useFetchVariables(workspaceId, filters);
	const deleteVariable = useDeleteVariable(workspaceId);

	const { setHeaderLeft } = useOutletContext<OutletContextType>();

	// Set breadcrumb
	useEffect(() => {
		setHeaderLeft(<span className='font-semibold'>Environment Variables</span>);
		return () => setHeaderLeft(undefined);
	}, [setHeaderLeft]);

	const handleDelete = async (variable: IVariable) => {
		if (confirm(`Are you sure you want to delete "${variable.key}"?`)) {
			try {
				await deleteVariable.mutateAsync(variable.id);
				toast.success('Variable deleted successfully');
			} catch (error) {
				toast.error('Failed to delete variable');
			}
		}
	};

	const handleEdit = () => {
		toast.info('Edit functionality coming soon');
	};

	const clearAllFilters = () => {
		setSearchQuery('');
		setScopeFilter(null);
	};

	const filteredData = useMemo(() => variables || [], [variables]);

	return (
		<>
			<Subheader>
				<SubheaderLeft>
					<FieldWrap firstSuffix={<Icon icon='Search02' />}>
						<Input
							name='search'
							variant='solid'
							placeholder='Search variables...'
							dimension='sm'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</FieldWrap>
				</SubheaderLeft>
				<SubheaderRight>
					<FiltersPartial
						scopeFilter={scopeFilter}
						setScopeFilter={setScopeFilter}
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
						aria-label='New Variable'
						variant='solid'
						icon='PlusSignCircle'
						onClick={() => toast.info('Add variable coming soon')}>
						Create Variable
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
						onAddNew={() => toast.info('Add variable coming soon')}
					/>
				) : (
					<TablePartial
						data={filteredData}
						sorting={sorting}
						onSortingChange={setSorting}
						onEdit={handleEdit}
						onDelete={handleDelete}
					/>
				)}
			</div>
		</>
	);
};

export default VariablesListPage;
