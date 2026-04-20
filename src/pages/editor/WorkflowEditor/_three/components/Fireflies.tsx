/* eslint-disable react/no-unknown-property */
import { useRef, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface IFirefliesProps {
	count?: number;
	colors?: THREE.Color[];
	areaSize?: number;
	cursorInfluence?: boolean;
}

interface IFirefly {
	basePosition: THREE.Vector3;
	offset: THREE.Vector3;
	speed: number;
	phase: number;
	size: number;
	colorIndex: number;
	brightness: number;
	brightPhase: number;
}

const Fireflies = ({
	count = 80,
	colors = [
		new THREE.Color(0x10b981), // emerald
		new THREE.Color(0x60a5fa), // blue
		new THREE.Color(0xa78bfa), // purple
		new THREE.Color(0xfbbf24), // amber
	],
	areaSize = 40,
	cursorInfluence = true,
}: IFirefliesProps) => {
	const pointsRef = useRef<THREE.Points>(null);
	const { pointer, viewport } = useThree();

	const fireflies = useMemo<IFirefly[]>(() => {
		return Array.from({ length: count }, () => ({
			basePosition: new THREE.Vector3(
				(Math.random() - 0.5) * areaSize,
				(Math.random() - 0.5) * areaSize,
				(Math.random() - 0.5) * 5,
			),
			offset: new THREE.Vector3(),
			speed: 0.2 + Math.random() * 0.3,
			phase: Math.random() * Math.PI * 2,
			size: 0.06 + Math.random() * 0.08,
			colorIndex: Math.floor(Math.random() * colors.length),
			brightness: Math.random(),
			brightPhase: Math.random() * Math.PI * 2,
		}));
	}, [count, areaSize, colors.length]);

	const [positions] = useState(() => new Float32Array(count * 3));
	const [sizes] = useState(() => new Float32Array(count));
	const [colorArray] = useState(() => new Float32Array(count * 3));

	useFrame((state) => {
		if (!pointsRef.current) return;

		const time = state.clock.elapsedTime;
		const mouseX = pointer.x * viewport.width * 0.5;
		const mouseY = pointer.y * viewport.height * 0.5;

		fireflies.forEach((fly, i) => {
			// Organic floating motion
			const wobbleX = Math.sin(time * fly.speed + fly.phase) * 0.5;
			const wobbleY = Math.cos(time * fly.speed * 0.7 + fly.phase) * 0.5;
			const wobbleZ = Math.sin(time * fly.speed * 0.5 + fly.phase) * 0.2;

			fly.offset.set(wobbleX, wobbleY, wobbleZ);

			let x = fly.basePosition.x + fly.offset.x;
			let y = fly.basePosition.y + fly.offset.y;
			const z = fly.basePosition.z + fly.offset.z;

			// Cursor influence - fireflies gently move away from cursor
			if (cursorInfluence) {
				const dx = x - mouseX;
				const dy = y - mouseY;
				const dist = Math.sqrt(dx * dx + dy * dy);
				const influence = Math.max(0, 1 - dist / 5);

				if (influence > 0) {
					const pushStrength = influence * 2;
					x += (dx / dist) * pushStrength;
					y += (dy / dist) * pushStrength;
				}
			}

			positions[i * 3] = x;
			positions[i * 3 + 1] = y;
			positions[i * 3 + 2] = z;

			// Pulsing brightness
			const pulse = Math.sin(time * 2 + fly.brightPhase) * 0.5 + 0.5;
			const currentBrightness = 0.3 + pulse * 0.7;
			sizes[i] = fly.size * currentBrightness;

			// Color with brightness
			const color = colors[fly.colorIndex];
			colorArray[i * 3] = color.r * currentBrightness;
			colorArray[i * 3 + 1] = color.g * currentBrightness;
			colorArray[i * 3 + 2] = color.b * currentBrightness;
		});

		const geometry = pointsRef.current.geometry;
		geometry.attributes.position.needsUpdate = true;
		geometry.attributes.size.needsUpdate = true;
		geometry.attributes.color.needsUpdate = true;
	});

	const shaderMaterial = useMemo(() => {
		return new THREE.ShaderMaterial({
			uniforms: {},
			vertexShader: `
				attribute float size;
				attribute vec3 color;
				varying vec3 vColor;
				
				void main() {
					vColor = color;
					vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
					gl_PointSize = size * (400.0 / -mvPosition.z);
					gl_Position = projectionMatrix * mvPosition;
				}
			`,
			fragmentShader: `
				varying vec3 vColor;
				
				void main() {
					float dist = length(gl_PointCoord - vec2(0.5));
					if (dist > 0.5) discard;
					
					// Soft glow
					float alpha = smoothstep(0.5, 0.0, dist);
					float glow = exp(-dist * 4.0);
					
					vec3 finalColor = vColor * (1.0 + glow * 2.0);
					gl_FragColor = vec4(finalColor, alpha);
				}
			`,
			transparent: true,
			blending: THREE.AdditiveBlending,
			depthWrite: false,
		});
	}, []);

	return (
		<points ref={pointsRef} material={shaderMaterial}>
			<bufferGeometry>
				<bufferAttribute attach='attributes-position' args={[positions, 3]} />
				<bufferAttribute attach='attributes-size' args={[sizes, 1]} />
				<bufferAttribute attach='attributes-color' args={[colorArray, 3]} />
			</bufferGeometry>
		</points>
	);
};

export default Fireflies;
