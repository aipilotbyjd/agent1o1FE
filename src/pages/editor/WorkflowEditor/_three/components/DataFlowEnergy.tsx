/* eslint-disable react/no-unknown-property */
import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface IDataFlowEnergyProps {
	start: [number, number, number];
	end: [number, number, number];
	color?: THREE.Color;
	speed?: number;
	particleCount?: number;
	active?: boolean;
	intensity?: number;
}

const DataFlowEnergy = ({
	start,
	end,
	color = new THREE.Color(0x10b981),
	speed = 1,
	particleCount = 15,
	active = true,
	intensity = 1,
}: IDataFlowEnergyProps) => {
	const pointsRef = useRef<THREE.Points>(null);
	const groupRef = useRef<THREE.Group>(null);
	const trailLineRef = useRef<THREE.Line | null>(null);

	const curve = useMemo(() => {
		const startVec = new THREE.Vector3(...start);
		const endVec = new THREE.Vector3(...end);
		const midPoint = startVec.clone().lerp(endVec, 0.5);

		// Add curve
		const distance = startVec.distanceTo(endVec);
		midPoint.z += Math.min(distance * 0.2, 1);

		return new THREE.QuadraticBezierCurve3(startVec, midPoint, endVec);
	}, [start, end]);

	const particleData = useMemo(() => {
		return Array.from({ length: particleCount }, (_, i) => ({
			offset: i / particleCount,
			speed: 0.8 + Math.random() * 0.4,
			size: 0.04 + Math.random() * 0.03,
		}));
	}, [particleCount]);

	const positions = useMemo(() => new Float32Array(particleCount * 3), [particleCount]);
	const sizes = useMemo(() => new Float32Array(particleCount), [particleCount]);

	const trailGeometry = useMemo(() => {
		const points = curve.getPoints(50);
		return new THREE.BufferGeometry().setFromPoints(points);
	}, [curve]);

	useFrame((state) => {
		if (!active || !pointsRef.current) return;

		const time = state.clock.elapsedTime * speed;

		particleData.forEach((particle, i) => {
			const t = (time * particle.speed + particle.offset) % 1;
			const point = curve.getPoint(t);

			positions[i * 3] = point.x;
			positions[i * 3 + 1] = point.y;
			positions[i * 3 + 2] = point.z;

			// Pulse size
			const pulse = Math.sin(time * 4 + particle.offset * Math.PI * 2) * 0.5 + 0.5;
			sizes[i] = particle.size * (0.7 + pulse * 0.3) * intensity;
		});

		const geometry = pointsRef.current.geometry;
		geometry.attributes.position.needsUpdate = true;
		geometry.attributes.size.needsUpdate = true;
	});

	const shaderMaterial = useMemo(() => {
		return new THREE.ShaderMaterial({
			uniforms: {
				uColor: { value: color },
			},
			vertexShader: `
				attribute float size;
				varying float vSize;
				
				void main() {
					vSize = size;
					vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
					gl_PointSize = size * (400.0 / -mvPosition.z);
					gl_Position = projectionMatrix * mvPosition;
				}
			`,
			fragmentShader: `
				uniform vec3 uColor;
				varying float vSize;
				
				void main() {
					float dist = length(gl_PointCoord - vec2(0.5));
					if (dist > 0.5) discard;
					
					float alpha = smoothstep(0.5, 0.0, dist);
					float glow = exp(-dist * 3.0);
					
					vec3 finalColor = uColor + vec3(glow * 0.5);
					gl_FragColor = vec4(finalColor, alpha);
				}
			`,
			transparent: true,
			blending: THREE.AdditiveBlending,
			depthWrite: false,
		});
	}, [color]);

	// Create trail line imperatively
	useEffect(() => {
		if (!groupRef.current || !active) return;

		const trailMaterial = new THREE.LineBasicMaterial({
			color,
			transparent: true,
			opacity: 0.2 * intensity,
			blending: THREE.AdditiveBlending,
		});
		const trailLine = new THREE.Line(trailGeometry, trailMaterial);
		trailLineRef.current = trailLine;
		groupRef.current.add(trailLine);

		return () => {
			const group = groupRef.current;
			if (group && trailLineRef.current) {
				group.remove(trailLineRef.current);
			}
			trailMaterial.dispose();
		};
	}, [active, color, intensity, trailGeometry]);

	if (!active) return null;

	return (
		<group ref={groupRef}>
			{/* Energy particles */}
			<points ref={pointsRef} material={shaderMaterial}>
				<bufferGeometry>
					<bufferAttribute attach='attributes-position' args={[positions, 3]} />
					<bufferAttribute attach='attributes-size' args={[sizes, 1]} />
				</bufferGeometry>
			</points>
		</group>
	);
};

export default DataFlowEnergy;
