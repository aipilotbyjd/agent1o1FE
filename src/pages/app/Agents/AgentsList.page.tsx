import Container from '@/components/layout/Container';
import { useNavigate, useOutletContext } from 'react-router';
import { OutletContextType } from './_layouts/Agents.layout';
import { useEffect, useState, useMemo } from 'react';
import Breadcrumb from '@/components/layout/Breadcrumb';
import pages from '@/Routes/pages';
import Subheader, {
	SubheaderLeft,
	SubheaderRight,
	SubheaderSeparator,
} from '@/components/layout/Subheader';
import Input from '@/components/form/Input';
import FieldWrap from '@/components/form/FieldWrap';
import Icon from '@/components/icon/Icon';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card, { CardBody } from '@/components/ui/Card';
import Dropdown, { DropdownItem, DropdownMenu, DropdownToggle } from '@/components/ui/Dropdown';
import { useCurrentWorkspaceId } from '@/context/workspaceContext';
import {
	useFetchAgents,
	useDeleteAgent,
	useDuplicateAgent,
	useUpdateAgent,
	useCreateAgent,
} from '@/api/hooks/useAgents';
import type { TAgent } from '@/types/agent.type';

import StatsCardsPartial from './_partial/StatsCards.partial';
import EmptyStatePartial from './_partial/EmptyState.partial';
import AgentModalPartial from './_partial/AgentModal.partial';
import SkillsModalPartial from './_partial/SkillsModal.partial';
import { LoadingStatePartial, ErrorStatePartial } from './_partial/States.partial';

