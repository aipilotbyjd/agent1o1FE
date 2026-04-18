import { motion } from 'framer-motion';
import Icon from '@/components/icon/Icon';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card, { CardBody } from '@/components/ui/Card';
import ChatBubbles, {
	ChatBubblesItem,
	ChatBubblesSeparate,
} from '@/components/ui/ChatBubbles';
import Textarea from '@/components/form/Textarea';
import { TOOL_OPTIONS } from './Builder.constants';

type BuilderChatProps = {
	avatarAgent: string;
	name: string;
	model: string;
	enabledToolIds: string[];
};

export const BuilderChatPartial = ({
	avatarAgent,
	name,
	model: _model,
	enabledToolIds,
}: BuilderChatProps) => {
	const agentName = name || 'Untitled Agent';
	const visibleTools = enabledToolIds
		.map((toolId) => TOOL_OPTIONS.find((tool) => tool.id === toolId))
		.filter((tool): tool is (typeof TOOL_OPTIONS)[number] => Boolean(tool))
		.slice(0, 3);

	return (
		<aside id='agent-builder-test' className='h-full min-h-0 w-full transition-all duration-300'>
			<Card className='flex h-full min-h-0 flex-col shadow-sm'>
				<CardBody className='min-h-0 flex-1 overflow-y-auto bg-zinc-50/50 pt-6 pb-6 dark:bg-zinc-950/40'>
					<div className='mx-auto flex w-full max-w-5xl flex-col gap-6'>
						<ChatBubbles isAvatar className='gap-5'>
							<ChatBubblesItem isMyContent username='You' className='pe-0 ps-10'>
								<div className='space-y-2'>
									<p className='text-[11px] font-semibold uppercase tracking-wide text-white/75'>
										User Prompt
									</p>
									<p className='text-sm leading-6'>
										Check our latest support tickets and summarize any recurring issues.
									</p>
								</div>
							</ChatBubblesItem>

							<ChatBubblesItem
								username={agentName}
								image={avatarAgent}
								footer={
									<div className='flex flex-wrap gap-2'>
										{visibleTools.map((tool) => (
											<Badge
												key={tool.id}
												color='zinc'
												variant='soft'
												rounded='rounded-full'
												className='text-[11px]'>
												<Icon icon={tool.icon} size='text-xs' />
												{tool.name}
											</Badge>
										))}
									</div>
								}>
								<div className='space-y-4'>
									<div className='flex flex-wrap items-center justify-between gap-2'>
										<div>
											<p className='text-sm font-semibold text-zinc-900 dark:text-white'>
												{agentName}
											</p>
											<p className='text-xs text-zinc-500'>
												Running a structured triage pass with enabled tools
											</p>
										</div>
										<Badge color='emerald' variant='soft' rounded='rounded-full'>
											Ready
										</Badge>
									</div>

									<p className='text-sm leading-6 text-zinc-700 dark:text-zinc-300'>
										I&apos;ll review the latest tickets, cluster similar complaints, and
										return the top recurring themes with recommended next actions.
									</p>
								</div>
							</ChatBubblesItem>

							<ChatBubblesSeparate className='text-left'>
								<div className='inline-flex items-center gap-3 rounded-full border border-zinc-500/10 bg-white px-3 py-2 dark:border-zinc-500/25 dark:bg-zinc-950'>
									<div className='flex gap-1'>
										{[0, 0.2, 0.4].map((delay) => (
											<motion.span
												key={delay}
												className='h-2 w-2 rounded-full bg-primary-500'
												animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }}
												transition={{ duration: 1.2, repeat: Infinity, delay }}
											/>
										))}
									</div>
									<span className='text-xs font-medium uppercase tracking-wide text-primary-500'>
										Thinking
									</span>
								</div>
							</ChatBubblesSeparate>
						</ChatBubbles>
					</div>
				</CardBody>

				<div className='sticky bottom-0 z-10 mt-auto border-t border-zinc-500/10 bg-zinc-50/90 px-4 py-4 backdrop-blur-sm dark:border-zinc-500/25 dark:bg-zinc-950/85 md:px-6 md:py-5'>
					<div className='mx-auto flex w-full max-w-5xl flex-col gap-3'>
						<div className='flex flex-wrap items-center gap-2'>
							<Badge color='zinc' variant='soft' rounded='rounded-full'>
								Test Prompt
							</Badge>
							<Badge color='primary' variant='soft' rounded='rounded-full'>
								Smart compose enabled
							</Badge>
						</div>

						<div className='rounded-2xl border border-zinc-500/10 bg-white p-4 shadow-sm dark:border-zinc-500/25 dark:bg-zinc-950'>
							<Textarea
								name='test-message'
								placeholder='Describe a realistic task to evaluate this agent...'
								className='min-h-[120px] max-h-[220px] resize-none border-0 bg-transparent p-0 text-sm leading-7 text-zinc-800 placeholder:text-zinc-400 focus:ring-0 focus:outline-none dark:text-zinc-200 dark:placeholder:text-zinc-600'
							/>

							<div className='mt-4 flex flex-col gap-3 border-t border-zinc-500/10 pt-4 dark:border-zinc-500/25 lg:flex-row lg:items-center lg:justify-between'>
								<div className='flex flex-wrap items-center gap-2'>
									<Button variant='outline' color='zinc' dimension='sm' icon='Attachment'>
										Attach Context
									</Button>
									<Button variant='soft' color='zinc' dimension='sm' icon='Message02'>
										Use Sample Prompt
									</Button>
								</div>

								<div className='flex flex-wrap items-center gap-3 lg:justify-end'>
									<p className='text-xs text-zinc-500'>
										Test the current instructions and tool configuration in real-time.
									</p>
									<Button variant='solid' color='primary' dimension='sm' rightIcon='Sent'>
										Send Prompt
									</Button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</Card>
		</aside>
	);
};
