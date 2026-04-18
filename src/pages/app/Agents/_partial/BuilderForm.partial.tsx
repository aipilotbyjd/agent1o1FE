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
	activeSection: TBuilderSection;
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
	activeSection,
	selfImproveInstructions,
	setSelfImproveInstructions,
	enabledToolIds,
	toggleTool,
	skills,
	toggleSkill,
	selectedTrigger,
	setSelectedTrigger,
	followUpPrompts,
	setFollowUpPrompts,
	addPromptRule,
}: BuilderFormPartialProps) => {
	const navigate = useNavigate();

	const renderBasics = () => (
		<div className='space-y-4'>
			<div className='rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50'>
				<div className='mb-5 flex items-center justify-between'>
					<div>
						<h2 className='text-base font-semibold text-zinc-900 dark:text-white'>Identity & Model</h2>
						<p className='text-xs text-zinc-500'>Define how your agent identifies and the engine powering it</p>
					</div>
					<Checkbox
						id='agent-active'
						name='is_active'
						variant='switch'
						checked={formik.values.is_active}
						label='Active'
						onChange={formik.handleChange}
					/>
				</div>
				<div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
					<div className='lg:col-span-2'>
						<Label htmlFor='name'>Agent Name</Label>
						<Input
							id='name'
							name='name'
							dimension='lg'
							placeholder='e.g. Data Extraction Specialist'
							value={formik.values.name}
							onChange={formik.handleChange}
						/>
					</div>
					<div className='lg:col-span-2'>
						<Label htmlFor='description'>Internal Description</Label>
						<Textarea
							id='description'
							name='description'
							rows={2}
							placeholder='What is the primary purpose of this agent?'
							value={formik.values.description}
							onChange={formik.handleChange}
						/>
					</div>
					<div>
						<Label htmlFor='model'>Language Model</Label>
						<Select id='model' name='model' value={formik.values.model} onChange={formik.handleChange}>
							{AI_MODELS.map((model) => (
								<option key={model.value} value={model.value}>
									{model.label}
								</option>
							))}
						</Select>
					</div>
					<div>
						<Label htmlFor='visibility'>Workspace Visibility</Label>
						<Select id='visibility' name='visibility' value={formik.values.visibility} onChange={formik.handleChange}>
							<option value='personal'>Private (Just me)</option>
							<option value='team'>Team (Shared workspace)</option>
						</Select>
					</div>
				</div>
			</div>

			<div className='rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50'>
				<h2 className='mb-4 text-base font-semibold text-zinc-900 dark:text-white'>Hyperparameters</h2>
				<div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
					<div>
						<div className='mb-2 flex items-center justify-between'>
							<Label htmlFor='temperature' className='mb-0'>Temperature</Label>
							<span className='text-xs font-mono font-semibold text-primary-400'>{formik.values.temperature}</span>
						</div>
						<input
							id='temperature'
							type='range'
							name='temperature'
							min={0}
							max={2}
							step={0.1}
							value={formik.values.temperature}
							onChange={formik.handleChange}
							className='h-2 w-full cursor-pointer appearance-none rounded-lg bg-zinc-200 accent-primary-500 dark:bg-zinc-800'
						/>
						<div className='mt-2 flex justify-between text-[10px] text-zinc-500 uppercase'>
							<span>Precise</span>
							<span>Creative</span>
						</div>
					</div>
					<div>
						<Label htmlFor='max_tokens'>Max Response Tokens</Label>
						<Input
							id='max_tokens'
							name='max_tokens'
							type='number'
							value={formik.values.max_tokens}
							onChange={formik.handleChange}
						/>
					</div>
				</div>
			</div>
		</div>
	);

	const renderInstructions = () => (
		<div className='flex h-full flex-col gap-4'>
			<div className='flex-1 flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/50'>
				<div className='flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800'>
					<div>
						<h2 className='text-base font-semibold text-zinc-900 dark:text-white'>System Instructions</h2>
						<p className='text-xs text-zinc-500'>Define your agent's behavior and personality</p>
					</div>
					<Checkbox
						id='self-improve-instructions'
						variant='switch'
						checked={selfImproveInstructions}
						label='Auto-Optimize'
						onChange={(event) => setSelfImproveInstructions(event.target.checked)}
					/>
				</div>
				<div className='relative flex-1 bg-zinc-50/50 dark:bg-zinc-950/50'>
					<Textarea
						id='system_prompt'
						name='system_prompt'
						className='h-full min-h-[500px] resize-none border-0 bg-transparent p-5 text-sm leading-relaxed text-zinc-900 placeholder:text-zinc-600 focus:ring-0 focus:outline-none dark:text-zinc-200 dark:placeholder:text-zinc-400'
						value={formik.values.system_prompt}
						onChange={formik.handleChange}
						placeholder='Enter detailed instructions here...

Example:
You are an expert AI assistant specialized in data analysis. Your role is to:
- Analyze data patterns and provide insights
- Communicate findings clearly and concisely
- Ask clarifying questions when needed'
					/>
					<div className='absolute bottom-4 right-5 flex items-center gap-3 rounded-lg border border-zinc-200 bg-white/90 px-3 py-2 text-xs text-zinc-500 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/90'>
						<span className='flex items-center gap-1.5'>
							<Icon icon='Code' size='text-xs' /> 
							<span>Markdown</span>
						</span>
						<span className='h-3 w-px bg-zinc-200 dark:bg-zinc-700'></span>
						<span>{formik.values.system_prompt.length} chars</span>
					</div>
				</div>
			</div>

			<div className='rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/30'>
				<p className='mb-3 text-xs font-medium text-zinc-500'>Quick Templates</p>
				<div className='grid grid-cols-1 gap-2 sm:grid-cols-3'>
					{[
						{ label: 'Role Definition', icon: 'UserAccount', rule: 'Role: You are an expert analyst...' },
						{ label: 'Safety Guardrails', icon: 'Shield', rule: 'Safety: Never share credentials...' },
						{ label: 'Tone of Voice', icon: 'ListView', rule: 'Tone: Professional yet concise...' },
					].map((lib) => (
						<button
							key={lib.label}
							type='button'
							onClick={() => addPromptRule(lib.rule)}
							className='flex items-center gap-2 rounded-lg border border-zinc-200 bg-white p-3 text-left transition-colors hover:border-primary-500/50 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-primary-500/50 dark:hover:bg-zinc-900'>
							<div className='flex h-8 w-8 items-center justify-center rounded-lg border border-primary-500/20 bg-primary-500/10 text-primary-400'>
								<Icon icon={lib.icon} size='text-sm' />
							</div>
							<span className='text-xs font-medium text-zinc-700 dark:text-zinc-300'>{lib.label}</span>
						</button>
					))}
				</div>
			</div>
		</div>
	);

	const renderTools = () => (
		<div className='space-y-6'>
			<div>
				<div className='mb-4 flex items-center justify-between'>
					<h2 className='text-base font-semibold text-zinc-900 dark:text-white'>Available Capabilities</h2>
					<Badge variant='soft' color='primary' rounded='rounded-full'>
						{enabledToolIds.length} Active
					</Badge>
				</div>
				<div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3'>
					{TOOL_OPTIONS.map((tool) => {
						const isEnabled = enabledToolIds.includes(tool.id);
						return (
							<button
								key={tool.id}
								type='button'
								className={classNames(
									'relative flex flex-col rounded-xl border p-4 text-left transition-colors',
									isEnabled
										? 'border-primary-500/50 bg-primary-500/10'
										: 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-700'
								)}
								onClick={() => toggleTool(tool.id)}
							>
								<div className='flex items-center justify-between'>
									<div className={classNames('flex h-9 w-9 items-center justify-center rounded-lg', isEnabled ? 'bg-primary-500 text-white' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800')}>
										<Icon icon={tool.icon} size='text-lg' />
									</div>
									{isEnabled && <Icon icon='Tick01' className='text-primary-400' size='text-lg' />}
								</div>
								<p className='mt-3 text-sm font-semibold text-zinc-900 dark:text-white'>{tool.name}</p>
								<p className='mt-1 text-xs text-zinc-500 line-clamp-2'>{tool.description}</p>
							</button>
						);
					})}
				</div>
			</div>

			<div className='border-t border-zinc-200 pt-6 dark:border-zinc-800'>
				<div className='mb-4 flex items-center justify-between'>
					<h2 className='text-base font-semibold text-zinc-900 dark:text-white'>Knowledge & Skills</h2>
					<Button variant='outline' dimension='sm' icon='PlusSign' onClick={() => navigate('/app/skills')}>New Skill</Button>
				</div>
				<div className='grid grid-cols-1 gap-3 lg:grid-cols-2'>
					{skills.map((skill) => {
						const isSelected = formik.values.selected_skill_ids.includes(skill.id);
						const meta = SKILL_META[skill.type];
						return (
							<button
								key={skill.id}
								type='button'
								onClick={() => toggleSkill(skill.id)}
								className={classNames(
									'flex items-start gap-3 rounded-xl border p-3 text-left transition-colors',
									isSelected ? 'border-primary-500/50 bg-primary-500/10' : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-700'
								)}
							>
								<div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800'>
									<Icon icon={meta.icon} color={meta.color} size='text-xl' />
								</div>
								<div className='min-w-0 flex-1'>
									<div className='flex items-center justify-between'>
										<p className='truncate text-sm font-semibold text-zinc-900 dark:text-white'>{skill.name}</p>
										{isSelected && <Badge color='primary' variant='soft' rounded='rounded-full' className='ml-2'>Active</Badge>}
									</div>
									<p className='mt-0.5 text-xs text-zinc-500 line-clamp-1'>{skill.description}</p>
								</div>
							</button>
						);
					})}
				</div>
			</div>
		</div>
	);

	const renderTriggers = () => (
		<div className='space-y-4'>
			<div className='rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50'>
				<h2 className='mb-4 text-base font-semibold text-zinc-900 dark:text-white'>Activation Methods</h2>
				<div className='grid grid-cols-1 gap-3 lg:grid-cols-3'>
					{TRIGGER_OPTIONS.map((trigger) => {
						const isSelected = selectedTrigger === trigger.id;
						return (
							<button
								key={trigger.id}
								type='button'
								onClick={() => setSelectedTrigger(trigger.id)}
								className={classNames(
									'relative flex flex-col rounded-xl border p-4 text-left transition-colors',
									isSelected ? 'border-primary-500/50 bg-primary-500/10' : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-700'
								)}
							>
								<div className={classNames('mb-3 flex h-10 w-10 items-center justify-center rounded-lg', isSelected ? 'bg-primary-500 text-white' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800')}>
									<Icon icon={trigger.icon} size='text-xl' />
								</div>
								<p className='text-sm font-semibold text-zinc-900 dark:text-white'>{trigger.name}</p>
								<p className='mt-1 text-xs text-zinc-500'>{trigger.description}</p>
								{isSelected && <div className='absolute top-3 right-3 h-2 w-2 rounded-full bg-primary-500' />}
							</button>
						);
					})}
				</div>
			</div>

			<div className='rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-3'>
						<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500/10 text-primary-400 border border-primary-500/20'>
							<Icon icon='Sparkles' size='text-xl' />
						</div>
						<div>
							<h3 className='text-sm font-semibold text-zinc-900 dark:text-white'>Conversational Intelligence</h3>
							<p className='text-xs text-zinc-500'>Suggest smart follow-up actions to users</p>
						</div>
					</div>
					<Checkbox
						id='follow-up-prompts'
						variant='switch'
						checked={followUpPrompts}
						onChange={(event) => setFollowUpPrompts(event.target.checked)}
					/>
				</div>
			</div>
		</div>
	);

	return (
		<form className='h-full' onSubmit={formik.handleSubmit}>
			<AnimatePresence mode='wait'>
				<motion.div
					key={activeSection}
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -10 }}
					transition={{ duration: 0.2 }}
					className='h-full'
				>
					{activeSection === 'basics' && renderBasics()}
					{activeSection === 'instructions' && renderInstructions()}
					{activeSection === 'tools' && renderTools()}
					{activeSection === 'triggers' && renderTriggers()}
				</motion.div>
			</AnimatePresence>
		</form>
	);
};
