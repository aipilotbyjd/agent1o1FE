/* eslint-disable react/no-unknown-property */
import { useRef, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getPalette } from '../utils/colorPalettes';

interface IAmbientParticlesProps {
	isDarkMode: boolean;
	count?: number;
	spread?: number;
	speed?: number;
	size?: number;
	opacity?: number;
}

const particleVertexShader = `
attribute float aSize;
attribute vec3 aColor;
attribute float aOpacity;
varying vec3 vColor;
varying float vOpacity;

void main() {
    vColor = aColor;
    vOpacity = aOpacity;
    
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
}
`;

const particleFragmentShader = `
varying vec3 vColor;
varying float vOpacity;

void main() {
    // Circular particle
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    
    if (dist > 0.5) discard;
    
    // Soft edge
    float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
    alpha *= vOpacity;
    
    // Glow effect
    float glow = exp(-dist * 4.0) * 0.5;
    
    gl_FragColor = vec4(vColor, alpha + glow * vOpacity);
}
`;

interface IParticleData {
	positions: Float32Array;
	velocities: Float32Array;
	sizes: Float32Array;
	colors: Float32Array;
	opacities: Float32Array;
	phases: Float32Array;
}

const AmbientParticles = ({
	isDarkMode,
	count = 200,
	spread = 100,
	speed = 0.2,
	size = 0.5,
	opacity = 0.6,
}: IAmbientParticlesProps) => {
	const pointsRef = useRef<THREE.Points>(null);
	const palette = getPalette(isDarkMode);

	const particleData = useMemo<IParticleData>(() => {
		const positions = new Float32Array(count * 3);
		const velocities = new Float32Array(count * 3);
		const sizes = new Float32Array(count);
		const colors = new Float32Array(count * 3);
		const opacities = new Float32Array(count);
		const phases = new Float32Array(count);

		for (let i = 0; i < count; i++) {
			// Random position within spread
			positions[i * 3] = (Math.random() - 0.5) * spread;
			positions[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.3;
			positions[i * 3 + 2] = (Math.random() - 0.5) * spread;

			// Random velocity
			velocities[i * 3] = (Math.random() - 0.5) * speed;
			velocities[i * 3 + 1] = (Math.random() - 0.5) * speed * 0.5;
			velocities[i * 3 + 2] = (Math.random() - 0.5) * speed;

			// Random size
			sizes[i] = size * (0.5 + Math.random() * 1.5);

			// Random color from palette
			const color = palette.particles[Math.floor(Math.random() * palette.particles.length)];
			colors[i * 3] = color.r;
			colors[i * 3 + 1] = color.g;
			colors[i * 3 + 2] = color.b;

			// Random opacity
			opacities[i] = opacity * (0.3 + Math.random() * 0.7);

			// Random phase for animation variation
			phases[i] = Math.random() * Math.PI * 2;
		}

		return { positions, velocities, sizes, colors, opacities, phases };
	}, [count, spread, speed, size, opacity, palette.particles]);

	const updateParticles = useCallback(
		(elapsedTime: number, delta: number) => {
			if (!pointsRef.current) return;

			const geometry = pointsRef.current.geometry;
			const positions = geometry.attributes.position.array as Float32Array;
			const opacityAttr = geometry.attributes.aOpacity.array as Float32Array;

			for (let i = 0; i < count; i++) {
				// Update position
				positions[i * 3] += particleData.velocities[i * 3] * delta;
				positions[i * 3 + 1] +=
					particleData.velocities[i * 3 + 1] * delta +
					Math.sin(elapsedTime + particleData.phases[i]) * 0.01;
				positions[i * 3 + 2] += particleData.velocities[i * 3 + 2] * delta;

				// Wrap around bounds
				const halfSpread = spread / 2;
				if (positions[i * 3] > halfSpread) positions[i * 3] = -halfSpread;
				if (positions[i * 3] < -halfSpread) positions[i * 3] = halfSpread;
				if (positions[i * 3 + 1] > halfSpread * 0.3)
					positions[i * 3 + 1] = -halfSpread * 0.3;
				if (positions[i * 3 + 1] < -halfSpread * 0.3)
					positions[i * 3 + 1] = halfSpread * 0.3;
				if (positions[i * 3 + 2] > halfSpread) positions[i * 3 + 2] = -halfSpread;
				if (positions[i * 3 + 2] < -halfSpread) positions[i * 3 + 2] = halfSpread;

				// Pulsing opacity
				opacityAttr[i] =
					particleData.opacities[i] *
					(0.7 + Math.sin(elapsedTime * 0.5 + particleData.phases[i]) * 0.3);
			}

			geometry.attributes.position.needsUpdate = true;
			geometry.attributes.aOpacity.needsUpdate = true;
		},
		[count, spread, particleData],
	);

	useFrame((state, delta) => {
		updateParticles(state.clock.elapsedTime, delta);
	});

	return (
		<points ref={pointsRef}>
			<bufferGeometry>
				<bufferAttribute attach='attributes-position' args={[particleData.positions, 3]} />
				<bufferAttribute attach='attributes-aSize' args={[particleData.sizes, 1]} />
				<bufferAttribute attach='attributes-aColor' args={[particleData.colors, 3]} />
				<bufferAttribute attach='attributes-aOpacity' args={[particleData.opacities, 1]} />
			</bufferGeometry>
			<shaderMaterial
				vertexShader={particleVertexShader}
				fragmentShader={particleFragmentShader}
				transparent
				depthWrite={false}
				blending={THREE.AdditiveBlending}
			/>
		</points>
	);
};

export default AmbientParticles;