const AgentsListPage = () => {
	const navigate = useNavigate();
	const workspaceId = useCurrentWorkspaceId();

	// ─── State ────────────────────────────────────────────
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | ''>('');
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingAgent, setEditingAgent] = useState<TAgent | null>(null);
	const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
	const [managingSkillsAgentId, setManagingSkillsAgentId] = useState<string | null>(null);

	// ─── Breadcrumb ───────────────────────────────────────
	const { setHeaderLeft } = useOutletContext<OutletContextType>();

	useEffect(() => {
		setHeaderLeft(<Breadcrumb list={[{ ...pages.app.appMain.subPages.agents }]} />);
		return () => setHeaderLeft(undefined);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// ─── API Hooks ────────────────────────────────────────
	const {
		data: agentsData,
		isLoading,
		isError,
		refetch,
	} = useFetchAgents(workspaceId || '');

	const deleteAgent = useDeleteAgent(workspaceId || '');
	const duplicateAgent = useDuplicateAgent(workspaceId || '');
	const updateAgent = useUpdateAgent(workspaceId || '');
	const createAgent = useCreateAgent(workspaceId || '');

	// ─── Derived Data ─────────────────────────────────────
	const agents: TAgent[] = useMemo(() => {
		if (!agentsData) return [];
		if (Array.isArray(agentsData)) return agentsData;
		if ('data' in agentsData && Array.isArray(agentsData.data)) return agentsData.data;
		return [];
	}, [agentsData]);

	const filteredAgents = useMemo(() => {
		let result = [...agents];

		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			result = result.filter(
				(a) =>
					a.name.toLowerCase().includes(query) ||
					a.description?.toLowerCase().includes(query),
			);
		}

		if (statusFilter) {
			result = result.filter((a) =>
				statusFilter === 'active' ? a.is_active : !a.is_active,
			);
		}

		return result;
	}, [agents, searchQuery, statusFilter]);

	const hasFilters = searchQuery || statusFilter;

	// ─── Handlers ─────────────────────────────────────────
	const handleOpenCreateModal = () => {
		setEditingAgent(null);
		setIsModalOpen(true);
	};

	const handleOpenEditModal = (agent: TAgent) => {
		setEditingAgent(agent);
		setIsModalOpen(true);
	};

	const handleModalSubmit = async (values: Partial<TAgent>) => {
		if (editingAgent) {
			await updateAgent.mutateAsync({ id: editingAgent.id, data: values });
		} else {
			await createAgent.mutateAsync(values);
		}
		setIsModalOpen(false);
		setEditingAgent(null);
	};

	const handleOpenSkillsModal = (agentId: string) => {
		setManagingSkillsAgentId(agentId);
		setIsSkillsModalOpen(true);
	};

	const handleAttachSkill = async (skillId: string) => {
		if (!managingSkillsAgentId || !workspaceId) return;
		// TODO: Implement attach skill API call
		console.log('Attach skill', skillId, 'to agent', managingSkillsAgentId);
	};

	const handleDetachSkill = async (skillId: string) => {
		if (!managingSkillsAgentId || !workspaceId) return;
		// TODO: Implement detach skill API call
		console.log('Detach skill', skillId, 'from agent', managingSkillsAgentId);
	};

	const handleToggleStatus = (id: string, currentStatus: boolean) => {
		updateAgent.mutate({ id, data: { is_active: !currentStatus } });
	};

	const handleDelete = (id: string, name: string) => {
		if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
			deleteAgent.mutate(id);
		}
	};

	const clearFilters = () => {
		setSearchQuery('');
		setStatusFilter('');
	};

	// ─── Render ───────────────────────────────────────────
	return (
		<>
			<Subheader>
				<SubheaderLeft>
					<FieldWrap firstSuffix={<Icon icon='Search02' />}>
						<Input
							name='search'
							variant='solid'
							placeholder='Search agents...'
							dimension='sm'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</FieldWrap>
				</SubheaderLeft>
				<SubheaderRight>
					<Dropdown>
						<DropdownToggle>
							<Button
								variant='outline'
								dimension='sm'
								icon='Filter'
								rightIcon='ChevronDown'>
								{statusFilter
									? statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)
									: 'All Status'}
							</Button>
						</DropdownToggle>
						<DropdownMenu placement='bottom-end'>
							<DropdownItem onClick={() => setStatusFilter('')}>
								All Status
							</DropdownItem>
							<DropdownItem onClick={() => setStatusFilter('active')}>
								Active
							</DropdownItem>
							<DropdownItem onClick={() => setStatusFilter('inactive')}>
								Inactive
							</DropdownItem>
						</DropdownMenu>
					</Dropdown>
					{hasFilters && (
						<Button
							aria-label='Clear filters'
							variant='outline'
							color='red'
							dimension='sm'
							icon='Cancel01'
							onClick={clearFilters}>
							Clear
						</Button>
					)}
					<SubheaderSeparator />
					<Button
						aria-label='New Agent'
						variant='solid'
						icon='PlusSignCircle'
						onClick={handleOpenCreateModal}>
						New Agent
					</Button>
				</SubheaderRight>
			</Subheader>

			<Container className='flex h-full'>
				<div className='flex min-w-0 flex-1 flex-col gap-4'>
					{/* Stats Cards */}
					{!isLoading && !isError && <StatsCardsPartial agents={filteredAgents} />}

					{/* Main Content */}
					{isLoading ? (
						<LoadingStatePartial />
					) : isError ? (
						<ErrorStatePartial onRetry={() => refetch()} />
					) : filteredAgents.length === 0 ? (
						<EmptyStatePartial
							hasFilters={!!hasFilters}
							onClearFilters={clearFilters}
							onCreate={handleOpenCreateModal}
						/>
					) : (
						<div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
							{filteredAgents.map((agent) => (
								<Card key={agent.id} className='group relative'>
									<CardBody>
										<div className='flex items-start justify-between'>
											<div className='flex items-center gap-3'>
												<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30'>
													<Icon
														icon='Bot'
														color='primary'
														size='text-xl'
													/>
												</div>
												<div>
													<div className='font-semibold text-zinc-900 dark:text-white'>
														{agent.name}
													</div>
													<div className='text-xs text-zinc-500'>
														{agent.model}
													</div>
												</div>
											</div>
											<Dropdown>
												<DropdownToggle>
													<Button
														variant='outline'
														dimension='sm'
														icon='MoreHorizontal'
														aria-label='Actions'
													/>
												</DropdownToggle>
												<DropdownMenu placement='bottom-end'>
													<DropdownItem
														icon='PencilEdit02'
														onClick={() =>
															handleOpenEditModal(agent)
														}>
														Edit
													</DropdownItem>
													<DropdownItem
														icon='Tool02'
														onClick={() =>
															handleOpenSkillsModal(agent.id)
														}>
														Manage Skills
													</DropdownItem>
													<DropdownItem
														icon='Copy01'
														onClick={() =>
															duplicateAgent.mutate(agent.id)
														}>
														Duplicate
													</DropdownItem>
													<DropdownItem
														icon={
															agent.is_active
																? 'PauseCircle'
																: 'PlayCircle'
														}
														onClick={() =>
															handleToggleStatus(
																agent.id,
																agent.is_active,
															)
														}>
														{agent.is_active
															? 'Deactivate'
															: 'Activate'}
													</DropdownItem>
													<DropdownItem
														icon='Delete02'
														onClick={() =>
															handleDelete(agent.id, agent.name)
														}>
														Delete
													</DropdownItem>
												</DropdownMenu>
											</Dropdown>
										</div>

										<p className='mt-3 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400'>
											{agent.description || 'No description'}
										</p>

										<div className='mt-4 flex items-center gap-2'>
											<Badge
												variant='outline'
												color={agent.is_active ? 'emerald' : 'zinc'}>
												{agent.is_active ? 'Active' : 'Inactive'}
											</Badge>
											<div className='flex items-center gap-1 text-xs text-zinc-500'>
												<Icon icon='Tool02' size='text-sm' />
												{agent.skills_count} skills
											</div>
											<div className='flex items-center gap-1 text-xs text-zinc-500'>
												<Icon icon='Message02' size='text-sm' />
												{agent.conversations_count} chats
											</div>
										</div>

										<div className='mt-4 flex gap-2'>
											<Button
												variant='outline'
												dimension='sm'
												icon='Message02'
												className='flex-1'
												onClick={() =>
													navigate(`/app/agents/${agent.id}/chat`)
												}>
												Chat
											</Button>
											<Button
												variant='outline'
												dimension='sm'
												icon='PencilEdit02'
												className='flex-1'
												onClick={() => handleOpenEditModal(agent)}>
												Edit
											</Button>
										</div>
									</CardBody>
								</Card>
							))}
						</div>
					)}
				</div>
			</Container>

			{/* Agent Modal */}
			<AgentModalPartial
				isOpen={isModalOpen}
				onClose={() => {
					setIsModalOpen(false);
					setEditingAgent(null);
				}}
				onSubmit={handleModalSubmit}
				isLoading={createAgent.isPending || updateAgent.isPending}
				agent={editingAgent}
			/>

			{/* Skills Modal */}
			{managingSkillsAgentId && (
				<SkillsModalPartial
					isOpen={isSkillsModalOpen}
					onClose={() => {
						setIsSkillsModalOpen(false);
						setManagingSkillsAgentId(null);
					}}
					agentId={managingSkillsAgentId}
					attachedSkillIds={
						agents.find((a) => a.id === managingSkillsAgentId)?.skills_count
							? []
							: []
					}
					onAttachSkill={handleAttachSkill}
					onDetachSkill={handleDetachSkill}
				/>
			)}
		</>
	);
};

export default AgentsListPage;
