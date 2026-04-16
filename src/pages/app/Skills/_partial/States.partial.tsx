import Button from '@/components/ui/Button';
import Icon from '@/components/icon/Icon';

export const LoadingStatePartial = () => (
	<div className='flex flex-1 items-center justify-center py-20'>
		<div className='text-center'>
			<Icon icon='Loading02' size='text-4xl' color='primary' className='animate-spin' />
			<p className='mt-4 text-zinc-500'>Loading skills...</p>
		</div>
	</div>
);

export const ErrorStatePartial = ({ onRetry }: { onRetry: () => void }) => (
	<div className='flex flex-1 items-center justify-center py-20'>
		<div className='text-center'>
			<Icon icon='AlertCircle' size='text-5xl' color='red' />
			<p className='mt-4 text-lg font-semibold'>Failed to load skills</p>
			<p className='mt-2 text-sm text-zinc-500'>Please try again</p>
			<Button variant='solid' className='mt-4' onClick={onRetry}>
				Retry
			</Button>
		</div>
	</div>
);
