import { useEffect, useMemo, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import classNames from 'classnames';
import { toast } from 'react-toastify';
import { useNavigate, useOutletContext, useParams } from 'react-router';

import {
	useAttachAgentSkill,
	useCreateAgent,
	useDetachAgentSkill,
	useFetchAgent,
	useFetchAgentSkills,
	useUpdateAgent,
} from '@/api/hooks/useAgents';
import pages from '@/Routes/pages';
import avatarAgent from '@/assets/avatar/avatar6.png';
import avatarUser from '@/assets/avatar/avatar2.png';
import Badge from '@/components/ui/Badge';
import Breadcrumb from '@/components/layout/Breadcrumb';
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

import { OutletContextType } from './_layouts/Agents.layout';

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

const BUILDER_SECTIONS: { id: TBuilderSection; label: string; icon: string }[] = [
	{ id: 'basics', label: 'Basics', icon: 'Bot' },
	{ id: 'instructions', label: 'Instructions', icon: 'FileEdit' },
	{ id: 'tools', label: 'Tools', icon: 'Tool02' },
	{ id: 'skills', label: 'Skills', icon: 'Tools' },
	{ id: 'triggers', label: 'Triggers', icon: 'Clock03' },
	{ id: 'test', label: 'Test', icon: 'Message02' },
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

const SKILL_META: Record<
	TAgentSkill['type'],
	{ color: TColors; icon: string; tileClassName: string }
> = {
	api_call: {
		color: 'blue',
		icon: 'Link01',
		tileClassName: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20',
	},
	vector_search: {
		color: 'violet',
		icon: 'Search01',
		tileClassName:
			'border-violet-200 bg-violet-50 dark:border-violet-800 dark:bg-violet-900/20',
	},
	workflow: {
		color: 'emerald',
		icon: 'GitMerge',
		tileClassName:
			'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20',
	},
	script: {
		color: 'amber',
		icon: 'Code',
		tileClassName: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20',
	},
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

const AgentBuilderPage = () => {
	const navigate = useNavigate();
	const workspaceId = useCurrentWorkspaceId();
	const { agentId } = useParams();
	const isEditing = Boolean(agentId);
	const { setHeaderLeft } = useOutletContext<OutletContextType>();

	const [activeSection, setActiveSection] = useState<TBuilderSection>('basics');
	const [enabledToolIds, setEnabledToolIds] = useState<string[]>(DEFAULT_TOOL_IDS);
	const [selectedTrigger, setSelectedTrigger] = useState('manual');
	const [selfImproveInstructions, setSelfImproveInstructions] = useState(true);
	const [followUpPrompts, setFollowUpPrompts] = useState(true);

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

	useEffect(() => {
		setHeaderLeft(
			<Breadcrumb
				list={[
					{ ...pages.app.appMain.subPages.agents },
					{
						text: isEditing ? 'Edit Agent' : 'New Agent',
						to:
							isEditing && agentId
								? `/app/agents/${agentId}/edit`
								: '/app/agents/new',
						icon: isEditing ? 'PencilEdit02' : 'PlusSignCircle',
					},
				]}
			/>,
		);

		return () => setHeaderLeft(undefined);
	}, [agentId, isEditing, setHeaderLeft]);

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
		setActiveSection('instructions');
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
				</SubheaderLeft>
				<SubheaderRight>
					<Badge variant='soft' color={formik.values.is_active ? 'emerald' : 'zinc'}>
						{formik.values.is_active ? 'Active' : 'Inactive'}
					</Badge>
					<SubheaderSeparator />
					<Button
						variant='outline'
						icon='Message02'
						onClick={() => jumpToSection('test')}>
						Test
					</Button>
					<Button
						variant='solid'
						icon='CheckmarkCircle02'
						isLoading={isSaving}
						isDisable={!formik.isValid || isSaving}
						onClick={() => formik.handleSubmit()}>
						{isEditing ? 'Save Agent' : 'Create Agent'}
					</Button>
				</SubheaderRight>
			</Subheader>

			<Container className='h-full'>
				<div className='grid min-h-full grid-cols-1 gap-4 xl:grid-cols-[15rem_minmax(0,1fr)_22rem]'>
					<aside className='xl:sticky xl:top-4 xl:h-fit'>
						<div className='rounded-lg border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-950'>
							<div className='px-3 py-2'>
								<p className='text-xs font-semibold text-zinc-500 uppercase'>
									Agent Builder
								</p>
								<p className='mt-1 truncate text-sm font-semibold text-zinc-900 dark:text-white'>
									{formik.values.name || 'Untitled agent'}
								</p>
							</div>
							<div className='mt-2 space-y-1'>
								{BUILDER_SECTIONS.map((section) => (
									<button
										key={section.id}
										type='button'
										className={classNames(
											'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
											activeSection === section.id
												? 'bg-primary-500 text-zinc-900'
												: 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900',
										)}
										onClick={() => jumpToSection(section.id)}>
										<Icon icon={section.icon} />
										<span>{section.label}</span>
									</button>
								))}
							</div>
						</div>
					</aside>

					<form className='space-y-4' onSubmit={formik.handleSubmit}>
						<section
							id='agent-builder-basics'
							className='rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950'>
							<div className='flex flex-wrap items-start justify-between gap-3'>
								<div>
									<h1 className='text-2xl font-semibold text-zinc-900 dark:text-white'>
										{isEditing ? 'Edit agent' : 'Create agent'}
									</h1>
									<p className='mt-1 text-sm text-zinc-500'>
										Set the goal, model, and workspace access.
									</p>
								</div>
								<Checkbox
									id='agent-active'
									name='is_active'
									variant='switch'
									checked={formik.values.is_active}
									label='Active'
									description='Ready for conversations'
									onChange={formik.handleChange}
								/>
							</div>

							<div className='mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2'>
								<div>
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
							</div>
						</section>

						<section
							id='agent-builder-instructions'
							className='rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950'>
							<div className='flex flex-wrap items-start justify-between gap-4'>
								<div>
									<h2 className='text-xl font-semibold text-zinc-900 dark:text-white'>
										Instructions
									</h2>
									<p className='mt-1 text-sm text-zinc-500'>
										Define role, tool rules, confirmations, and response style.
									</p>
								</div>
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
							</div>

							<div className='mt-4'>
								<Label htmlFor='system_prompt'>System prompt *</Label>
								<Textarea
									id='system_prompt'
									name='system_prompt'
									rows={14}
									className='font-mono text-sm'
									value={formik.values.system_prompt}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
								/>
								{formik.touched.system_prompt && formik.errors.system_prompt && (
									<p className='mt-1 text-sm text-red-500'>
										{formik.errors.system_prompt}
									</p>
								)}
							</div>

							<div className='mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3'>
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
									Add safety rules
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
									Add response style
								</Button>
							</div>
						</section>

						<section
							id='agent-builder-tools'
							className='rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950'>
							<div>
								<h2 className='text-xl font-semibold text-zinc-900 dark:text-white'>
									Tools
								</h2>
								<p className='mt-1 text-sm text-zinc-500'>
									Start with a small toolset and add more after testing.
								</p>
							</div>
							<div className='mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3'>
								{TOOL_OPTIONS.map((tool) => {
									const isEnabled = enabledToolIds.includes(tool.id);

									return (
										<button
											key={tool.id}
											type='button'
											className={classNames(
												'min-h-32 rounded-lg border p-4 text-left transition-colors',
												isEnabled
													? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
													: 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700',
											)}
											onClick={() => toggleTool(tool.id)}>
											<div className='flex items-start justify-between gap-3'>
												<div
													className={classNames(
														'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
														isEnabled
															? 'bg-white dark:bg-zinc-950'
															: 'bg-zinc-100 dark:bg-zinc-900',
													)}>
													<Icon
														icon={tool.icon}
														color={tool.color}
														size='text-xl'
													/>
												</div>
												<Badge
													variant='outline'
													color={isEnabled ? 'emerald' : 'zinc'}>
													{isEnabled ? 'Enabled' : 'Off'}
												</Badge>
											</div>
											<p className='mt-3 font-semibold text-zinc-900 dark:text-white'>
												{tool.name}
											</p>
											<p className='mt-1 text-sm text-zinc-500'>
												{tool.description}
											</p>
											<p className='mt-3 text-xs text-zinc-400 uppercase'>
												{tool.group.replace('-', ' ')}
											</p>
										</button>
									);
								})}
							</div>
						</section>

						<section
							id='agent-builder-skills'
							className='rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950'>
							<div className='flex flex-wrap items-start justify-between gap-4'>
								<div>
									<h2 className='text-xl font-semibold text-zinc-900 dark:text-white'>
										Skills
									</h2>
									<p className='mt-1 text-sm text-zinc-500'>
										Attach playbooks, scripts, workflow tools, and knowledge
										packs.
									</p>
								</div>
								<Button
									variant='outline'
									icon='PlusSignCircle'
									onClick={() => navigate('/app/skills')}>
									New Skill
								</Button>
							</div>

							<div className='mt-4'>
								{isLoadingSkills ? (
									<div className='flex items-center gap-2 py-6 text-zinc-500'>
										<Icon icon='Loading02' className='animate-spin' />
										Loading skills...
									</div>
								) : skills.length === 0 ? (
									<div className='rounded-lg border border-dashed border-zinc-300 p-6 text-center dark:border-zinc-700'>
										<Icon icon='Tools' size='text-4xl' color='zinc' />
										<p className='mt-2 font-semibold text-zinc-900 dark:text-white'>
											No skills available
										</p>
										<p className='mt-1 text-sm text-zinc-500'>
											Create reusable skills before attaching them here.
										</p>
									</div>
								) : (
									<div className='grid grid-cols-1 gap-3 lg:grid-cols-2'>
										{skills.map((skill) => {
											const isSelected = selectedSkillIds.includes(skill.id);
											const meta = SKILL_META[skill.type];

											return (
												<button
													key={skill.id}
													type='button'
													className={classNames(
														'rounded-lg border p-4 text-left transition-colors',
														isSelected
															? meta.tileClassName
															: 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700',
													)}
													onClick={() => toggleSkill(skill.id)}>
													<div className='flex items-start justify-between gap-3'>
														<div className='flex items-center gap-3'>
															<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-white dark:bg-zinc-900'>
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
																<p className='text-xs text-zinc-400 uppercase'>
																	{skill.type.replace('_', ' ')}
																</p>
															</div>
														</div>
														<Badge
															variant={
																isSelected ? 'soft' : 'outline'
															}
															color={isSelected ? 'emerald' : 'zinc'}>
															{isSelected ? 'Attached' : 'Add'}
														</Badge>
													</div>
													<p className='mt-3 text-sm text-zinc-500'>
														{skill.description || 'No description'}
													</p>
												</button>
											);
										})}
									</div>
								)}
							</div>
						</section>

						<section
							id='agent-builder-triggers'
							className='rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950'>
							<div>
								<h2 className='text-xl font-semibold text-zinc-900 dark:text-white'>
									Triggers
								</h2>
								<p className='mt-1 text-sm text-zinc-500'>
									Choose how the agent starts work.
								</p>
							</div>
							<div className='mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3'>
								{TRIGGER_OPTIONS.map((trigger) => (
									<button
										key={trigger.id}
										type='button'
										className={classNames(
											'min-h-32 rounded-lg border p-4 text-left transition-colors',
											selectedTrigger === trigger.id
												? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
												: 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700',
										)}
										onClick={() => setSelectedTrigger(trigger.id)}>
										<Icon icon={trigger.icon} color='primary' size='text-2xl' />
										<p className='mt-3 font-semibold text-zinc-900 dark:text-white'>
											{trigger.name}
										</p>
										<p className='mt-1 text-sm text-zinc-500'>
											{trigger.description}
										</p>
									</button>
								))}
							</div>
							<div className='mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800'>
								<div>
									<p className='font-semibold text-zinc-900 dark:text-white'>
										Follow-up prompts
									</p>
									<p className='text-sm text-zinc-500'>
										Suggest useful next prompts after each response.
									</p>
								</div>
								<Checkbox
									id='follow-up-prompts'
									variant='switch'
									checked={followUpPrompts}
									onChange={(event) => setFollowUpPrompts(event.target.checked)}
								/>
							</div>
						</section>
					</form>

					<aside
						id='agent-builder-test'
						className='rounded-lg border border-zinc-200 bg-white xl:sticky xl:top-4 xl:h-fit dark:border-zinc-800 dark:bg-zinc-950'>
						<div className='border-b border-zinc-200 p-4 dark:border-zinc-800'>
							<div className='flex items-center gap-3'>
								<img
									src={avatarAgent}
									alt='Agent avatar'
									className='h-10 w-10 rounded-lg object-cover'
								/>
								<div className='min-w-0'>
									<p className='truncate font-semibold text-zinc-900 dark:text-white'>
										{formik.values.name || 'Untitled agent'}
									</p>
									<p className='text-xs text-zinc-500'>
										{selectedSkills.length} skills, {enabledToolIds.length}{' '}
										tools
									</p>
								</div>
							</div>
						</div>
						<div className='space-y-4 p-4'>
							<div className='flex items-start gap-3'>
								<img
									src={avatarUser}
									alt='User avatar'
									className='h-8 w-8 rounded-lg object-cover'
								/>
								<div className='rounded-lg bg-zinc-100 p-3 text-sm text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200'>
									Review ticket 4821 and tell me whether we should offer a
									discount.
								</div>
							</div>
							<div className='flex items-start gap-3'>
								<div className='bg-primary-100 dark:bg-primary-900/40 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg'>
									<Icon icon='Bot' color='primary' />
								</div>
								<div className='rounded-lg border border-zinc-200 p-3 text-sm text-zinc-700 dark:border-zinc-800 dark:text-zinc-200'>
									I will check the ticket, retrieve customer context, read the
									discount policy, and ask before sending any external message.
									<div className='mt-3 flex flex-wrap gap-2'>
										{enabledToolIds.slice(0, 3).map((toolId) => {
											const tool = TOOL_OPTIONS.find(
												(option) => option.id === toolId,
											);
											if (!tool) return null;

											return (
												<Badge
													key={tool.id}
													variant='soft'
													color={tool.color}>
													{tool.name}
												</Badge>
											);
										})}
									</div>
								</div>
							</div>
							<FieldWrap lastSuffix={<Icon icon='Sent' />}>
								<Input
									name='test-message'
									placeholder='Test a request...'
									value=''
									readOnly
									onFocus={() => jumpToSection('test')}
								/>
							</FieldWrap>
						</div>
					</aside>
				</div>
			</Container>
		</>
	);
};

export default AgentBuilderPage;
