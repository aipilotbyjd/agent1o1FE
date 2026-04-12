import { FC, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
	createColumnHelper,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	SortingState,
	useReactTable,
} from '@tanstack/react-table';
import Card, { CardBody, CardHeader, CardHeaderChild, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Icon from '@/components/icon/Icon';
import Dropdown, { DropdownMenu, DropdownItem, DropdownToggle } from '@/components/ui/Dropdown';
import TableTemplate, { TableCardFooterTemplate } from '@/templates/common/TableParts.template';
import { TExecution, TExecutionStatus, TExecutionTrigger } from '@/types/execution.type';
import { STATUS_COLORS, formatDuration } from '../_helper/helper';

const columnHelper = createColumnHelper<TExecution>();

const TRIGGER_ICONS: Record<TExecutionTrigger, string> = {
	manual: 'Cursor02',
	webhook: 'Webhook',
	schedule: 'Calendar03',
};

interface ITablePartialProps {
	data: TExecution[];
	sorting: SortingState;
	onSortingChange: (sorting: SortingState) => void;
	onCancel: (execution: TExecution) => void;
	onRetry: (execution: TExecution) => void;
}

const TablePartial: FC<ITablePartialProps> = ({
	data,
	sorting,
	onSortingChange,
	onCancel,
	onRetry,
}) => {
	const navigate = useNavigate();

	const columns = useMemo(
		() => [
			columnHelper.accessor('workflow_name', {
				cell: (info) => (
					<div className='flex flex-col'>
						<span className='font-medium text-zinc-900 dark:text-white'>
							{info.getValue() || 'Unknown Workflow'}
						</span>
						<span className='text-xs text-zinc-400'>
							{info.row.original.id.slice(0, 8)}...
						</span>
					</div>
				),
				header: () => 'Workflow',
			}),
			columnHelper.accessor('status', {
				cell: (info) => {
					const status = info.getValue();
					return (
						<div className='flex items-center gap-2'>
							<Badge variant='soft' color={STATUS_COLORS[status as TExecutionStatus]}>
								{status === 'running' && (
									<Icon icon='Loading03' className='me-1 animate-spin' />
								)}
								{status}
							</Badge>
						</div>
					);
				},
				header: () => 'Status',
			}),
			columnHelper.accessor('trigger', {
				cell: (info) => (
					<div className='flex items-center gap-1'>
						<Icon
							icon={TRIGGER_ICONS[info.getValue()]}
							size='text-lg'
							className='text-zinc-400'
						/>
						<span className='capitalize'>{info.getValue()}</span>
					</div>
				),
				header: () => 'Trigger',
			}),
			columnHelper.accessor('started_at', {
				cell: (info) => new Date(info.getValue()).toLocaleString(),
				header: () => 'Started',
			}),
			columnHelper.display({
				id: 'duration',
				cell: (info) => {
					const execution = info.row.original;
					if (execution.duration_ms) {
						return formatDuration(execution.duration_ms);
					}
					if (execution.started_at && !execution.completed_at) {
						return (
							<span className='text-blue-500'>
								{formatDuration(Date.now() - new Date(execution.started_at).getTime())}
							</span>
						);
					}
					return '-';
				},
				header: () => 'Duration',
			}),
			columnHelper.display({
				id: 'actions',
				cell: (info) => {
					const execution = info.row.original;
					const isRunning = execution.status === 'running';
					const isFailed = execution.status === 'failed';

					return (
						<Dropdown>
							<DropdownToggle hasIcon={false}>
								<Button aria-label='Actions' icon='MoreVertical' variant='link' />
							</DropdownToggle>
							<DropdownMenu placement='bottom-end'>
								<DropdownItem
									icon='Eye'
									onClick={() => navigate(`/app/executions/${execution.id}`)}>
									View Details
								</DropdownItem>
								{isRunning && (
									<DropdownItem
										icon='Cancel01'
										className='text-red-500'
										onClick={() => onCancel(execution)}>
										Cancel
									</DropdownItem>
								)}
								{isFailed && (
									<DropdownItem
										icon='RotateClockwise'
										onClick={() => onRetry(execution)}>
										Retry
									</DropdownItem>
								)}
							</DropdownMenu>
						</Dropdown>
					);
				},
				header: () => 'Actions',
			}),
		],
		[navigate, onCancel, onRetry],
	);

	const table = useReactTable({
		data,
		columns,
		state: { sorting },
		onSortingChange: (updater) => {
			const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
			onSortingChange(newSorting);
		},
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		initialState: {
			pagination: { pageSize: 10 },
		},
	});

	return (
		<Card className='h-full'>
			<CardHeader>
				<CardHeaderChild>
					<CardTitle
						iconProps={{
							icon: 'Activity01',
							color: 'emerald',
							size: 'text-3xl',
						}}>
						Executions
					</CardTitle>
				</CardHeaderChild>
				<CardHeaderChild>
					<span className='text-sm text-zinc-500'>
						{data.length} execution{data.length !== 1 ? 's' : ''}
					</span>
				</CardHeaderChild>
			</CardHeader>
			<CardBody className='overflow-auto'>
				<TableTemplate table={table} hasFooter={false} />
			</CardBody>
			<TableCardFooterTemplate table={table} />
		</Card>
	);
};

export default TablePartial;
