import Container from '@/components/layout/Container';
import { useNavigate, useOutletContext } from 'react-router';
import { OutletContextType } from './_layouts/Workflows.layout';
import { useEffect, useState, useMemo, useCallback } from 'react';
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
import { Range } from 'react-date-range';
import { useCurrentWorkspaceId } from '@/context/workspaceContext';
import {
	useFetchWorkflows,
	useDeleteWorkflow,
	useExecuteWorkflow,
	useActivateWorkflow,
	useDeactivateWorkflow,
	useDuplicateWorkflow,
	useToggleFavorite,
	useUpdateWorkflow,
} from '@/api/hooks/useWorkflows';
import {
	useFetchFolders,
	useCreateFolder,
	useUpdateFolder,
	useDeleteFolder,
} from '@/api/hooks/useFolders';
import type {
	IWorkflow,
	TWorkflowStatus,
	TWorkflowSortBy,
	TSortOrder,
} from '@/types/workflow.type';
import type { IFolder, ICreateFolderDto } from '@/types/folder.type';

import StatsCardsPartial from './_partial/StatsCards.partial';
import ViewTogglePartial, { TViewMode } from './_partial/ViewToggle.partial';
import FiltersPartial from './_partial/Filters.partial';
import BulkActionsPartial from './_partial/BulkActions.partial';
import EmptyStatePartial from './_partial/EmptyState.partial';
import { LoadingStatePartial, ErrorStatePartial } from './_partial/States.partial';
import TablePartial from './_partial/Table.partial';
import FolderModalPartial from './_partial/FolderModal.partial';
import MoveToFolderModalPartial from './_partial/MoveToFolderModal.partial';
import PreviewPanelPartial from './_partial/PreviewPanel.partial';

