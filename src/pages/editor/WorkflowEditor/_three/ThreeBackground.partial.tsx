import { Suspense, useState, useMemo, useCallback } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import InfiniteGrid from './components/InfiniteGrid';
import AmbientParticles from './components/AmbientParticles';
import BackgroundShader from './components/BackgroundShader';
import NodeGlow from './components/NodeGlow';
import ConnectionBeam from './components/ConnectionBeam';
import DataFlowParticle from './components/DataFlowParticle';
import ExecutionBurst from './components/ExecutionBurst';
import EnvironmentEffects from './components/EnvironmentEffects';
import EnergyPulse, { useEnergyPulses } from './components/EnergyPulse';
import LightningArc from './components/LightningArc';
import CircuitPattern from './components/CircuitPattern';
import HexGrid from './components/HexGrid';
import Fireflies from './components/Fireflies';
import DataFlowEnergy from './components/DataFlowEnergy';
import HolographicProjection from './components/HolographicProjection';
import { useThreeContextSafe } from './ThreeProvider';
import { INodePosition, IEdgePosition } from './hooks/useEditorState';

interface IThreeBackgroundProps {
	isDarkMode: boolean;
	isExecuting?: boolean;
	nodePositions?: INodePosition[];
	edgePositions?: IEdgePosition[];
	selectedNodeIds?: string[];
	hoveredNodeId?: string | null;
	zoom?: number;
	pan?: { x: number; y: number };
}

// Camera controller that syncs with React Flow
const CameraController = ({
	zoom = 1,
	pan = { x: 0, y: 0 },
}: {
	zoom?: number;
	pan?: { x: number; y: number };
}) => {
	const { camera } = useThree();

	useFrame(() => {
		// Sync camera with React Flow viewport
		const targetZ = 50 / zoom;
		camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.1);
		camera.position.x = THREE.MathUtils.lerp(camera.position.x, -pan.x * 0.01, 0.1);
		camera.position.y = THREE.MathUtils.lerp(camera.position.y, pan.y * 0.01, 0.1);
	});

	return null;
};

