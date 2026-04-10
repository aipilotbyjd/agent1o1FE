import { FC, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
	DragDropContext,
	Droppable,
	Draggable,
	DropResult,
} from '@hello-pangea/dnd';
import Card, { CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Icon from '@/components/icon/Icon';
import Checkbox from '@/components/form/Checkbox';
import Dropdown, {
	DropdownMenu,
	DropdownItem,
	DropdownToggle,
	DropdownDivider,
} from '@/components/ui/Dropdown';
import { IWorkflow, TWorkflowStatus } from '@/types/workflow.type';
import { IFolder } from '@/types/folder.type';
import { STATUS_COLORS } from '../_helper/helper';
import type { TViewMode } from './ViewToggle.partial';
import type { TColors } from '@/types/colors.type';

dayjs.extend(relativeTime);

interface ITablePartialProps {
	workflows: IWorkflow[];
	folders: IFolder[];
	viewMode: TViewMode;
	selectedIds: string[];
	onSelectionChange: (ids: string[]) => void;
	previewWorkflowId: string | null;
	onPreviewChange: (id: string | null) => void;
	onRun: (id: string) => void;
	onEdit: (id: string) => void;
	onDuplicate: (id: string) => void;
	onDelete: (id: string) => void;
	onToggleStatus: (id: string, status: TWorkflowStatus) => void;
	onToggleFavorite: (id: string, isFavorite: boolean) => void;
	onMoveToFolder: (workflowId: string) => void;
	onEditFolder: (folder: IFolder) => void;
	onDeleteFolder: (folderId: string) => void;
	isRunning?: string | null;
}

// ─── Table View ─────────────────────────────────────────────

const TableRow: FC<{
	workflow: IWorkflow;
	isSelected: boolean;
	isPreview: boolean;
	onSelect: (checked: boolean) => void;
	onPreview: () => void;
	onRun: () => void;
	onEdit: () => void;
	onDuplicate: () => void;
	onDelete: () => void;
	onToggleStatus: () => void;
	onToggleFavorite: () => void;
	onMove: () => void;
	isRunning?: boolean;
}> = ({
	workflow,
	isSelected,
	isPreview,
	onSelect,
	onPreview,
	onRun,
	onEdit,
	onDuplicate,
	onDelete,
	onToggleStatus,
	onToggleFavorite,
	onMove,
	isRunning,
}) => {
	const statusColor = STATUS_COLORS[workflow.status] as TColors;

	return (
		<tr
			className={`group cursor-pointer border-b border-zinc-100 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50 ${
				isPreview ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
			} ${isSelected ? 'bg-primary-50/30 dark:bg-primary-900/5' : ''}`}
			onClick={onPreview}>
			{/* Checkbox */}
			<td className='w-12 px-3 py-3' onClick={(e) => e.stopPropagation()}>
				<Checkbox
					dimension='sm'
					checked={isSelected}
					onChange={(e) => onSelect(e.target.checked)}
				/>
			</td>

			{/* Favorite */}
			<td className='w-10 px-1 py-3' onClick={(e) => e.stopPropagation()}>
				<button
					type='button'
					className='text-zinc-300 transition-colors hover:text-amber-500 dark:text-zinc-600'
					onClick={onToggleFavorite}>
					<Icon
						icon={workflow.is_favorite ? 'StarFill' : 'Star'}
						className={workflow.is_favorite ? 'text-amber-500' : ''}
						size='text-lg'
					/>
				</button>
			</td>

			{/* Name */}
			<td className='min-w-[200px] px-3 py-3'>
				<div className='flex items-center gap-3'>
					<div
						className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
							workflow.color
								? workflow.color
								: 'bg-primary-100 dark:bg-primary-900/30'
						}`}>
						<Icon
							icon={workflow.icon || 'Workflow'}
							size='text-xl'
							className={workflow.color ? 'text-white' : 'text-primary-500'}
						/>
					</div>
					<div className='min-w-0'>
						<div className='truncate font-medium text-zinc-900 dark:text-white'>
							{workflow.name}
						</div>
						{workflow.description && (
							<div className='truncate text-xs text-zinc-400'>
								{workflow.description}
							</div>
						)}
					</div>
				</div>
			</td>

			{/* Status */}
			<td className='px-3 py-3'>
				<Badge variant='outline' color={statusColor} className='capitalize'>
					{workflow.status}
				</Badge>
			</td>

			{/* Executions */}
			<td className='px-3 py-3 text-sm text-zinc-600 dark:text-zinc-400'>
				{workflow.execution_count.toLocaleString()}
			</td>

			{/* Last Run */}
			<td className='px-3 py-3 text-sm text-zinc-500'>
				{workflow.last_executed_at
					? dayjs.unix(workflow.last_executed_at).fromNow()
					: 'Never'}
			</td>

			{/* Actions */}
			<td className='w-12 px-3 py-3' onClick={(e) => e.stopPropagation()}>
				<Dropdown>
					<DropdownToggle hasIcon={false}>
						<Button
							aria-label='Actions'
							variant='link'
							dimension='xs'
							icon='MoreVertical'
							className='opacity-0 transition-opacity group-hover:opacity-100'
						/>
					</DropdownToggle>
					<DropdownMenu placement='bottom-end'>
						<DropdownItem onClick={onRun}>
							<Icon icon='PlayCircle' className='me-2 text-emerald-500' />
							{isRunning ? 'Running...' : 'Run'}
						</DropdownItem>
						<DropdownItem onClick={onEdit}>
							<Icon icon='Edit02' className='me-2' />
							Edit
						</DropdownItem>
						<DropdownItem onClick={onDuplicate}>
							<Icon icon='Copy01' className='me-2' />
							Duplicate
						</DropdownItem>
						<DropdownItem onClick={onMove}>
							<Icon icon='FolderAdd' className='me-2' />
							Move to Folder
						</DropdownItem>
						<DropdownDivider />
						<DropdownItem onClick={onToggleStatus}>
							<Icon
								icon={workflow.status === 'active' ? 'PauseCircle' : 'PlayCircle'}
								className={`me-2 ${workflow.status === 'active' ? 'text-amber-500' : 'text-emerald-500'}`}
							/>
							{workflow.status === 'active' ? 'Deactivate' : 'Activate'}
						</DropdownItem>
						<DropdownDivider />
						<DropdownItem onClick={onDelete}>
							<Icon icon='Delete02' className='me-2 text-red-500' />
							Delete
						</DropdownItem>
					</DropdownMenu>
				</Dropdown>
			</td>
		</tr>
	);
};

// ─── Grid Card ──────────────────────────────────────────────

const GridCard: FC<{
	workflow: IWorkflow;
	isSelected: boolean;
	onSelect: (checked: boolean) => void;
	onPreview: () => void;
	onRun: () => void;
	onEdit: () => void;
	onToggleFavorite: () => void;
	isRunning?: boolean;
}> = ({ workflow, isSelected, onSelect, onPreview, onRun, onEdit, onToggleFavorite, isRunning }) => {
	const statusColor = STATUS_COLORS[workflow.status] as TColors;

	return (
		<Card
			className={`group cursor-pointer transition-all hover:shadow-md ${
				isSelected ? 'ring-primary-500 ring-2' : ''
			}`}
			onClick={onPreview}>
			<CardBody className='p-4'>
				{/* Header */}
				<div className='mb-3 flex items-start justify-between'>
					<div
						className={`flex h-12 w-12 items-center justify-center rounded-xl ${
							workflow.color || 'bg-primary-100 dark:bg-primary-900/30'
						}`}>
						<Icon
							icon={workflow.icon || 'Workflow'}
							size='text-2xl'
							className={workflow.color ? 'text-white' : 'text-primary-500'}
						/>
					</div>
					<div className='flex items-center gap-1' onClick={(e) => e.stopPropagation()}>
						<button
							type='button'
							className='text-zinc-300 transition-colors hover:text-amber-500'
							onClick={onToggleFavorite}>
							<Icon
								icon={workflow.is_favorite ? 'StarFill' : 'Star'}
								className={workflow.is_favorite ? 'text-amber-500' : ''}
							/>
						</button>
						<Checkbox
							dimension='sm'
							checked={isSelected}
							onChange={(e) => onSelect(e.target.checked)}
						/>
					</div>
				</div>

				{/* Title & Description */}
				<h4 className='mb-1 truncate font-semibold text-zinc-900 dark:text-white'>
					{workflow.name}
				</h4>
				{workflow.description && (
					<p className='mb-3 line-clamp-2 text-sm text-zinc-500'>
						{workflow.description}
					</p>
				)}

				{/* Status */}
				<div className='mb-3'>
					<Badge variant='outline' color={statusColor} className='capitalize'>
						{workflow.status}
					</Badge>
				</div>

				{/* Stats */}
				<div className='mb-3 flex items-center justify-between text-xs text-zinc-400'>
					<span>{workflow.execution_count} runs</span>
					<span>
						{workflow.last_executed_at
							? dayjs.unix(workflow.last_executed_at).fromNow()
							: 'Never run'}
					</span>
				</div>

				{/* Actions */}
				<div
					className='flex gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800'
					onClick={(e) => e.stopPropagation()}>
					<Button
						variant='outline'
						dimension='sm'
						className='flex-1'
						icon='PlayCircle'
						isLoading={isRunning}
						onClick={onRun}>
						Run
					</Button>
					<Button
						variant='outline'
						dimension='sm'
						className='flex-1'
						icon='Edit02'
						onClick={onEdit}>
						Edit
					</Button>
				</div>
			</CardBody>
		</Card>
	);
};

// ─── Compact Row ────────────────────────────────────────────

const CompactRow: FC<{
	workflow: IWorkflow;
	isSelected: boolean;
	onSelect: (checked: boolean) => void;
	onPreview: () => void;
	onToggleFavorite: () => void;
	onToggleStatus: () => void;
}> = ({ workflow, isSelected, onSelect, onPreview, onToggleFavorite, onToggleStatus }) => {
	const statusColor = STATUS_COLORS[workflow.status] as TColors;

	return (
		<div
			className={`flex cursor-pointer items-center gap-3 border-b border-zinc-100 px-4 py-2 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50 ${
				isSelected ? 'bg-primary-50/30 dark:bg-primary-900/5' : ''
			}`}
			onClick={onPreview}>
			<div onClick={(e) => e.stopPropagation()}>
				<Checkbox
					dimension='sm'
					checked={isSelected}
					onChange={(e) => onSelect(e.target.checked)}
				/>
			</div>
			<div onClick={(e) => e.stopPropagation()}>
				<button
					type='button'
					className='text-zinc-300 hover:text-amber-500'
					onClick={onToggleFavorite}>
					<Icon
						icon={workflow.is_favorite ? 'StarFill' : 'Star'}
						className={workflow.is_favorite ? 'text-amber-500' : ''}
						size='text-sm'
					/>
				</button>
			</div>
			<Icon
				icon={workflow.icon || 'Workflow'}
				size='text-lg'
				className='text-primary-500 shrink-0'
			/>
			<span className='min-w-0 flex-1 truncate text-sm font-medium text-zinc-900 dark:text-white'>
				{workflow.name}
			</span>
			<Badge variant='outline' color={statusColor} className='capitalize text-xs'>
				{workflow.status}
			</Badge>
			<span className='text-xs text-zinc-400'>{workflow.execution_count} runs</span>
			<div onClick={(e) => e.stopPropagation()}>
				<button
					type='button'
					className='text-zinc-400 hover:text-zinc-600'
					onClick={onToggleStatus}>
					<Icon
						icon={workflow.status === 'active' ? 'PauseCircle' : 'PlayCircle'}
						size='text-lg'
					/>
				</button>
			</div>
		</div>
	);
};

// ─── Folder Section ─────────────────────────────────────────

const FolderSection: FC<{
	folder: IFolder;
	workflows: IWorkflow[];
	isExpanded: boolean;
	onToggleExpand: () => void;
	onEditFolder: () => void;
	onDeleteFolder: () => void;
	children: React.ReactNode;
}> = ({ folder, workflows, isExpanded, onToggleExpand, onEditFolder, onDeleteFolder, children }) => {
	return (
		<div className='mb-2'>
			{/* Folder Header */}
			<div className='flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'>
				<button type='button' onClick={onToggleExpand} className='text-zinc-400'>
					<Icon icon={isExpanded ? 'ArrowDown01' : 'ArrowRight01'} size='text-lg' />
				</button>
				<div
					className={`flex h-8 w-8 items-center justify-center rounded-lg ${folder.color} bg-opacity-20`}>
					<Icon icon={folder.icon} className='text-white' />
				</div>
				<span className='font-medium text-zinc-900 dark:text-white'>{folder.name}</span>
				<Badge variant='outline' color='zinc' className='text-xs'>
					{workflows.length}
				</Badge>
				<div className='flex-1' />
				<Dropdown>
					<DropdownToggle hasIcon={false}>
						<Button
							aria-label='Folder actions'
							variant='link'
							dimension='xs'
							icon='MoreVertical'
							className='opacity-0 transition-opacity group-hover:opacity-100'
						/>
					</DropdownToggle>
					<DropdownMenu placement='bottom-end'>
						<DropdownItem onClick={onEditFolder}>
							<Icon icon='Edit02' className='me-2' />
							Edit Folder
						</DropdownItem>
						<DropdownDivider />
						<DropdownItem onClick={onDeleteFolder}>
							<Icon icon='Delete02' className='me-2 text-red-500' />
							Delete Folder
						</DropdownItem>
					</DropdownMenu>
				</Dropdown>
			</div>

			{/* Folder Content */}
			{isExpanded && (
				<div className='ml-7 border-l-2 border-zinc-200 dark:border-zinc-700'>
					{children}
				</div>
			)}
		</div>
	);
};

// ─── Main Table Partial ─────────────────────────────────────

const TablePartial: FC<ITablePartialProps> = ({
	workflows,
	folders,
	viewMode,
	selectedIds,
	onSelectionChange,
	previewWorkflowId,
	onPreviewChange,
	onRun,
	onEdit: _onEdit,
	onDuplicate,
	onDelete,
	onToggleStatus,
	onToggleFavorite,
	onMoveToFolder,
	onEditFolder,
	onDeleteFolder,
	isRunning,
}) => {
	const navigate = useNavigate();
	const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

	// Group workflows by folder
	const { folderedWorkflows, uncategorized } = useMemo(() => {
		const foldered = new Map<string, IWorkflow[]>();
		const uncat: IWorkflow[] = [];

		workflows.forEach((wf) => {
			if (wf.folder_id) {
				const existing = foldered.get(wf.folder_id) || [];
				existing.push(wf);
				foldered.set(wf.folder_id, existing);
			} else {
				uncat.push(wf);
			}
		});

		return { folderedWorkflows: foldered, uncategorized: uncat };
	}, [workflows]);

	const toggleFolderExpand = useCallback((folderId: string) => {
		setExpandedFolders((prev) => {
			const next = new Set(prev);
			if (next.has(folderId)) next.delete(folderId);
			else next.add(folderId);
			return next;
		});
	}, []);

	const toggleSelection = useCallback(
		(id: string, checked: boolean) => {
			if (checked) {
				onSelectionChange([...selectedIds, id]);
			} else {
				onSelectionChange(selectedIds.filter((sid) => sid !== id));
			}
		},
		[selectedIds, onSelectionChange],
	);

	const selectAll = useCallback(() => {
		if (selectedIds.length === workflows.length) {
			onSelectionChange([]);
		} else {
			onSelectionChange(workflows.map((w) => w.id));
		}
	}, [selectedIds, workflows, onSelectionChange]);

	const handleDragEnd = useCallback(
		(result: DropResult) => {
			if (!result.destination) return;
			// Handle drag to folder
			const workflowId = result.draggableId;
			const destinationFolderId = result.destination.droppableId;
			if (destinationFolderId === 'uncategorized') {
				onToggleStatus(workflowId, 'active'); // placeholder — would be onMoveToFolder(null)
			}
		},
		[onToggleStatus],
	);

	const handleEdit = useCallback(
		(id: string) => {
			navigate(`/app/story-builder/${id}`);
		},
		[navigate],
	);

	// ─── Render Functions ─────────────────────────────────

	const renderWorkflowRow = (workflow: IWorkflow) => (
		<TableRow
			key={workflow.id}
			workflow={workflow}
			isSelected={selectedIds.includes(workflow.id)}
			isPreview={previewWorkflowId === workflow.id}
			onSelect={(checked) => toggleSelection(workflow.id, checked)}
			onPreview={() => onPreviewChange(workflow.id)}
			onRun={() => onRun(workflow.id)}
			onEdit={() => handleEdit(workflow.id)}
			onDuplicate={() => onDuplicate(workflow.id)}
			onDelete={() => onDelete(workflow.id)}
			onToggleStatus={() => onToggleStatus(workflow.id, workflow.status)}
			onToggleFavorite={() => onToggleFavorite(workflow.id, !workflow.is_favorite)}
			onMove={() => onMoveToFolder(workflow.id)}
			isRunning={isRunning === workflow.id}
		/>
	);

	const renderWorkflowCard = (workflow: IWorkflow) => (
		<GridCard
			key={workflow.id}
			workflow={workflow}
			isSelected={selectedIds.includes(workflow.id)}
			onSelect={(checked) => toggleSelection(workflow.id, checked)}
			onPreview={() => onPreviewChange(workflow.id)}
			onRun={() => onRun(workflow.id)}
			onEdit={() => handleEdit(workflow.id)}
			onToggleFavorite={() => onToggleFavorite(workflow.id, !workflow.is_favorite)}
			isRunning={isRunning === workflow.id}
		/>
	);

	const renderCompactRow = (workflow: IWorkflow) => (
		<CompactRow
			key={workflow.id}
			workflow={workflow}
			isSelected={selectedIds.includes(workflow.id)}
			onSelect={(checked) => toggleSelection(workflow.id, checked)}
			onPreview={() => onPreviewChange(workflow.id)}
			onToggleFavorite={() => onToggleFavorite(workflow.id, !workflow.is_favorite)}
			onToggleStatus={() => onToggleStatus(workflow.id, workflow.status)}
		/>
	);

	// ─── Table View ───────────────────────────────────────

	if (viewMode === 'table') {
		return (
			<DragDropContext onDragEnd={handleDragEnd}>
				<Card className='overflow-hidden'>
					<CardBody className='p-0'>
						<div className='overflow-x-auto'>
							<table className='w-full'>
								<thead>
									<tr className='border-b border-zinc-200 bg-zinc-50/50 dark:border-zinc-700 dark:bg-zinc-800/30'>
										<th className='w-12 px-3 py-3'>
											<Checkbox
												dimension='sm'
												checked={
													selectedIds.length === workflows.length &&
													workflows.length > 0
												}
												onChange={selectAll}
											/>
										</th>
										<th className='w-10 px-1 py-3' />
										<th className='px-3 py-3 text-left text-xs font-medium text-zinc-500'>
											Name
										</th>
										<th className='px-3 py-3 text-left text-xs font-medium text-zinc-500'>
											Status
										</th>
										<th className='px-3 py-3 text-left text-xs font-medium text-zinc-500'>
											Runs
										</th>
										<th className='px-3 py-3 text-left text-xs font-medium text-zinc-500'>
											Last Run
										</th>
										<th className='w-12 px-3 py-3' />
									</tr>
								</thead>
								<tbody>
									{/* Folders */}
									{folders.map((folder) => {
										const folderWfs =
											folderedWorkflows.get(folder.id) || [];
										if (folderWfs.length === 0) return null;
										return (
											<Droppable
												key={folder.id}
												droppableId={folder.id}>
												{(provided) => (
													<>
														<tr
															className='border-b border-zinc-200 bg-zinc-50/30 dark:border-zinc-700 dark:bg-zinc-800/20'
															onClick={() =>
																toggleFolderExpand(folder.id)
															}>
															<td
																colSpan={7}
																className='px-3 py-2'>
																<FolderSection
																	folder={folder}
																	workflows={folderWfs}
																	isExpanded={expandedFolders.has(
																		folder.id,
																	)}
																	onToggleExpand={() =>
																		toggleFolderExpand(
																			folder.id,
																		)
																	}
																	onEditFolder={() =>
																		onEditFolder(folder)
																	}
																	onDeleteFolder={() =>
																		onDeleteFolder(folder.id)
																	}>
																	<table
																		className='w-full'
																		ref={provided.innerRef}
																		{...provided.droppableProps}>
																		<tbody>
																			{folderWfs.map(
																				(wf, idx) => (
																					<Draggable
																						key={wf.id}
																						draggableId={
																							wf.id
																						}
																						index={idx}>
																						{(
																							dragProvided,
																						) => (
																							<tr
																								ref={
																									dragProvided.innerRef
																								}
																								{...dragProvided.draggableProps}
																								{...dragProvided.dragHandleProps}>
																								<td
																									colSpan={
																										7
																									}>
																									{renderWorkflowRow(
																										wf,
																									)}
																								</td>
																							</tr>
																						)}
																					</Draggable>
																				),
																			)}
																			{
																				provided.placeholder
																			}
																		</tbody>
																	</table>
																</FolderSection>
															</td>
														</tr>
													</>
												)}
											</Droppable>
										);
									})}

									{/* Uncategorized */}
									{uncategorized.map(renderWorkflowRow)}
								</tbody>
							</table>
						</div>
					</CardBody>
				</Card>
			</DragDropContext>
		);
	}

	// ─── Grid View ────────────────────────────────────────

	if (viewMode === 'grid') {
		return (
			<div className='space-y-6'>
				{/* Folders */}
				{folders.map((folder) => {
					const folderWfs = folderedWorkflows.get(folder.id) || [];
					if (folderWfs.length === 0) return null;
					return (
						<FolderSection
							key={folder.id}
							folder={folder}
							workflows={folderWfs}
							isExpanded={expandedFolders.has(folder.id)}
							onToggleExpand={() => toggleFolderExpand(folder.id)}
							onEditFolder={() => onEditFolder(folder)}
							onDeleteFolder={() => onDeleteFolder(folder.id)}>
							<div className='grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3'>
								{folderWfs.map(renderWorkflowCard)}
							</div>
						</FolderSection>
					);
				})}

				{/* Uncategorized */}
				{uncategorized.length > 0 && (
					<div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
						{uncategorized.map(renderWorkflowCard)}
					</div>
				)}
			</div>
		);
	}

	// ─── Compact View ─────────────────────────────────────

	return (
		<Card className='overflow-hidden'>
			<CardBody className='p-0'>
				{/* Folders */}
				{folders.map((folder) => {
					const folderWfs = folderedWorkflows.get(folder.id) || [];
					if (folderWfs.length === 0) return null;
					return (
						<FolderSection
							key={folder.id}
							folder={folder}
							workflows={folderWfs}
							isExpanded={expandedFolders.has(folder.id)}
							onToggleExpand={() => toggleFolderExpand(folder.id)}
							onEditFolder={() => onEditFolder(folder)}
							onDeleteFolder={() => onDeleteFolder(folder.id)}>
							{folderWfs.map(renderCompactRow)}
						</FolderSection>
					);
				})}

				{/* Uncategorized */}
				{uncategorized.map(renderCompactRow)}
			</CardBody>
		</Card>
	);
};

export default TablePartial;
