/* eslint-disable react/no-unknown-property */
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface IDataFlowParticleProps {
	start: [number, number, number];
	end: [number, number, number];
	progress: number;
	color?: THREE.Color;
	size?: number;
	trailLength?: number;
}

const DataFlowParticle = ({
	start,
	end,
	progress,
	color = new THREE.Color(0x10b981),
	size = 0.15,
	trailLength = 0.15,
}: IDataFlowParticleProps) => {
	const groupRef = useRef<THREE.Group>(null);
	const particleRef = useRef<THREE.Mesh>(null);
	const trailRef = useRef<THREE.Points>(null);

	const startVec = useMemo(() => new THREE.Vector3(...start), [start]);
	const endVec = useMemo(() => new THREE.Vector3(...end), [end]);

	const currentPosition = useMemo(() => {
		return startVec.clone().lerp(endVec, Math.min(Math.max(progress, 0), 1));
	}, [startVec, endVec, progress]);

	const trailPositions = useMemo(() => {
		const positions = new Float32Array(30 * 3);

		for (let i = 0; i < 10; i++) {
			const trailProgress = progress - (i / 10) * trailLength;
			if (trailProgress >= 0 && trailProgress <= 1) {
				const pos = startVec.clone().lerp(endVec, trailProgress);
				positions[i * 3] = pos.x;
				positions[i * 3 + 1] = pos.y;
				positions[i * 3 + 2] = pos.z;
			} else {
				positions[i * 3] = currentPosition.x;
				positions[i * 3 + 1] = currentPosition.y;
				positions[i * 3 + 2] = currentPosition.z;
			}
		}

		return positions;
	}, [startVec, endVec, progress, trailLength, currentPosition]);

	const trailSizes = useMemo(() => {
		const sizes = new Float32Array(10);
		for (let i = 0; i < 10; i++) {
			sizes[i] = size * (1 - i / 10) * 0.5;
		}
		return sizes;
	}, [size]);

	useFrame((state) => {
		if (particleRef.current) {
			const pulse = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.2;
			particleRef.current.scale.setScalar(pulse);
		}
	});

	return (
		<group ref={groupRef}>
			{/* Main particle */}
			<mesh ref={particleRef} position={currentPosition}>
				<sphereGeometry args={[size, 16, 16]} />
				<meshBasicMaterial color={color} transparent opacity={0.9} />
			</mesh>

			{/* Glow around particle */}
			<sprite position={currentPosition}>
				<spriteMaterial
					color={color}
					transparent
					opacity={0.5}
					blending={THREE.AdditiveBlending}
					sizeAttenuation
				/>
			</sprite>

			{/* Trail particles */}
			<points ref={trailRef}>
				<bufferGeometry>
					<bufferAttribute attach='attributes-position' args={[trailPositions, 3]} />
					<bufferAttribute attach='attributes-size' args={[trailSizes, 1]} />
				</bufferGeometry>
				<pointsMaterial
					color={color}
					size={size * 0.5}
					transparent
					opacity={0.5}
					blending={THREE.AdditiveBlending}
					sizeAttenuation
				/>
			</points>
		</group>
	);
};

export default DataFlowParticle;
