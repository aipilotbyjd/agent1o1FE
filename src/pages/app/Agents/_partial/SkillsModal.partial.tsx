import { FC, useState, useMemo } from 'react';
import Modal, { ModalBody, ModalFooter, ModalHeader } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Icon from '@/components/icon/Icon';
import Badge from '@/components/ui/Badge';
import Input from '@/components/form/Input';
import FieldWrap from '@/components/form/FieldWrap';
import { useFetchAgentSkills } from '@/api/hooks/useAgents';
import { useCurrentWorkspaceId } from '@/context/workspaceContext';
import type { TAgentSkill } from '@/types/agent.type';

interface ISkillsModalPartialProps {
	isOpen: boolean;
	onClose: () => void;
	agentId?: string;
	attachedSkillIds: string[];
	onAttachSkill: (skillId: string) => void;
	onDetachSkill: (skillId: string) => void;
	isLoading?: boolean;
}

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

const SkillsModalPartial: FC<ISkillsModalPartialProps> = ({
	isOpen,
	onClose,
	attachedSkillIds,
	onAttachSkill,
	onDetachSkill,
	isLoading,
}) => {
	const workspaceId = useCurrentWorkspaceId();
	const [searchQuery, setSearchQuery] = useState('');

	const { data: skillsData, isLoading: isLoadingSkills } = useFetchAgentSkills(
		workspaceId || '',
	);

	const skills: TAgentSkill[] = useMemo(() => {
		if (!skillsData) return [];
		if (Array.isArray(skillsData)) return skillsData;
		if ('data' in skillsData && Array.isArray(skillsData.data)) return skillsData.data;
		return [];
	}, [skillsData]);

	const filteredSkills = useMemo(() => {
		if (!searchQuery) return skills;
		const query = searchQuery.toLowerCase();
		return skills.filter(
			(skill) =>
				skill.name.toLowerCase().includes(query) ||
				skill.description?.toLowerCase().includes(query),
		);
	}, [skills, searchQuery]);

	const attachedSkills = useMemo(
		() => filteredSkills.filter((s) => attachedSkillIds.includes(s.id)),
		[filteredSkills, attachedSkillIds],
	);

	const availableSkills = useMemo(
		() => filteredSkills.filter((s) => !attachedSkillIds.includes(s.id)),
		[filteredSkills, attachedSkillIds],
	);

	return (
		<Modal isOpen={isOpen} setIsOpen={onClose} size='lg'>
			<ModalHeader>
				<div className='flex items-center gap-3'>
					<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30'>
						<Icon icon='Tools' color='violet' size='text-xl' />
					</div>
					<div>
						<span>Manage Skills</span>
						<p className='text-sm font-normal text-zinc-500'>
							Attach skills to enhance agent capabilities
						</p>
					</div>
				</div>
			</ModalHeader>
			<ModalBody>
				<div className='space-y-6'>
					{/* Search */}
					<FieldWrap firstSuffix={<Icon icon='Search02' />}>
						<Input
							name='search'
							placeholder='Search skills...'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</FieldWrap>

					{isLoadingSkills ? (
						<div className='flex items-center justify-center py-8'>
							<Icon
								icon='Loading02'
								size='text-3xl'
								color='primary'
								className='animate-spin'
							/>
						</div>
					) : (
						<>
							{/* Attached Skills */}
							{attachedSkills.length > 0 && (
								<div>
									<h4 className='mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white'>
										<Icon icon='CheckmarkCircle02' color='emerald' />
										Attached Skills ({attachedSkills.length})
									</h4>
									<div className='space-y-2'>
										{attachedSkills.map((skill) => (
											<div
												key={skill.id}
												className='flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-900/20'>
												<div className='flex items-center gap-3'>
													<div
														className={`flex h-8 w-8 items-center justify-center rounded-lg bg-${SKILL_TYPE_COLORS[skill.type]}-100 dark:bg-${SKILL_TYPE_COLORS[skill.type]}-900/30`}>
														<Icon
															icon={
																SKILL_TYPE_ICONS[skill.type]
															}
															color={SKILL_TYPE_COLORS[skill.type]}
															size='text-sm'
														/>
													</div>
													<div>
														<div className='font-medium text-zinc-900 dark:text-white'>
															{skill.name}
														</div>
														<div className='text-xs text-zinc-500'>
															{skill.description ||
																'No description'}
														</div>
													</div>
												</div>
												<Button
													variant='outline'
													dimension='sm'
													color='red'
													icon='Delete02'
													onClick={() => onDetachSkill(skill.id)}
													isDisable={isLoading}>
													Remove
												</Button>
											</div>
										))}
									</div>
								</div>
							)}

							{/* Available Skills */}
							{availableSkills.length > 0 && (
								<div>
									<h4 className='mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white'>
										<Icon icon='PlusSignCircle' color='zinc' />
										Available Skills ({availableSkills.length})
									</h4>
									<div className='space-y-2'>
										{availableSkills.map((skill) => (
											<div
												key={skill.id}
												className='flex items-center justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-700'>
												<div className='flex items-center gap-3'>
													<div
														className={`flex h-8 w-8 items-center justify-center rounded-lg bg-${SKILL_TYPE_COLORS[skill.type]}-100 dark:bg-${SKILL_TYPE_COLORS[skill.type]}-900/30`}>
														<Icon
															icon={
																SKILL_TYPE_ICONS[skill.type]
															}
															color={SKILL_TYPE_COLORS[skill.type]}
															size='text-sm'
														/>
													</div>
													<div>
														<div className='font-medium text-zinc-900 dark:text-white'>
															{skill.name}
														</div>
														<div className='flex items-center gap-2'>
															<Badge
																variant='soft'
																color={
																	SKILL_TYPE_COLORS[
																		skill.type
																	]
																}>
																{skill.type.replace('_', ' ')}
															</Badge>
															<span className='text-xs text-zinc-500'>
																{skill.description ||
																	'No description'}
															</span>
														</div>
													</div>
												</div>
												<Button
													variant='outline'
													dimension='sm'
													icon='Add01'
													onClick={() => onAttachSkill(skill.id)}
													isDisable={isLoading}>
													Add
												</Button>
											</div>
										))}
									</div>
								</div>
							)}

							{/* Empty State */}
							{filteredSkills.length === 0 && (
								<div className='flex flex-col items-center justify-center py-8'>
									<Icon icon='Tools' size='text-4xl' color='zinc' />
									<p className='mt-2 text-sm text-zinc-500'>
										{searchQuery
											? 'No skills found'
											: 'No skills available'}
									</p>
								</div>
							)}
						</>
					)}
				</div>
			</ModalBody>
			<ModalFooter>
				<Button variant='solid' onClick={onClose}>
					Done
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default SkillsModalPartial;
