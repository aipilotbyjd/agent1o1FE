/* eslint-disable react/no-unknown-property */
import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface IExecutionBurstProps {
	position: [number, number, number];
	type: 'success' | 'error' | 'running' | 'warning';
	onComplete?: () => void;
}

const burstColors = {
	success: new THREE.Color(0x22c55e),
	error: new THREE.Color(0xef4444),
	running: new THREE.Color(0x3b82f6),
	warning: new THREE.Color(0xf59e0b),
};

const ExecutionBurst = ({ position, type, onComplete }: IExecutionBurstProps) => {
	const groupRef = useRef<THREE.Group>(null);
	const pointsRef = useRef<THREE.Points>(null);
	const [progress, setProgress] = useState(0);
	const startTime = useRef(Date.now());

	const color = burstColors[type];
	const particleCount = type === 'error' ? 80 : 50;
	const duration = type === 'error' ? 1.2 : 0.8;

	const particleData = useMemo(() => {
		const positions = new Float32Array(particleCount * 3);
		const velocities = new Float32Array(particleCount * 3);
		const sizes = new Float32Array(particleCount);
		const initialPositions = new Float32Array(particleCount * 3);

		for (let i = 0; i < particleCount; i++) {
			// Spherical distribution
			const theta = Math.random() * Math.PI * 2;
			const phi = Math.acos(2 * Math.random() - 1);

			const direction = new THREE.Vector3(
				Math.sin(phi) * Math.cos(theta),
				Math.sin(phi) * Math.sin(theta),
				Math.cos(phi),
			);

			// Initial position at center
			initialPositions[i * 3] = position[0];
			initialPositions[i * 3 + 1] = position[1];
			initialPositions[i * 3 + 2] = position[2];

			positions[i * 3] = position[0];
			positions[i * 3 + 1] = position[1];
			positions[i * 3 + 2] = position[2];

			// Velocity (outward burst)
			const speed = 2 + Math.random() * 3;
			velocities[i * 3] = direction.x * speed;
			velocities[i * 3 + 1] = direction.y * speed;
			velocities[i * 3 + 2] = direction.z * speed;

			// Size variation
			sizes[i] = 0.05 + Math.random() * 0.1;
		}

		return { positions, velocities, sizes, initialPositions };
	}, [particleCount, position]);

	useFrame(() => {
		const elapsed = (Date.now() - startTime.current) / 1000;
		const newProgress = Math.min(elapsed / duration, 1);
		setProgress(newProgress);

		if (pointsRef.current && newProgress < 1) {
			const positionAttr = pointsRef.current.geometry.attributes.position;
			const positions = positionAttr.array as Float32Array;

			// Ease out function for deceleration
			const easeOut = 1 - Math.pow(1 - newProgress, 3);

			for (let i = 0; i < particleCount; i++) {
				// Update positions based on velocity and eased progress
				positions[i * 3] =
					particleData.initialPositions[i * 3] +
					particleData.velocities[i * 3] * easeOut * 0.5;
				positions[i * 3 + 1] =
					particleData.initialPositions[i * 3 + 1] +
					particleData.velocities[i * 3 + 1] * easeOut * 0.5 -
					newProgress * 0.5; // Gravity
				positions[i * 3 + 2] =
					particleData.initialPositions[i * 3 + 2] +
					particleData.velocities[i * 3 + 2] * easeOut * 0.5;
			}

			positionAttr.needsUpdate = true;
		}

		if (newProgress >= 1 && onComplete) {
			onComplete();
		}
	});

	// Opacity fades out
	const opacity = 1 - progress;

	if (progress >= 1) return null;

	return (
		<group ref={groupRef}>
			{/* Particle burst */}
			<points ref={pointsRef}>
				<bufferGeometry>
					<bufferAttribute
						attach='attributes-position'
						args={[particleData.positions, 3]}
					/>
					<bufferAttribute attach='attributes-size' args={[particleData.sizes, 1]} />
				</bufferGeometry>
				<pointsMaterial
					color={color}
					size={0.1}
					transparent
					opacity={opacity}
					blending={THREE.AdditiveBlending}
					sizeAttenuation
				/>
			</points>

			{/* Central flash */}
			<mesh position={position}>
				<sphereGeometry args={[0.3 + progress * 0.5, 16, 16]} />
				<meshBasicMaterial
					color={color}
					transparent
					opacity={opacity * 0.5}
					blending={THREE.AdditiveBlending}
				/>
			</mesh>

			{/* Expanding ring */}
			<mesh position={position} rotation={[Math.PI / 2, 0, 0]}>
				<ringGeometry args={[progress * 1.5, progress * 1.5 + 0.05, 32]} />
				<meshBasicMaterial
					color={color}
					transparent
					opacity={opacity * 0.7}
					blending={THREE.AdditiveBlending}
					side={THREE.DoubleSide}
				/>
			</mesh>
		</group>
	);
};

export default ExecutionBurst;
