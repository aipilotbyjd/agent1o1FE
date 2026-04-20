import { useState, useCallback, useRef, useEffect } from 'react';
import * as THREE from 'three';

export interface IExecutionNode {
	id: string;
	status: 'pending' | 'running' | 'success' | 'error';
	startTime?: number;
	endTime?: number;
	progress: number;
}

export interface IDataPacket {
	id: string;
	edgeId: string;
	sourceId: string;
	targetId: string;
	progress: number;
	speed: number;
	color: THREE.Color;
	size: number;
	createdAt: number;
}

export interface IExecutionEffect {
	id: string;
	type: 'burst' | 'ripple' | 'trail';
	position: THREE.Vector3;
	color: THREE.Color;
	createdAt: number;
	duration: number;
}

export const useExecutionState = () => {
	const [isRunning, setIsRunning] = useState(false);
	const [executionNodes, setExecutionNodes] = useState<Map<string, IExecutionNode>>(new Map());
	const [dataPackets, setDataPackets] = useState<IDataPacket[]>([]);
	const [effects, setEffects] = useState<IExecutionEffect[]>([]);
	const packetIdRef = useRef(0);
	const effectIdRef = useRef(0);

	const startExecution = useCallback(() => {
		setIsRunning(true);
		setExecutionNodes(new Map());
		setDataPackets([]);
		setEffects([]);
	}, []);

	const stopExecution = useCallback(() => {
		setIsRunning(false);
	}, []);

	const setNodeStatus = useCallback(
		(nodeId: string, status: IExecutionNode['status'], progress: number = 0) => {
			setExecutionNodes((prev) => {
				const newMap = new Map(prev);
				const existing = newMap.get(nodeId);
				newMap.set(nodeId, {
					id: nodeId,
					status,
					startTime: status === 'running' ? Date.now() : existing?.startTime,
					endTime: status === 'success' || status === 'error' ? Date.now() : undefined,
					progress,
				});
				return newMap;
			});
		},
		[],
	);

	const createDataPacket = useCallback(
		(
			edgeId: string,
			sourceId: string,
			targetId: string,
			color: THREE.Color = new THREE.Color(0x10b981),
		): string => {
			const id = `packet_${packetIdRef.current++}`;
			const packet: IDataPacket = {
				id,
				edgeId,
				sourceId,
				targetId,
				progress: 0,
				speed: 0.5 + Math.random() * 0.5,
				color,
				size: 0.1 + Math.random() * 0.05,
				createdAt: Date.now(),
			};
			setDataPackets((prev) => [...prev, packet]);
			return id;
		},
		[],
	);

	const updateDataPackets = useCallback((delta: number) => {
		setDataPackets((prev) =>
			prev
				.map((packet) => ({
					...packet,
					progress: packet.progress + delta * packet.speed,
				}))
				.filter((packet) => packet.progress < 1),
		);
	}, []);

	const createEffect = useCallback(
		(
			type: IExecutionEffect['type'],
			position: THREE.Vector3,
			color: THREE.Color,
			duration: number = 1,
		): string => {
			const id = `effect_${effectIdRef.current++}`;
			const effect: IExecutionEffect = {
				id,
				type,
				position: position.clone(),
				color: color.clone(),
				createdAt: Date.now(),
				duration,
			};
			setEffects((prev) => [...prev, effect]);
			return id;
		},
		[],
	);

	const createSuccessBurst = useCallback(
		(position: THREE.Vector3) => {
			return createEffect('burst', position, new THREE.Color(0x22c55e), 0.8);
		},
		[createEffect],
	);

	const createErrorBurst = useCallback(
		(position: THREE.Vector3) => {
			return createEffect('burst', position, new THREE.Color(0xef4444), 1.2);
		},
		[createEffect],
	);

	const createRipple = useCallback(
		(position: THREE.Vector3, color: THREE.Color) => {
			return createEffect('ripple', position, color, 1.5);
		},
		[createEffect],
	);

	useEffect(() => {
		if (!isRunning) return;

		const interval = setInterval(() => {
			const now = Date.now();
			setEffects((prev) =>
				prev.filter((effect) => now - effect.createdAt < effect.duration * 1000),
			);
		}, 100);

		return () => clearInterval(interval);
	}, [isRunning]);

	const getNodeExecutionState = useCallback(
		(nodeId: string): IExecutionNode | undefined => {
			return executionNodes.get(nodeId);
		},
		[executionNodes],
	);

	const getActivePacketsForEdge = useCallback(
		(edgeId: string): IDataPacket[] => {
			return dataPackets.filter((packet) => packet.edgeId === edgeId);
		},
		[dataPackets],
	);

	const clearAll = useCallback(() => {
		setIsRunning(false);
		setExecutionNodes(new Map());
		setDataPackets([]);
		setEffects([]);
	}, []);

	return {
		isRunning,
		executionNodes,
		dataPackets,
		effects,
		startExecution,
		stopExecution,
		setNodeStatus,
		createDataPacket,
		updateDataPackets,
		createEffect,
		createSuccessBurst,
		createErrorBurst,
		createRipple,
		getNodeExecutionState,
		getActivePacketsForEdge,
		clearAll,
	};
};

export type UseExecutionStateReturn = ReturnType<typeof useExecutionState>;
