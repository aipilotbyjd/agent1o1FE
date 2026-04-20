/* eslint-disable react/no-unknown-property */
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getPalette } from '../utils/colorPalettes';

interface IInfiniteGridProps {
	isDarkMode: boolean;
	gridSize?: number;
	fadeDistance?: number;
	pulseIntensity?: number;
	pulseSpeed?: number;
	isExecuting?: boolean;
}

const gridVertexShader = `
varying vec2 vUv;
varying vec3 vWorldPosition;

void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`;

const gridFragmentShader = `
varying vec2 vUv;
varying vec3 vWorldPosition;
uniform float uTime;
uniform vec3 uGridColor;
uniform float uGridSize;
uniform float uFadeDistance;
uniform float uPulseIntensity;
uniform float uPulseSpeed;

float grid(vec2 st, float res) {
    vec2 grid = abs(fract(st * res - 0.5) - 0.5) / fwidth(st * res);
    return 1.0 - min(min(grid.x, grid.y), 1.0);
}

void main() {
    vec2 worldUv = vWorldPosition.xz / uGridSize;
    
    // Main grid
    float mainGrid = grid(worldUv, 1.0) * 0.8;
    
    // Secondary grid (larger squares)
    float secondaryGrid = grid(worldUv, 0.1) * 1.5;
    
    // Combine grids
    float gridPattern = max(mainGrid, secondaryGrid);
    
    // Distance fade
    float dist = length(vWorldPosition.xz);
    float fade = 1.0 - smoothstep(0.0, uFadeDistance, dist);
    
    // Pulse animation
    float pulse = 1.0 + sin(uTime * uPulseSpeed - dist * 0.02) * uPulseIntensity;
    
    // Final color
    vec3 color = uGridColor * gridPattern * fade * pulse;
    float alpha = gridPattern * fade * 0.4;
    
    gl_FragColor = vec4(color, alpha);
}
`;

const InfiniteGrid = ({
	isDarkMode,
	gridSize = 50,
	fadeDistance = 500,
	pulseIntensity = 0.1,
	pulseSpeed = 1,
	isExecuting = false,
}: IInfiniteGridProps) => {
	const meshRef = useRef<THREE.Mesh>(null);
	const palette = getPalette(isDarkMode);

	const uniforms = useMemo(
		() => ({
			uTime: { value: 0 },
			uGridColor: { value: palette.grid },
			uGridSize: { value: gridSize },
			uFadeDistance: { value: fadeDistance },
			uPulseIntensity: { value: pulseIntensity },
			uPulseSpeed: { value: pulseSpeed },
		}),
		[palette.grid, gridSize, fadeDistance, pulseIntensity, pulseSpeed],
	);

	useFrame((state) => {
		if (meshRef.current) {
			const material = meshRef.current.material as THREE.ShaderMaterial;
			material.uniforms.uTime.value = state.clock.elapsedTime;
			material.uniforms.uPulseIntensity.value = isExecuting ? 0.3 : pulseIntensity;
			material.uniforms.uPulseSpeed.value = isExecuting ? 3 : pulseSpeed;
		}
	});

	return (
		<mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
			<planeGeometry args={[1000, 1000, 1, 1]} />
			<shaderMaterial
				vertexShader={gridVertexShader}
				fragmentShader={gridFragmentShader}
				uniforms={uniforms}
				transparent
				depthWrite={false}
				side={THREE.DoubleSide}
			/>
		</mesh>
	);
};

export default InfiniteGrid;
