import classNames from 'classnames';
import { motion } from 'framer-motion';
import Icon from '@/components/icon/Icon';
import Badge from '@/components/ui/Badge';
import FieldWrap from '@/components/form/FieldWrap';
import Textarea from '@/components/form/Textarea';
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
			<div className='flex h-full flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm'>
				{/* Header */}
				<div className='border-b border-zinc-800 bg-zinc-900/80 p-5'>
					<div className='flex items-center gap-3'>
						<div className='relative shrink-0'>
							<img
								src={avatarAgent}
								alt='Agent avatar'
								className='h-12 w-12 rounded-xl object-cover ring-2 ring-zinc-800'
							/>
							<span className='absolute -right-1 -bottom-1 h-3.5 w-3.5 rounded-full bg-primary-500 border-2 border-zinc-900' />
						</div>
						<div className='min-w-0 flex-1'>
							<div className='flex items-center gap-2'>
								<h3 className='truncate text-base font-semibold text-white'>
									{name || 'Untitled Agent'}
								</h3>
								<Badge color='primary' variant='soft' rounded='rounded-full' className='px-2 py-0 text-[10px]'>Preview</Badge>
							</div>
							<div className='mt-1 flex items-center gap-2 text-xs text-zinc-500'>
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
				<div className='flex-1 overflow-y-auto bg-zinc-950/50 p-6 space-y-6'>
					<div className='flex items-start gap-3'>
						<div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400'>
							<Icon icon='User' size='text-lg' />
						</div>
						<div className='max-w-[80%] rounded-xl rounded-tl-sm bg-zinc-800/80 px-4 py-2.5 text-sm text-zinc-200 leading-relaxed'>
							Check our latest support tickets and summarize any recurring issues.
						</div>
					</div>

					<div className='flex items-start gap-3'>
						<div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-500 text-white'>
							<Icon icon='Bot' size='text-lg' />
						</div>
						<div className='max-w-[80%] rounded-xl rounded-tl-sm border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-sm text-zinc-200 leading-relaxed'>
							I'll start by retrieving the tickets from the database.
							<div className='mt-3 flex flex-wrap gap-2'>
								{enabledToolIds.slice(0, 2).map((toolId) => {
									const tool = TOOL_OPTIONS.find((t) => t.id === toolId);
									if (!tool) return null;
									return (
										<div key={tool.id} className='flex items-center gap-1.5 rounded-md bg-zinc-800 px-2 py-1 text-[10px] font-medium text-zinc-400'>
											<Icon icon={tool.icon} size='text-xs' className='text-primary-400' />
											{tool.name}
										</div>
									);
								})}
							</div>
						</div>
					</div>

					<div className='flex items-center gap-2 pl-12'>
						<div className='flex gap-1'>
							{[0, 0.2, 0.4].map((delay) => (
								<motion.span
									key={delay}
									className='h-1.5 w-1.5 rounded-full bg-primary-500'
									animate={{ opacity: [0.3, 1, 0.3] }}
									transition={{ duration: 1.2, repeat: Infinity, delay }}
								/>
							))}
						</div>
						<span className='text-[10px] font-medium uppercase tracking-wider text-primary-400'>Thinking...</span>
					</div>
				</div>

				{/* Input Area */}
				<div className='border-t border-zinc-800 bg-zinc-900/50 p-4'>
					<div className='flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-950/50 p-3 focus-within:border-primary-500/50 focus-within:bg-zinc-950 transition-all'>
						<Textarea
							name='test-message'
							placeholder='Test your agent with a detailed prompt...'
							className='min-h-[100px] max-h-[200px] resize-none border-0 bg-transparent p-0 text-sm text-zinc-200 placeholder:text-zinc-600 focus:ring-0 focus:outline-none'
							readOnly
						/>
						<div className='flex items-center justify-between border-t border-zinc-800/50 pt-3'>
							<button className='flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-400 transition-colors'>
								<Icon icon='Attachment' size='text-sm' />
								<span>Attach</span>
							</button>
							<button className='flex items-center gap-1.5 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors'>
								<span>Send</span>
								<Icon icon='Sent' size='text-sm' />
							</button>
						</div>
					</div>
					<p className='mt-2 text-center text-xs text-zinc-600'>
						Test the current instructions and tool configuration in real-time.
					</p>
				</div>
			</div>
		</aside>
	);
};
