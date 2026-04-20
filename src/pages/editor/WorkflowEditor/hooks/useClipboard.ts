import { useState, useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { generateNodeId, IEditorNodeData } from '../_helper/serializer.helper';
import { toast } from 'react-toastify';

export const useClipboard = (
	nodes: Node[],
	edges: Edge[],
	setNodes: (updater: (nodes: Node[]) => Node[]) => void,
	setEdges: (updater: (edges: Edge[]) => Edge[]) => void,
	selectedNode: Node | null,
	setSelectedNode: (node: Node | null) => void,
	saveToHistory: () => void,
	handleAddNodeAfterRef: React.MutableRefObject<(nodeId: string) => void>,
	handleContextMenuRef: React.MutableRefObject<(nodeId: string, x: number, y: number) => void>,
) => {
	const [copiedNodes, setCopiedNodes] = useState<Node[]>([]);
	const [copiedEdges, setCopiedEdges] = useState<Edge[]>([]);

	const handleCopy = useCallback(() => {
		const selectedNodes = nodes.filter((n) => n.selected && n.type !== 'addNode');

		if (selectedNodes.length === 0) {
			if (selectedNode && selectedNode.type !== 'addNode') {
				setCopiedNodes([selectedNode]);
				// Copy edges between selected nodes (only one node, so no internal edges)
				// But maybe we want edges connected to it? No, usually copy/paste copies selection.
				setCopiedEdges([]);
				toast.success('Node copied');
			}
			return;
		}

		setCopiedNodes(selectedNodes);
		// Copy edges between selected nodes
		const nodeIds = new Set(selectedNodes.map((n) => n.id));
		const relatedEdges = edges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target));
		setCopiedEdges(relatedEdges);
		toast.success(`${selectedNodes.length} node(s) copied`);
	}, [nodes, edges, selectedNode]);

	const handlePaste = useCallback(() => {
		if (copiedNodes.length === 0) return;

		const idMap = new Map<string, string>();
		const newNodes: Node[] = copiedNodes.map((node) => {
			const newId = generateNodeId();
			idMap.set(node.id, newId);
			return {
				...node,
				id: newId,
				position: {
					x: node.position.x + 50,
					y: node.position.y + 50,
				},
				selected: true,
				data: {
					...(node.data as IEditorNodeData),
					onAddNode: (nodeId: string) => handleAddNodeAfterRef.current(nodeId),
					onContextMenu: (nodeId: string, x: number, y: number) =>
						handleContextMenuRef.current(nodeId, x, y),
				},
			};
		});

		const newEdges: Edge[] = copiedEdges.map((edge) => ({
			...edge,
			id: `edge-${idMap.get(edge.source)}-${idMap.get(edge.target)}`,
			source: idMap.get(edge.source) || edge.source,
			target: idMap.get(edge.target) || edge.target,
		}));

		// Deselect all existing nodes
		setNodes((nds) => [...nds.map((n) => ({ ...n, selected: false })), ...newNodes]);
		setEdges((eds) => [...eds, ...newEdges]);
		toast.success(`${newNodes.length} node(s) pasted`);
		setTimeout(saveToHistory, 0);
	}, [
		copiedNodes,
		copiedEdges,
		setNodes,
		setEdges,
		saveToHistory,
		handleAddNodeAfterRef,
		handleContextMenuRef,
	]);

	const handleCut = useCallback(() => {
		handleCopy();
		const selectedNodes = nodes.filter((n) => n.selected && n.type !== 'addNode');

		if (selectedNodes.length > 0) {
			const idsToDelete = new Set(selectedNodes.map((n) => n.id));
			setNodes((nds) => nds.filter((n) => !idsToDelete.has(n.id)));
			setEdges((eds) =>
				eds.filter((e) => !idsToDelete.has(e.source) && !idsToDelete.has(e.target)),
			);
			setSelectedNode(null);
			setTimeout(saveToHistory, 0);
		} else if (selectedNode && selectedNode.type !== 'addNode') {
			// Fallback to cutting single selected node if not caught by multi-selection
			setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
			setEdges((eds) =>
				eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id),
			);
			setSelectedNode(null);
			setTimeout(saveToHistory, 0);
		}
	}, [handleCopy, nodes, selectedNode, setNodes, setEdges, saveToHistory, setSelectedNode]);

	const handleDuplicate = useCallback(
		(nodeId: string) => {
			const nodeToDuplicate = nodes.find((n) => n.id === nodeId);
			if (nodeToDuplicate) {
				const newNode: Node = {
					...nodeToDuplicate,
					id: generateNodeId(),
					position: {
						x: nodeToDuplicate.position.x + 100,
						y: nodeToDuplicate.position.y + 50,
					},
					selected: false,
					data: {
						...(nodeToDuplicate.data as IEditorNodeData),
						onAddNode: (nId: string) => handleAddNodeAfterRef.current(nId),
						onContextMenu: (nId: string, x: number, y: number) =>
							handleContextMenuRef.current(nId, x, y),
					},
				};
				setNodes((nds) => [...nds, newNode]);
				setTimeout(saveToHistory, 0);
			}
		},
		[nodes, setNodes, saveToHistory, handleAddNodeAfterRef, handleContextMenuRef],
	);

	return {
		handleCopy,
		handlePaste,
		handleCut,
		handleDuplicate,
	};
};
