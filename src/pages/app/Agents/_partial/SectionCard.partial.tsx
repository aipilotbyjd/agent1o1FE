import { motion } from 'framer-motion';
import Icon from '@/components/icon/Icon';

export const SectionCardPartial = ({
	id,
	icon,
	eyebrow,
	title,
	description,
	children,
	actions,
}: {
	id: string;
	icon: string;
	eyebrow: string;
	title: string;
	description: string;
	children: React.ReactNode;
	actions?: React.ReactNode;
}) => (
	<motion.section
		id={id}
		initial={{ opacity: 0, y: 12 }}
		animate={{ opacity: 1, y: 0 }}
		transition={{ duration: 0.35, ease: 'easeOut' }}
		className='relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm ring-1 ring-black/[0.02] transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:ring-white/[0.02]'>
		<div className='absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-500/40 to-transparent' />
		<div className='flex flex-wrap items-start justify-between gap-4 px-6 pt-6 pb-4'>
			<div className='flex items-start gap-4'>
				<div className='bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-primary-500/20'>
					<Icon icon={icon} size='text-2xl' color='primary' />
				</div>
				<div>
					<p className='text-primary-600 dark:text-primary-400 text-xs font-semibold tracking-wider uppercase'>
						{eyebrow}
					</p>
					<h2 className='mt-0.5 text-xl font-semibold text-zinc-900 dark:text-white'>
						{title}
					</h2>
					<p className='mt-1 max-w-xl text-sm text-zinc-500 dark:text-zinc-400'>
						{description}
					</p>
				</div>
			</div>
			{actions}
		</div>
		<div className='px-6 pt-2 pb-6'>{children}</div>
	</motion.section>
);
