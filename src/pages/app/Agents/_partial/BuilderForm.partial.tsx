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
	isEditing,
	activeSection,
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

	const renderBasics = () => (
		<div className='space-y-6'>
			<div className='rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm'>
				<div className='mb-6 flex items-center justify-between'>
					<div>
						<h2 className='text-lg font-bold text-white'>Identity & Model</h2>
						<p className='text-sm text-zinc-400'>Define how your agent identifies and the engine powering it.</p>
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
				<div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
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

			<div className='rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm'>
				<h2 className='mb-4 text-lg font-bold text-white'>Hyperparameters</h2>
				<div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
					<div>
						<div className='mb-2 flex items-center justify-between'>
							<Label className='mb-0'>Temperature</Label>
							<span className='text-xs font-mono font-bold text-emerald-400'>{formik.values.temperature}</span>
						</div>
						<input
							type='range'
							name='temperature'
							min={0}
							max={2}
							step={0.1}
							value={formik.values.temperature}
							onChange={formik.handleChange}
							className='h-2 w-full cursor-pointer appearance-none rounded-lg bg-zinc-800 accent-emerald-500'
						/>
						<div className='mt-2 flex justify-between text-[10px] text-zinc-400 uppercase tracking-tighter'>
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
			<div className='flex-1 rounded-2xl border border-zinc-800 bg-zinc-900/50 flex flex-col overflow-hidden backdrop-blur-sm'>
				<div className='flex items-center justify-between border-b border-zinc-800 px-6 py-4'>
					<div>
						<h2 className='text-lg font-bold text-white'>System Instructions</h2>
						<p className='text-sm text-zinc-400'>The "brain" of your agent. Define logic, persona, and constraints.</p>
					</div>
					<Checkbox
						id='self-improve-instructions'
						variant='switch'
						checked={selfImproveInstructions}
						label='Auto-Optimize'
						onChange={(event) => setSelfImproveInstructions(event.target.checked)}
					/>
				</div>
				<div className='relative flex-1 bg-zinc-950/50'>
					<Textarea
						id='system_prompt'
						name='system_prompt'
						className='h-full min-h-[400px] border-0 bg-transparent p-6 font-mono text-sm leading-relaxed text-zinc-300 focus:ring-0 placeholder:text-zinc-600'
						value={formik.values.system_prompt}
						onChange={formik.handleChange}
						placeholder='Enter detailed instructions here...'
					/>
					<div className='absolute bottom-4 right-6 flex items-center gap-4 rounded-full bg-zinc-900/90 px-4 py-2 text-[10px] font-bold text-zinc-400 shadow-sm backdrop-blur-sm border border-zinc-800'>
						<span className='flex items-center gap-1'>
							<Icon icon='Code' size='text-xs' /> Markdown
						</span>
						<span>{formik.values.system_prompt.length} Characters</span>
					</div>
				</div>
			</div>

			<div className='rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 backdrop-blur-sm'>
				<p className='mb-4 text-xs font-bold uppercase tracking-widest text-zinc-500'>Instruction Libraries</p>
				<div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
					{[
						{ label: 'Role Definition', icon: 'UserAccount', rule: 'Role: You are an expert analyst...' },
						{ label: 'Safety Guardrails', icon: 'Shield', rule: 'Safety: Never share credentials...' },
						{ label: 'Tone of Voice', icon: 'ListView', rule: 'Tone: Professional yet concise...' },
					].map((lib) => (
						<button
							key={lib.label}
							type='button'
							onClick={() => addPromptRule(lib.rule)}
							className='flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-left transition-all hover:border-emerald-500 hover:shadow-md hover:bg-zinc-900/80'>
							<div className='flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'>
								<Icon icon={lib.icon} size='text-sm' />
							</div>
							<span className='text-xs font-semibold text-zinc-300'>{lib.label}</span>
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
					<h2 className='text-lg font-bold text-white'>Available Capabilities</h2>
					<Badge variant='soft' color='emerald' rounded='rounded-full'>
						{enabledToolIds.length} Tools Active
					</Badge>
				</div>
				<div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
					{TOOL_OPTIONS.map((tool) => {
						const isEnabled = enabledToolIds.includes(tool.id);
						return (
							<motion.button
								key={tool.id}
								type='button'
								whileHover={{ y: -2 }}
								className={classNames(
									'relative flex flex-col rounded-2xl border p-5 text-left transition-all',
									isEnabled
										? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/20'
										: 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
								)}
								onClick={() => toggleTool(tool.id)}
							>
								<div className='flex items-center justify-between'>
									<div className={classNames('flex h-10 w-10 items-center justify-center rounded-xl shadow-sm ring-1 ring-zinc-800', isEnabled ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-500')}>
										<Icon icon={tool.icon} size='text-xl' />
									</div>
									{isEnabled && <Icon icon='Tick01' className='text-emerald-400' />}
								</div>
								<p className='mt-4 font-bold text-white'>{tool.name}</p>
								<p className='mt-1 text-xs text-zinc-400 line-clamp-2'>{tool.description}</p>
							</motion.button>
						);
					})}
				</div>
			</div>

			<div className='border-t border-zinc-800 pt-8'>
				<div className='mb-4 flex items-center justify-between'>
					<h2 className='text-lg font-bold text-white'>Knowledge & Skills</h2>
					<Button variant='outline' dimension='sm' icon='PlusSign' onClick={() => navigate('/app/skills')}>New Skill</Button>
				</div>
				<div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
					{skills.map((skill) => {
						const isSelected = formik.values.selected_skill_ids.includes(skill.id);
						const meta = SKILL_META[skill.type];
						return (
							<button
								key={skill.id}
								type='button'
								onClick={() => toggleSkill(skill.id)}
								className={classNames(
									'flex items-start gap-4 rounded-2xl border p-4 text-left transition-all',
									isSelected ? 'border-emerald-500 bg-emerald-500/10' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
								)}
							>
								<div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-800 shadow-sm ring-1 ring-zinc-800'>
									<Icon icon={meta.icon} color={meta.color} size='text-2xl' />
								</div>
								<div className='min-w-0 flex-1'>
									<div className='flex items-center justify-between'>
										<p className='font-bold text-white truncate'>{skill.name}</p>
										{isSelected && <Badge color='emerald' variant='soft' rounded='rounded-full'>Enabled</Badge>}
									</div>
									<p className='mt-1 text-xs text-zinc-400 line-clamp-1'>{skill.description}</p>
								</div>
							</button>
						);
					})}
				</div>
			</div>
		</div>
	);

	const renderTriggers = () => (
		<div className='space-y-6'>
			<div className='rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm'>
				<h2 className='mb-6 text-lg font-bold text-white'>Activation Methods</h2>
				<div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
					{TRIGGER_OPTIONS.map((trigger) => {
						const isSelected = selectedTrigger === trigger.id;
						return (
							<button
								key={trigger.id}
								type='button'
								onClick={() => setSelectedTrigger(trigger.id)}
								className={classNames(
									'relative flex flex-col rounded-2xl border p-6 text-left transition-all',
									isSelected ? 'border-emerald-500 bg-emerald-500/10 shadow-sm' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
								)}
							>
								<div className={classNames('flex h-12 w-12 items-center justify-center rounded-xl mb-4', isSelected ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-500')}>
									<Icon icon={trigger.icon} size='text-2xl' />
								</div>
								<p className='font-bold text-white'>{trigger.name}</p>
								<p className='mt-1 text-xs text-zinc-400'>{trigger.description}</p>
								{isSelected && <div className='absolute top-4 right-4 h-2 w-2 rounded-full bg-emerald-500 animate-pulse' />}
							</button>
						);
					})}
				</div>
			</div>

			<div className='rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-4'>
						<div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'>
							<Icon icon='Sparkles' size='text-2xl' />
						</div>
						<div>
							<h3 className='font-bold text-white'>Conversational Intelligence</h3>
							<p className='text-sm text-zinc-400'>Suggest smart follow-up actions to users.</p>
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
