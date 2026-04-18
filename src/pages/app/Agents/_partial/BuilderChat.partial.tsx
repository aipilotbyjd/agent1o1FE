import classNames from 'classnames';
import { motion } from 'framer-motion';
import Icon from '@/components/icon/Icon';
import Badge from '@/components/ui/Badge';
import FieldWrap from '@/components/form/FieldWrap';
import Input from '@/components/form/Input';
import { TOOL_OPTIONS, type TBuilderSection } from './Builder.constants';

type BuilderChatProps = {
	avatarAgent: string;
	avatarUser: string;
	name: string;
	model: string;
	enabledToolIds: string[];
	selectedSkillsCount: number;
	isSettingsOpen: boolean;
	jumpToSection: (section: TBuilderSection) => void;
};

export const BuilderChatPartial = ({
	avatarAgent,
	avatarUser,
	name,
	model,
	enabledToolIds,
	selectedSkillsCount,
	isSettingsOpen,
	jumpToSection,
}: BuilderChatProps) => {
	return (
		<aside
			id='agent-builder-test'
			className={classNames(
				'lg:sticky lg:top-4 lg:h-fit transition-all duration-300',
				isSettingsOpen ? 'lg:col-span-8' : 'mx-auto w-full max-w-7xl',
			)}>
			<div className='overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/80 shadow-sm ring-1 ring-black/[0.02] backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80 dark:ring-white/[0.02]'>
				<div className='from-primary-500/5 via-primary-500/5 relative overflow-hidden border-b border-zinc-200 bg-gradient-to-br to-transparent p-4 dark:border-zinc-800'>
					<div className='flex items-center gap-3'>
						<div className='relative'>
							<img
								src={avatarAgent}
								alt='Agent avatar'
								className='h-12 w-12 rounded-xl object-cover ring-2 ring-white dark:ring-zinc-900'
							/>
							<span className='absolute -right-0.5 -bottom-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-950' />
						</div>
						<div className='min-w-0 flex-1'>
							<p className='truncate font-semibold text-zinc-900 dark:text-white'>
								{name || 'Untitled agent'}
							</p>
							<div className='mt-0.5 flex items-center gap-2 text-xs text-zinc-500'>
								<span className='bg-primary-500 h-1.5 w-1.5 rounded-full' />
								<span>Online</span>
								<span>·</span>
								<span>{model}</span>
							</div>
						</div>
						<button
							type='button'
							className='flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900'>
							<Icon icon='MoreHorizontal' />
						</button>
					</div>
					<div className='mt-3 flex flex-wrap gap-1.5'>
						<span className='flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-zinc-600 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-800'>
							<Icon icon='Tools' size='text-xs' color='primary' />
							{enabledToolIds.length} tools
						</span>
						<span className='flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-zinc-600 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-800'>
							<Icon icon='Puzzle' size='text-xs' color='violet' />
							{selectedSkillsCount} skills
						</span>
					</div>
				</div>
				<div className={classNames('space-y-4 p-4', !isSettingsOpen && 'min-h-[500px]')}>
					<div className='flex items-start gap-3'>
						<img
							src={avatarUser}
							alt='User avatar'
							className='h-8 w-8 rounded-lg object-cover'
						/>
						<div className='max-w-[85%] rounded-2xl rounded-tl-md bg-zinc-100 px-3.5 py-2.5 text-sm text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200'>
							Review ticket 4821 and tell me whether we should offer a discount.
						</div>
					</div>
					<div className='flex items-start gap-3'>
						<div className='from-primary-500 to-secondary-500 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm'>
							<Icon icon='Bot' />
						</div>
						<div className='max-w-[85%] rounded-2xl rounded-tl-md border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200'>
							I will check the ticket, retrieve customer context, read the discount
							policy, and ask before sending any external message.
							<div className='mt-3 flex flex-wrap gap-1.5'>
								{enabledToolIds.slice(0, 3).map((toolId) => {
									const tool = TOOL_OPTIONS.find(
										(option) => option.id === toolId,
									);
									if (!tool) return null;

									return (
										<Badge
											key={tool.id}
											variant='soft'
											color={tool.color}
											rounded='rounded-full'>
											<span className='flex items-center gap-1'>
												<Icon icon={tool.icon} size='text-xs' />
												{tool.name}
											</span>
										</Badge>
									);
								})}
							</div>
						</div>
					</div>
					<div className='flex items-center gap-2 pl-11'>
						<span className='flex gap-1'>
							<motion.span
								className='bg-primary-500 h-1.5 w-1.5 rounded-full'
								animate={{ opacity: [0.3, 1, 0.3] }}
								transition={{
									duration: 1.2,
									repeat: Infinity,
									delay: 0,
								}}
							/>
							<motion.span
								className='bg-primary-500 h-1.5 w-1.5 rounded-full'
								animate={{ opacity: [0.3, 1, 0.3] }}
								transition={{
									duration: 1.2,
									repeat: Infinity,
									delay: 0.2,
								}}
							/>
							<motion.span
								className='bg-primary-500 h-1.5 w-1.5 rounded-full'
								animate={{ opacity: [0.3, 1, 0.3] }}
								transition={{
									duration: 1.2,
									repeat: Infinity,
									delay: 0.4,
								}}
							/>
						</span>
						<span className='text-xs text-zinc-500'>Agent is thinking...</span>
					</div>
				</div>
				<div className='border-t border-zinc-200 p-3 dark:border-zinc-800'>
					<FieldWrap lastSuffix={<Icon icon='Sent' color='primary' />}>
						<Input
							name='test-message'
							placeholder='Test a request...'
							value=''
							readOnly
							onFocus={() => jumpToSection('test')}
						/>
					</FieldWrap>
				</div>
			</div>
		</aside>
	);
};
