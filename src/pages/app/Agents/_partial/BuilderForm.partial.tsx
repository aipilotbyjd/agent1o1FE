import { AnimatePresence, motion } from 'framer-motion';
import classNames from 'classnames';
import { useNavigate } from 'react-router';
import Checkbox from '@/components/form/Checkbox';
import Label from '@/components/form/Label';
import Input from '@/components/form/Input';
import Select from '@/components/form/Select';
import Textarea from '@/components/form/Textarea';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Icon from '@/components/icon/Icon';
import { SectionCardPartial } from './SectionCard.partial';
import {
	AI_MODELS,
	TOOL_OPTIONS,
	SKILL_META,
	TRIGGER_OPTIONS,
	type TBuilderSection,
} from './Builder.constants';
import type { TAgentSkill } from '@/types/agent.type';

type BuilderFormPartialProps = {
	formik: any;
	isEditing: boolean;
	isSettingsOpen: boolean;
	selfImproveInstructions: boolean;
	setSelfImproveInstructions: (val: boolean) => void;
	enabledToolIds: string[];
	toggleTool: (id: string) => void;
	skills: TAgentSkill[];
	isLoadingSkills: boolean;
	toggleSkill: (id: string) => void;
	selectedTrigger: string;
	setSelectedTrigger: (id: string) => void;
	followUpPrompts: boolean;
	setFollowUpPrompts: (val: boolean) => void;
	addPromptRule: (rule: string) => void;
};

