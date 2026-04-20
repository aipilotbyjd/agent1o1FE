import { useState, useCallback, useEffect } from 'react';
import * as THREE from 'three';

export type EditorStatus = 'idle' | 'running' | 'success' | 'error' | 'saving';

export interface INodePosition {
	id: string;
	type: string;
	x: number;
	y: number;
	width: number;
	height: number;
	status?: 'idle' | 'running' | 'success' | 'error';
}

export interface IEdgePosition {
	id: string;
	sourceId: string;
	targetId: string;
	sourceX: number;
	sourceY: number;
	targetX: number;
	targetY: number;
}

export interface IEditorStateForThree {
	status: EditorStatus;
	nodePositions: INodePosition[];
	edgePositions: IEdgePosition[];
	selectedNodeIds: string[];
	hoveredNodeId: string | null;
	zoom: number;
	pan: { x: number; y: number };
	isDarkMode: boolean;
}

const defaultState: IEditorStateForThree = {
	status: 'idle',
	nodePositions: [],
	edgePositions: [],
	selectedNodeIds: [],
	hoveredNodeId: null,
	zoom: 1,
	pan: { x: 0, y: 0 },
	isDarkMode: true,
};

export const useEditorState = () => {
	const [state, setState] = useState<IEditorStateForThree>(defaultState);

	const setStatus = useCallback((status: EditorStatus) => {
		setState((prev) => ({ ...prev, status }));
	}, []);

	const setNodePositions = useCallback((nodePositions: INodePosition[]) => {
		setState((prev) => ({ ...prev, nodePositions }));
	}, []);

	const setEdgePositions = useCallback((edgePositions: IEdgePosition[]) => {
		setState((prev) => ({ ...prev, edgePositions }));
	}, []);

	const setSelectedNodeIds = useCallback((selectedNodeIds: string[]) => {
		setState((prev) => ({ ...prev, selectedNodeIds }));
	}, []);

	const setHoveredNodeId = useCallback((hoveredNodeId: string | null) => {
		setState((prev) => ({ ...prev, hoveredNodeId }));
	}, []);

	const setZoom = useCallback((zoom: number) => {
		setState((prev) => ({ ...prev, zoom }));
	}, []);

	const setPan = useCallback((pan: { x: number; y: number }) => {
		setState((prev) => ({ ...prev, pan }));
	}, []);

	const setDarkMode = useCallback((isDarkMode: boolean) => {
		setState((prev) => ({ ...prev, isDarkMode }));
	}, []);

	const updateNodeStatus = useCallback((nodeId: string, status: INodePosition['status']) => {
		setState((prev) => ({
			...prev,
			nodePositions: prev.nodePositions.map((node) =>
				node.id === nodeId ? { ...node, status } : node,
			),
		}));
	}, []);

	const getNodePosition3D = useCallback(
		(nodeId: string): THREE.Vector3 | null => {
			const node = state.nodePositions.find((n) => n.id === nodeId);
			if (!node) return null;
			return new THREE.Vector3(
				(node.x + node.width / 2) * 0.01,
				-(node.y + node.height / 2) * 0.01,
				0,
			);
		},
		[state.nodePositions],
	);

	const getEdgePositions3D = useCallback(
		(edgeId: string): { start: THREE.Vector3; end: THREE.Vector3 } | null => {
			const edge = state.edgePositions.find((e) => e.id === edgeId);
			if (!edge) return null;
			return {
				start: new THREE.Vector3(edge.sourceX * 0.01, -edge.sourceY * 0.01, 0),
				end: new THREE.Vector3(edge.targetX * 0.01, -edge.targetY * 0.01, 0),
			};
		},
		[state.edgePositions],
	);

	return {
		state,
		setStatus,
		setNodePositions,
		setEdgePositions,
		setSelectedNodeIds,
		setHoveredNodeId,
		setZoom,
		setPan,
		setDarkMode,
		updateNodeStatus,
		getNodePosition3D,
		getEdgePositions3D,
	};
};

export type UseEditorStateReturn = ReturnType<typeof useEditorState>;

export const EditorStateContext = {
	state: defaultState,
	setStatus: () => {},
	setNodePositions: () => {},
	setEdgePositions: () => {},
	setSelectedNodeIds: () => {},
	setHoveredNodeId: () => {},
	setZoom: () => {},
	setPan: () => {},
	setDarkMode: () => {},
	updateNodeStatus: () => {},
	getNodePosition3D: () => null,
	getEdgePositions3D: () => null,
} as UseEditorStateReturn;

export const useVisibilityPause = (callback: () => void) => {
	const [isPaused, setIsPaused] = useState(false);

	useEffect(() => {
		const handleVisibilityChange = () => {
			setIsPaused(document.hidden);
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);
		return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
	}, []);

	useEffect(() => {
		if (!isPaused) {
			callback();
		}
	}, [isPaused, callback]);

	return isPaused;
};
