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
}: BuilderChatProps) => {
	return (
		<aside
			id='agent-builder-test'
			className={classNames(
				'h-full transition-all duration-300',
				isSettingsOpen ? 'w-full' : 'mx-auto w-full max-w-7xl',
			)}>
			<div className='flex h-full flex-col overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-xl ring-1 ring-black/[0.02] dark:border-zinc-800 dark:bg-zinc-950 dark:ring-white/[0.02]'>
				{/* Header */}
				<div className='border-b border-zinc-100 bg-zinc-50/50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50'>
					<div className='flex items-center gap-4'>
						<div className='relative shrink-0'>
							<img
								src={avatarAgent}
								alt='Agent avatar'
								className='h-14 w-14 rounded-2xl object-cover ring-4 ring-white shadow-sm dark:ring-zinc-900'
							/>
							<span className='absolute -right-1 -bottom-1 h-4 w-4 rounded-full bg-emerald-500 border-4 border-white dark:border-zinc-950' />
						</div>
						<div className='min-w-0 flex-1'>
							<div className='flex items-center gap-2'>
								<h3 className='truncate text-lg font-bold text-zinc-900 dark:text-white'>
									{name || 'Untitled Agent'}
								</h3>
								<Badge color='emerald' variant='soft' rounded='rounded-full' className='px-2 py-0 text-[10px]'>Live Preview</Badge>
							</div>
							<div className='mt-1 flex items-center gap-3 text-xs text-zinc-500 font-medium'>
								<span className='flex items-center gap-1'>
									<Icon icon='Cpu' size='text-xs' /> {model}
								</span>
								<span>•</span>
								<span className='flex items-center gap-1'>
									<Icon icon='Tools' size='text-xs' /> {enabledToolIds.length} Tools
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* Chat Area */}
				<div className='flex-1 overflow-y-auto bg-white p-8 dark:bg-zinc-950 space-y-8'>
					<div className='flex items-start gap-4'>
						<div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400'>
							<Icon icon='User' size='text-xl' />
						</div>
						<div className='max-w-[85%] rounded-2xl rounded-tl-none bg-zinc-100 px-5 py-3.5 text-sm text-zinc-700 leading-relaxed shadow-sm dark:bg-zinc-900 dark:text-zinc-200'>
							Check our latest support tickets and summarize any recurring issues.
						</div>
					</div>

					<div className='flex items-start gap-4'>
						<div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-500 text-white shadow-lg shadow-primary-500/20'>
							<Icon icon='Bot' size='text-xl' />
						</div>
						<div className='max-w-[85%] rounded-2xl rounded-tl-none border border-zinc-100 bg-white px-5 py-3.5 text-sm text-zinc-700 leading-relaxed shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200'>
							I'll start by retrieving the tickets from the database.
							<div className='mt-4 flex flex-wrap gap-2'>
								{enabledToolIds.slice(0, 2).map((toolId) => {
									const tool = TOOL_OPTIONS.find((t) => t.id === toolId);
									if (!tool) return null;
									return (
										<div key={tool.id} className='flex items-center gap-2 rounded-lg bg-zinc-50 px-2.5 py-1.5 text-[10px] font-bold text-zinc-600 ring-1 ring-zinc-100 dark:bg-zinc-900 dark:text-zinc-400 dark:ring-zinc-800'>
											<Icon icon={tool.icon} size='text-xs' className='text-primary-500' />
											{tool.name}
										</div>
									);
								})}
							</div>
						</div>
					</div>

					<div className='flex items-center gap-3 pl-14'>
						<div className='flex gap-1.5'>
							{[0, 0.2, 0.4].map((delay) => (
								<motion.span
									key={delay}
									className='h-1.5 w-1.5 rounded-full bg-primary-500'
									animate={{ opacity: [0.3, 1, 0.3] }}
									transition={{ duration: 1.2, repeat: Infinity, delay }}
								/>
							))}
						</div>
						<span className='text-[10px] font-bold uppercase tracking-widest text-zinc-400'>Thinking...</span>
					</div>
				</div>

				{/* Input Area */}
				<div className='p-6 bg-zinc-50/50 border-t border-zinc-100 dark:bg-zinc-900/50 dark:border-zinc-800'>
					<div className='relative group'>
						<div className='absolute inset-0 bg-primary-500/5 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity' />
						<div className='relative flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-500/10 dark:border-zinc-800 dark:bg-zinc-950'>
							<button className='p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'>
								<Icon icon='Attachment' />
							</button>
							<Input
								name='test-message'
								placeholder='Test your agent...'
								className='border-0 bg-transparent focus:ring-0 text-sm'
								readOnly
							/>
							<button className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400 dark:bg-zinc-900'>
								<Icon icon='Sent' />
							</button>
						</div>
					</div>
					<p className='mt-3 text-center text-[10px] font-medium text-zinc-400'>
						Test the current instructions and tool configuration in real-time.
					</p>
				</div>
			</div>
		</aside>
	);
};
