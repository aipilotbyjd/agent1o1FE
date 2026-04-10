import { FC } from 'react';
import Card, { CardBody } from '@/components/ui/Card';
import Icon from '@/components/icon/Icon';
import Button from '@/components/ui/Button';
import { WorkflowTableSkeleton, StatsCardsSkeleton } from '@/components/ui/TableSkeleton';

export const LoadingStatePartial: FC = () => {
	return (
		<div className='space-y-4'>
			<StatsCardsSkeleton />
			<WorkflowTableSkeleton />
		</div>
	);
};

interface IErrorStatePartialProps {
	onRetry: () => void;
}

export const ErrorStatePartial: FC<IErrorStatePartialProps> = ({ onRetry }) => {
	return (
		<Card className='border-red-200 dark:border-red-900/50'>
			<CardBody className='py-16 text-center'>
				<div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30'>
					<Icon
						icon='AlertTriangle'
						size='text-4xl'
						className='text-red-500 dark:text-red-400'
					/>
				</div>
				<h3 className='mb-2 text-lg font-semibold text-zinc-900 dark:text-white'>
					Failed to Load Workflows
				</h3>
				<p className='mx-auto mb-6 max-w-md text-zinc-500'>
					We couldn't load your workflows. This might be a temporary issue. Please check
					your connection and try again.
				</p>
				<div className='flex items-center justify-center gap-3'>
					<Button variant='outline' icon='RotateClockwise' onClick={onRetry}>
						Try Again
					</Button>
					<Button variant='link' icon='CustomerService01'>
						Contact Support
					</Button>
				</div>
			</CardBody>
		</Card>
	);
};