const WorkflowsListPage = () => {
	const navigate = useNavigate();
	const workspaceId = useCurrentWorkspaceId();

	// ─── State ────────────────────────────────────────────
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState<TWorkflowStatus | ''>('');
	const [sortBy, setSortBy] = useState<TWorkflowSortBy>('updated_at');
	const [sortOrder, setSortOrder] = useState<TSortOrder>('desc');
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [tagSearchQuery, setTagSearchQuery] = useState('');
	const [dateRange, setDateRange] = useState<Range[]>([
		{ startDate: undefined, endDate: undefined, key: 'selection' },
	]);
	const [viewMode, setViewMode] = useState<TViewMode>('table');
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [previewWorkflowId, setPreviewWorkflowId] = useState<string | null>(null);
	const [runningWorkflowId, setRunningWorkflowId] = useState<string | null>(null);

	// Folder modals
	const [folderModalOpen, setFolderModalOpen] = useState(false);
	const [editingFolder, setEditingFolder] = useState<IFolder | null>(null);
	const [moveModalOpen, setMoveModalOpen] = useState(false);
	const [movingWorkflowId, setMovingWorkflowId] = useState<string | null>(null);

	// ─── Breadcrumb ───────────────────────────────────────
	const { setHeaderLeft } = useOutletContext<OutletContextType>();

	useEffect(() => {
		setHeaderLeft(<Breadcrumb list={[{ ...pages.app.appMain.subPages.workflows }]} />);
		return () => setHeaderLeft(undefined);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// ─── API Hooks ────────────────────────────────────────
	const {
		data: workflowsData,
		isLoading,
		isError,
		refetch,
	} = useFetchWorkflows(workspaceId || '', {
		search: searchQuery || undefined,
		status: statusFilter || undefined,
		sort: sortBy,
		order: sortOrder,
	});

	const { data: folders = [] } = useFetchFolders(workspaceId || '');

	const deleteWorkflow = useDeleteWorkflow(workspaceId || '');
	const executeWorkflow = useExecuteWorkflow(workspaceId || '');
	const activateWorkflow = useActivateWorkflow(workspaceId || '');
	const deactivateWorkflow = useDeactivateWorkflow(workspaceId || '');
	const duplicateWorkflow = useDuplicateWorkflow(workspaceId || '');
	const toggleFavorite = useToggleFavorite(workspaceId || '');
	const updateWorkflow = useUpdateWorkflow(workspaceId || '');
	const createFolder = useCreateFolder(workspaceId || '');
	const updateFolder = useUpdateFolder(workspaceId || '');
	const deleteFolder = useDeleteFolder(workspaceId || '');

	// ─── Derived Data ─────────────────────────────────────
	const workflows: IWorkflow[] = useMemo(() => {
		if (!workflowsData) return [];
		if (Array.isArray(workflowsData)) return workflowsData;
		if ('data' in workflowsData && Array.isArray(workflowsData.data))
			return workflowsData.data;
		return [];
	}, [workflowsData]);

	const filteredWorkflows = useMemo(() => {
		let result = [...workflows];

		if (selectedTags.length > 0) {
			result = result.filter((w) =>
				selectedTags.some((tag) => w.tags?.includes(tag)),
			);
		}

		if (dateRange[0].startDate && dateRange[0].endDate) {
			const start = dateRange[0].startDate.getTime() / 1000;
			const end = dateRange[0].endDate.getTime() / 1000;
			result = result.filter(
				(w) => w.created_at >= start && w.created_at <= end,
			);
		}

		return result;
	}, [workflows, selectedTags, dateRange]);

	const previewWorkflow = useMemo(
		() => filteredWorkflows.find((w) => w.id === previewWorkflowId) || null,
		[filteredWorkflows, previewWorkflowId],
	);

	const selectedWorkflows = useMemo(
		() => filteredWorkflows.filter((w) => selectedIds.includes(w.id)),
		[filteredWorkflows, selectedIds],
	);

	const hasFilters =
		searchQuery ||
		statusFilter ||
		selectedTags.length > 0 ||
		(dateRange[0].startDate && dateRange[0].endDate);

	// ─── Handlers ─────────────────────────────────────────
	const handleRun = useCallback(
		async (id: string) => {
			setRunningWorkflowId(id);
			try {
				await executeWorkflow.mutateAsync(id);
			} finally {
				setRunningWorkflowId(null);
			}
		},
		[executeWorkflow],
	);

	const handleEdit = useCallback(
		(id: string) => {
			navigate(`/app/story-builder/${id}`);
		},
		[navigate],
	);

	const handleToggleStatus = useCallback(
		(id: string, currentStatus: TWorkflowStatus) => {
			if (currentStatus === 'active') {
				deactivateWorkflow.mutate(id);
			} else {
				activateWorkflow.mutate(id);
			}
		},
		[activateWorkflow, deactivateWorkflow],
	);

	const handleDelete = useCallback(
		(id: string) => {
			if (window.confirm('Are you sure you want to delete this workflow?')) {
				deleteWorkflow.mutate(id);
				if (previewWorkflowId === id) setPreviewWorkflowId(null);
				setSelectedIds((prev) => prev.filter((sid) => sid !== id));
			}
		},
		[deleteWorkflow, previewWorkflowId],
	);

	const handleToggleFavorite = useCallback(
		(id: string, isFavorite: boolean) => {
			toggleFavorite.mutate({ id, is_favorite: isFavorite });
		},
		[toggleFavorite],
	);

	const handleMoveToFolder = useCallback((workflowId: string) => {
		setMovingWorkflowId(workflowId);
		setMoveModalOpen(true);
	}, []);

	const handleMoveConfirm = useCallback(
		async (folderId: string | null) => {
			const ids = movingWorkflowId ? [movingWorkflowId] : selectedIds;
			for (const id of ids) {
				await updateWorkflow.mutateAsync({ id, data: { folder_id: folderId } });
			}
			setMoveModalOpen(false);
			setMovingWorkflowId(null);
		},
		[movingWorkflowId, selectedIds, updateWorkflow],
	);

	const handleBulkActivate = useCallback(() => {
		selectedIds.forEach((id) => activateWorkflow.mutate(id));
		setSelectedIds([]);
	}, [selectedIds, activateWorkflow]);

	const handleBulkDeactivate = useCallback(() => {
		selectedIds.forEach((id) => deactivateWorkflow.mutate(id));
		setSelectedIds([]);
	}, [selectedIds, deactivateWorkflow]);

	const handleBulkDelete = useCallback(() => {
		if (
			window.confirm(
				`Are you sure you want to delete ${selectedIds.length} workflow(s)?`,
			)
		) {
			selectedIds.forEach((id) => deleteWorkflow.mutate(id));
			setSelectedIds([]);
		}
	}, [selectedIds, deleteWorkflow]);

	const handleBulkMove = useCallback(() => {
		setMovingWorkflowId(null);
		setMoveModalOpen(true);
	}, []);

	const handleFolderSubmit = useCallback(
		async (values: ICreateFolderDto) => {
			if (editingFolder) {
				await updateFolder.mutateAsync({ id: editingFolder.id, data: values });
			} else {
				await createFolder.mutateAsync(values);
			}
			setFolderModalOpen(false);
			setEditingFolder(null);
		},
		[editingFolder, createFolder, updateFolder],
	);

	const handleEditFolder = useCallback((folder: IFolder) => {
		setEditingFolder(folder);
		setFolderModalOpen(true);
	}, []);

	const handleDeleteFolder = useCallback(
		(folderId: string) => {
			if (
				window.confirm(
					'Delete this folder? Workflows inside will be uncategorized.',
				)
			) {
				deleteFolder.mutate(folderId);
			}
		},
		[deleteFolder],
	);

	const clearFilters = useCallback(() => {
		setSearchQuery('');
		setStatusFilter('');
		setSelectedTags([]);
		setDateRange([{ startDate: undefined, endDate: undefined, key: 'selection' }]);
	}, []);

	// ─── Render ───────────────────────────────────────────
	return (
		<>
			<Subheader>
				<SubheaderLeft>
					<FieldWrap firstSuffix={<Icon icon='Search02' />}>
						<Input
							name='search'
							variant='solid'
							placeholder='Search workflows...'
							dimension='sm'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</FieldWrap>
				</SubheaderLeft>
				<SubheaderRight>
					<ViewTogglePartial viewMode={viewMode} onViewModeChange={setViewMode} />
					<SubheaderSeparator />
					<FiltersPartial
						statusFilter={statusFilter}
						setStatusFilter={setStatusFilter}
						sortBy={sortBy}
						setSortBy={setSortBy}
						sortOrder={sortOrder}
						setSortOrder={setSortOrder}
						selectedTags={selectedTags}
						setSelectedTags={setSelectedTags}
						tagSearchQuery={tagSearchQuery}
						setTagSearchQuery={setTagSearchQuery}
						dateRange={dateRange}
						setDateRange={setDateRange}
					/>
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
						aria-label='New Folder'
						variant='soft'
						dimension='sm'
						icon='FolderAdd'
						onClick={() => {
							setEditingFolder(null);
							setFolderModalOpen(true);
						}}>
						Folder
					</Button>
					<Button
						aria-label='New Workflow'
						variant='solid'
						icon='PlusSignCircle'
						onClick={() => navigate('/app/story-builder/new')}>
						New Workflow
					</Button>
				</SubheaderRight>
			</Subheader>

			<Container className='flex h-full gap-4'>
				<div className='flex min-w-0 flex-1 flex-col gap-4'>
					{/* Stats Cards - always show, even with 0 workflows */}
					{!isLoading && !isError && (
						<StatsCardsPartial workflows={filteredWorkflows} />
					)}

					{/* Bulk Actions Bar */}
					{selectedIds.length > 0 && (
						<BulkActionsPartial
							selectedWorkflows={selectedWorkflows}
							onActivate={handleBulkActivate}
							onDeactivate={handleBulkDeactivate}
							onMove={handleBulkMove}
							onDelete={handleBulkDelete}
							onClearSelection={() => setSelectedIds([])}
							isLoading={
								activateWorkflow.isPending ||
								deactivateWorkflow.isPending ||
								deleteWorkflow.isPending
							}
						/>
					)}

					{/* Main Content */}
					{isLoading ? (
						<LoadingStatePartial />
					) : isError ? (
						<ErrorStatePartial onRetry={() => refetch()} />
					) : filteredWorkflows.length === 0 ? (
						<EmptyStatePartial
							hasFilters={!!hasFilters}
							onClearFilters={clearFilters}
						/>
					) : (
						<TablePartial
							workflows={filteredWorkflows}
							folders={folders}
							viewMode={viewMode}
							selectedIds={selectedIds}
							onSelectionChange={setSelectedIds}
							previewWorkflowId={previewWorkflowId}
							onPreviewChange={setPreviewWorkflowId}
							onRun={handleRun}
							onEdit={handleEdit}
							onDuplicate={(id) => duplicateWorkflow.mutate(id)}
							onDelete={handleDelete}
							onToggleStatus={handleToggleStatus}
							onToggleFavorite={handleToggleFavorite}
							onMoveToFolder={handleMoveToFolder}
							onEditFolder={handleEditFolder}
							onDeleteFolder={handleDeleteFolder}
							isRunning={runningWorkflowId}
						/>
					)}
				</div>

				{/* Preview Panel */}
				{previewWorkflow && (
					<PreviewPanelPartial
						workflow={previewWorkflow}
						onClose={() => setPreviewWorkflowId(null)}
						onRun={handleRun}
						onEdit={handleEdit}
						onToggleStatus={(id) => {
							const wf = workflows.find((w) => w.id === id);
							if (wf) handleToggleStatus(id, wf.status);
						}}
						onDelete={handleDelete}
						isRunning={runningWorkflowId === previewWorkflow.id}
					/>
				)}
			</Container>

			{/* Folder Modal */}
			<FolderModalPartial
				isOpen={folderModalOpen}
				onClose={() => {
					setFolderModalOpen(false);
					setEditingFolder(null);
				}}
				onSubmit={handleFolderSubmit}
				isLoading={createFolder.isPending || updateFolder.isPending}
				folder={editingFolder}
			/>

			{/* Move to Folder Modal */}
			<MoveToFolderModalPartial
				isOpen={moveModalOpen}
				onClose={() => {
					setMoveModalOpen(false);
					setMovingWorkflowId(null);
				}}
				onMove={handleMoveConfirm}
				folders={folders}
				isLoading={updateWorkflow.isPending}
				workflowCount={movingWorkflowId ? 1 : selectedIds.length}
			/>
		</>
	);
};

export default WorkflowsListPage;
