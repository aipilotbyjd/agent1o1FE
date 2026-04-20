/* eslint-disable react/no-unknown-property */
import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ITrailParticle {
	id: string;
	position: THREE.Vector3;
	velocity: THREE.Vector3;
	life: number;
	maxLife: number;
	size: number;
	color: THREE.Color;
}

interface IParticleTrailProps {
	targetPosition: [number, number, number] | null;
	isDragging: boolean;
	color?: THREE.Color;
	particleCount?: number;
	emitRate?: number;
}

const ParticleTrail = ({
	targetPosition,
	isDragging,
	color = new THREE.Color(0x10b981),
	particleCount = 50,
	emitRate = 3,
}: IParticleTrailProps) => {
	const pointsRef = useRef<THREE.Points>(null);
	const particlesRef = useRef<ITrailParticle[]>([]);
	const lastEmitRef = useRef(0);
	const lastPositionRef = useRef<THREE.Vector3>(new THREE.Vector3());

	const [positions] = useState(() => new Float32Array(particleCount * 3));
	const [sizes] = useState(() => new Float32Array(particleCount));
	const [opacities] = useState(() => new Float32Array(particleCount));

	useFrame((state) => {
		if (!pointsRef.current) return;

		const time = state.clock.elapsedTime;

		// Emit new particles when dragging
		if (isDragging && targetPosition && time - lastEmitRef.current > 1 / 60) {
			const currentPos = new THREE.Vector3(...targetPosition);
			const velocity = currentPos.clone().sub(lastPositionRef.current);

			if (velocity.length() > 0.01) {
				for (let i = 0; i < emitRate; i++) {
					if (particlesRef.current.length < particleCount) {
						const spread = 0.3;
						const particle: ITrailParticle = {
							id: `${time}-${i}`,
							position: new THREE.Vector3(
								currentPos.x + (Math.random() - 0.5) * spread,
								currentPos.y + (Math.random() - 0.5) * spread,
								currentPos.z + (Math.random() - 0.5) * 0.1,
							),
							velocity: new THREE.Vector3(
								(Math.random() - 0.5) * 0.02,
								(Math.random() - 0.5) * 0.02 - 0.01,
								(Math.random() - 0.5) * 0.01,
							),
							life: 1,
							maxLife: 0.8 + Math.random() * 0.4,
							size: 0.05 + Math.random() * 0.05,
							color: color.clone(),
						};
						particlesRef.current.push(particle);
					}
				}
			}

			lastPositionRef.current.copy(currentPos);
			lastEmitRef.current = time;
		}

		// Update particles
		const delta = 1 / 60;
		particlesRef.current = particlesRef.current.filter((p) => {
			p.life -= delta / p.maxLife;
			p.position.add(p.velocity);
			p.velocity.y -= 0.001; // gravity
			p.velocity.multiplyScalar(0.98); // drag
			return p.life > 0;
		});

		// Update geometry
		const geometry = pointsRef.current.geometry;

		for (let i = 0; i < particleCount; i++) {
			const particle = particlesRef.current[i];
			if (particle) {
				positions[i * 3] = particle.position.x;
				positions[i * 3 + 1] = particle.position.y;
				positions[i * 3 + 2] = particle.position.z;
				sizes[i] = particle.size * particle.life;
				opacities[i] = particle.life;
			} else {
				positions[i * 3] = 0;
				positions[i * 3 + 1] = 0;
				positions[i * 3 + 2] = -100;
				sizes[i] = 0;
				opacities[i] = 0;
			}
		}

		geometry.attributes.position.needsUpdate = true;
		geometry.attributes.size.needsUpdate = true;
		geometry.attributes.opacity.needsUpdate = true;
	});

	const shaderMaterial = useMemo(() => {
		return new THREE.ShaderMaterial({
			uniforms: {
				uColor: { value: color },
			},
			vertexShader: `
				attribute float size;
				attribute float opacity;
				varying float vOpacity;
				
				void main() {
					vOpacity = opacity;
					vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
					gl_PointSize = size * (300.0 / -mvPosition.z);
					gl_Position = projectionMatrix * mvPosition;
				}
			`,
			fragmentShader: `
				uniform vec3 uColor;
				varying float vOpacity;
				
				void main() {
					float dist = length(gl_PointCoord - vec2(0.5));
					if (dist > 0.5) discard;
					
					float alpha = smoothstep(0.5, 0.0, dist) * vOpacity;
					gl_FragColor = vec4(uColor, alpha);
				}
			`,
			transparent: true,
			blending: THREE.AdditiveBlending,
			depthWrite: false,
		});
	}, [color]);

	return (
		<points ref={pointsRef} material={shaderMaterial}>
			<bufferGeometry>
				<bufferAttribute attach='attributes-position' args={[positions, 3]} />
				<bufferAttribute attach='attributes-size' args={[sizes, 1]} />
				<bufferAttribute attach='attributes-opacity' args={[opacities, 1]} />
			</bufferGeometry>
		</points>
	);
};

export default ParticleTrail;
