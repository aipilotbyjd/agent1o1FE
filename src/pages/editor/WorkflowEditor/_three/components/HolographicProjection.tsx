/* eslint-disable react/no-unknown-property */
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface IHolographicProjectionProps {
	position: [number, number, number];
	nodeType?: string;
	isSelected?: boolean;
	isHovered?: boolean;
	size?: number;
}

const HolographicProjection = ({
	position,
	nodeType = 'default',
	isSelected = false,
	isHovered = false,
	size = 0.8,
}: IHolographicProjectionProps) => {
	const groupRef = useRef<THREE.Group>(null);
	const wireframeRef = useRef<THREE.LineSegments>(null);
	const scanLineRef = useRef<THREE.Mesh>(null);
	const glitchRef = useRef(0);

	// Choose shape based on node type
	const geometry = useMemo(() => {
		switch (nodeType) {
			case 'trigger':
				return new THREE.OctahedronGeometry(size * 0.5, 0);
			case 'action':
				return new THREE.BoxGeometry(size * 0.6, size * 0.6, size * 0.6);
			case 'condition':
				return new THREE.TetrahedronGeometry(size * 0.5, 0);
			case 'loop':
				return new THREE.TorusGeometry(size * 0.3, size * 0.1, 8, 16);
			default:
				return new THREE.IcosahedronGeometry(size * 0.4, 0);
		}
	}, [nodeType, size]);

	// Wireframe edges
	const edgesGeometry = useMemo(() => {
		return new THREE.EdgesGeometry(geometry);
	}, [geometry]);

	// Color based on node type
	const color = useMemo(() => {
		switch (nodeType) {
			case 'trigger':
				return new THREE.Color(0x10b981); // emerald
			case 'action':
				return new THREE.Color(0x3b82f6); // blue
			case 'condition':
				return new THREE.Color(0xf59e0b); // amber
			case 'loop':
				return new THREE.Color(0xa855f7); // purple
			default:
				return new THREE.Color(0x60a5fa); // light blue
		}
	}, [nodeType]);

	// Scan line shader material
	const scanLineMaterial = useMemo(() => {
		return new THREE.ShaderMaterial({
			uniforms: {
				uTime: { value: 0 },
				uColor: { value: color },
				uOpacity: { value: 0.3 },
			},
			vertexShader: `
				varying vec2 vUv;
				varying vec3 vPosition;
				
				void main() {
					vUv = uv;
					vPosition = position;
					gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
				}
			`,
			fragmentShader: `
				uniform float uTime;
				uniform vec3 uColor;
				uniform float uOpacity;
				
				varying vec2 vUv;
				varying vec3 vPosition;
				
				void main() {
					// Horizontal scan lines
					float scanLine = sin(vPosition.y * 50.0 + uTime * 5.0) * 0.5 + 0.5;
					scanLine = step(0.8, scanLine);
					
					// Vertical interference
					float interference = sin(vPosition.x * 30.0 - uTime * 3.0) * 0.5 + 0.5;
					interference = smoothstep(0.7, 1.0, interference) * 0.3;
					
					// Edge glow
					float edge = 1.0 - abs(vUv.x - 0.5) * 2.0;
					edge *= 1.0 - abs(vUv.y - 0.5) * 2.0;
					
					float alpha = (scanLine * 0.5 + interference + edge * 0.2) * uOpacity;
					
					gl_FragColor = vec4(uColor, alpha);
				}
			`,
			transparent: true,
			blending: THREE.AdditiveBlending,
			side: THREE.DoubleSide,
			depthWrite: false,
		});
	}, [color]);

	useFrame((state) => {
		if (!groupRef.current) return;

		const time = state.clock.elapsedTime;

		// Float up and down
		const floatY = Math.sin(time * 2) * 0.05;
		groupRef.current.position.y = position[1] + 0.8 + floatY;

		// Rotate slowly
		groupRef.current.rotation.y = time * 0.5;
		groupRef.current.rotation.x = Math.sin(time * 0.3) * 0.2;

		// Update scan line shader
		if (scanLineMaterial.uniforms) {
			scanLineMaterial.uniforms.uTime.value = time;
		}

		// Glitch effect when hovered
		if (isHovered || isSelected) {
			glitchRef.current += 0.1;
			if (Math.random() > 0.95) {
				// Random glitch offset
				groupRef.current.position.x = position[0] + (Math.random() - 0.5) * 0.05;
			} else {
				groupRef.current.position.x = position[0];
			}

			// Flicker opacity
			if (wireframeRef.current) {
				const flicker = Math.random() > 0.1 ? 1 : 0.3;
				(wireframeRef.current.material as THREE.LineBasicMaterial).opacity =
					(isSelected ? 0.9 : 0.7) * flicker;
			}
		} else {
			groupRef.current.position.x = position[0];
		}

		// Scale based on state
		const targetScale = isSelected ? 1.3 : isHovered ? 1.15 : 1;
		groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
	});

	const baseOpacity = isSelected ? 1.0 : isHovered ? 0.85 : 0.4;

	// Only show holographic projection when hovered or selected
	if (!isHovered && !isSelected) return null;

	return (
		<group ref={groupRef} position={[position[0], position[1] + 0.8, position[2]]}>
			{/* Main wireframe shape */}
			<lineSegments ref={wireframeRef} geometry={edgesGeometry}>
				<lineBasicMaterial
					color={color}
					transparent
					opacity={baseOpacity}
					blending={THREE.AdditiveBlending}
				/>
			</lineSegments>

			{/* Inner glow plane */}
			<mesh ref={scanLineRef} material={scanLineMaterial}>
				<planeGeometry args={[size, size]} />
			</mesh>

			{/* Holographic base ring */}
			<mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.3, 0]}>
				<ringGeometry args={[size * 0.4, size * 0.45, 32]} />
				<meshBasicMaterial
					color={color}
					transparent
					opacity={baseOpacity * 0.5}
					blending={THREE.AdditiveBlending}
					side={THREE.DoubleSide}
				/>
			</mesh>

			{/* Projection beam */}
			<mesh position={[0, -0.5, 0]}>
				<coneGeometry args={[size * 0.3, 0.4, 16, 1, true]} />
				<meshBasicMaterial
					color={color}
					transparent
					opacity={baseOpacity * 0.2}
					blending={THREE.AdditiveBlending}
					side={THREE.DoubleSide}
				/>
			</mesh>

			{/* Data points orbiting */}
			{[0, 1, 2, 3].map((i) => (
				<DataPoint
					key={i}
					index={i}
					color={color}
					radius={size * 0.6}
					opacity={baseOpacity}
				/>
			))}
		</group>
	);
};

// Small orbiting data points
const DataPoint = ({
	index,
	color,
	radius,
	opacity,
}: {
	index: number;
	color: THREE.Color;
	radius: number;
	opacity: number;
}) => {
	const ref = useRef<THREE.Mesh>(null);

	useFrame((state) => {
		if (!ref.current) return;
		const time = state.clock.elapsedTime;
		const angle = time * 2 + (index * Math.PI * 2) / 4;
		ref.current.position.x = Math.cos(angle) * radius;
		ref.current.position.z = Math.sin(angle) * radius;
		ref.current.position.y = Math.sin(time * 3 + index) * 0.1;
	});

	return (
		<mesh ref={ref}>
			<boxGeometry args={[0.03, 0.03, 0.03]} />
			<meshBasicMaterial
				color={color}
				transparent
				opacity={opacity * 0.8}
				blending={THREE.AdditiveBlending}
			/>
		</mesh>
	);
};

export default HolographicProjection;
