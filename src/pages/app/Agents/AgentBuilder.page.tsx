import { useMemo, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import classNames from 'classnames';
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
import Container from '@/components/layout/Container';
import Icon from '@/components/icon/Icon';
import Subheader, {
	SubheaderLeft,
	SubheaderRight,
	SubheaderSeparator,
} from '@/components/layout/Subheader';
import { useCurrentWorkspaceId } from '@/context/workspaceContext';
import type { TAgent, TAgentSkill } from '@/types/agent.type';

// Parts
import {
	DEFAULT_SYSTEM_PROMPT,
	DEFAULT_TOOL_IDS,
	type TBuilderSection,
} from './_partial/Builder.constants';
import { BuilderChatPartial } from './_partial/BuilderChat.partial';
import { BuilderFormPartial } from './_partial/BuilderForm.partial';

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

	const [enabledToolIds, setEnabledToolIds] = useState<string[]>(DEFAULT_TOOL_IDS);
	const [selectedTrigger, setSelectedTrigger] = useState('manual');
	const [selfImproveInstructions, setSelfImproveInstructions] = useState(true);
	const [followUpPrompts, setFollowUpPrompts] = useState(true);
	const [isFormVisible, setIsFormVisible] = useState(true);
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

	const navItems: { id: TBuilderSection; label: string; icon: any }[] = [
		{ id: 'basics', label: 'Configuration', icon: 'Settings02' },
		{ id: 'instructions', label: 'Prompt Engineering', icon: 'EditUser02' },
		{ id: 'tools', label: 'Tools & Skills', icon: 'Tools' },
		{ id: 'triggers', label: 'Deployment', icon: 'Flash' },
	];

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
					<div className='flex items-center gap-1.5 rounded-2xl bg-zinc-900 p-1.5 border border-zinc-800'>
						{navItems.map((item) => (
							<button
								key={item.id}
								type='button'
								onClick={() => setActiveSection(item.id)}
								className={classNames(
									'flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all',
									activeSection === item.id
										? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
										: 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300',
								)}>
								<Icon icon={item.icon} size='text-sm' />
								{item.label}
							</button>
						))}
					</div>
					<SubheaderSeparator />
					<div className='hidden items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-[10px] font-bold text-zinc-400 md:flex border border-zinc-800'>
						<span className='bg-emerald-500 relative flex h-2 w-2'>
							<span className='bg-emerald-500 absolute inline-flex h-full w-full animate-ping rounded-full opacity-75' />
							<span className='bg-emerald-500 relative inline-flex h-2 w-2 rounded-full' />
						</span>
						{completion}%
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
						icon={isFormVisible ? 'SidebarLeft01' : 'SidebarRight01'}
						onClick={() => setIsFormVisible((prev) => !prev)}>
						{isFormVisible ? 'Hide Settings' : 'Show Settings'}
					</Button>
					<Button
						variant='solid'
						color='emerald'
						icon='CheckmarkCircle02'
						isLoading={isSaving}
						isDisable={!formik.isValid || isSaving}
						onClick={() => formik.handleSubmit()}>
						{isEditing ? 'Save' : 'Create'}
					</Button>
				</SubheaderRight>
			</Subheader>

			<Container className='h-full pb-8 pt-4'>
				<div
					className={classNames(
						'grid h-[calc(100vh-140px)] grid-cols-1 gap-6',
						isFormVisible ? 'lg:grid-cols-12' : 'grid-cols-1',
					)}>
					{isFormVisible && (
						<div className='flex flex-col gap-6 overflow-y-auto pr-2 lg:col-span-6'>
							<BuilderFormPartial
								formik={formik}
								isEditing={isEditing}
								isSettingsOpen={isFormVisible}
								activeSection={activeSection}
								selfImproveInstructions={selfImproveInstructions}
								setSelfImproveInstructions={setSelfImproveInstructions}
								enabledToolIds={enabledToolIds}
								toggleTool={toggleTool}
								skills={skills}
								isLoadingSkills={isLoadingSkills}
								toggleSkill={toggleSkill}
								selectedTrigger={selectedTrigger}
								setSelectedTrigger={setSelectedTrigger}
								followUpPrompts={followUpPrompts}
								setFollowUpPrompts={setFollowUpPrompts}
								addPromptRule={addPromptRule}
							/>
						</div>
					)}

					<div className={classNames(isFormVisible ? 'lg:col-span-6' : 'mx-auto w-full max-w-5xl')}>
						<BuilderChatPartial
							avatarAgent={avatarAgent}
							avatarUser={avatarUser}
							name={formik.values.name}
							model={formik.values.model}
							enabledToolIds={enabledToolIds}
							selectedSkillsCount={selectedSkills.length}
							isSettingsOpen={isFormVisible}
							jumpToSection={() => {}}
						/>
					</div>
				</div>
			</Container>
		</>
	);
};

export default AgentBuilderPage;
