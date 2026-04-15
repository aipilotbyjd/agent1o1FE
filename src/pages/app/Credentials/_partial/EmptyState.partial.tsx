import { FC } from 'react';
import Icon from '@/components/icon/Icon';
import Button from '@/components/ui/Button';

interface IEmptyStatePartialProps {
	hasFilters: boolean;
	onClearFilters: () => void;
	onAddNew: () => void;
}

const EmptyStatePartial: FC<IEmptyStatePartialProps> = ({
	hasFilters,
	onClearFilters,
	onAddNew,
}) => {
	return (
		<div className='flex flex-1 items-center justify-center py-12'>
			<div className='w-full max-w-lg text-center'>
				<div className='relative mx-auto mb-8 h-40 w-40'>
					<div className='absolute inset-0 animate-pulse rounded-full bg-blue-100 dark:bg-blue-900/30' />
					<div className='absolute inset-4 rounded-full bg-blue-50 dark:bg-blue-900/20' />
					<div className='absolute inset-0 flex items-center justify-center'>
						<div className='rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-800'>
							<Icon icon='Key01' size='text-5xl' className='text-blue-500' />
						</div>
					</div>
					<div className='absolute -top-2 -right-2 h-6 w-6 rounded-full bg-violet-400' />
					<div className='absolute -bottom-1 -left-1 h-4 w-4 rounded-full bg-emerald-400' />
					<div className='absolute top-1/2 -right-4 h-3 w-3 rounded-full bg-amber-400' />
				</div>

				{hasFilters ? (
					<>
						<h2 className='mb-3 text-2xl font-bold text-zinc-900 dark:text-white'>
							No credentials found
						</h2>
						<p className='mb-6 text-zinc-500 dark:text-zinc-400'>
							We couldn&apos;t find any credentials matching your filters.
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
							Store your first credential
						</h2>
						<p className='mb-2 text-zinc-500 dark:text-zinc-400'>
							Securely store API keys, tokens, and passwords for your workflows.
						</p>
						<p className='mb-8 text-sm text-zinc-400 dark:text-zinc-500'>
							Credentials are encrypted and can be used across multiple workflows.
						</p>

						<div className='mb-8 grid grid-cols-3 gap-4 text-left'>
							<div className='rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50'>
								<div className='mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30'>
									<Icon icon='ShieldCheck' className='text-blue-500' size='text-xl' />
								</div>
								<div className='text-sm font-medium text-zinc-700 dark:text-zinc-300'>Encrypted</div>
								<div className='text-xs text-zinc-400'>AES-256 encryption</div>
							</div>
							<div className='rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50'>
								<div className='mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30'>
									<Icon icon='Share01' className='text-violet-500' size='text-xl' />
								</div>
								<div className='text-sm font-medium text-zinc-700 dark:text-zinc-300'>Reusable</div>
								<div className='text-xs text-zinc-400'>Use anywhere</div>
							</div>
							<div className='rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50'>
								<div className='mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30'>
									<Icon icon='TestTube01' className='text-emerald-500' size='text-xl' />
								</div>
								<div className='text-sm font-medium text-zinc-700 dark:text-zinc-300'>Testable</div>
								<div className='text-xs text-zinc-400'>Verify connection</div>
							</div>
						</div>

						<div className='flex flex-wrap justify-center gap-3'>
							<Button variant='solid' icon='PlusSignCircle' onClick={onAddNew}>
								Add Credential
							</Button>
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default EmptyStatePartial;
