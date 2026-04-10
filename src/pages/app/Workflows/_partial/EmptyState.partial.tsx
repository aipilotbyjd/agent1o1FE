import { FC } from 'react';
import { useNavigate } from 'react-router';
import Icon from '@/components/icon/Icon';
import Button from '@/components/ui/Button';

interface IEmptyStatePartialProps {
	hasFilters: boolean;
	onClearFilters: () => void;
}

const EmptyStatePartial: FC<IEmptyStatePartialProps> = ({ hasFilters, onClearFilters }) => {
	const navigate = useNavigate();

	return (
		<div className='flex flex-1 items-center justify-center py-12'>
			<div className='w-full max-w-lg text-center'>
				{/* Animated Icon Container */}
				<div className='relative mx-auto mb-8 h-40 w-40'>
					{/* Background circles */}
					<div className='bg-primary-100 dark:bg-primary-900/30 absolute inset-0 animate-pulse rounded-full' />
					<div className='bg-primary-50 dark:bg-primary-900/20 absolute inset-4 rounded-full' />
					{/* Main icon */}
					<div className='absolute inset-0 flex items-center justify-center'>
						<div className='rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-800'>
							<Icon icon='Workflow' size='text-5xl' className='text-primary-500' />
						</div>
					</div>
					{/* Decorative elements */}
					<div className='absolute -top-2 -right-2 h-6 w-6 rounded-full bg-amber-400' />
					<div className='absolute -bottom-1 -left-1 h-4 w-4 rounded-full bg-emerald-400' />
					<div className='absolute top-1/2 -right-4 h-3 w-3 rounded-full bg-blue-400' />
				</div>

				{hasFilters ? (
					<>
						{/* No results state */}
						<h2 className='mb-3 text-2xl font-bold text-zinc-900 dark:text-white'>
							No workflows found
						</h2>
						<p className='mb-6 text-zinc-500 dark:text-zinc-400'>
							We couldn't find any workflows matching your filters.
							<br />
							Try adjusting your search or filters.
						</p>
						<div className='flex flex-wrap justify-center gap-3'>
							<Button variant='outline' icon='Cancel01' onClick={onClearFilters}>
								Clear all filters
							</Button>
						</div>
					</>
				) : (
					<>
						{/* Empty state - no workflows */}
						<h2 className='mb-3 text-2xl font-bold text-zinc-900 dark:text-white'>
							Build your first workflow
						</h2>
						<p className='mb-2 text-zinc-500 dark:text-zinc-400'>
							Automate your tasks by connecting apps and services.
						</p>
						<p className='mb-8 text-sm text-zinc-400 dark:text-zinc-500'>
							Workflows help you save time by automating repetitive tasks.
						</p>

						{/* Feature highlights */}
						<div className='mb-8 grid grid-cols-3 gap-4 text-left'>
							<div className='rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50'>
								<div className='mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30'>
									<Icon icon='Zap' className='text-blue-500' size='text-xl' />
								</div>
								<div className='text-sm font-medium text-zinc-700 dark:text-zinc-300'>
									Fast Setup
								</div>
								<div className='text-xs text-zinc-400'>Visual builder</div>
							</div>
							<div className='rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50'>
								<div className='mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30'>
									<Icon icon='Api' className='text-emerald-500' size='text-xl' />
								</div>
								<div className='text-sm font-medium text-zinc-700 dark:text-zinc-300'>
									100+ Apps
								</div>
								<div className='text-xs text-zinc-400'>Integrations</div>
							</div>
							<div className='rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50'>
								<div className='mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30'>
									<Icon
										icon='Clock01'
										className='text-amber-500'
										size='text-xl'
									/>
								</div>
								<div className='text-sm font-medium text-zinc-700 dark:text-zinc-300'>
									Scheduled
								</div>
								<div className='text-xs text-zinc-400'>Auto triggers</div>
							</div>
						</div>

						{/* CTA Buttons */}
						<div className='flex flex-wrap justify-center gap-3'>
							<Button
								variant='solid'
								icon='PlusSignCircle'
								onClick={() => navigate('/app/story-builder/new')}>
								Create Workflow
							</Button>
							<Button
								variant='outline'
								icon='Book02'
								onClick={() =>
									window.open('https://docs.agent1o1.com/workflows', '_blank')
								}>
								View Docs
							</Button>
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default EmptyStatePartial;
