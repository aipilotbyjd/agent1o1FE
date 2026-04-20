/* eslint-disable react/no-unknown-property */
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getPalette } from '../utils/colorPalettes';

interface IConnectionBeamProps {
	start: [number, number, number];
	end: [number, number, number];
	isDarkMode: boolean;
	isActive?: boolean;
	isHighlighted?: boolean;
	color?: THREE.Color;
	intensity?: number;
	flowSpeed?: number;
}

const beamVertexShader = `
varying vec2 vUv;
varying float vProgress;

void main() {
    vUv = uv;
    vProgress = uv.x;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const beamFragmentShader = `
varying vec2 vUv;
varying float vProgress;
uniform float uTime;
uniform vec3 uColor;
uniform float uIntensity;
uniform float uFlowSpeed;
uniform bool uIsActive;
uniform bool uIsHighlighted;

void main() {
    // Distance from center line
    float distFromCenter = abs(vUv.y - 0.5) * 2.0;
    
    // Base beam glow
    float glowWidth = uIsHighlighted ? 0.4 : 0.3;
    float beam = 1.0 - smoothstep(0.0, glowWidth, distFromCenter);
    beam = pow(beam, 1.5);
    
    // Core line
    float coreWidth = uIsHighlighted ? 0.15 : 0.1;
    float core = 1.0 - smoothstep(0.0, coreWidth, distFromCenter);
    
    // Flow animation (data packets moving along the beam)
    float flow = 0.0;
    if (uIsActive) {
        // Multiple flowing particles
        for (int i = 0; i < 3; i++) {
            float offset = float(i) * 0.33;
            float flowPos = fract(vUv.x - uTime * uFlowSpeed + offset);
            float particle = smoothstep(0.0, 0.05, flowPos) * smoothstep(0.15, 0.1, flowPos);
            particle *= (1.0 - distFromCenter * 2.0);
            flow += particle * 0.4;
        }
    }
    
    // Highlighted pulse
    float highlightPulse = 1.0;
    if (uIsHighlighted) {
        highlightPulse = 0.8 + sin(uTime * 4.0) * 0.2;
    }
    
    // Edge fade
    float edgeFade = smoothstep(0.0, 0.05, vUv.x) * smoothstep(1.0, 0.95, vUv.x);
    
    // Combine
    float baseIntensity = uIsHighlighted ? uIntensity * 1.5 : uIntensity;
    float alpha = (beam * 0.2 + core * 0.5 + flow) * baseIntensity * edgeFade * highlightPulse;
    
    // Color variation for flow
    vec3 finalColor = uColor;
    if (uIsActive) {
        finalColor = mix(uColor, vec3(1.0), flow * 0.5);
    }
    if (uIsHighlighted) {
        finalColor = mix(finalColor, vec3(1.0), 0.2);
    }
    
    gl_FragColor = vec4(finalColor, alpha);
}
`;

const ConnectionBeam = ({
	start,
	end,
	isDarkMode,
	isActive = false,
	isHighlighted = false,
	color,
	intensity = 0.8,
	flowSpeed = 0.5,
}: IConnectionBeamProps) => {
	const meshRef = useRef<THREE.Mesh>(null);
	const palette = getPalette(isDarkMode);
	const beamColor = color || palette.primary;

	const { geometry, position, rotation, scale } = useMemo(() => {
		const startVec = new THREE.Vector3(...start);
		const endVec = new THREE.Vector3(...end);
		const direction = endVec.clone().sub(startVec);
		const length = direction.length();
		const midpoint = startVec.clone().add(direction.multiplyScalar(0.5));

		const angle = Math.atan2(endVec.y - startVec.y, endVec.x - startVec.x);

		return {
			geometry: new THREE.PlaneGeometry(1, 0.3),
			position: midpoint.toArray() as [number, number, number],
			rotation: [0, 0, angle] as [number, number, number],
			scale: [length, 1, 1] as [number, number, number],
		};
	}, [start, end]);

	const uniforms = useMemo(
		() => ({
			uTime: { value: 0 },
			uColor: { value: beamColor },
			uIntensity: { value: intensity },
			uFlowSpeed: { value: flowSpeed },
			uIsActive: { value: isActive },
			uIsHighlighted: { value: isHighlighted },
		}),
		[beamColor, intensity, flowSpeed, isActive, isHighlighted],
	);

	useFrame((state) => {
		if (meshRef.current) {
			const material = meshRef.current.material as THREE.ShaderMaterial;
			material.uniforms.uTime.value = state.clock.elapsedTime;
			material.uniforms.uIsActive.value = isActive;
			material.uniforms.uIsHighlighted.value = isHighlighted;
		}
	});

	return (
		<mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
			<primitive object={geometry} attach='geometry' />
			<shaderMaterial
				vertexShader={beamVertexShader}
				fragmentShader={beamFragmentShader}
				uniforms={uniforms}
				transparent
				depthWrite={false}
				blending={THREE.AdditiveBlending}
				side={THREE.DoubleSide}
			/>
		</mesh>
	);
};

export default ConnectionBeam;
