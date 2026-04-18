import { motion } from 'framer-motion';
import classNames from 'classnames';
import Icon from '@/components/icon/Icon';
import Badge from '@/components/ui/Badge';

type BuilderHeroProps = {
	name: string;
	is_active: boolean;
	completion: number;
	isEditing: boolean;
	enabledToolCount: number;
	selectedSkillsCount: number;
	model: string;
};

export const BuilderHeroPartial = ({
	name,
	is_active,
	completion,
	isEditing,
	enabledToolCount,
	selectedSkillsCount,
	model,
}: BuilderHeroProps) => {
	return (
		<div className='relative mb-4 overflow-hidden rounded-2xl border border-zinc-200/80 bg-gradient-to-br from-white via-white to-primary-50/50 p-6 shadow-sm dark:border-zinc-800 dark:from-zinc-950 dark:via-zinc-950 dark:to-primary-950/10'>
			<div className='pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary-500/10 blur-3xl' />
			<div className='pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-secondary-500/10 blur-3xl' />
			<div className='relative flex flex-wrap items-center justify-between gap-6'>
				<div className='flex items-center gap-4'>
					<div className='relative'>
						<div className='from-primary-500 to-secondary-500 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg shadow-primary-500/20'>
							<Icon icon='Bot' size='text-3xl' className='text-white' />
						</div>
						<span className='absolute -right-1 -bottom-1 flex h-4 w-4 items-center justify-center rounded-full bg-white dark:bg-zinc-950'>
							<span
								className={classNames(
									'h-2.5 w-2.5 rounded-full',
									is_active ? 'bg-emerald-500' : 'bg-zinc-400',
								)}
							/>
						</span>
					</div>
					<div>
						<p className='text-xs font-semibold tracking-widest text-primary-600 uppercase dark:text-primary-400'>
							{isEditing ? 'Editing agent' : 'New agent'}
						</p>
						<h1 className='mt-0.5 text-2xl font-bold text-zinc-900 sm:text-3xl dark:text-white'>
							{name || 'Design your AI agent'}
						</h1>
						<p className='mt-1 max-w-xl text-sm text-zinc-500 dark:text-zinc-400'>
							Configure its role, tools, skills, and triggers. Preview behavior on the
							right as you go.
						</p>
					</div>
				</div>
				<div className='flex min-w-[220px] flex-col gap-2'>
					<div className='flex items-center justify-between text-xs font-medium text-zinc-600 dark:text-zinc-400'>
						<span>Setup progress</span>
						<span className='text-primary-600 dark:text-primary-400'>{completion}%</span>
					</div>
					<div className='h-2 overflow-hidden rounded-full bg-zinc-200/70 dark:bg-zinc-800'>
						<motion.div
							className='from-primary-500 to-secondary-500 h-full rounded-full bg-gradient-to-r'
							initial={{ width: 0 }}
							animate={{ width: `${completion}%` }}
							transition={{ duration: 0.4, ease: 'easeOut' }}
						/>
					</div>
					<div className='mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500'>
						<Badge variant='soft' color='primary' rounded='rounded-full'>
							{enabledToolCount} tools
						</Badge>
						<Badge variant='soft' color='violet' rounded='rounded-full'>
							{selectedSkillsCount} skills
						</Badge>
						<Badge variant='soft' color='blue' rounded='rounded-full'>
							{model}
						</Badge>
					</div>
				</div>
			</div>
		</div>
	);
};
