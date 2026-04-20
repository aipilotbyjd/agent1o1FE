/* eslint-disable react/no-unknown-property */
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ICircuitPatternProps {
	color?: THREE.Color;
	opacity?: number;
	gridSize?: number;
	animated?: boolean;
}

const CircuitPattern = ({
	color = new THREE.Color(0x10b981),
	opacity = 0.15,
	gridSize = 50,
	animated = true,
}: ICircuitPatternProps) => {
	const meshRef = useRef<THREE.Mesh>(null);

	const shaderMaterial = useMemo(() => {
		return new THREE.ShaderMaterial({
			uniforms: {
				uTime: { value: 0 },
				uColor: { value: color },
				uOpacity: { value: opacity },
				uGridSize: { value: gridSize },
			},
			vertexShader: `
				varying vec2 vUv;
				
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
				}
			`,
			fragmentShader: `
				uniform float uTime;
				uniform vec3 uColor;
				uniform float uOpacity;
				uniform float uGridSize;
				
				varying vec2 vUv;
				
				float hash(vec2 p) {
					return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
				}
				
				float circuit(vec2 uv, float scale) {
					vec2 grid = floor(uv * scale);
					vec2 local = fract(uv * scale);
					
					float lineWidth = 0.08;
					float nodeSize = 0.15;
					
					// Random value for this cell
					float rand = hash(grid);
					float rand2 = hash(grid + vec2(1.0, 0.0));
					float rand3 = hash(grid + vec2(0.0, 1.0));
					
					float line = 0.0;
					
					// Horizontal line
					if (rand > 0.3) {
						float h = smoothstep(0.5 - lineWidth, 0.5, local.y) - 
								  smoothstep(0.5, 0.5 + lineWidth, local.y);
						line = max(line, h * step(0.2, local.x) * step(local.x, 0.8));
					}
					
					// Vertical line
					if (rand > 0.5) {
						float v = smoothstep(0.5 - lineWidth, 0.5, local.x) - 
								  smoothstep(0.5, 0.5 + lineWidth, local.x);
						line = max(line, v * step(0.2, local.y) * step(local.y, 0.8));
					}
					
					// Connection to right
					if (rand2 > 0.4 && rand > 0.3) {
						float h = smoothstep(0.5 - lineWidth, 0.5, local.y) - 
								  smoothstep(0.5, 0.5 + lineWidth, local.y);
						line = max(line, h * step(0.5, local.x));
					}
					
					// Connection to bottom
					if (rand3 > 0.4 && rand > 0.5) {
						float v = smoothstep(0.5 - lineWidth, 0.5, local.x) - 
								  smoothstep(0.5, 0.5 + lineWidth, local.x);
						line = max(line, v * step(0.5, local.y));
					}
					
					// Node at center
					if (rand > 0.6) {
						float dist = length(local - vec2(0.5));
						float node = smoothstep(nodeSize, nodeSize - 0.05, dist);
						line = max(line, node * 0.8);
					}
					
					return line;
				}
				
				float pulsingLine(vec2 uv, float scale, float time) {
					vec2 grid = floor(uv * scale);
					float rand = hash(grid);
					
					// Pulse traveling along circuits
					float pulse = sin(uv.x * 3.0 + uv.y * 2.0 - time * 2.0 + rand * 6.28) * 0.5 + 0.5;
					return pulse;
				}
				
				void main() {
					vec2 uv = vUv;
					
					// Multi-scale circuit pattern
					float c1 = circuit(uv, uGridSize * 0.5);
					float c2 = circuit(uv + vec2(0.5), uGridSize * 0.3) * 0.5;
					
					float pattern = max(c1, c2);
					
					// Add pulsing glow
					float pulse = pulsingLine(uv, uGridSize * 0.5, uTime);
					float glow = pattern * (0.5 + pulse * 0.5);
					
					// Final color
					vec3 finalColor = uColor * glow;
					float alpha = pattern * uOpacity * (0.7 + pulse * 0.3);
					
					gl_FragColor = vec4(finalColor, alpha);
				}
			`,
			transparent: true,
			blending: THREE.AdditiveBlending,
			depthWrite: false,
			side: THREE.DoubleSide,
		});
	}, [color, opacity, gridSize]);

	useFrame((state) => {
		if (animated && meshRef.current) {
			shaderMaterial.uniforms.uTime.value = state.clock.elapsedTime;
		}
	});

	return (
		<mesh ref={meshRef} rotation={[0, 0, 0]} position={[0, 0, -2]} material={shaderMaterial}>
			<planeGeometry args={[100, 100]} />
		</mesh>
	);
};

export default CircuitPattern;
