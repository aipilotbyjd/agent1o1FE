import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams } from 'react-router';
import useDarkMode from '@/hooks/useDarkMode';
import { ReactFlowProvider } from '@xyflow/react';
import { toast } from 'react-toastify';

// Partials
import EditorHeaderPartial from './_partial/EditorHeader.partial';
import CanvasPartial, { ICanvasRef } from './_partial/Canvas.partial';
import BottomToolbarPartial from './_partial/BottomToolbar.partial';
import NodePaletteModalPartial from './_partial/NodePaletteModal.partial';
import NodeConfigPanelPartial from './_partial/NodeConfigPanel.partial';
import NodeContextMenuPartial from './_partial/NodeContextMenu.partial';
import CanvasContextMenuPartial from './_partial/CanvasContextMenu.partial';
import ExecutionPanelPartial from './_partial/ExecutionPanel.partial';
import SearchNodesModalPartial from './_partial/SearchNodesModal.partial';
import VersionHistoryPanelPartial from './_partial/VersionHistoryPanel.partial';
import TemplatesModalPartial from './_partial/TemplatesModal.partial';
import ThreeSettingsModalPartial from './_partial/ThreeSettingsModal.partial';

// Three.js
import { ThreeProvider, useThreeContextSafe } from './_three/ThreeProvider';

// Context & Helpers
import { useCurrentWorkspaceId } from '@/context/workspaceContext';
import { IEditorNodeData } from './_helper/serializer.helper';

// Custom Hooks
import { useEditorState } from './hooks/useEditorState';
import { useWorkflowLifecycle } from './hooks/useWorkflowLifecycle';
import { useCanvasInteraction } from './hooks/useCanvasInteraction';
import { useWorkflowExecution } from './hooks/useWorkflowExecution';
import { useClipboard } from './hooks/useClipboard';
import { useWorkflowTemplates } from './hooks/useWorkflowTemplates';
import { useVersionControl } from './hooks/useVersionControl';
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote } from '@/api/hooks/useNotes';
import { INote, TNoteColor } from '@/types/note.type';
import Spinner from '@/components/ui/Spinner';
import Modal, { ModalBody, ModalHeader } from '@/components/ui/Modal';
import Input from '@/components/form/Input';
import Label from '@/components/form/Label';

const EMPTY_ARRAY: string[] = [];

