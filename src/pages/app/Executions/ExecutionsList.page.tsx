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

import { useFetchExecutions, useCancelExecution, useRetryExecution } from '@/api';
import { TExecution, TExecutionStatus, TExecutionTrigger } from '@/types/execution.type';
import { TExecutionSortBy, TSortOrder } from './_helper/helper';
import { toast } from 'react-toastify';
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

interface IExecutionFilters {
	search?: string;
	status?: string;
	trigger_type?: string;
	sort_by: TExecutionSortBy;
	order: TSortOrder;
}

const ExecutionsListPage = () => {
	// Get active workspace ID
	const workspaceId = useCurrentWorkspaceId() || undefined;

	// Filter state
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState<TExecutionStatus | ''>('');
	const [triggerFilter, setTriggerFilter] = useState<TExecutionTrigger | ''>('');
	const [sortBy, setSortBy] = useState<TExecutionSortBy>('started_at');
	const [sortOrder, setSortOrder] = useState<TSortOrder>('desc');

	// Table sorting state
	const [sorting, setSorting] = useState<SortingState>([{ id: 'started_at', desc: true }]);

	// Check if any filter is active
	const hasFilters = searchQuery || statusFilter || triggerFilter;

	// Build filters object for API
	const filters = useMemo(
		() => ({
			...(searchQuery && { search: searchQuery }),
			...(statusFilter && { status: statusFilter }),
			...(triggerFilter && { trigger_type: triggerFilter }),
			sort_by: sortBy,
			order: sortOrder,
		} as Record<string, unknown>),
		[searchQuery, statusFilter, triggerFilter, sortBy, sortOrder],
	);

	// API hooks
	const { data: executions, isLoading, isError, refetch } = useFetchExecutions(workspaceId, filters);
	const cancelExecution = useCancelExecution(workspaceId);
	const retryExecution = useRetryExecution(workspaceId);

	const { setHeaderLeft } = useOutletContext<OutletContextType>();

	// Set breadcrumb
	useEffect(() => {
		setHeaderLeft(<span className='font-semibold'>Executions</span>);
		return () => setHeaderLeft(undefined);
	}, [setHeaderLeft]);

	const handleCancel = async (execution: TExecution) => {
		if (confirm('Are you sure you want to cancel this execution?')) {
			try {
				await cancelExecution.mutateAsync(execution.id);
				toast.success('Execution cancelled');
			} catch (error) {
				toast.error('Failed to cancel execution');
			}
		}
	};

	const handleRetry = async (execution: TExecution) => {
		try {
			await retryExecution.mutateAsync(execution.id);
			toast.success('Execution retried');
		} catch (error) {
			toast.error('Failed to retry execution');
		}
	};

	const clearAllFilters = () => {
		setSearchQuery('');
		setStatusFilter('');
		setTriggerFilter('');
	};

	const filteredData = useMemo(() => executions || [], [executions]);

	return (
		<>
			<Subheader>
				<SubheaderLeft>
					<FieldWrap firstSuffix={<Icon icon='Search02' />}>
						<Input
							name='search'
							variant='solid'
							placeholder='Search executions...'
							dimension='sm'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</FieldWrap>
				</SubheaderLeft>
				<SubheaderRight>
					<FiltersPartial
						statusFilter={statusFilter}
						setStatusFilter={setStatusFilter}
						triggerFilter={triggerFilter}
						setTriggerFilter={setTriggerFilter}
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
						aria-label='Refresh'
						variant='soft'
						icon='RotateClockwise'
						onClick={() => refetch()}>
						Refresh
					</Button>
				</SubheaderRight>
			</Subheader>
			<div className='mx-auto w-full bg-white px-2 pt-4 pb-2 dark:bg-zinc-950'>
				{isLoading ? (
					<LoadingStatePartial />
				) : isError ? (
					<ErrorStatePartial onRetry={() => refetch()} />
				) : filteredData.length === 0 ? (
					<EmptyStatePartial hasFilters={!!hasFilters} onClearFilters={clearAllFilters} />
				) : (
					<TablePartial
						data={filteredData}
						sorting={sorting}
						onSortingChange={setSorting}
						onCancel={handleCancel}
						onRetry={handleRetry}
					/>
				)}
			</div>
		</>
	);
};

export default ExecutionsListPage;
