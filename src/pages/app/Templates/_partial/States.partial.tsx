import { FC } from 'react';
import Card, { CardBody } from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import Icon from '@/components/icon/Icon';
import Button from '@/components/ui/Button';

export const LoadingStatePartial: FC = () => {
	return (
		<div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
			{Array.from({ length: 8 }).map((_, index) => (
				<Card key={index} className='h-64'>
					<CardBody className='flex flex-col p-4'>
						<div className='mb-4 flex gap-2'>
							<Skeleton className='size-10 rounded-lg' />
							<Skeleton className='size-10 rounded-lg' />
						</div>
						<Skeleton className='mb-2 h-6 w-3/4' />
						<Skeleton className='mb-2 h-4 w-full' />
						<Skeleton className='mb-4 h-4 w-2/3' />
						<div className='mt-auto flex items-center justify-between'>
							<Skeleton className='h-6 w-20 rounded-full' />
							<Skeleton className='h-4 w-24' />
						</div>
					</CardBody>
				</Card>
			))}
		</div>
	);
};

interface IErrorStatePartialProps {
	onRetry: () => void;
}

export const ErrorStatePartial: FC<IErrorStatePartialProps> = ({ onRetry }) => {
	return (
		<Card>
			<CardBody className='flex flex-col items-center justify-center py-16'>
				<div className='mb-4 rounded-full bg-red-100 p-4 dark:bg-red-900/20'>
					<Icon icon='AlertCircle' size='text-4xl' className='text-red-500' />
				</div>
				<h3 className='mb-2 text-lg font-semibold text-zinc-900 dark:text-white'>
					Failed to load templates
				</h3>
				<p className='mb-6 max-w-md text-center text-sm text-zinc-500'>
					Something went wrong while loading the templates. Please try again.
				</p>
				<Button variant='solid' color='blue' icon='RefreshCcw01' onClick={onRetry}>
					Retry
				</Button>
			</CardBody>
		</Card>
	);
};
