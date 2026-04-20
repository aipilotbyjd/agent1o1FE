import { useCallback, useRef, forwardRef, useImperativeHandle, useMemo } from 'react';
import {
	ReactFlow,
	Controls,
	Background,
	OnNodesChange,
	OnEdgesChange,
	OnConnect,
	Node,
	Edge,
	ReactFlowInstance,
	MiniMap,
	BackgroundVariant,
	ConnectionMode,
	SelectionMode,
	OnConnectEnd,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ThreeBackgroundPartial from '../_three/ThreeBackground.partial';
import { useThreeContextSafe } from '../_three/ThreeProvider';
import { INodePosition, IEdgePosition } from '../_three/hooks/useEditorState';
import CircularNodePartial from './nodes/CircularNode.partial';
import StickyNoteNodePartial from './nodes/StickyNoteNode.partial';
import GroupNodePartial from './nodes/GroupNode.partial';
import CustomEdgePartial from './edges/CustomEdge.partial';
import { INodeTypeDefinition } from '../_helper/nodeTypes.helper';
import { generateNodeId, IEditorNodeData } from '../_helper/serializer.helper';
import { HighlightContext } from '../context/HighlightContext';

const nodeTypes: Record<
	string,
	typeof CircularNodePartial | typeof StickyNoteNodePartial | typeof GroupNodePartial
> = {
	// ========== TRIGGERS ==========
	webhook: CircularNodePartial,
	schedule: CircularNodePartial,
	manual: CircularNodePartial,
	emailTrigger: CircularNodePartial,
	errorTrigger: CircularNodePartial,

	// ========== ACTIONS ==========
	httpRequest: CircularNodePartial,
	code: CircularNodePartial,
	sendEmail: CircularNodePartial,
	send_email: CircularNodePartial,
	respondWebhook: CircularNodePartial,
	function: CircularNodePartial,
	transform: CircularNodePartial,
	set: CircularNodePartial,
	respond: CircularNodePartial,
	stopError: CircularNodePartial,
	subWorkflow: CircularNodePartial,
	executeWorkflow: CircularNodePartial,

	// ========== LOGIC ==========
	if: CircularNodePartial,
	switch: CircularNodePartial,
	merge: CircularNodePartial,
	loop: CircularNodePartial,
	wait: CircularNodePartial,
	filter: CircularNodePartial,
	sort: CircularNodePartial,
	limit: CircularNodePartial,
	unique: CircularNodePartial,
	splitBatches: CircularNodePartial,
	aggregate: CircularNodePartial,
	noOp: CircularNodePartial,
	dataFilter: CircularNodePartial,
	dataSort: CircularNodePartial,
	dataLimit: CircularNodePartial,
	removeDuplicates: CircularNodePartial,
	datetime: CircularNodePartial,
	expression: CircularNodePartial,
	math: CircularNodePartial,
	crypto: CircularNodePartial,
	xml: CircularNodePartial,
	jsonTransform: CircularNodePartial,
	splitData: CircularNodePartial,
	splitOut: CircularNodePartial,
	mergeData: CircularNodePartial,
	htmlExtract: CircularNodePartial,

	// ========== ERROR HANDLING ==========
	tryCatch: CircularNodePartial,
	retry: CircularNodePartial,
	throwError: CircularNodePartial,
	error: CircularNodePartial,
	continueOnFail: CircularNodePartial,
	timeout: CircularNodePartial,
	fallback: CircularNodePartial,

	// ========== INTEGRATIONS ==========
	slack: CircularNodePartial,
	discord: CircularNodePartial,
	telegram: CircularNodePartial,
	github: CircularNodePartial,
	postgres: CircularNodePartial,
	mysql: CircularNodePartial,
	mongodb: CircularNodePartial,
	redis: CircularNodePartial,
	email: CircularNodePartial,
	openai: CircularNodePartial,
	anthropic: CircularNodePartial,
	googleSheets: CircularNodePartial,
	stripe: CircularNodePartial,
	awsS3: CircularNodePartial,
	googleDrive: CircularNodePartial,
	twilio: CircularNodePartial,
	sendgrid: CircularNodePartial,
	jira: CircularNodePartial,
	salesforce: CircularNodePartial,
	airtable: CircularNodePartial,
	notion: CircularNodePartial,
	graphql: CircularNodePartial,
	ftp: CircularNodePartial,
	sftp: CircularNodePartial,
	hubspot: CircularNodePartial,

	// ========== AI & ML ==========
	aiEmbeddings: CircularNodePartial,
	aiAgent: CircularNodePartial,
	aiGenerate: CircularNodePartial,
	aiChat: CircularNodePartial,
	aiImage: CircularNodePartial,
	aiVision: CircularNodePartial,
	aiSpeech: CircularNodePartial,
	aiStructured: CircularNodePartial,
	aiRouter: CircularNodePartial,
	aiVectorStore: CircularNodePartial,

	// ========== SPECIAL NODE TYPES ==========
	stickyNote: StickyNoteNodePartial,
	group: GroupNodePartial,

	// ========== FALLBACK ==========
	default: CircularNodePartial,
};

// Custom edge types
const edgeTypes = {
	custom: CustomEdgePartial,
};

// Default edge options - clean dotted green line
const defaultEdgeOptions = {
	type: 'custom',
	animated: false,
};

export interface ICanvasRef {
	fitView: () => void;
	zoomIn: () => void;
	zoomOut: () => void;
	setZoom: (zoom: number) => void;
	getZoom: () => number;
}

interface ICanvasPartialProps {
	nodes: Node[];
	edges: Edge[];
	onNodesChange: OnNodesChange;
	onEdgesChange: OnEdgesChange;
	onConnect: OnConnect;
	onNodeSelect: (node: Node | null) => void;
	onNodesAdd: (nodes: Node[]) => void;
	onNodeDoubleClick: (node: Node) => void;
	onPaneClick: () => void;
	onZoomChange: (zoom: number) => void;
	onCanvasContextMenu?: (e: React.MouseEvent, position: { x: number; y: number }) => void;
	onConnectionEnd?: (
		event: MouseEvent | TouchEvent,
		connectionState: { fromNode?: Node; fromHandle?: string },
	) => void;
	onNodeMouseEnter?: (event: React.MouseEvent, node: Node) => void;
	onNodeMouseLeave?: (event: React.MouseEvent, node: Node) => void;
	highlightedNodeIds?: string[];
	highlightedEdgeIds?: string[];
	isDarkMode?: boolean;
	isExecuting?: boolean;
}

const CanvasPartial = forwardRef<ICanvasRef, ICanvasPartialProps>(
	(
		{
			nodes,
			edges,
			onNodesChange,
			onEdgesChange,
			onConnect,
			onNodeSelect,
			onNodesAdd,
			onNodeDoubleClick,
			onPaneClick,
			onZoomChange,
			onCanvasContextMenu,
			onConnectionEnd,
			onNodeMouseEnter,
			onNodeMouseLeave,
			highlightedNodeIds = [],
			highlightedEdgeIds = [],
			isDarkMode = false,
			isExecuting = false,
		},
		ref,
	) => {
		const reactFlowWrapper = useRef<HTMLDivElement>(null);
		const reactFlowInstance = useRef<ReactFlowInstance | null>(null);
		const threeContext = useThreeContextSafe();
		const isThreeEnabled = threeContext?.settings.enabled ?? false;

		useImperativeHandle(ref, () => ({
			fitView: () => reactFlowInstance.current?.fitView({ padding: 0.5, maxZoom: 1 }),
			zoomIn: () => reactFlowInstance.current?.zoomIn(),
			zoomOut: () => reactFlowInstance.current?.zoomOut(),
			setZoom: (zoom: number) => reactFlowInstance.current?.zoomTo(zoom),
			getZoom: () => reactFlowInstance.current?.getZoom() ?? 1,
		}));

		const onInit = useCallback(
			(instance: ReactFlowInstance) => {
				reactFlowInstance.current = instance;
				onZoomChange(instance.getZoom());
			},
			[onZoomChange],
		);

		const onMoveEnd = useCallback(() => {
			if (reactFlowInstance.current) {
				onZoomChange(reactFlowInstance.current.getZoom());
			}
		}, [onZoomChange]);

		const onDragOver = useCallback((event: React.DragEvent) => {
			event.preventDefault();
			event.dataTransfer.dropEffect = 'move';
		}, []);

		const onDrop = useCallback(
			(event: React.DragEvent) => {
				event.preventDefault();

				const nodeTypeData = event.dataTransfer.getData('application/reactflow');
				if (!nodeTypeData || !reactFlowInstance.current || !reactFlowWrapper.current)
					return;

				const nodeType: INodeTypeDefinition = JSON.parse(nodeTypeData);
				const bounds = reactFlowWrapper.current.getBoundingClientRect();
				const position = reactFlowInstance.current.screenToFlowPosition({
					x: event.clientX - bounds.left,
					y: event.clientY - bounds.top,
				});

				const newNode: Node<IEditorNodeData> = {
					id: generateNodeId(),
					type: nodeType.type,
					position,
					data: {
						label: nodeType.label,
						type: nodeType.type,
						parameters: nodeType.parameters.reduce(
							(acc, param) => {
								if (param.default !== undefined) {
									acc[param.name] = param.default;
								}
								return acc;
							},
							{} as Record<string, unknown>,
						),
					},
					style: { background: 'transparent', border: 'none', width: 'auto' },
				};

				onNodesAdd([newNode]);
			},
			[onNodesAdd],
		);

		const onSelectionChange = useCallback(
			({ nodes: selectedNodes }: { nodes: Node[] }) => {
				if (selectedNodes.length === 1) {
					onNodeSelect(selectedNodes[0]);
				} else {
					onNodeSelect(null);
				}
			},
			[onNodeSelect],
		);

		const handlePaneClick = useCallback(() => {
			onNodeSelect(null);
			onPaneClick();
		}, [onNodeSelect, onPaneClick]);

		const handleNodeDoubleClick = useCallback(
			(_event: React.MouseEvent, node: Node) => {
				onNodeDoubleClick(node);
			},
			[onNodeDoubleClick],
		);

		const handlePaneContextMenu = useCallback(
			(event: MouseEvent | React.MouseEvent<Element, MouseEvent>) => {
				event.preventDefault();
				if (onCanvasContextMenu && reactFlowInstance.current) {
					const position = reactFlowInstance.current.screenToFlowPosition({
						x: event.clientX,
						y: event.clientY,
					});
					onCanvasContextMenu(event as React.MouseEvent, position);
				}
			},
			[onCanvasContextMenu],
		);

		// Handle connection end (drag from handle to empty space)
		const handleConnectEnd: OnConnectEnd = useCallback(
			(event, connectionState) => {
				// Check if we connected to a valid target
				if (!connectionState.isValid && onConnectionEnd && reactFlowInstance.current) {
					const fromNode = nodes.find((n) => n.id === connectionState.fromNode?.id);
					if (fromNode) {
						onConnectionEnd(event, {
							fromNode,
							fromHandle: connectionState.fromHandle?.id || undefined,
						});
					}
				}
			},
			[nodes, onConnectionEnd],
		);

		// Handle node mouse enter for highlighting
		const handleNodeMouseEnter = useCallback(
			(event: React.MouseEvent, node: Node) => {
				onNodeMouseEnter?.(event, node);
			},
			[onNodeMouseEnter],
		);

		// Handle node mouse leave
		const handleNodeMouseLeave = useCallback(
			(event: React.MouseEvent, node: Node) => {
				onNodeMouseLeave?.(event, node);
			},
			[onNodeMouseLeave],
		);

		// Context for highlighting
		const highlightContextValue = useMemo(
			() => ({
				highlightedNodeIds,
				highlightedEdgeIds,
			}),
			[highlightedNodeIds, highlightedEdgeIds],
		);

		// Compute node positions for Three.js
		const nodePositions: INodePosition[] = useMemo(
			() =>
				nodes.map((node) => ({
					id: node.id,
					x: node.position?.x ?? 0,
					y: node.position?.y ?? 0,
					width: (node.measured?.width ?? node.width ?? 80) as number,
					height: (node.measured?.height ?? node.height ?? 80) as number,
					type: (node.data as { type?: string })?.type ?? node.type ?? 'default',
					status: 'idle' as const,
				})),
			[nodes],
		);

		// Compute edge positions for Three.js
		const edgePositions: IEdgePosition[] = useMemo(
			() =>
				edges.map((edge) => {
					const sourceNode = nodes.find((n) => n.id === edge.source);
					const targetNode = nodes.find((n) => n.id === edge.target);
					const sourceX =
						(sourceNode?.position?.x ?? 0) +
						((sourceNode?.measured?.width ?? sourceNode?.width ?? 80) as number) / 2;
					const sourceY =
						(sourceNode?.position?.y ?? 0) +
						((sourceNode?.measured?.height ?? sourceNode?.height ?? 80) as number) / 2;
					const targetX =
						(targetNode?.position?.x ?? 0) +
						((targetNode?.measured?.width ?? targetNode?.width ?? 80) as number) / 2;
					const targetY =
						(targetNode?.position?.y ?? 0) +
						((targetNode?.measured?.height ?? targetNode?.height ?? 80) as number) / 2;
					return {
						id: edge.id,
						sourceId: edge.source,
						targetId: edge.target,
						sourceX,
						sourceY,
						targetX,
						targetY,
					};
				}),
			[edges, nodes],
		);

		// Get selected node IDs
		const selectedNodeIds = useMemo(
			() => nodes.filter((n) => n.selected).map((n) => n.id),
			[nodes],
		);

		return (
			<div ref={reactFlowWrapper} className='relative h-full w-full'>
				{/* Three.js background layer */}
				{isThreeEnabled && (
					<ThreeBackgroundPartial
						isDarkMode={isDarkMode}
						isExecuting={isExecuting}
						nodePositions={nodePositions}
						edgePositions={edgePositions}
						selectedNodeIds={selectedNodeIds}
						zoom={reactFlowInstance.current?.getZoom() ?? 1}
						pan={{ x: 0, y: 0 }}
					/>
				)}

				<HighlightContext.Provider value={highlightContextValue}>
					<ReactFlow
						nodes={nodes}
						edges={edges}
						onNodesChange={onNodesChange}
						onEdgesChange={onEdgesChange}
						onConnect={onConnect}
						onConnectEnd={handleConnectEnd}
						onInit={onInit}
						onMoveEnd={onMoveEnd}
						onDragOver={onDragOver}
						onDrop={onDrop}
						onSelectionChange={onSelectionChange}
						onPaneClick={handlePaneClick}
						onNodeDoubleClick={handleNodeDoubleClick}
						onNodeMouseEnter={handleNodeMouseEnter}
						onNodeMouseLeave={handleNodeMouseLeave}
						onPaneContextMenu={handlePaneContextMenu}
						nodeTypes={nodeTypes}
						edgeTypes={edgeTypes}
						defaultEdgeOptions={defaultEdgeOptions}
						connectionMode={ConnectionMode.Loose}
						selectionMode={SelectionMode.Partial}
						selectionOnDrag
						snapToGrid
						snapGrid={[20, 20]}
						fitView
						fitViewOptions={{ padding: 0.5, maxZoom: 1 }}
						minZoom={0.2}
						maxZoom={2}
						deleteKeyCode={['Backspace', 'Delete']}
						multiSelectionKeyCode='Shift'
						panOnScroll
						panOnDrag={[1, 2]}
						selectionKeyCode={null}
						proOptions={{ hideAttribution: true }}
						style={{ position: 'relative', zIndex: 1 }}
						className={
							isThreeEnabled ? '!bg-transparent' : '!bg-white dark:!bg-zinc-900'
						}>
						{/* Clean dot background like Make.com - hide when Three.js is enabled */}
						{!isThreeEnabled && (
							<Background
								variant={BackgroundVariant.Dots}
								gap={20}
								size={1.5}
								color='#a1a1aa'
								className='!bg-zinc-50 dark:!bg-zinc-900'
							/>
						)}
						{/* MiniMap for navigation */}
						<MiniMap
							nodeStrokeWidth={3}
							zoomable
							pannable
							className='!rounded-xl !border-zinc-200 !bg-white/90 !shadow-lg dark:!border-zinc-700 dark:!bg-zinc-800/90'
							maskColor='rgba(0, 0, 0, 0.1)'
							nodeColor={(node) => {
								if (node.type === 'addNode') return '#e4e4e7';
								if (node.type === 'stickyNote') return '#fef08a';
								return '#68d391';
							}}
						/>
						{/* Zoom Controls */}
						<Controls
							showZoom
							showFitView
							showInteractive={false}
							className='!bottom-24 !rounded-xl !border-zinc-200 !bg-white/90 !shadow-lg dark:!border-zinc-700 dark:!bg-zinc-800/90 [&>button]:!rounded-lg [&>button]:!border-0 [&>button]:!bg-transparent [&>button:hover]:!bg-zinc-100 dark:[&>button:hover]:!bg-zinc-700'
						/>
					</ReactFlow>
				</HighlightContext.Provider>
			</div>
		);
	},
);

CanvasPartial.displayName = 'CanvasPartial';

export default CanvasPartial;
