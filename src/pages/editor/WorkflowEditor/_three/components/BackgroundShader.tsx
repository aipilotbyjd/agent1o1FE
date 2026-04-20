/* eslint-disable react/no-unknown-property */
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface IBackgroundShaderProps {
	isDarkMode: boolean;
	noiseScale?: number;
	noiseSpeed?: number;
}

const backgroundVertexShader = `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.999, 1.0);
}
`;

const backgroundFragmentShader = `
varying vec2 vUv;
uniform float uTime;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uNoiseScale;
uniform float uNoiseSpeed;

// Simplex noise
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
    float f = 0.0;
    float w = 0.5;
    for (int i = 0; i < 4; i++) {
        f += w * snoise(p);
        p *= 2.0;
        w *= 0.5;
    }
    return f;
}

void main() {
    vec2 uv = vUv;
    
    // Animated noise
    float noise1 = fbm(uv * uNoiseScale + uTime * uNoiseSpeed * 0.1);
    float noise2 = fbm(uv * uNoiseScale * 0.5 - uTime * uNoiseSpeed * 0.05);
    
    // Combine noises
    float noise = (noise1 + noise2) * 0.5 + 0.5;
    noise = noise * 0.15;
    
    // Create gradient with noise
    float gradient = uv.y + noise;
    
    // Mix colors based on gradient
    vec3 color;
    if (gradient < 0.5) {
        color = mix(uColor1, uColor2, gradient * 2.0);
    } else {
        color = mix(uColor2, uColor3, (gradient - 0.5) * 2.0);
    }
    
    // Subtle vignette
    float vignette = 1.0 - length(uv - 0.5) * 0.3;
    color *= vignette;
    
    gl_FragColor = vec4(color, 1.0);
}
`;

const BackgroundShader = ({
	isDarkMode,
	noiseScale = 2.0,
	noiseSpeed = 0.1,
}: IBackgroundShaderProps) => {
	const meshRef = useRef<THREE.Mesh>(null);

	const colors = useMemo(() => {
		if (isDarkMode) {
			return {
				color1: new THREE.Color(0x09090b), // zinc-950
				color2: new THREE.Color(0x18181b), // zinc-900
				color3: new THREE.Color(0x1a1a1e), // slightly lighter
			};
		}
		return {
			color1: new THREE.Color(0xf4f4f5), // zinc-100
			color2: new THREE.Color(0xfafafa), // zinc-50
			color3: new THREE.Color(0xffffff), // white
		};
	}, [isDarkMode]);

	const uniforms = useMemo(
		() => ({
			uTime: { value: 0 },
			uColor1: { value: colors.color1 },
			uColor2: { value: colors.color2 },
			uColor3: { value: colors.color3 },
			uNoiseScale: { value: noiseScale },
			uNoiseSpeed: { value: noiseSpeed },
		}),
		[colors, noiseScale, noiseSpeed],
	);

	useFrame((state) => {
		if (meshRef.current) {
			const material = meshRef.current.material as THREE.ShaderMaterial;
			material.uniforms.uTime.value = state.clock.elapsedTime;
		}
	});

	return (
		<mesh ref={meshRef} renderOrder={-1000}>
			<planeGeometry args={[2, 2]} />
			<shaderMaterial
				vertexShader={backgroundVertexShader}
				fragmentShader={backgroundFragmentShader}
				uniforms={uniforms}
				depthTest={false}
				depthWrite={false}
			/>
		</mesh>
	);
};

export default BackgroundShader;