export const BuilderFormPartial = ({
	formik,
	isEditing,
	isSettingsOpen,
	selfImproveInstructions,
	setSelfImproveInstructions,
	enabledToolIds,
	toggleTool,
	skills,
	isLoadingSkills,
	toggleSkill,
	selectedTrigger,
	setSelectedTrigger,
	followUpPrompts,
	setFollowUpPrompts,
	addPromptRule,
}: BuilderFormPartialProps) => {
	const navigate = useNavigate();

	return (
		<form
			className={classNames('space-y-4', isSettingsOpen ? 'lg:col-span-4' : 'hidden')}
			onSubmit={formik.handleSubmit}>
			<SectionCardPartial
				id='agent-builder-basics'
				icon='Bot'
				eyebrow='Step 01'
				title={isEditing ? 'Edit agent' : 'Create agent'}
				description='Set the goal, model, and workspace access.'
				actions={
					<Checkbox
						id='agent-active'
						name='is_active'
						variant='switch'
						checked={formik.values.is_active}
						label='Active'
						description='Ready for conversations'
						onChange={formik.handleChange}
					/>
				}>
				<div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
					<div className='lg:col-span-2'>
						<Label htmlFor='name'>Agent name *</Label>
						<Input
							id='name'
							name='name'
							placeholder='Customer Support Agent'
							value={formik.values.name}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
						/>
						{formik.touched.name && formik.errors.name && (
							<p className='mt-1 text-sm text-red-500'>{formik.errors.name}</p>
						)}
					</div>
					<div>
						<Label htmlFor='model'>Model *</Label>
						<Select
							id='model'
							name='model'
							value={formik.values.model}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}>
							{AI_MODELS.map((model) => (
								<option key={model.value} value={model.value}>
									{model.label}
								</option>
							))}
						</Select>
					</div>
					<div>
						<Label htmlFor='visibility'>Visibility</Label>
						<Select
							id='visibility'
							name='visibility'
							value={formik.values.visibility}
							onChange={formik.handleChange}>
							<option value='personal'>Personal</option>
							<option value='team'>Team</option>
						</Select>
					</div>
					<div className='lg:col-span-2'>
						<Label htmlFor='description'>Description</Label>
						<Textarea
							id='description'
							name='description'
							rows={3}
							placeholder='Qualifies inbound requests, checks customer context, and drafts next steps.'
							value={formik.values.description}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
						/>
						{formik.touched.description && formik.errors.description && (
							<p className='mt-1 text-sm text-red-500'>{formik.errors.description}</p>
						)}
					</div>
					<div>
						<Label htmlFor='max_tokens'>Max tokens</Label>
						<Input
							id='max_tokens'
							name='max_tokens'
							type='number'
							value={formik.values.max_tokens}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
						/>
					</div>
					<div>
						<Label htmlFor='temperature'>
							Temperature ({formik.values.temperature})
						</Label>
						<input
							id='temperature'
							name='temperature'
							type='range'
							min={0}
							max={2}
							step={0.1}
							value={formik.values.temperature}
							onChange={formik.handleChange}
							className='accent-primary-500 mt-3 w-full'
						/>
					</div>
				</div>
			</SectionCardPartial>

			<SectionCardPartial
				id='agent-builder-instructions'
				icon='EditUser02'
				eyebrow='Step 02'
				title='Instructions'
				description='Define role, tool rules, confirmations, and response style.'
				actions={
					<Checkbox
						id='self-improve-instructions'
						variant='switch'
						checked={selfImproveInstructions}
						label='Self-improve'
						description='Refine instructions from feedback'
						onChange={(event) => setSelfImproveInstructions(event.target.checked)}
					/>
				}>
				<div className='relative'>
					<Label htmlFor='system_prompt'>System prompt *</Label>
					<div className='focus-within:border-primary-500 focus-within:ring-primary-500/20 relative overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50/50 transition-all focus-within:ring-2 dark:border-zinc-800 dark:bg-zinc-900/40'>
						<Textarea
							id='system_prompt'
							name='system_prompt'
							rows={12}
							className='border-0 bg-transparent font-mono text-sm focus:ring-0'
							value={formik.values.system_prompt}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
						/>
						<div className='flex items-center justify-between border-t border-zinc-200 bg-white/50 px-3 py-2 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/50'>
							<span className='flex items-center gap-1.5'>
								<Icon icon='Code' />
								Markdown supported
							</span>
							<span>{formik.values.system_prompt.length} chars</span>
						</div>
					</div>
					{formik.touched.system_prompt && formik.errors.system_prompt && (
						<p className='mt-1 text-sm text-red-500'>{formik.errors.system_prompt}</p>
					)}
				</div>

				<div className='mt-4'>
					<p className='mb-2 text-xs font-semibold tracking-wider text-zinc-500 uppercase'>
						Quick add
					</p>
					<div className='grid grid-cols-1 gap-2 lg:grid-cols-3'>
						<Button
							variant='outline'
							icon='UserAccount'
							className='justify-start'
							onClick={() =>
								addPromptRule(
									'Role: You are an operations assistant for the support team.',
								)
							}>
							Add role
						</Button>
						<Button
							variant='outline'
							icon='Shield'
							className='justify-start'
							onClick={() =>
								addPromptRule(
									'Safety: Always ask before sending emails, editing records, deleting data, or making irreversible changes.',
								)
							}>
							Safety rules
						</Button>
						<Button
							variant='outline'
							icon='ListView'
							className='justify-start'
							onClick={() =>
								addPromptRule(
									'Response style: Keep answers under 120 words unless the user asks for detail.',
								)
							}>
							Response style
						</Button>
					</div>
				</div>
			</SectionCardPartial>

			<SectionCardPartial
				id='agent-builder-tools'
				icon='Tools'
				eyebrow='Step 03'
				title='Tools'
				description='Start with a small toolset and add more after testing.'
				actions={
					<Badge variant='soft' color='primary' rounded='rounded-full'>
						{enabledToolIds.length} / {TOOL_OPTIONS.length} enabled
					</Badge>
				}>
				<div className='grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3'>
					{TOOL_OPTIONS.map((tool) => {
						const isEnabled = enabledToolIds.includes(tool.id);

						return (
							<motion.button
								key={tool.id}
								type='button'
								whileHover={{ y: -2 }}
								whileTap={{ scale: 0.98 }}
								className={classNames(
									'group relative min-h-36 overflow-hidden rounded-xl border p-4 text-left transition-all',
									isEnabled
										? 'border-primary-500 bg-gradient-to-br from-primary-50 to-white shadow-md shadow-primary-500/10 dark:from-primary-900/20 dark:to-zinc-950'
										: 'border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700',
								)}
								onClick={() => toggleTool(tool.id)}>
								<AnimatePresence>
									{isEnabled && (
										<motion.span
											initial={{ scale: 0, opacity: 0 }}
											animate={{ scale: 1, opacity: 1 }}
											exit={{ scale: 0, opacity: 0 }}
											className='bg-primary-500 absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full text-white shadow-md shadow-primary-500/30'>
											<Icon icon='Tick01' size='text-sm' />
										</motion.span>
									)}
								</AnimatePresence>
								<div
									className={classNames(
										'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 transition-colors',
										isEnabled
											? 'bg-white shadow-sm ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-700'
											: 'bg-zinc-50 ring-zinc-200 group-hover:bg-white dark:bg-zinc-900 dark:ring-zinc-800',
									)}>
									<Icon icon={tool.icon} color={tool.color} size='text-xl' />
								</div>
								<p className='mt-3 font-semibold text-zinc-900 dark:text-white'>
									{tool.name}
								</p>
								<p className='mt-1 line-clamp-2 text-sm text-zinc-500'>
									{tool.description}
								</p>
								<p className='mt-3 text-[10px] font-semibold tracking-widest text-zinc-400 uppercase'>
									{tool.group.replace('-', ' ')}
								</p>
							</motion.button>
						);
					})}
				</div>
			</SectionCardPartial>

			<SectionCardPartial
				id='agent-builder-skills'
				icon='Puzzle'
				eyebrow='Step 04'
				title='Skills'
				description='Attach playbooks, scripts, workflow tools, and knowledge packs.'
				actions={
					<Button
						variant='outline'
						icon='PlusSignCircle'
						onClick={() => navigate('/app/skills')}>
						New Skill
					</Button>
				}>
				{isLoadingSkills ? (
					<div className='flex items-center gap-2 py-6 text-zinc-500'>
						<Icon icon='Loading02' className='animate-spin' />
						Loading skills...
					</div>
				) : skills.length === 0 ? (
					<div className='rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 p-8 text-center dark:border-zinc-700 dark:bg-zinc-900/20'>
						<div className='mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800'>
							<Icon icon='Tools' size='text-2xl' color='zinc' />
						</div>
						<p className='mt-3 font-semibold text-zinc-900 dark:text-white'>
							No skills available
						</p>
						<p className='mt-1 text-sm text-zinc-500'>
							Create reusable skills before attaching them here.
						</p>
					</div>
				) : (
					<div className='grid grid-cols-1 gap-3 lg:grid-cols-2'>
						{skills.map((skill) => {
							const isSelected = formik.values.selected_skill_ids.includes(skill.id);
							const meta = SKILL_META[skill.type];

							return (
								<motion.button
									key={skill.id}
									type='button'
									whileHover={{ y: -2 }}
									whileTap={{ scale: 0.98 }}
									className={classNames(
										'group relative overflow-hidden rounded-xl border p-4 text-left transition-all',
										isSelected
											? 'border-primary-500 bg-gradient-to-br from-primary-50/60 to-white shadow-md shadow-primary-500/10 dark:from-primary-900/10 dark:to-zinc-950'
											: 'border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700',
									)}
									onClick={() => toggleSkill(skill.id)}>
									<div className='flex items-start justify-between gap-3'>
										<div className='flex items-center gap-3'>
											<div className='flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800'>
												<Icon
													icon={meta.icon}
													color={meta.color}
													size='text-xl'
												/>
											</div>
											<div>
												<p className='font-semibold text-zinc-900 dark:text-white'>
													{skill.name}
												</p>
												<p className='text-[10px] font-semibold tracking-widest text-zinc-400 uppercase'>
													{skill.type.replace('_', ' ')}
												</p>
											</div>
										</div>
										<Badge
											variant={isSelected ? 'soft' : 'outline'}
											color={isSelected ? 'emerald' : 'zinc'}
											rounded='rounded-full'>
											{isSelected ? (
												<span className='flex items-center gap-1'>
													<Icon icon='Tick01' size='text-sm' />
													Attached
												</span>
											) : (
												'Add'
											)}
										</Badge>
									</div>
									<p className='mt-3 line-clamp-2 text-sm text-zinc-500'>
										{skill.description || 'No description'}
									</p>
								</motion.button>
							);
						})}
					</div>
				)}
			</SectionCardPartial>

			<SectionCardPartial
				id='agent-builder-triggers'
				icon='Flash'
				eyebrow='Step 05'
				title='Triggers'
				description='Choose how the agent starts work.'>
				<div className='grid grid-cols-1 gap-3 lg:grid-cols-3'>
					{TRIGGER_OPTIONS.map((trigger) => {
						const isSelected = selectedTrigger === trigger.id;
						return (
							<motion.button
								key={trigger.id}
								type='button'
								whileHover={{ y: -2 }}
								whileTap={{ scale: 0.98 }}
								className={classNames(
									'relative min-h-32 overflow-hidden rounded-xl border p-4 text-left transition-all',
									isSelected
										? 'border-primary-500 bg-gradient-to-br from-primary-50 to-white shadow-md shadow-primary-500/10 dark:from-primary-900/20 dark:to-zinc-950'
										: 'border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700',
								)}
								onClick={() => setSelectedTrigger(trigger.id)}>
								<div
									className={classNames(
										'flex h-11 w-11 items-center justify-center rounded-xl transition-colors',
										isSelected
											? 'bg-primary-500/10 text-primary-600'
											: 'bg-zinc-100 dark:bg-zinc-900',
									)}>
									<Icon icon={trigger.icon} color='primary' size='text-2xl' />
								</div>
								<p className='mt-3 font-semibold text-zinc-900 dark:text-white'>
									{trigger.name}
								</p>
								<p className='mt-1 text-sm text-zinc-500'>{trigger.description}</p>
								{isSelected && (
									<motion.span
										layoutId='trigger-indicator'
										className='bg-primary-500 absolute right-3 bottom-3 flex h-6 w-6 items-center justify-center rounded-full text-white'>
										<Icon icon='Tick01' size='text-sm' />
									</motion.span>
								)}
							</motion.button>
						);
					})}
				</div>
				<div className='mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/30'>
					<div className='flex items-center gap-3'>
						<div className='flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800'>
							<Icon icon='Sparkles' color='amber' />
						</div>
						<div>
							<p className='font-semibold text-zinc-900 dark:text-white'>
								Follow-up prompts
							</p>
							<p className='text-sm text-zinc-500'>
								Suggest useful next prompts after each response.
							</p>
						</div>
					</div>
					<Checkbox
						id='follow-up-prompts'
						variant='switch'
						checked={followUpPrompts}
						onChange={(event) => setFollowUpPrompts(event.target.checked)}
					/>
				</div>
			</SectionCardPartial>
		</form>
	);
};
