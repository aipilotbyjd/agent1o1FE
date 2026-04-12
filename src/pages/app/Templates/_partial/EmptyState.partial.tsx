import { FC } from 'react';
import Icon from '@/components/icon/Icon';
import Button from '@/components/ui/Button';

interface IEmptyStatePartialProps {
	hasFilters: boolean;
	onClearFilters: () => void;
}

const EmptyStatePartial: FC<IEmptyStatePartialProps> = ({ hasFilters, onClearFilters }) => {
	return (
		<div className='flex min-h-[60vh] items-center justify-center'>
			<div className='w-full max-w-lg text-center'>
				<div className='relative mx-auto mb-8 h-40 w-40'>
					<div className='absolute inset-0 animate-pulse rounded-full bg-teal-100 dark:bg-teal-900/30' />
					<div className='absolute inset-4 rounded-full bg-teal-50 dark:bg-teal-900/20' />
					<div className='absolute inset-0 flex items-center justify-center'>
						<div className='rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-800'>
							<Icon
								icon='LayoutGrid'
								size='text-5xl'
								className='text-teal-500'
							/>
						</div>
					</div>
					<div className='absolute -top-2 -right-2 h-6 w-6 rounded-full bg-amber-400' />
					<div className='absolute -bottom-1 -left-1 h-4 w-4 rounded-full bg-cyan-400' />
					<div className='absolute top-1/2 -right-4 h-3 w-3 rounded-full bg-teal-400' />
				</div>

				{hasFilters ? (
					<>
						<h2 className='mb-3 text-2xl font-bold text-zinc-900 dark:text-white'>
							No templates found
						</h2>
						<p className='mb-6 text-zinc-500 dark:text-zinc-400'>
							We couldn&apos;t find any templates matching your filters.
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
						<h2 className='mb-3 text-2xl font-bold text-zinc-900 dark:text-white'>
							Explore workflow templates
						</h2>
						<p className='mb-2 text-zinc-500 dark:text-zinc-400'>
							Start with pre-built templates to automate common tasks faster.
						</p>
						<p className='mb-8 text-sm text-zinc-400 dark:text-zinc-500'>
							Browse templates to find the perfect starting point for your
							workflows.
						</p>

						<div className='mb-8 grid grid-cols-3 gap-4 text-left'>
							<div className='rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50'>
								<div className='mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/30'>
									<Icon icon='PackageOpen' className='text-teal-500' size='text-xl' />
								</div>
								<div className='text-sm font-medium text-zinc-700 dark:text-zinc-300'>Pre-built</div>
								<div className='text-xs text-zinc-400'>Ready to use</div>
							</div>
							<div className='rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50'>
								<div className='mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30'>
									<Icon icon='PaintBrush01' className='text-amber-500' size='text-xl' />
								</div>
								<div className='text-sm font-medium text-zinc-700 dark:text-zinc-300'>Customizable</div>
								<div className='text-xs text-zinc-400'>Adapt to needs</div>
							</div>
							<div className='rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50'>
								<div className='mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900/30'>
									<Icon icon='Zap' className='text-cyan-500' size='text-xl' />
								</div>
								<div className='text-sm font-medium text-zinc-700 dark:text-zinc-300'>Time Saver</div>
								<div className='text-xs text-zinc-400'>Quick start</div>
							</div>
						</div>

						<div className='flex flex-wrap justify-center gap-3'>
							<Button variant='solid' icon='Rocket01'>
								Browse Templates
							</Button>
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default EmptyStatePartial;
