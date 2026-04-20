/* eslint-disable react/no-unknown-property */
import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface IHexGridProps {
	color?: THREE.Color;
	highlightColor?: THREE.Color;
	opacity?: number;
	cellSize?: number;
	animated?: boolean;
}

const HexGrid = ({
	color = new THREE.Color(0x10b981),
	highlightColor = new THREE.Color(0x60a5fa),
	opacity = 0.12,
	cellSize = 2,
	animated = true,
}: IHexGridProps) => {
	const meshRef = useRef<THREE.Mesh>(null);
	const { pointer, viewport } = useThree();

	const shaderMaterial = useMemo(() => {
		return new THREE.ShaderMaterial({
			uniforms: {
				uTime: { value: 0 },
				uColor: { value: color },
				uHighlightColor: { value: highlightColor },
				uOpacity: { value: opacity },
				uCellSize: { value: cellSize },
				uMouse: { value: new THREE.Vector2(0, 0) },
			},
			vertexShader: `
				varying vec2 vUv;
				varying vec2 vWorldPos;
				
				void main() {
					vUv = uv;
					vec4 worldPos = modelMatrix * vec4(position, 1.0);
					vWorldPos = worldPos.xy;
					gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
				}
			`,
			fragmentShader: `
				uniform float uTime;
				uniform vec3 uColor;
				uniform vec3 uHighlightColor;
				uniform float uOpacity;
				uniform float uCellSize;
				uniform vec2 uMouse;
				
				varying vec2 vUv;
				varying vec2 vWorldPos;
				
				// Hexagon distance function
				float hexDist(vec2 p) {
					p = abs(p);
					float c = dot(p, normalize(vec2(1.0, 1.73)));
					return max(c, p.x);
				}
				
				vec4 hexCoords(vec2 uv) {
					vec2 r = vec2(1.0, 1.73);
					vec2 h = r * 0.5;
					vec2 a = mod(uv, r) - h;
					vec2 b = mod(uv - h, r) - h;
					
					vec2 gv = length(a) < length(b) ? a : b;
					
					float x = atan(gv.x, gv.y);
					float y = 0.5 - hexDist(gv);
					vec2 id = uv - gv;
					
					return vec4(x, y, id.x, id.y);
				}
				
				float hash(vec2 p) {
					return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
				}
				
				void main() {
					vec2 uv = vWorldPos / uCellSize;
					
					vec4 hc = hexCoords(uv);
					
					// Edge glow
					float edge = smoothstep(0.0, 0.1, hc.y) - smoothstep(0.1, 0.15, hc.y);
					
					// Random brightness per cell
					float rand = hash(hc.zw);
					
					// Pulse animation
					float pulse = sin(uTime * 0.5 + rand * 6.28) * 0.5 + 0.5;
					
					// Mouse proximity highlight
					float mouseDist = length(vWorldPos - uMouse);
					float highlight = smoothstep(8.0, 0.0, mouseDist);
					
					// Wave propagation from mouse
					float wave = sin(mouseDist * 0.5 - uTime * 2.0) * 0.5 + 0.5;
					wave *= smoothstep(15.0, 0.0, mouseDist);
					
					// Combine effects
					float brightness = edge * (0.5 + pulse * 0.3);
					brightness += highlight * 0.5;
					brightness += wave * 0.3 * edge;
					
					// Color mixing
					vec3 finalColor = mix(uColor, uHighlightColor, highlight + wave * 0.5);
					
					// Random cell highlights
					if (rand > 0.95) {
						brightness += 0.3 * pulse;
					}
					
					float alpha = brightness * uOpacity;
					
					// Add subtle fill for highlighted cells
					float fill = smoothstep(0.0, 0.3, hc.y) * highlight * 0.1;
					alpha += fill;
					
					gl_FragColor = vec4(finalColor, alpha);
				}
			`,
			transparent: true,
			blending: THREE.AdditiveBlending,
			depthWrite: false,
			side: THREE.DoubleSide,
		});
	}, [color, highlightColor, opacity, cellSize]);

	useFrame((state) => {
		if (!meshRef.current) return;

		if (animated) {
			shaderMaterial.uniforms.uTime.value = state.clock.elapsedTime;
		}

		// Update mouse position
		const mouseX = pointer.x * viewport.width * 0.5;
		const mouseY = pointer.y * viewport.height * 0.5;
		shaderMaterial.uniforms.uMouse.value.set(mouseX, mouseY);
	});

	return (
		<mesh ref={meshRef} rotation={[0, 0, 0]} position={[0, 0, -1.5]} material={shaderMaterial}>
			<planeGeometry args={[120, 120]} />
		</mesh>
	);
};

export default HexGrid;
