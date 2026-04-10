import { FC } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { IWorkflow } from '@/types/workflow.type';
import { STATUS_COLORS } from '../_helper/helper';
import type { TColors } from '@/types/colors.type';

dayjs.extend(relativeTime);

interface IPreviewPanelPartialProps {
	workflow: IWorkflow;
	onClose: () => void;
	onRun: (id: string) => void;
	onEdit: (id: string) => void;
	onToggleStatus: (id: string) => void;
	onDelete: (id: string) => void;
	isRunning?: boolean;
}

const PreviewPanelPartial: FC<IPreviewPanelPartialProps> = ({
	workflow,
	onClose,
	onRun,
	onEdit,
	onToggleStatus,
	onDelete,
	isRunning,
}) => {
	const statusColor = STATUS_COLORS[workflow.status] as TColors;

	return (
		<div className='flex h-full w-80 flex-col border-l border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900'>
			{/* Header */}
			<div className='flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-700'>
				<h3 className='font-semibold text-zinc-900 dark:text-white'>Workflow Details</h3>
				<Button
					aria-label='Close panel'
					variant='link'
					dimension='xs'
					icon='Cancel01'
					onClick={onClose}
				/>
			</div>

			{/* Content */}
			<div className='flex-1 overflow-y-auto p-4'>
				<div className='space-y-5'>
					{/* Name & Description */}
					<div>
						<h4 className='text-lg font-bold text-zinc-900 dark:text-white'>
							{workflow.name}
						</h4>
						{workflow.description && (
							<p className='mt-1 text-sm text-zinc-500'>{workflow.description}</p>
						)}
					</div>

					{/* Status Badge */}
					<div className='flex items-center gap-2'>
						<Badge variant='outline' color={statusColor} className='capitalize'>
							{workflow.status}
						</Badge>
						<span className='text-xs text-zinc-400'>v{workflow.version}</span>
					</div>

					{/* Quick Stats */}
					<div className='grid grid-cols-2 gap-3'>
						<div className='rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50'>
							<div className='text-xs text-zinc-400'>Executions</div>
							<div className='text-lg font-bold text-zinc-900 dark:text-white'>
								{workflow.execution_count.toLocaleString()}
							</div>
						</div>
						<div className='rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50'>
							<div className='text-xs text-zinc-400'>Version</div>
							<div className='text-lg font-bold text-zinc-900 dark:text-white'>
								{workflow.version}
							</div>
						</div>
					</div>

					{/* Tags */}
					{workflow.tags.length > 0 && (
						<div>
							<div className='mb-2 text-xs font-medium text-zinc-400'>Tags</div>
							<div className='flex flex-wrap gap-1.5'>
								{workflow.tags.map((tag) => (
									<Badge key={tag} variant='outline' color='zinc' className='rounded-full'>
										{tag}
									</Badge>
								))}
							</div>
						</div>
					)}

					{/* Timestamps */}
					<div className='space-y-2'>
						<div className='flex items-center justify-between text-sm'>
							<span className='text-zinc-400'>Created</span>
							<span className='text-zinc-600 dark:text-zinc-300'>
								{dayjs.unix(workflow.created_at).fromNow()}
							</span>
						</div>
						<div className='flex items-center justify-between text-sm'>
							<span className='text-zinc-400'>Updated</span>
							<span className='text-zinc-600 dark:text-zinc-300'>
								{dayjs.unix(workflow.updated_at).fromNow()}
							</span>
						</div>
						{workflow.last_executed_at && (
							<div className='flex items-center justify-between text-sm'>
								<span className='text-zinc-400'>Last Run</span>
								<span className='text-zinc-600 dark:text-zinc-300'>
									{dayjs.unix(workflow.last_executed_at).fromNow()}
								</span>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Actions */}
			<div className='space-y-2 border-t border-zinc-200 p-4 dark:border-zinc-700'>
				<div className='flex gap-2'>
					<Button
						variant='solid'
						className='flex-1'
						icon='PlayCircle'
						isLoading={isRunning}
						onClick={() => onRun(workflow.id)}>
						Run
					</Button>
					<Button
						variant='outline'
						className='flex-1'
						icon='Edit02'
						onClick={() => onEdit(workflow.id)}>
						Edit
					</Button>
				</div>
				<div className='flex gap-2'>
					<Button
						variant='outline'
						className='flex-1'
						icon={workflow.status === 'active' ? 'PauseCircle' : 'PlayCircle'}
						color={workflow.status === 'active' ? 'amber' : 'emerald'}
						onClick={() => onToggleStatus(workflow.id)}>
						{workflow.status === 'active' ? 'Deactivate' : 'Activate'}
					</Button>
					<Button
						variant='outline'
						className='flex-1'
						icon='Delete02'
						color='red'
						onClick={() => onDelete(workflow.id)}>
						Delete
					</Button>
				</div>
			</div>
		</div>
	);
};

export default PreviewPanelPartial;
