import { FC } from 'react';
import Button from '@/components/ui/Button';
import Icon from '@/components/icon/Icon';
import { IWorkflow } from '@/types/workflow.type';

interface IBulkActionsPartialProps {
	selectedWorkflows: IWorkflow[];
	onActivate: () => void;
	onDeactivate: () => void;
	onMove: () => void;
	onDelete: () => void;
	onClearSelection: () => void;
	isLoading?: boolean;
}

const BulkActionsPartial: FC<IBulkActionsPartialProps> = ({
	selectedWorkflows,
	onActivate,
	onDeactivate,
	onMove,
	onDelete,
	onClearSelection,
	isLoading,
}) => {
	const count = selectedWorkflows.length;
	const hasActive = selectedWorkflows.some((w) => w.status === 'active');
	const hasInactive = selectedWorkflows.some((w) => w.status !== 'active');

	if (count === 0) return null;

	return (
		<div className='border-primary-200 bg-primary-50 dark:border-primary-800 dark:bg-primary-900/20 flex items-center gap-3 rounded-xl border px-4 py-2'>
			<div className='flex items-center gap-2'>
				<div className='bg-primary-500 flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white'>
					{count}
				</div>
				<span className='text-sm font-medium text-zinc-700 dark:text-zinc-300'>
					workflow{count !== 1 ? 's' : ''} selected
				</span>
			</div>

			<div className='bg-primary-200 dark:bg-primary-700 h-6 w-px' />

			<div className='flex items-center gap-2'>
				{hasInactive && (
					<Button
						variant='soft'
						color='emerald'
						dimension='sm'
						icon='PlayCircle'
						onClick={onActivate}
						isLoading={isLoading}>
						Activate
					</Button>
				)}
				{hasActive && (
					<Button
						variant='soft'
						color='amber'
						dimension='sm'
						icon='PauseCircle'
						onClick={onDeactivate}
						isLoading={isLoading}>
						Deactivate
					</Button>
				)}
				<Button
					variant='soft'
					dimension='sm'
					icon='FolderAdd'
					onClick={onMove}
					isLoading={isLoading}>
					Move
				</Button>
				<Button
					variant='soft'
					color='red'
					dimension='sm'
					icon='Delete02'
					onClick={onDelete}
					isLoading={isLoading}>
					Delete
				</Button>
			</div>

			<div className='flex-1' />

			<Button
				aria-label='Clear selection'
				variant='link'
				dimension='sm'
				onClick={onClearSelection}>
				<Icon icon='Cancel01' className='mr-1' />
				Clear
			</Button>
		</div>
	);
};

export default BulkActionsPartial;
