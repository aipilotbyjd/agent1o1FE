import Container from '@/components/layout/Container';
import { useOutletContext } from 'react-router';
import { OutletContextType } from './_layouts/Skills.layout';
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
	useFetchAgentSkills,
	useCreateAgentSkill,
	useUpdateAgentSkill,
	useDeleteAgentSkill,
} from '@/api/hooks/useAgents';
import type { TAgentSkill } from '@/types/agent.type';

import StatsCardsPartial from './_partial/StatsCards.partial';
import EmptyStatePartial from './_partial/EmptyState.partial';
import SkillModalPartial from './_partial/SkillModal.partial';
import { LoadingStatePartial, ErrorStatePartial } from './_partial/States.partial';

const SKILL_TYPE_COLORS = {
	api_call: 'blue',
	vector_search: 'violet',
	workflow: 'emerald',
	script: 'amber',
} as const;

const SKILL_TYPE_ICONS = {
	api_call: 'Link01',
	vector_search: 'Search01',
	workflow: 'GitMerge',
	script: 'Code',
} as const;

const SKILL_TYPE_LABELS = {
	api_call: 'API Call',
	vector_search: 'Vector Search',
	workflow: 'Workflow',
	script: 'Script',
} as const;

const SkillsListPage = () => {
	const workspaceId = useCurrentWorkspaceId();

	// ─── State ────────────────────────────────────────────
	const [searchQuery, setSearchQuery] = useState('');
	const [typeFilter, setTypeFilter] = useState<TAgentSkill['type'] | ''>('');
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingSkill, setEditingSkill] = useState<TAgentSkill | null>(null);

	// ─── Breadcrumb ───────────────────────────────────────
	const { setHeaderLeft } = useOutletContext<OutletContextType>();

	useEffect(() => {
		setHeaderLeft(<Breadcrumb list={[{ ...pages.app.appMain.subPages.skills }]} />);
		return () => setHeaderLeft(undefined);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// ─── API Hooks ────────────────────────────────────────
	const {
		data: skillsData,
		isLoading,
		isError,
		refetch,
	} = useFetchAgentSkills(workspaceId || '');

	const createSkill = useCreateAgentSkill(workspaceId || '');
	const updateSkill = useUpdateAgentSkill(workspaceId || '');
	const deleteSkill = useDeleteAgentSkill(workspaceId || '');

	// ─── Derived Data ─────────────────────────────────────
	const skills: TAgentSkill[] = useMemo(() => {
		if (!skillsData) return [];
		if (Array.isArray(skillsData)) return skillsData;
		if ('data' in skillsData && Array.isArray(skillsData.data)) return skillsData.data;
		return [];
	}, [skillsData]);

	const filteredSkills = useMemo(() => {
		let result = [...skills];

		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			result = result.filter(
				(s) =>
					s.name.toLowerCase().includes(query) ||
					s.description?.toLowerCase().includes(query),
			);
		}

		if (typeFilter) {
			result = result.filter((s) => s.type === typeFilter);
		}

		return result;
	}, [skills, searchQuery, typeFilter]);

	const hasFilters = searchQuery || typeFilter;

	// ─── Handlers ─────────────────────────────────────────
	const handleOpenCreateModal = () => {
		setEditingSkill(null);
		setIsModalOpen(true);
	};

	const handleOpenEditModal = (skill: TAgentSkill) => {
		setEditingSkill(skill);
		setIsModalOpen(true);
	};

	const handleModalSubmit = async (values: Partial<TAgentSkill>) => {
		if (editingSkill) {
			await updateSkill.mutateAsync({ id: editingSkill.id, data: values });
		} else {
			await createSkill.mutateAsync(values);
		}
		setIsModalOpen(false);
		setEditingSkill(null);
	};

	const handleDuplicate = async (skill: TAgentSkill) => {
		await createSkill.mutateAsync({
			name: `${skill.name} Copy`,
			type: skill.type,
			description: skill.description,
			config: skill.config,
		});
	};

	const handleDelete = (id: string, name: string) => {
		if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
			deleteSkill.mutate(id);
		}
	};

	const clearFilters = () => {
		setSearchQuery('');
		setTypeFilter('');
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
							placeholder='Search skills...'
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
								{typeFilter
									? SKILL_TYPE_LABELS[typeFilter]
									: 'All Types'}
							</Button>
						</DropdownToggle>
						<DropdownMenu placement='bottom-end'>
							<DropdownItem onClick={() => setTypeFilter('')}>
								All Types
							</DropdownItem>
							<DropdownItem onClick={() => setTypeFilter('api_call')}>
								API Call
							</DropdownItem>
							<DropdownItem onClick={() => setTypeFilter('vector_search')}>
								Vector Search
							</DropdownItem>
							<DropdownItem onClick={() => setTypeFilter('workflow')}>
								Workflow
							</DropdownItem>
							<DropdownItem onClick={() => setTypeFilter('script')}>
								Script
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
						aria-label='New Skill'
						variant='solid'
						icon='PlusSignCircle'
						onClick={handleOpenCreateModal}>
						New Skill
					</Button>
				</SubheaderRight>
			</Subheader>

			<Container className='flex h-full'>
				<div className='flex min-w-0 flex-1 flex-col gap-4'>
					{/* Stats Cards */}
					{!isLoading && !isError && <StatsCardsPartial skills={filteredSkills} />}

					{/* Main Content */}
					{isLoading ? (
						<LoadingStatePartial />
					) : isError ? (
						<ErrorStatePartial onRetry={() => refetch()} />
					) : filteredSkills.length === 0 ? (
						<EmptyStatePartial
							hasFilters={!!hasFilters}
							onClearFilters={clearFilters}
							onCreate={handleOpenCreateModal}
						/>
					) : (
						<div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
							{filteredSkills.map((skill) => (
								<Card key={skill.id} className='group relative'>
									<CardBody>
										<div className='flex items-start justify-between'>
											<div className='flex items-center gap-3'>
												<div
													className={`flex h-10 w-10 items-center justify-center rounded-lg bg-${SKILL_TYPE_COLORS[skill.type]}-100 dark:bg-${SKILL_TYPE_COLORS[skill.type]}-900/30`}>
													<Icon
														icon={SKILL_TYPE_ICONS[skill.type]}
														color={SKILL_TYPE_COLORS[skill.type]}
														size='text-xl'
													/>
												</div>
												<div>
													<div className='font-semibold text-zinc-900 dark:text-white'>
														{skill.name}
													</div>
													<Badge
														variant='soft'
														color={
															SKILL_TYPE_COLORS[skill.type]
														}>
														{SKILL_TYPE_LABELS[skill.type]}
													</Badge>
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
															handleOpenEditModal(skill)
														}>
														Edit
													</DropdownItem>
													<DropdownItem
														icon='Copy01'
														onClick={() => handleDuplicate(skill)}>
														Duplicate
													</DropdownItem>
													<DropdownItem
														icon='Delete02'
														onClick={() =>
															handleDelete(skill.id, skill.name)
														}>
														Delete
													</DropdownItem>
												</DropdownMenu>
											</Dropdown>
										</div>

										<p className='mt-3 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400'>
											{skill.description || 'No description'}
										</p>

										<div className='mt-4 text-xs text-zinc-500'>
											Created{' '}
											{new Date(skill.created_at * 1000).toLocaleDateString()}
										</div>

										<div className='mt-4'>
											<Button
												variant='outline'
												dimension='sm'
												icon='PencilEdit02'
												className='w-full'
												onClick={() => handleOpenEditModal(skill)}>
												Edit Configuration
											</Button>
										</div>
									</CardBody>
								</Card>
							))}
						</div>
					)}
				</div>
			</Container>

			{/* Skill Modal */}
			<SkillModalPartial
				isOpen={isModalOpen}
				onClose={() => {
					setIsModalOpen(false);
					setEditingSkill(null);
				}}
				onSubmit={handleModalSubmit}
				isLoading={createSkill.isPending || updateSkill.isPending}
				skill={editingSkill}
			/>
		</>
	);
};

export default SkillsListPage;
