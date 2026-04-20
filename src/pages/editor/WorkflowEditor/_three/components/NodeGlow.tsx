/* eslint-disable react/no-unknown-property */
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getNodeColor } from '../utils/colorPalettes';

interface INodeGlowProps {
	position: [number, number, number];
	nodeType: string;
	isSelected?: boolean;
	isRunning?: boolean;
	isHovered?: boolean;
	size?: number;
	intensity?: number;
}

const glowVertexShader = `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const glowFragmentShader = `
varying vec2 vUv;
uniform float uTime;
uniform vec3 uColor;
uniform float uIntensity;
uniform float uPulseSpeed;
uniform bool uIsSelected;
uniform bool uIsRunning;
uniform bool uIsHovered;

void main() {
    vec2 center = vec2(0.5);
    float dist = distance(vUv, center);
    
    // Base glow falloff
    float glow = 1.0 - smoothstep(0.0, 0.5, dist);
    glow = pow(glow, 2.5);
    
    // Pulse animation
    float pulse = 1.0;
    if (uIsRunning) {
        pulse = 0.6 + sin(uTime * 8.0) * 0.4;
    } else if (uIsSelected) {
        pulse = 0.8 + sin(uTime * 2.0) * 0.2;
    } else if (uIsHovered) {
        pulse = 0.9 + sin(uTime * 3.0) * 0.1;
    }
    
    // Ring effect for selected nodes
    float ring = 0.0;
    if (uIsSelected) {
        float ringDist = abs(dist - 0.35);
        ring = 1.0 - smoothstep(0.0, 0.04, ringDist);
        ring *= 0.6;
    }
    
    // Running animation ring (expanding circles)
    float runningRing = 0.0;
    if (uIsRunning) {
        for (int i = 0; i < 3; i++) {
            float offset = float(i) * 0.33;
            float animatedRadius = fract(uTime * 0.8 + offset) * 0.5;
            float ringDist = abs(dist - animatedRadius);
            float ringStrength = 1.0 - smoothstep(0.0, 0.025, ringDist);
            ringStrength *= (1.0 - animatedRadius * 2.0);
            runningRing += ringStrength * 0.4;
        }
    }
    
    // Hover glow boost
    float hoverBoost = uIsHovered ? 0.3 : 0.0;
    
    // Combine effects
    float alpha = (glow * uIntensity + ring + runningRing + hoverBoost) * pulse;
    alpha = clamp(alpha, 0.0, 1.0);
    
    vec3 finalColor = uColor;
    
    // Brighten for running state
    if (uIsRunning) {
        finalColor = mix(uColor, vec3(1.0), 0.3);
    }
    
    gl_FragColor = vec4(finalColor, alpha);
}
`;

const NodeGlow = ({
	position,
	nodeType,
	isSelected = false,
	isRunning = false,
	isHovered = false,
	size = 2,
	intensity = 0.5,
}: INodeGlowProps) => {
	const meshRef = useRef<THREE.Mesh>(null);
	const color = getNodeColor(nodeType);

	const uniforms = useMemo(
		() => ({
			uTime: { value: 0 },
			uColor: { value: color },
			uIntensity: { value: intensity },
			uPulseSpeed: { value: 2 },
			uIsSelected: { value: isSelected },
			uIsRunning: { value: isRunning },
			uIsHovered: { value: isHovered },
		}),
		[color, intensity, isSelected, isRunning, isHovered],
	);

	useFrame((state) => {
		if (meshRef.current) {
			const material = meshRef.current.material as THREE.ShaderMaterial;
			material.uniforms.uTime.value = state.clock.elapsedTime;
			material.uniforms.uIsSelected.value = isSelected;
			material.uniforms.uIsRunning.value = isRunning;
			material.uniforms.uIsHovered.value = isHovered;
		}
	});

	const scale = isSelected ? size * 1.2 : isHovered ? size * 1.1 : size;

	return (
		<mesh ref={meshRef} position={position}>
			<planeGeometry args={[scale, scale]} />
			<shaderMaterial
				vertexShader={glowVertexShader}
				fragmentShader={glowFragmentShader}
				uniforms={uniforms}
				transparent
				depthWrite={false}
				blending={THREE.AdditiveBlending}
			/>
		</mesh>
	);
};

export default NodeGlow;
