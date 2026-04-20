import { useCallback, useState, useRef, useEffect } from 'react';
import { Node, Edge, useNodesState, useEdgesState, addEdge, Connection } from '@xyflow/react';
import { IEditorNode, IEditorEdge, IEditorNodeData } from '../_helper/serializer.helper';
import { useEditorHistory } from './useEditorHistory';

export const useEditorState = () => {
	const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
	const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
	const [selectedNode, setSelectedNode] = useState<Node | null>(null);

	const history = useEditorHistory();

	// We use a ref to access the latest nodes/edges in async callbacks/timeouts
	// without needing to depend on them in dependency arrays
	const stateRef = useRef({ nodes, edges });
	useEffect(() => {
		stateRef.current = { nodes, edges };
	}, [nodes, edges]);

	const saveToHistory = useCallback(() => {
		history.push({
			nodes: stateRef.current.nodes as unknown as IEditorNode[],
			edges: stateRef.current.edges as unknown as IEditorEdge[],
		});
	}, [history]);

	const onConnect = useCallback(
		(params: Connection) => {
			setEdges((eds) => addEdge({ ...params, type: 'custom' }, eds));
			// Save to history after state update
			setTimeout(saveToHistory, 0);
		},
		[setEdges, saveToHistory],
	);

	const handleUndo = useCallback(() => {
		const state = history.undo();
		if (state) {
			setNodes(state.nodes as unknown as Node[]);
			setEdges(state.edges as unknown as Edge[]);
		}
	}, [history, setNodes, setEdges]);

	const handleRedo = useCallback(() => {
		const state = history.redo();
		if (state) {
			setNodes(state.nodes as unknown as Node[]);
			setEdges(state.edges as unknown as Edge[]);
		}
	}, [history, setNodes, setEdges]);

	// Handle node update (data change)
	const updateNodeData = useCallback(
		(nodeId: string, data: Partial<IEditorNodeData>) => {
			setNodes((nds) =>
				nds.map((node) =>
					node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node,
				),
			);
			if (selectedNode?.id === nodeId) {
				setSelectedNode((prev) =>
					prev ? { ...prev, data: { ...prev.data, ...data } } : null,
				);
			}
			// Debounce history save for text inputs?
			// For now, save immediately like original (timeout 100)
			setTimeout(saveToHistory, 100);
		},
		[setNodes, selectedNode, saveToHistory],
	);

	return {
		nodes,
		setNodes,
		onNodesChange,
		edges,
		setEdges,
		onEdgesChange,
		selectedNode,
		setSelectedNode,
		history,
		onConnect,
		saveToHistory,
		handleUndo,
		handleRedo,
		updateNodeData,
		stateRef,
	};
};
