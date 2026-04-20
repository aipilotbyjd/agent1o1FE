import { Node, Edge } from '@xyflow/react';

interface ITreeNode {
	id: string;
	children: ITreeNode[];
	depth: number;
	index: number;
	x: number;
	y: number;
}

interface ILayoutOptions {
	horizontalSpacing: number;
	verticalSpacing: number;
	nodeWidth: number;
	nodeHeight: number;
	direction: 'LR' | 'TB'; // Left-to-Right or Top-to-Bottom
}

const defaultOptions: ILayoutOptions = {
	horizontalSpacing: 250,
	verticalSpacing: 140,
	nodeWidth: 82,
	nodeHeight: 120,
	direction: 'LR',
};

/**
 * Build a tree structure from nodes and edges
 */
const buildTree = (nodes: Node[], edges: Edge[]): Map<string, ITreeNode> => {
	const nodeMap = new Map<string, ITreeNode>();
	const childrenMap = new Map<string, string[]>();
	const hasParent = new Set<string>();

	// Initialize node map
	nodes.forEach((node) => {
		nodeMap.set(node.id, {
			id: node.id,
			children: [],
			depth: 0,
			index: 0,
			x: 0,
			y: 0,
		});
	});

	// Build parent-child relationships from edges
	edges.forEach((edge) => {
		const children = childrenMap.get(edge.source) || [];
		children.push(edge.target);
		childrenMap.set(edge.source, children);
		hasParent.add(edge.target);
	});

	// Link children to tree nodes
	childrenMap.forEach((children, parentId) => {
		const parentNode = nodeMap.get(parentId);
		if (parentNode) {
			parentNode.children = children
				.map((childId) => nodeMap.get(childId))
				.filter((n): n is ITreeNode => n !== undefined);
		}
	});

	return nodeMap;
};

/**
 * Find root nodes (nodes with no incoming edges)
 */
const findRootNodes = (nodes: Node[], edges: Edge[]): string[] => {
	const hasParent = new Set<string>();
	edges.forEach((edge) => hasParent.add(edge.target));
	return nodes.filter((node) => !hasParent.has(node.id)).map((node) => node.id);
};

/**
 * Calculate depth for each node using BFS
 */
const calculateDepths = (nodeMap: Map<string, ITreeNode>, rootIds: string[]): void => {
	const visited = new Set<string>();
	const queue: { id: string; depth: number }[] = rootIds.map((id) => ({
		id,
		depth: 0,
	}));

	while (queue.length > 0) {
		const { id, depth } = queue.shift()!;
		if (visited.has(id)) continue;
		visited.add(id);

		const node = nodeMap.get(id);
		if (node) {
			node.depth = depth;
			node.children.forEach((child) => {
				if (!visited.has(child.id)) {
					queue.push({ id: child.id, depth: depth + 1 });
				}
			});
		}
	}
};

/**
 * Group nodes by their depth level
 */
const groupByDepth = (nodeMap: Map<string, ITreeNode>): Map<number, ITreeNode[]> => {
	const depthGroups = new Map<number, ITreeNode[]>();
	nodeMap.forEach((node) => {
		const group = depthGroups.get(node.depth) || [];
		group.push(node);
		depthGroups.set(node.depth, group);
	});
	return depthGroups;
};

/**
 * Calculate positions for tree layout
 */
export const calculateTreeLayout = (
	nodes: Node[],
	edges: Edge[],
	options: Partial<ILayoutOptions> = {},
): Map<string, { x: number; y: number }> => {
	const opts = { ...defaultOptions, ...options };
	const positions = new Map<string, { x: number; y: number }>();

	// Filter out special nodes like addNode
	const realNodes = nodes.filter((n) => n.type !== 'addNode' && n.type !== 'stickyNote');
	const realEdges = edges.filter(
		(e) => realNodes.some((n) => n.id === e.source) && realNodes.some((n) => n.id === e.target),
	);

	if (realNodes.length === 0) return positions;

	// Build tree structure
	const nodeMap = buildTree(realNodes, realEdges);
	const rootIds = findRootNodes(realNodes, realEdges);

	// Handle disconnected nodes - treat them as roots
	const connectedNodes = new Set<string>();
	realEdges.forEach((edge) => {
		connectedNodes.add(edge.source);
		connectedNodes.add(edge.target);
	});
	realNodes.forEach((node) => {
		if (!connectedNodes.has(node.id) && !rootIds.includes(node.id)) {
			rootIds.push(node.id);
		}
	});

	// Calculate depths
	calculateDepths(nodeMap, rootIds);

	// Group by depth
	const depthGroups = groupByDepth(nodeMap);

	// Find max nodes at any level for centering
	let maxNodesAtLevel = 0;
	depthGroups.forEach((group) => {
		maxNodesAtLevel = Math.max(maxNodesAtLevel, group.length);
	});

	// Calculate positions based on direction
	const isHorizontal = opts.direction === 'LR';
	const startX = 100;
	const startY = 100;

	depthGroups.forEach((group, depth) => {
		// Sort group by their order in the parent's children array for consistent layout
		group.forEach((node, index) => {
			node.index = index;
		});

		const groupSize = group.length;
		const totalSpan =
			(groupSize - 1) * (isHorizontal ? opts.verticalSpacing : opts.horizontalSpacing);
		const centerOffset = totalSpan / 2;

		group.forEach((node, index) => {
			const offsetFromCenter =
				index * (isHorizontal ? opts.verticalSpacing : opts.horizontalSpacing) -
				centerOffset;

			if (isHorizontal) {
				positions.set(node.id, {
					x: startX + depth * opts.horizontalSpacing,
					y: startY + offsetFromCenter + (maxNodesAtLevel * opts.verticalSpacing) / 2,
				});
			} else {
				positions.set(node.id, {
					x: startX + offsetFromCenter + (maxNodesAtLevel * opts.horizontalSpacing) / 2,
					y: startY + depth * opts.verticalSpacing,
				});
			}
		});
	});

	return positions;
};

/**
 * Apply tree layout to nodes
 */
export const applyTreeLayout = (
	nodes: Node[],
	edges: Edge[],
	options: Partial<ILayoutOptions> = {},
): Node[] => {
	const positions = calculateTreeLayout(nodes, edges, options);

	return nodes.map((node) => {
		const newPosition = positions.get(node.id);
		if (newPosition) {
			return {
				...node,
				position: newPosition,
			};
		}
		return node;
	});
};
