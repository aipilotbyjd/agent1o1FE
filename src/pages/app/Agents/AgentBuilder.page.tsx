import { useMemo, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import classNames from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router';

import {
	useAttachAgentSkill,
	useCreateAgent,
	useDetachAgentSkill,
	useFetchAgent,
	useFetchAgentSkills,
	useUpdateAgent,
} from '@/api/hooks/useAgents';
import avatarAgent from '@/assets/avatar/avatar6.png';
import avatarUser from '@/assets/avatar/avatar2.png';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Checkbox from '@/components/form/Checkbox';
import Container from '@/components/layout/Container';
import FieldWrap from '@/components/form/FieldWrap';
import Icon from '@/components/icon/Icon';
import Input from '@/components/form/Input';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import Subheader, {
	SubheaderLeft,
	SubheaderRight,
	SubheaderSeparator,
} from '@/components/layout/Subheader';
import Textarea from '@/components/form/Textarea';
import { useCurrentWorkspaceId } from '@/context/workspaceContext';
import type { TAgent, TAgentSkill } from '@/types/agent.type';
import type { TColors } from '@/types/colors.type';

type TAgentBuilderForm = {
	name: string;
	description: string;
	model: string;
	system_prompt: string;
	temperature: number;
	max_tokens: number;
	is_active: boolean;
	visibility: 'personal' | 'team';
	selected_skill_ids: string[];
};

type TBuilderSection = 'basics' | 'instructions' | 'tools' | 'skills' | 'triggers' | 'test';

type TToolOption = {
	id: string;
	name: string;
	description: string;
	icon: string;
	color: TColors;
	group: 'built-in' | 'integration' | 'workflow';
};

type TApiRecord = Record<string, unknown>;

const agentSchema = Yup.object({
	name: Yup.string().min(1).max(100).required('Agent name is required'),
	description: Yup.string().max(500),
	model: Yup.string().required('Model is required'),
	system_prompt: Yup.string().min(20).required('System prompt is required'),
	temperature: Yup.number().min(0).max(2).required('Temperature is required'),
	max_tokens: Yup.number().min(1).max(100000).required('Max tokens is required'),
	is_active: Yup.boolean(),
	visibility: Yup.string().oneOf(['personal', 'team']).required('Visibility is required'),
	selected_skill_ids: Yup.array().of(Yup.string()),
});

const DEFAULT_SYSTEM_PROMPT = `You are a focused operations agent.

Use the available tools only when they are relevant.
Ask for confirmation before sending messages, editing records, deleting data, or making irreversible changes.
When you are uncertain, ask one clear question before proceeding.
Keep responses concise and include the next best action.`;

const AI_MODELS = [
	{ value: 'gpt-4o', label: 'GPT-4o' },
	{ value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
	{ value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
	{ value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet' },
	{ value: 'claude-3-opus', label: 'Claude 3 Opus' },
	{ value: 'claude-3-haiku', label: 'Claude 3 Haiku' },
	{ value: 'gemini-pro', label: 'Gemini Pro' },
	{ value: 'gemini-flash', label: 'Gemini Flash' },
];

const TOOL_OPTIONS: TToolOption[] = [
	{
		id: 'code_sandbox',
		name: 'Code Sandbox',
		description: 'Run code for analysis, files, and calculations.',
		icon: 'Code',
		color: 'amber',
		group: 'built-in',
	},
	{
		id: 'search_past_conversations',
		name: 'Search Past Conversations',
		description: 'Use previous chats as working context.',
		icon: 'Search01',
		color: 'blue',
		group: 'built-in',
	},
	{
		id: 'skill_editing',
		name: 'Skill Editing',
		description: 'Create and refine skills during conversations.',
		icon: 'Tools',
		color: 'violet',
		group: 'built-in',
	},
	{
		id: 'gmail',
		name: 'Gmail',
		description: 'Read, search, and draft email actions.',
		icon: 'Mail01',
		color: 'red',
		group: 'integration',
	},
	{
		id: 'salesforce',
		name: 'Salesforce',
		description: 'Look up accounts, leads, and CRM records.',
		icon: 'Database',
		color: 'sky',
		group: 'integration',
	},
	{
		id: 'notion',
		name: 'Notion',
		description: 'Read team docs, policies, and databases.',
		icon: 'Notion01',
		color: 'zinc',
		group: 'integration',
	},
	{
		id: 'workflow_tool',
		name: 'Workflow Tool',
		description: 'Call a workflow as a reliable task step.',
		icon: 'GitMerge',
		color: 'emerald',
		group: 'workflow',
	},
];

const DEFAULT_TOOL_IDS = ['code_sandbox', 'skill_editing'];

const SKILL_META: Record<TAgentSkill['type'], { color: TColors; icon: string }> = {
	api_call: { color: 'blue', icon: 'Link01' },
	vector_search: { color: 'violet', icon: 'Search01' },
	workflow: { color: 'emerald', icon: 'GitMerge' },
	script: { color: 'amber', icon: 'Code' },
};

const TRIGGER_OPTIONS = [
	{
		id: 'manual',
		name: 'Manual Chat',
		description: 'Start from the agent chat whenever work is needed.',
		icon: 'Message02',
	},
	{
		id: 'scheduled',
		name: 'Scheduled Run',
		description: 'Run on a recurring schedule after the agent is saved.',
		icon: 'Calendar02',
	},
	{
		id: 'event',
		name: 'Event-Based',
		description: 'Run when email, Slack, CRM, or database events arrive.',
		icon: 'Webhook',
	},
];

const SECTION_NAV: {
	id: TBuilderSection;
	label: string;
	description: string;
	icon: string;
}[] = [
	{ id: 'basics', label: 'Basics', description: 'Name, model & access', icon: 'Bot' },
	{
		id: 'instructions',
		label: 'Instructions',
		description: 'System prompt & rules',
		icon: 'EditUser02',
	},
	{ id: 'tools', label: 'Tools', description: 'Built-ins & integrations', icon: 'Tools' },
	{ id: 'skills', label: 'Skills', description: 'Playbooks & workflows', icon: 'Puzzle' },
	{ id: 'triggers', label: 'Triggers', description: 'When it runs', icon: 'Flash' },
	{ id: 'test', label: 'Test', description: 'Live preview', icon: 'Message02' },
];

const isRecord = (value: unknown): value is TApiRecord =>
	typeof value === 'object' && value !== null;

const unwrapApiPayload = (response: unknown): unknown => {
	let value = response;

	if (isRecord(value) && 'data' in value) {
		value = value.data;
	}

	if (isRecord(value) && 'data' in value) {
		value = value.data;
	}

	return value;
};

const unwrapApiItem = <T,>(response: unknown): T | undefined => {
	const payload = unwrapApiPayload(response);
	return isRecord(payload) ? (payload as T) : undefined;
};

const unwrapApiList = <T,>(response: unknown): T[] => {
	const payload = unwrapApiPayload(response);
	return Array.isArray(payload) ? (payload as T[]) : [];
};

const getInitialValues = (agent?: TAgent): TAgentBuilderForm => ({
	name: agent?.name || '',
	description: agent?.description || '',
	model: agent?.model || 'gpt-4o',
	system_prompt: agent?.system_prompt || DEFAULT_SYSTEM_PROMPT,
	temperature: agent?.temperature ?? 0.7,
	max_tokens: agent?.max_tokens || 1000,
	is_active: agent?.is_active ?? true,
	visibility: 'personal',
	selected_skill_ids: agent?.skills?.map((skill) => skill.id) || [],
});

const SectionCard = ({
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

const AgentBuilderPage = () => {
	const navigate = useNavigate();
	const workspaceId = useCurrentWorkspaceId();
	const { agentId } = useParams();
	const isEditing = Boolean(agentId);

	const [enabledToolIds, setEnabledToolIds] = useState<string[]>(DEFAULT_TOOL_IDS);
	const [selectedTrigger, setSelectedTrigger] = useState('manual');
	const [selfImproveInstructions, setSelfImproveInstructions] = useState(true);
	const [followUpPrompts, setFollowUpPrompts] = useState(true);
	const [isSettingsOpen, setIsSettingsOpen] = useState(true);
	const [activeSection, setActiveSection] = useState<TBuilderSection>('basics');

	const {
		data: agentData,
		isLoading: isLoadingAgent,
		isError: isAgentError,
	} = useFetchAgent(workspaceId || '', agentId || '');
	const { data: skillsData, isLoading: isLoadingSkills } = useFetchAgentSkills(workspaceId || '');
	const createAgent = useCreateAgent(workspaceId || '');
	const updateAgent = useUpdateAgent(workspaceId || '');
	const attachSkill = useAttachAgentSkill(workspaceId || '');
	const detachSkill = useDetachAgentSkill(workspaceId || '');

	const agent = useMemo(() => unwrapApiItem<TAgent>(agentData), [agentData]);
	const skills = useMemo(() => unwrapApiList<TAgentSkill>(skillsData), [skillsData]);

	const formik = useFormik<TAgentBuilderForm>({
		initialValues: getInitialValues(agent),
		validationSchema: agentSchema,
		enableReinitialize: true,
		validateOnMount: true,
		onSubmit: async (values) => {
			if (!workspaceId) {
				toast.error('Select a workspace before saving an agent');
				return;
			}

			const payload: Partial<TAgent> = {
				name: values.name.trim(),
				description: values.description.trim(),
				model: values.model,
				system_prompt: values.system_prompt.trim(),
				temperature: Number(values.temperature),
				max_tokens: Number(values.max_tokens),
				is_active: values.is_active,
			};

			try {
				let savedAgentId = agentId;

				if (isEditing && agentId) {
					await updateAgent.mutateAsync({ id: agentId, data: payload });
				} else {
					const createdAgentResponse = await createAgent.mutateAsync(payload);
					const createdAgent = unwrapApiItem<TAgent>(createdAgentResponse);
					savedAgentId = createdAgent?.id;
				}

				if (savedAgentId) {
					const initialSkillIds = agent?.skills?.map((skill) => skill.id) || [];
					const skillsToAttach = values.selected_skill_ids.filter(
						(skillId) => !initialSkillIds.includes(skillId),
					);
					const skillsToDetach = initialSkillIds.filter(
						(skillId) => !values.selected_skill_ids.includes(skillId),
					);

					await Promise.all([
						...skillsToAttach.map((skillId) =>
							attachSkill.mutateAsync({ agentId: savedAgentId as string, skillId }),
						),
						...skillsToDetach.map((skillId) =>
							detachSkill.mutateAsync({ agentId: savedAgentId as string, skillId }),
						),
					]);
				}

				toast.success(isEditing ? 'Agent updated' : 'Agent created');

				if (!isEditing && savedAgentId) {
					navigate(`/app/agents/${savedAgentId}/edit`, { replace: true });
				}
			} catch {
				toast.error(isEditing ? 'Failed to update agent' : 'Failed to create agent');
			}
		},
	});

	const isSaving =
		createAgent.isPending ||
		updateAgent.isPending ||
		attachSkill.isPending ||
		detachSkill.isPending;

	const selectedSkills = useMemo(
		() => skills.filter((skill) => formik.values.selected_skill_ids.includes(skill.id)),
		[formik.values.selected_skill_ids, skills],
	);

	// Completion tracking for progress bar
	const completion = useMemo(() => {
		const v = formik.values;
		const steps = [
			Boolean(v.name.trim()),
			Boolean(v.model),
			v.system_prompt.trim().length >= 20,
			enabledToolIds.length > 0,
			v.selected_skill_ids.length > 0 || skills.length === 0,
			Boolean(selectedTrigger),
		];
		const done = steps.filter(Boolean).length;
		return Math.round((done / steps.length) * 100);
	}, [formik.values, enabledToolIds, selectedTrigger, skills.length]);

	const toggleTool = (toolId: string) => {
		setEnabledToolIds((currentToolIds) =>
			currentToolIds.includes(toolId)
				? currentToolIds.filter((id) => id !== toolId)
				: [...currentToolIds, toolId],
		);
	};

	const toggleSkill = (skillId: string) => {
		const nextSkillIds = formik.values.selected_skill_ids.includes(skillId)
			? formik.values.selected_skill_ids.filter((id) => id !== skillId)
			: [...formik.values.selected_skill_ids, skillId];

		formik.setFieldValue('selected_skill_ids', nextSkillIds);
	};

	const jumpToSection = (section: TBuilderSection) => {
		setActiveSection(section);
		document
			.getElementById(`agent-builder-${section}`)
			?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	};

	const addPromptRule = (rule: string) => {
		const nextPrompt = `${formik.values.system_prompt.trim()}\n\n${rule}`;
		formik.setFieldValue('system_prompt', nextPrompt);
	};

	if (isEditing && isLoadingAgent) {
		return (
			<Container className='flex h-full items-center justify-center'>
				<div className='flex flex-col items-center gap-3 text-zinc-500'>
					<Icon
						icon='Loading02'
						size='text-4xl'
						color='primary'
						className='animate-spin'
					/>
					Loading agent...
				</div>
			</Container>
		);
	}

	if (isEditing && (isAgentError || !agent)) {
		return (
			<Container className='flex h-full items-center justify-center'>
				<div className='max-w-md text-center'>
					<Icon icon='Bot' size='text-5xl' color='zinc' />
					<p className='mt-4 text-lg font-semibold text-zinc-900 dark:text-white'>
						Agent not found
					</p>
					<p className='mt-2 text-sm text-zinc-500'>
						Return to agents and choose another record.
					</p>
					<Button
						variant='solid'
						icon='ArrowLeft02'
						className='mt-4'
						onClick={() => navigate('/app/agents')}>
						Back to Agents
					</Button>
				</div>
			</Container>
		);
	}

	return (
		<>
			<Subheader>
				<SubheaderLeft>
					<Button
						variant='outline'
						dimension='sm'
						icon='ArrowLeft02'
						onClick={() => navigate('/app/agents')}>
						Agents
					</Button>
					<SubheaderSeparator />
					<div className='flex items-center gap-2 text-sm'>
						<Icon icon='Bot' color='primary' />
						<span className='font-medium text-zinc-900 dark:text-white'>
							{formik.values.name || (isEditing ? 'Untitled' : 'New Agent')}
						</span>
					</div>
				</SubheaderLeft>
				<SubheaderRight>
					<div className='hidden items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 md:flex dark:bg-zinc-900 dark:text-zinc-400'>
						<span className='bg-primary-500 relative flex h-2 w-2'>
							<span className='bg-primary-500 absolute inline-flex h-full w-full animate-ping rounded-full opacity-75' />
							<span className='bg-primary-500 relative inline-flex h-2 w-2 rounded-full' />
						</span>
						{completion}% ready
					</div>
					<Badge
						variant='soft'
						color={formik.values.is_active ? 'emerald' : 'zinc'}
						rounded='rounded-full'>
						{formik.values.is_active ? 'Active' : 'Inactive'}
					</Badge>
					<SubheaderSeparator />
					<Button
						variant='outline'
						dimension='sm'
						icon={isSettingsOpen ? 'SidebarRight01' : 'SidebarLeft01'}
						onClick={() => setIsSettingsOpen((prev) => !prev)}>
						{isSettingsOpen ? 'Focus' : 'Edit'}
					</Button>
					<Button variant='outline' icon='Message02' onClick={() => jumpToSection('test')}>
						Test
					</Button>
					<Button
						variant='solid'
						color='primary'
						icon='CheckmarkCircle02'
						isLoading={isSaving}
						isDisable={!formik.isValid || isSaving}
						onClick={() => formik.handleSubmit()}>
						{isEditing ? 'Save' : 'Create'}
					</Button>
				</SubheaderRight>
			</Subheader>

			<Container className='h-full'>
				{/* Hero banner */}
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
											formik.values.is_active
												? 'bg-emerald-500'
												: 'bg-zinc-400',
										)}
									/>
								</span>
							</div>
							<div>
								<p className='text-xs font-semibold tracking-widest text-primary-600 uppercase dark:text-primary-400'>
									{isEditing ? 'Editing agent' : 'New agent'}
								</p>
								<h1 className='mt-0.5 text-2xl font-bold text-zinc-900 sm:text-3xl dark:text-white'>
									{formik.values.name || 'Design your AI agent'}
								</h1>
								<p className='mt-1 max-w-xl text-sm text-zinc-500 dark:text-zinc-400'>
									Configure its role, tools, skills, and triggers. Preview behavior on the right as you go.
								</p>
							</div>
						</div>
						<div className='flex min-w-[220px] flex-col gap-2'>
							<div className='flex items-center justify-between text-xs font-medium text-zinc-600 dark:text-zinc-400'>
								<span>Setup progress</span>
								<span className='text-primary-600 dark:text-primary-400'>
									{completion}%
								</span>
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
									{enabledToolIds.length} tools
								</Badge>
								<Badge variant='soft' color='violet' rounded='rounded-full'>
									{selectedSkills.length} skills
								</Badge>
								<Badge variant='soft' color='blue' rounded='rounded-full'>
									{formik.values.model}
								</Badge>
							</div>
						</div>
					</div>
				</div>

				<div
					className={classNames(
						'grid min-h-full grid-cols-1 gap-4',
						isSettingsOpen
							? 'xl:grid-cols-[240px_minmax(0,1fr)_420px]'
							: 'xl:grid-cols-[240px_minmax(0,1fr)]',
					)}>
					{/* Left stepper navigation */}
					<aside className='xl:sticky xl:top-4 xl:h-fit'>
						<div className='rounded-2xl border border-zinc-200/80 bg-white p-2 shadow-sm dark:border-zinc-800 dark:bg-zinc-950'>
							<p className='px-3 pt-3 pb-2 text-xs font-semibold tracking-wider text-zinc-500 uppercase'>
								Build steps
							</p>
							<nav className='flex flex-col gap-1'>
								{SECTION_NAV.map((section, index) => {
									const isActive = activeSection === section.id;
									return (
										<button
											key={section.id}
											type='button'
											onClick={() => jumpToSection(section.id)}
											className={classNames(
												'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all',
												isActive
													? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
													: 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white',
											)}>
											<span
												className={classNames(
													'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold transition-colors',
													isActive
														? 'bg-primary-500 text-white shadow-sm shadow-primary-500/30'
														: 'bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200 dark:bg-zinc-900 dark:group-hover:bg-zinc-800',
												)}>
												<Icon icon={section.icon} />
											</span>
											<span className='min-w-0 flex-1'>
												<span className='flex items-center justify-between gap-2'>
													<span className='text-sm font-semibold'>
														{section.label}
													</span>
													<span className='text-xs text-zinc-400'>
														{String(index + 1).padStart(2, '0')}
													</span>
												</span>
												<span className='block truncate text-xs text-zinc-500 dark:text-zinc-500'>
													{section.description}
												</span>
											</span>
										</button>
									);
								})}
							</nav>
						</div>

						<div className='mt-3 hidden rounded-2xl border border-dashed border-zinc-200 bg-white/50 p-4 xl:block dark:border-zinc-800 dark:bg-zinc-950/50'>
							<div className='flex items-center gap-2 text-zinc-500'>
								<Icon icon='Bulb' color='amber' />
								<p className='text-xs font-semibold tracking-wider uppercase'>
									Pro tip
								</p>
							</div>
							<p className='mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400'>
								Start with a minimal toolset and refine the system prompt as you test. Add skills incrementally.
							</p>
						</div>
					</aside>

					{/* Center form */}
					<form
						className={classNames('space-y-4', !isSettingsOpen && 'hidden')}
						onSubmit={formik.handleSubmit}>
						<SectionCard
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
										<p className='mt-1 text-sm text-red-500'>
											{formik.errors.name}
										</p>
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
										<p className='mt-1 text-sm text-red-500'>
											{formik.errors.description}
										</p>
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
						</SectionCard>

						<SectionCard
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
									onChange={(event) =>
										setSelfImproveInstructions(event.target.checked)
									}
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
										<span>
											{formik.values.system_prompt.length} chars
										</span>
									</div>
								</div>
								{formik.touched.system_prompt && formik.errors.system_prompt && (
									<p className='mt-1 text-sm text-red-500'>
										{formik.errors.system_prompt}
									</p>
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
						</SectionCard>

						<SectionCard
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
												<Icon
													icon={tool.icon}
													color={tool.color}
													size='text-xl'
												/>
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
						</SectionCard>

						<SectionCard
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
										const isSelected =
											formik.values.selected_skill_ids.includes(skill.id);
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
						</SectionCard>

						<SectionCard
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
												<Icon
													icon={trigger.icon}
													color='primary'
													size='text-2xl'
												/>
											</div>
											<p className='mt-3 font-semibold text-zinc-900 dark:text-white'>
												{trigger.name}
											</p>
											<p className='mt-1 text-sm text-zinc-500'>
												{trigger.description}
											</p>
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
						</SectionCard>
					</form>

					{/* Right preview */}
					{isSettingsOpen && (
						<aside
							id='agent-builder-test'
							className='xl:sticky xl:top-4 xl:h-fit'>
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
												{formik.values.name || 'Untitled agent'}
											</p>
											<div className='mt-0.5 flex items-center gap-2 text-xs text-zinc-500'>
												<span className='bg-primary-500 h-1.5 w-1.5 rounded-full' />
												<span>Online</span>
												<span>·</span>
												<span>{formik.values.model}</span>
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
											{selectedSkills.length} skills
										</span>
									</div>
								</div>
								<div className='space-y-4 p-4'>
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
											I will check the ticket, retrieve customer context, read the discount policy, and ask before sending any external message.
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
																<Icon
																	icon={tool.icon}
																	size='text-xs'
																/>
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
										<span className='text-xs text-zinc-500'>
											Agent is thinking...
										</span>
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
					)}
				</div>
			</Container>
		</>
	);
};

export default AgentBuilderPage;
