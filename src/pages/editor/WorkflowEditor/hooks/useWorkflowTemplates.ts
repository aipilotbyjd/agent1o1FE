import { useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { toast } from 'react-toastify';
import { IWorkflowTemplate } from '../_partial/TemplatesModal.partial';
import { applyTreeLayout } from '../_helper/treeLayout.helper';
import { generateNodeId } from '../_helper/serializer.helper';

export const useWorkflowTemplates = (
	setNodes: (nodes: Node[]) => void,
	setEdges: (edges: Edge[]) => void,
	setWorkflowName: (name: string) => void,
	saveToHistory: () => void,
	canvasRef: any,
	handleAddNodeAfterRef: React.MutableRefObject<(nodeId: string) => void>,
	handleContextMenuRef: React.MutableRefObject<(nodeId: string, x: number, y: number) => void>,
) => {
	const handleSelectTemplate = useCallback(
		(template: IWorkflowTemplate) => {
			const templateNodes = (template.nodes as any[]).map((node) => ({
				id: generateNodeId(),
				type: node.type,
				position: node.position,
				data: {
					label: node.label,
					type: node.type,
					parameters: (node.parameters as Record<string, unknown>) || {},
					onAddNode: (nodeId: string) => handleAddNodeAfterRef.current(nodeId),
					onContextMenu: (nodeId: string, x: number, y: number) =>
						handleContextMenuRef.current(nodeId, x, y),
				},
			}));

			const idMap = new Map<string, string>();
			(template.nodes as any[]).forEach((node, index: number) => {
				idMap.set(node.id, templateNodes[index].id);
			});

			const templateEdges: Edge[] = (template.connections as any[]).map((conn) => ({
				id: `edge-${idMap.get(conn.source)}-${idMap.get(conn.target)}`,
				source: idMap.get(conn.source) || '',
				target: idMap.get(conn.target) || '',
				type: 'custom',
				data: conn.data as Record<string, unknown>,
			}));

			const arrangedNodes = applyTreeLayout(templateNodes, templateEdges, {
				horizontalSpacing: 250,
				verticalSpacing: 140,
				direction: 'LR',
			});

			setNodes(arrangedNodes);
			setEdges(templateEdges);
			setWorkflowName(template.name);

			setTimeout(() => {
				canvasRef.current?.fitView();
			}, 50);

			setTimeout(saveToHistory, 0);
			toast.success(`Template "${template.name}" loaded`);
		},
		[
			setNodes,
			setEdges,
			setWorkflowName,
			saveToHistory,
			canvasRef,
			handleAddNodeAfterRef,
			handleContextMenuRef,
		],
	);

	return {
		handleSelectTemplate,
	};
};