// Scene content component
const SceneContent = ({
	isDarkMode,
	isExecuting = false,
	nodePositions = [],
	edgePositions = [],
	selectedNodeIds = [],
	hoveredNodeId = null,
	zoom = 1,
	pan = { x: 0, y: 0 },
}: IThreeBackgroundProps) => {
	const context = useThreeContextSafe();
	const settings = context?.settings;
	const qualitySettings = context?.qualitySettings;
	const executionState = context?.executionState;

	const [bursts, setBursts] = useState<
		Array<{
			id: string;
			position: [number, number, number];
			type: 'success' | 'error' | 'running' | 'warning';
		}>
	>([]);

	// Energy pulses hook
	const { pulses, removePulse, updateClock } = useEnergyPulses();

	// Update clock for energy pulses
	useFrame((state) => {
		updateClock(state.clock.elapsedTime);
	});

	// Convert 2D positions to 3D (filter out non-workflow nodes)
	const nodePositions3D = useMemo(() => {
		const excludedTypes = ['stickyNote', 'sticky', 'note', 'group', 'addNodeButton'];
		return nodePositions
			.filter((node) => !excludedTypes.includes(node.type))
			.map((node) => ({
				...node,
				position3D: [
					(node.x + node.width / 2) * 0.01,
					-(node.y + node.height / 2) * 0.01,
					0,
				] as [number, number, number],
			}));
	}, [nodePositions]);

	const edgePositions3D = useMemo(() => {
		return edgePositions.map((edge) => ({
			...edge,
			start: [edge.sourceX * 0.01, -edge.sourceY * 0.01, 0] as [number, number, number],
			end: [edge.targetX * 0.01, -edge.targetY * 0.01, 0] as [number, number, number],
		}));
	}, [edgePositions]);

	// Handle burst removal
	const removeBurst = useCallback((id: string) => {
		setBursts((prev) => prev.filter((b) => b.id !== id));
	}, []);

	// Enabled checks
	const showGrid = settings?.backgroundEffects.animatedGrid ?? true;
	const showParticles = settings?.backgroundEffects.ambientParticles ?? true;
	const showBackground = settings?.backgroundEffects.backgroundGradient ?? true;
	const showGlows = settings?.nodeEffects.glowHalos ?? true;
	const showBeams = settings?.nodeEffects.connectionBeams ?? true;
	const showDataFlow = settings?.executionEffects.dataFlowAnimation ?? true;
	const showBloom = settings?.advanced.bloom ?? true;

	const particleCount = qualitySettings?.particleCount ?? 200;

	return (
		<>
			<CameraController zoom={zoom} pan={pan} />
			<EnvironmentEffects isDarkMode={isDarkMode} />

			{/* Background gradient */}
			{showBackground && <BackgroundShader isDarkMode={isDarkMode} />}

			{/* Infinite grid */}
			{showGrid && <InfiniteGrid isDarkMode={isDarkMode} isExecuting={isExecuting} />}

			{/* Ambient particles */}
			{showParticles && (
				<AmbientParticles isDarkMode={isDarkMode} count={particleCount} spread={80} />
			)}

			{/* Connection beams */}
			{showBeams &&
				edgePositions3D.map((edge) => (
					<ConnectionBeam
						key={edge.id}
						start={edge.start}
						end={edge.end}
						isDarkMode={isDarkMode}
						isActive={isExecuting}
						isHighlighted={
							selectedNodeIds.includes(edge.sourceId) ||
							selectedNodeIds.includes(edge.targetId)
						}
						intensity={0.4}
					/>
				))}

			{/* Node glows */}
			{showGlows &&
				nodePositions3D.map((node) => (
					<NodeGlow
						key={`glow-${node.id}`}
						position={node.position3D}
						nodeType={node.type}
						isSelected={selectedNodeIds.includes(node.id)}
						isHovered={hoveredNodeId === node.id}
						isRunning={node.status === 'running'}
						intensity={0.3}
					/>
				))}

			{/* Holographic Projections - Sci-fi 3D wireframes above nodes */}
			{showGlows &&
				nodePositions3D.map((node) => (
					<HolographicProjection
						key={`holo-${node.id}`}
						position={node.position3D}
						nodeType={node.type}
						isSelected={selectedNodeIds.includes(node.id)}
						isHovered={hoveredNodeId === node.id}
						size={0.6}
					/>
				))}

			{/* Data flow particles during execution */}
			{showDataFlow &&
				isExecuting &&
				executionState?.dataPackets.map((packet) => {
					const edge = edgePositions3D.find((e) => e.id === packet.edgeId);
					if (!edge) return null;
					return (
						<DataFlowParticle
							key={packet.id}
							start={edge.start}
							end={edge.end}
							progress={packet.progress}
							color={packet.color}
							size={packet.size}
						/>
					);
				})}

			{/* Execution bursts */}
			{bursts.map((burst) => (
				<ExecutionBurst
					key={burst.id}
					position={burst.position}
					type={burst.type}
					onComplete={() => removeBurst(burst.id)}
				/>
			))}

			{/* === NEW BEAST EFFECTS === */}

			{/* Circuit Pattern Background - Tech automation feel */}
			<CircuitPattern
				color={new THREE.Color(isDarkMode ? 0x10b981 : 0x059669)}
				opacity={isDarkMode ? 0.25 : 0.15}
				gridSize={35}
				animated
			/>

			{/* HexGrid - Interactive honeycomb pattern */}
			<HexGrid
				color={new THREE.Color(isDarkMode ? 0x10b981 : 0x059669)}
				highlightColor={new THREE.Color(0x60a5fa)}
				opacity={isDarkMode ? 0.2 : 0.12}
				cellSize={2.0}
				animated
			/>

			{/* Fireflies - Magical ambient particles that react to cursor */}
			<Fireflies
				count={100}
				colors={[
					new THREE.Color(0x10b981),
					new THREE.Color(0x60a5fa),
					new THREE.Color(0xa78bfa),
					new THREE.Color(0xfbbf24),
				]}
				areaSize={60}
				cursorInfluence
			/>

			{/* Energy Pulses - Ripples when clicking nodes */}
			<EnergyPulse pulses={pulses} onPulseComplete={removePulse} />

			{/* Lightning Arcs - Electric connections when executing */}
			{isExecuting &&
				edgePositions3D.map((edge) => (
					<LightningArc
						key={`lightning-${edge.id}`}
						start={edge.start}
						end={edge.end}
						color={new THREE.Color(0x60a5fa)}
						intensity={0.6}
						segments={10}
						active
					/>
				))}

			{/* Data Flow Energy - Premium particle flow on connections */}
			{isExecuting &&
				edgePositions3D.map((edge) => (
					<DataFlowEnergy
						key={`energy-${edge.id}`}
						start={edge.start}
						end={edge.end}
						color={new THREE.Color(0x10b981)}
						speed={1.5}
						particleCount={12}
						active
						intensity={1}
					/>
				))}

			{/* Post-processing effects */}
			{showBloom && (
				<EffectComposer>
					<Bloom
						luminanceThreshold={0.1}
						luminanceSmoothing={0.8}
						intensity={isDarkMode ? 1.5 : 0.8}
					/>
					<Vignette eskil={false} offset={0.1} darkness={isDarkMode ? 0.6 : 0.3} />
				</EffectComposer>
			)}
		</>
	);
};

// Main Three.js background component
const ThreeBackgroundPartial = ({
	isDarkMode,
	isExecuting = false,
	nodePositions = [],
	edgePositions = [],
	selectedNodeIds = [],
	hoveredNodeId = null,
	zoom = 1,
	pan = { x: 0, y: 0 },
}: IThreeBackgroundProps) => {
	const context = useThreeContextSafe();

	// Check if Three.js effects are enabled
	const isEnabled = context?.settings.enabled ?? true;

	if (!isEnabled) {
		return null;
	}

	return (
		<div
			style={{
				position: 'absolute',
				top: 0,
				left: 0,
				width: '100%',
				height: '100%',
				pointerEvents: 'none',
				zIndex: 0,
			}}>
			<Canvas
				gl={{
					antialias: true,
					alpha: true,
					powerPreference: 'high-performance',
				}}
				camera={{
					position: [0, 0, 50],
					fov: 50,
					near: 0.1,
					far: 1000,
				}}
				style={{ background: 'transparent' }}>
				<Suspense fallback={null}>
					<SceneContent
						isDarkMode={isDarkMode}
						isExecuting={isExecuting}
						nodePositions={nodePositions}
						edgePositions={edgePositions}
						selectedNodeIds={selectedNodeIds}
						hoveredNodeId={hoveredNodeId}
						zoom={zoom}
						pan={pan}
					/>
				</Suspense>
			</Canvas>
		</div>
	);
};

export default ThreeBackgroundPartial;
