/* eslint-disable react/no-unknown-property */
import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { getPalette } from '../utils/colorPalettes';

interface IEnvironmentEffectsProps {
	isDarkMode: boolean;
	fogEnabled?: boolean;
	fogNear?: number;
	fogFar?: number;
	ambientIntensity?: number;
}

const EnvironmentEffects = ({
	isDarkMode,
	fogEnabled = true,
	fogNear = 50,
	fogFar = 200,
	ambientIntensity = 0.5,
}: IEnvironmentEffectsProps) => {
	const { scene } = useThree();
	const palette = getPalette(isDarkMode);

	// Set up fog
	useFrame(() => {
		if (fogEnabled) {
			const fogColor = isDarkMode ? 0x18181b : 0xfafafa;
			if (!scene.fog || (scene.fog as THREE.Fog).color.getHex() !== fogColor) {
				scene.fog = new THREE.Fog(fogColor, fogNear, fogFar);
			}
		} else if (scene.fog) {
			scene.fog = null;
		}
	});

	return (
		<>
			{/* Ambient light */}
			<ambientLight intensity={ambientIntensity} color={isDarkMode ? 0x404040 : 0xffffff} />

			{/* Directional light for subtle shadows */}
			<directionalLight
				position={[10, 20, 10]}
				intensity={isDarkMode ? 0.3 : 0.5}
				color={isDarkMode ? 0x6366f1 : 0xffffff}
			/>

			{/* Accent lights */}
			<pointLight
				position={[-20, 10, -20]}
				intensity={isDarkMode ? 0.2 : 0.1}
				color={palette.primary.getHex()}
				distance={50}
			/>
			<pointLight
				position={[20, 10, 20]}
				intensity={isDarkMode ? 0.2 : 0.1}
				color={palette.secondary.getHex()}
				distance={50}
			/>
		</>
	);
};

export default EnvironmentEffects;

// Vignette overlay component
export const VignetteOverlay = ({ isDarkMode }: { isDarkMode: boolean }) => {
	const meshRef = useRef<THREE.Mesh>(null);

	const vignetteShader = {
		uniforms: {
			uDarkness: { value: isDarkMode ? 0.4 : 0.2 },
			uOffset: { value: 0.9 },
		},
		vertexShader: `
			varying vec2 vUv;
			void main() {
				vUv = uv;
				gl_Position = vec4(position.xy, 0.9999, 1.0);
			}
		`,
		fragmentShader: `
			varying vec2 vUv;
			uniform float uDarkness;
			uniform float uOffset;
			
			void main() {
				vec2 uv = vUv;
				uv *= 1.0 - uv.yx;
				float vig = uv.x * uv.y * 15.0;
				vig = pow(vig, uDarkness);
				vig = clamp(vig, 0.0, 1.0);
				
				gl_FragColor = vec4(0.0, 0.0, 0.0, (1.0 - vig) * 0.3);
			}
		`,
	};

	return (
		<mesh ref={meshRef} renderOrder={999}>
			<planeGeometry args={[2, 2]} />
			<shaderMaterial
				uniforms={vignetteShader.uniforms}
				vertexShader={vignetteShader.vertexShader}
				fragmentShader={vignetteShader.fragmentShader}
				transparent
				depthTest={false}
				depthWrite={false}
			/>
		</mesh>
	);
};

// Scanline effect (optional retro look)
export const ScanlineOverlay = ({ intensity = 0.05 }: { intensity?: number }) => {
	const meshRef = useRef<THREE.Mesh>(null);

	useFrame((state) => {
		if (meshRef.current) {
			const material = meshRef.current.material as THREE.ShaderMaterial;
			material.uniforms.uTime.value = state.clock.elapsedTime;
		}
	});

	const scanlineShader = {
		uniforms: {
			uTime: { value: 0 },
			uIntensity: { value: intensity },
		},
		vertexShader: `
			varying vec2 vUv;
			void main() {
				vUv = uv;
				gl_Position = vec4(position.xy, 0.9998, 1.0);
			}
		`,
		fragmentShader: `
			varying vec2 vUv;
			uniform float uTime;
			uniform float uIntensity;
			
			void main() {
				float scanline = sin(vUv.y * 800.0 + uTime * 2.0) * 0.5 + 0.5;
				scanline = pow(scanline, 2.0);
				
				gl_FragColor = vec4(0.0, 0.0, 0.0, scanline * uIntensity);
			}
		`,
	};

	return (
		<mesh ref={meshRef} renderOrder={998}>
			<planeGeometry args={[2, 2]} />
			<shaderMaterial
				uniforms={scanlineShader.uniforms}
				vertexShader={scanlineShader.vertexShader}
				fragmentShader={scanlineShader.fragmentShader}
				transparent
				depthTest={false}
				depthWrite={false}
			/>
		</mesh>
	);
};