const WorkflowEditorContent = () => {
	const { id } = useParams<{ id: string }>();
	const workspaceId = useCurrentWorkspaceId();
	const { isDarkTheme } = useDarkMode();
	const canvasRef = useRef<ICanvasRef>(null);

	const isNewWorkflow = id === 'new';
	const workflowId = isNewWorkflow ? null : id || null;

	// 1. Editor State (Nodes, Edges, History)
	const {
		nodes,
		setNodes,
		onNodesChange,
		edges,
		setEdges,
		onEdgesChange,
		selectedNode,
		setSelectedNode,
		onConnect,
		saveToHistory,
		handleUndo,
		handleRedo,
		history,
		updateNodeData,
		stateRef,
	} = useEditorState();

	// 2. Lifecycle (Load, Save, Create, Delete, Auto-save)
	const {
		workflow,
		workflowName,
		setWorkflowName,
		isLoading,
		isCreatingWorkflow,
		isSaving,
		hasChanges,
		lastSavedAt,
		handleSave,
		handleDeleteWorkflow,
		handleDuplicateWorkflow,
		isScheduleEnabled,
		setIsScheduleEnabled,
		refetchWorkflow,
	} = useWorkflowLifecycle(
		workspaceId || undefined,
		workflowId as string | null | undefined,
		isNewWorkflow,
		setNodes,
		setEdges,
		stateRef,
		history,
	);

	// 3. Execution (Run, Test, Logs, WebSocket)
	const {
		isExecutionPanelOpen,
		setIsExecutionPanelOpen,
		executionLogs,
		setExecutionLogs,
		handleRun,
		handleTestNode,
		handleToggleSchedule,
		isRunning,
	} = useWorkflowExecution(
		workspaceId || undefined,
		workflowId as string | null | undefined,
		setNodes,
	);

	// 4. Canvas Interaction (Palette, Arrange, Context Menus)
	const {
		isNodePaletteOpen,
		setIsNodePaletteOpen,
		setAddAfterNodeId,
		setInsertOnEdgeId,
		setInsertOnEdgePosition,
		insertOnEdgeId,
		canvasContextMenu,
		setCanvasContextMenu,
		contextMenu,
		setContextMenu,
		recentNodes,
		handleNodeSelect,
		handleNodeSelectForEdgeInsert,
		handleInsertNodeOnEdge,
		handleAutoArrange,
		handleAddNodeAfterRef,
		handleContextMenuRef,
		handleSelectAll,
		handleAddGroup,
		handleAddNodeFromContextMenu,
		handleToggleNodeDisabled,
	} = useCanvasInteraction(nodes, edges, setNodes, setEdges, saveToHistory, canvasRef);

	// 5. Clipboard (Copy, Paste, Cut, Duplicate)
	const {
		handleCopy,
		handlePaste,
		handleCut,
		handleDuplicate: handleNodeDuplicate,
	} = useClipboard(
		nodes,
		edges,
		setNodes,
		setEdges,
		selectedNode,
		setSelectedNode,
		saveToHistory,
		handleAddNodeAfterRef,
		handleContextMenuRef,
	);

	// 6. Templates
	const { handleSelectTemplate } = useWorkflowTemplates(
		setNodes,
		setEdges,
		setWorkflowName,
		saveToHistory,
		canvasRef,
		handleAddNodeAfterRef,
		handleContextMenuRef,
	);

	// 7. Version Control
	const { versionEntries, handleRestoreVersion, handlePreviewVersion } = useVersionControl(
		workspaceId || undefined,
		workflowId as string | null | undefined,
		workflow,
		setNodes,
		setEdges,
		setWorkflowName,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		(_changed) => {},
		saveToHistory,
		refetchWorkflow,
		handleAddNodeAfterRef,
		handleContextMenuRef,
	);

	// Modals State
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
	const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
	const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
	const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
	const [isThreeSettingsModalOpen, setIsThreeSettingsModalOpen] = useState(false);

	// Three.js Context
	const threeContext = useThreeContextSafe();
	const isVisualEffectsEnabled = threeContext?.settings.enabled ?? false;

	// Notes Logic (Migrate to hook if possible, but it's small)
	const { data: notesData } = useNotes(
		workspaceId,
		isNewWorkflow ? undefined : id || undefined,
		'workflow',
	);
	const createNote = useCreateNote();
	const updateNote = useUpdateNote();
	const deleteNote = useDeleteNote();

	const handleNoteUpdate = useCallback(
		(
			noteId: string,
			data: {
				content?: string;
				color?: TNoteColor;
				position?: { x: number; y: number };
				size?: { width: number; height: number };
			},
		) => {
			if (!workspaceId) return;
			updateNote.mutate({
				workspaceId,
				noteId,
				payload: data,
			});
		},
		[workspaceId, updateNote],
	);

	const handleNoteDelete = useCallback(
		(nodeId: string) => {
			if (!workspaceId) return;
			deleteNote.mutate({ workspaceId, noteId: nodeId });
		},
		[workspaceId, deleteNote],
	);

	const handleNoteUpdateRef = useRef(handleNoteUpdate);
	const handleNoteDeleteRef = useRef(handleNoteDelete);

	useEffect(() => {
		handleNoteUpdateRef.current = handleNoteUpdate;
		handleNoteDeleteRef.current = handleNoteDelete;
	}, [handleNoteUpdate, handleNoteDelete]);

	const handleAddNote = useCallback(async () => {
		if (!workspaceId || !workflowId) {
			toast.error('Save the workflow first to add notes');
			return;
		}
		const position = { x: 300, y: 300 };
		const size = { width: 200, height: 150 };
		try {
			await createNote.mutateAsync({
				workspaceId,
				payload: {
					resource_id: workflowId,
					resource_name: 'workflow',
					content: 'Double-click to edit',
					position,
					size,
					color: 'yellow',
				},
			});
			toast.success('Note added');
		} catch {
			// handled by hook
		}
	}, [workspaceId, workflowId, createNote]);

	const lastNotesKeyRef = useRef<string>('');
	const noteNodes = useMemo(() => {
		const notes = notesData?.data;
		if (!notes || notes.length === 0) return [];

		return notes.map((note: INote) => ({
			id: `note_${note.id}`,
			type: 'stickyNote',
			position: note.position,
			data: {
				label: 'Note',
				type: 'stickyNote',
				noteId: note.id,
				onNoteUpdate: (nId: string, d: any) => handleNoteUpdateRef.current(nId, d),
				onNoteDelete: (nId: string) => handleNoteDeleteRef.current(nId),
				parameters: {
					content: note.content,
					color: note.color,
				},
			},
		}));
	}, [notesData]);

	useEffect(() => {
		const notesKey =
			noteNodes
				.map((n) => n.id)
				.sort()
				.join(',') || '';
		if (notesKey === lastNotesKeyRef.current) return;
		lastNotesKeyRef.current = notesKey;

		setNodes((currentNodes) => {
			const nonNoteNodes = currentNodes.filter((n) => !n.id.startsWith('note_'));
			if (noteNodes.length === 0) {
				if (nonNoteNodes.length === currentNodes.length) return currentNodes;
				return nonNoteNodes;
			}
			return [...nonNoteNodes, ...noteNodes];
		});
	}, [noteNodes, setNodes]);

	// Handle export/import logic
	const handleExport = useCallback(async () => {
		if (!nodes || nodes.length === 0) return;
		const dataStr = JSON.stringify({ nodes, edges, workflowName }, null, 2);
		const blob = new Blob([dataStr], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `${workflowName.replace(/\s+/g, '_').toLowerCase()}.json`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		toast.success('Workflow exported successfully');
	}, [nodes, edges, workflowName]);

	const handleImport = useCallback(() => {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'application/json';
		input.onchange = (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (!file) return;
			const reader = new FileReader();
			reader.onload = (event) => {
				try {
					const data = JSON.parse(event.target?.result as string);
					if (data.nodes) setNodes(data.nodes);
					if (data.edges) setEdges(data.edges);
					if (data.workflowName) setWorkflowName(data.workflowName);
					toast.success('Workflow imported successfully');
					setTimeout(saveToHistory, 0);
				} catch {
					toast.error('Failed to import workflow: Invalid JSON');
				}
			};
			reader.readAsText(file);
		};
		input.click();
	}, [setNodes, setEdges, setWorkflowName, saveToHistory]);

	// Toggle Schedule Wrapper
	const onToggleSchedule = async () => {
		const newState = await handleToggleSchedule(isScheduleEnabled);
		setIsScheduleEnabled(newState);
	};

	// Memoized edges with callbacks
	const memoizedEdges = useMemo(
		() =>
			edges.map((edge) => ({
				...edge,
				data: { ...edge.data, onInsertNode: handleInsertNodeOnEdge },
			})),
		[edges, handleInsertNodeOnEdge],
	);

	// Node Delete Wrapper
	const handleNodeDelete = useCallback(
		(nodeId: string) => {
			setNodes((nds) => nds.filter((node) => node.id !== nodeId));
			setEdges((eds) =>
				eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
			);
			setSelectedNode(null);
			setTimeout(saveToHistory, 0);
		},
		[setNodes, setEdges, setSelectedNode, saveToHistory],
	);

	// Shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			const target = e.target as HTMLElement;
			if (
				target.tagName === 'INPUT' ||
				target.tagName === 'TEXTAREA' ||
				target.isContentEditable
			)
				return;

			if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
				e.preventDefault();
				handleUndo();
			}
			if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
				e.preventDefault();
				handleRedo();
			}
			if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
				e.preventDefault();
				handleRedo();
			}
			if ((e.ctrlKey || e.metaKey) && e.key === 's') {
				e.preventDefault();
				handleSave();
			}
			if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
				e.preventDefault();
				handleCopy();
			}
			if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
				e.preventDefault();
				handlePaste();
			}
			if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
				e.preventDefault();
				handleCut();
			}
			if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
				e.preventDefault();
				if (selectedNode && selectedNode.type !== 'addNode')
					handleNodeDuplicate(selectedNode.id);
			}
			if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
				e.preventDefault();
				handleSelectAll();
			}
			if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
				e.preventDefault();
				setIsSearchOpen(true);
			}
			if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
				e.preventDefault();
				setIsExecutionPanelOpen((p) => !p);
			}
			if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
				e.preventDefault();
				handleAddGroup();
			}
			if ((e.ctrlKey || e.metaKey) && e.key === 't') {
				e.preventDefault();
				setIsTemplatesModalOpen(true);
			}

			if (e.key === 'Escape') {
				e.preventDefault();
				if (isSearchOpen) setIsSearchOpen(false);
				else {
					setSelectedNode(null);
					setNodes((nds) => nds.map((n) => ({ ...n, selected: false })));
				}
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [
		handleUndo,
		handleRedo,
		handleSave,
		handleCopy,
		handlePaste,
		handleCut,
		handleSelectAll,
		isSearchOpen,
		setSelectedNode,
		setNodes,
		selectedNode,
		handleNodeDuplicate,
		handleAddGroup,
		setIsExecutionPanelOpen,
		setIsTemplatesModalOpen,
		setIsSearchOpen,
	]);

	// Render Logic
	const nodeConfigPanel = useMemo(() => {
		if (!selectedNode || selectedNode.type === 'addNode' || selectedNode.type === 'stickyNote')
			return null;

		const nodeLog = executionLogs
			.filter((log) => log.nodeId === selectedNode.id)
			.sort((a, b) => b.startTime.getTime() - a.startTime.getTime())[0];

		const incomingEdges = edges.filter((e) => e.target === selectedNode.id);
		const incomingData = incomingEdges.map((edge) => {
			const sourceLog = executionLogs
				.filter((log) => log.nodeId === edge.source)
				.sort((a, b) => b.startTime.getTime() - a.startTime.getTime())[0];
			const sourceNode = nodes.find((n) => n.id === edge.source);
			const nodeData = sourceNode?.data as unknown as IEditorNodeData | undefined;
			const label = nodeData?.label;

			return {
				nodeId: edge.source,
				nodeLabel: typeof label === 'string' ? label : edge.source,
				data: sourceLog?.outputData,
			};
		});

		return (
			<NodeConfigPanelPartial
				node={selectedNode}
				onClose={() => setSelectedNode(null)}
				onNodeUpdate={updateNodeData}
				onNodeDelete={handleNodeDelete}
				onNodeDuplicate={handleNodeDuplicate}
				onTestNode={(nodeId) => handleTestNode(nodeId, nodes)}
				lastOutput={nodeLog?.outputData}
				incomingData={incomingData}
			/>
		);
	}, [
		selectedNode,
		executionLogs,
		edges,
		nodes,
		updateNodeData,
		handleNodeDelete,
		handleNodeDuplicate,
		handleTestNode,
	]);

	// Loading states
	if (isNewWorkflow || isCreatingWorkflow || isLoading) {
		return (
			<div className='flex h-full w-full items-center justify-center bg-white dark:bg-zinc-900'>
				<div className='flex flex-col items-center gap-4'>
					<Spinner className='size-8' />
					<span className='text-sm text-zinc-500'>Loading workflow...</span>
				</div>
			</div>
		);
	}

	return (
		<div className='flex h-full flex-col bg-white dark:bg-zinc-900'>
			<EditorHeaderPartial
				workflowName={workflowName}
				onNameChange={setWorkflowName}
				onShare={() => {}} // handleShare
				onDuplicate={handleDuplicateWorkflow}
				onExport={handleExport}
				onImport={handleImport}
				onDelete={handleDeleteWorkflow}
				onShowSettings={() => setIsSettingsModalOpen(true)}
				isSaving={isSaving}
				hasChanges={hasChanges}
				lastSavedAt={lastSavedAt}
			/>

			{/* Canvas */}
			<div className='relative flex-1 overflow-hidden'>
				<CanvasPartial
					ref={canvasRef}
					nodes={nodes}
					edges={memoizedEdges}
					onNodesChange={onNodesChange}
					onEdgesChange={onEdgesChange}
					onConnect={onConnect}
					onNodeSelect={setSelectedNode}
					onNodesAdd={(newNodes) => {
						// Logic for onNodesAdd (drag drop)
						const hasStarterNode = nodes.some((n) => n.id === 'starter');
						if (hasStarterNode && newNodes.some((n) => n.type !== 'addNode')) {
							setNodes((nds) => [
								...nds.filter((n) => n.id !== 'starter'),
								...newNodes,
							]);
						} else {
							setNodes((nds) => [...nds, ...newNodes]);
						}
						setTimeout(saveToHistory, 0);
					}}
					onNodeDoubleClick={(node) => {
						if (node.type === 'addNode') setIsNodePaletteOpen(true);
						else setSelectedNode(node);
					}}
					onPaneClick={() => {
						setSelectedNode(null);
						setCanvasContextMenu(null);
					}}
					onZoomChange={() => {}}
					onCanvasContextMenu={(e, pos) => {
						e.preventDefault();
						setCanvasContextMenu({ x: e.clientX, y: e.clientY, canvasPosition: pos });
					}}
					onConnectionEnd={(e, connectionState) => {
						if (!connectionState.fromNode) return;
						const clientX = 'clientX' in e ? e.clientX : e.touches?.[0]?.clientX || 0;
						const clientY = 'clientY' in e ? e.clientY : e.touches?.[0]?.clientY || 0;
						setAddAfterNodeId(connectionState.fromNode.id);
						setCanvasContextMenu({
							x: clientX,
							y: clientY,
							canvasPosition: connectionState.fromNode.position,
						});
					}}
					highlightedNodeIds={EMPTY_ARRAY} // Placeholder
					highlightedEdgeIds={EMPTY_ARRAY}
					isDarkMode={isDarkTheme}
				/>

				<BottomToolbarPartial
					onRun={handleRun}
					onSave={handleSave}
					onUndo={handleUndo}
					onRedo={handleRedo}
					onAddNode={() => setIsNodePaletteOpen(true)}
					onToggleSchedule={onToggleSchedule}
					onAutoArrange={handleAutoArrange}
					onFitView={() => canvasRef.current?.fitView()}
					onShowShortcuts={() => setIsShortcutsModalOpen(true)}
					onShowSettings={() => setIsSettingsModalOpen(true)}
					onAddNote={handleAddNote}
					onShowVisualEffects={() => setIsThreeSettingsModalOpen(true)}
					isRunning={isRunning}
					isSaving={isSaving}
					canUndo={!!history.canUndo} // fix typing
					canRedo={!!history.canRedo}
					isScheduleEnabled={isScheduleEnabled}
					scheduleInterval='15m' // Placeholder
					hasChanges={hasChanges}
					isVisualEffectsEnabled={isVisualEffectsEnabled}
				/>

				{nodeConfigPanel}
			</div>

			{/* Modals */}
			<NodePaletteModalPartial
				isOpen={isNodePaletteOpen}
				onClose={() => {
					setIsNodePaletteOpen(false);
					setAddAfterNodeId(null);
					setInsertOnEdgeId(null);
					setInsertOnEdgePosition(null);
				}}
				onNodeSelect={handleNodeSelect}
				onNodeSelectForEdgeInsert={handleNodeSelectForEdgeInsert}
				isEdgeInsertMode={Boolean(insertOnEdgeId)}
			/>

			<SearchNodesModalPartial
				isOpen={isSearchOpen}
				onClose={() => setIsSearchOpen(false)}
				nodes={nodes}
				onNodeSelect={(nodeId) => {
					const node = nodes.find((n) => n.id === nodeId);
					if (node) {
						setSelectedNode(node);
						setNodes((nds) => nds.map((n) => ({ ...n, selected: n.id === nodeId })));
						canvasRef.current?.fitView();
					}
				}}
			/>

			<ExecutionPanelPartial
				isOpen={isExecutionPanelOpen}
				onClose={() => setIsExecutionPanelOpen(false)}
				logs={executionLogs}
				isRunning={isRunning}
				onNodeClick={(nodeId) => {
					const node = nodes.find((n) => n.id === nodeId);
					if (node) {
						setSelectedNode(node);
						canvasRef.current?.fitView();
					}
				}}
				onClearLogs={() => {
					setExecutionLogs([]);
					setNodes((nds) =>
						nds.map((n) => ({
							...n,
							data: { ...n.data, executionStatus: undefined },
						})),
					);
				}}
			/>

			<VersionHistoryPanelPartial
				isOpen={isVersionHistoryOpen}
				onClose={() => setIsVersionHistoryOpen(false)}
				versions={versionEntries}
				onRestore={handleRestoreVersion}
				onPreview={handlePreviewVersion}
			/>

			<TemplatesModalPartial
				isOpen={isTemplatesModalOpen}
				onClose={() => setIsTemplatesModalOpen(false)}
				onSelectTemplate={handleSelectTemplate}
			/>

			<ThreeSettingsModalPartial
				isOpen={isThreeSettingsModalOpen}
				onClose={() => setIsThreeSettingsModalOpen(false)}
			/>

			{/* Context Menus */}
			{canvasContextMenu && (
				<CanvasContextMenuPartial
					x={canvasContextMenu.x}
					y={canvasContextMenu.y}
					canvasPosition={canvasContextMenu.canvasPosition}
					onClose={() => setCanvasContextMenu(null)}
					onAddNode={handleAddNodeFromContextMenu}
					recentNodes={recentNodes}
				/>
			)}

			{contextMenu && (
				<NodeContextMenuPartial
					x={contextMenu.x}
					y={contextMenu.y}
					nodeId={contextMenu.nodeId}
					onClose={() => setContextMenu(null)}
					onDuplicate={handleNodeDuplicate}
					onDelete={handleNodeDelete}
					onCopy={handleCopy}
					onCut={handleCut}
					onDisable={handleToggleNodeDisabled}
					isDisabled={Boolean(
						nodes.find((n) => n.id === contextMenu.nodeId)?.data?.isDisabled,
					)}
				/>
			)}

			{/* Settings & Shortcuts Modals */}
			<Modal isOpen={isShortcutsModalOpen} setIsOpen={setIsShortcutsModalOpen}>
				<ModalHeader>Keyboard Shortcuts</ModalHeader>
				<ModalBody>
					<div className='space-y-4'>
						<div>
							<h4 className='mb-2 text-xs font-semibold text-zinc-400 uppercase'>
								General
							</h4>
							<div className='space-y-2'>
								<div className='flex items-center justify-between'>
									<span className='text-sm text-zinc-600 dark:text-zinc-400'>
										Undo
									</span>
									<kbd className='rounded bg-zinc-100 px-2 py-1 font-mono text-xs dark:bg-zinc-800'>
										Ctrl+Z
									</kbd>
								</div>
								<div className='flex items-center justify-between'>
									<span className='text-sm text-zinc-600 dark:text-zinc-400'>
										Redo
									</span>
									<kbd className='rounded bg-zinc-100 px-2 py-1 font-mono text-xs dark:bg-zinc-800'>
										Ctrl+Shift+Z / Ctrl+Y
									</kbd>
								</div>
								<div className='flex items-center justify-between'>
									<span className='text-sm text-zinc-600 dark:text-zinc-400'>
										Save
									</span>
									<kbd className='rounded bg-zinc-100 px-2 py-1 font-mono text-xs dark:bg-zinc-800'>
										Ctrl+S
									</kbd>
								</div>
								<div className='flex items-center justify-between'>
									<span className='text-sm text-zinc-600 dark:text-zinc-400'>
										Select All
									</span>
									<kbd className='rounded bg-zinc-100 px-2 py-1 font-mono text-xs dark:bg-zinc-800'>
										Ctrl+A
									</kbd>
								</div>
								<div className='flex items-center justify-between'>
									<span className='text-sm text-zinc-600 dark:text-zinc-400'>
										Search Nodes
									</span>
									<kbd className='rounded bg-zinc-100 px-2 py-1 font-mono text-xs dark:bg-zinc-800'>
										Ctrl+F
									</kbd>
								</div>
							</div>
						</div>
						<div>
							<h4 className='mb-2 text-xs font-semibold text-zinc-400 uppercase'>
								Editing
							</h4>
							<div className='space-y-2'>
								<div className='flex items-center justify-between'>
									<span className='text-sm text-zinc-600 dark:text-zinc-400'>
										Copy
									</span>
									<kbd className='rounded bg-zinc-100 px-2 py-1 font-mono text-xs dark:bg-zinc-800'>
										Ctrl+C
									</kbd>
								</div>
								<div className='flex items-center justify-between'>
									<span className='text-sm text-zinc-600 dark:text-zinc-400'>
										Paste
									</span>
									<kbd className='rounded bg-zinc-100 px-2 py-1 font-mono text-xs dark:bg-zinc-800'>
										Ctrl+V
									</kbd>
								</div>
								<div className='flex items-center justify-between'>
									<span className='text-sm text-zinc-600 dark:text-zinc-400'>
										Cut
									</span>
									<kbd className='rounded bg-zinc-100 px-2 py-1 font-mono text-xs dark:bg-zinc-800'>
										Ctrl+X
									</kbd>
								</div>
								<div className='flex items-center justify-between'>
									<span className='text-sm text-zinc-600 dark:text-zinc-400'>
										Duplicate
									</span>
									<kbd className='rounded bg-zinc-100 px-2 py-1 font-mono text-xs dark:bg-zinc-800'>
										Ctrl+D
									</kbd>
								</div>
								<div className='flex items-center justify-between'>
									<span className='text-sm text-zinc-600 dark:text-zinc-400'>
										Delete
									</span>
									<kbd className='rounded bg-zinc-100 px-2 py-1 font-mono text-xs dark:bg-zinc-800'>
										Del / Backspace
									</kbd>
								</div>
								<div className='flex items-center justify-between'>
									<span className='text-sm text-zinc-600 dark:text-zinc-400'>
										Group Nodes
									</span>
									<kbd className='rounded bg-zinc-100 px-2 py-1 font-mono text-xs dark:bg-zinc-800'>
										Ctrl+G
									</kbd>
								</div>
							</div>
						</div>
					</div>
				</ModalBody>
			</Modal>

			<Modal isOpen={isSettingsModalOpen} setIsOpen={setIsSettingsModalOpen}>
				<ModalHeader>Workflow Settings</ModalHeader>
				<ModalBody>
					<div className='space-y-4'>
						<div>
							<Label htmlFor='settingsName' className='mb-1.5'>
								Workflow Name
							</Label>
							<Input
								id='settingsName'
								name='settingsName'
								value={workflowName}
								onChange={(e) => setWorkflowName(e.target.value)}
							/>
						</div>

						{/* Placeholder for future settings */}
						<div>
							<Label htmlFor='settingsTimeout' className='mb-1.5'>
								Execution Timeout (seconds)
							</Label>
							<Input
								id='settingsTimeout'
								name='settingsTimeout'
								type='number'
								placeholder='300'
								disabled
							/>
							<p className='mt-1 text-xs text-zinc-500'>
								Maximum time a workflow can run.
							</p>
						</div>

						<div>
							<Label htmlFor='settingsTimeout' className='mb-1.5'>
								Error Handling
							</Label>
							<div className='rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800'>
								<p className='text-sm text-zinc-600 dark:text-zinc-400'>
									Global error handler workflow configuration coming soon.
								</p>
							</div>
						</div>
					</div>
				</ModalBody>
			</Modal>
		</div>
	);
};

const WorkflowEditorPage = () => {
	return (
		<ReactFlowProvider>
			<ThreeProvider>
				<WorkflowEditorContent />
			</ThreeProvider>
		</ReactFlowProvider>
	);
};

export default WorkflowEditorPage;
