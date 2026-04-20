import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ILightningArcProps {
	start: [number, number, number];
	end: [number, number, number];
	color?: THREE.Color;
	intensity?: number;
	segments?: number;
	active?: boolean;
}

const LightningArc = ({
	start,
	end,
	color = new THREE.Color(0x60a5fa),
	intensity = 1,
	segments = 12,
	active = true,
}: ILightningArcProps) => {
	const groupRef = useRef<THREE.Group>(null);
	const lineRef = useRef<THREE.Line | null>(null);
	const glowRef = useRef<THREE.Line | null>(null);
	const lastUpdateRef = useRef(0);

	const generateLightningPoints = useMemo(() => {
		return (displacement: number) => {
			const points: THREE.Vector3[] = [];
			const startVec = new THREE.Vector3(...start);
			const endVec = new THREE.Vector3(...end);
			const direction = endVec.clone().sub(startVec);
			const len = direction.length();

			for (let i = 0; i <= segments; i++) {
				const t = i / segments;
				const point = startVec.clone().lerp(endVec, t);

				if (i !== 0 && i !== segments) {
					const perpendicular = new THREE.Vector3(
						-direction.y,
						direction.x,
						0,
					).normalize();

					const offset = (Math.random() - 0.5) * displacement * len * 0.1;
					point.add(perpendicular.multiplyScalar(offset));
				}

				points.push(point);
			}

			return points;
		};
	}, [start, end, segments]);

	// Create line objects on mount
	useEffect(() => {
		if (!groupRef.current || !active) return;

		const initialPoints = generateLightningPoints(0.5);
		const geometry = new THREE.BufferGeometry();
		const positions = new Float32Array(initialPoints.length * 3);
		initialPoints.forEach((p, i) => {
			positions[i * 3] = p.x;
			positions[i * 3 + 1] = p.y;
			positions[i * 3 + 2] = p.z;
		});
		geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

		// Main line
		const lineMaterial = new THREE.LineBasicMaterial({
			color: 0xffffff,
			transparent: true,
			opacity: intensity,
			blending: THREE.AdditiveBlending,
		});
		const line = new THREE.Line(geometry, lineMaterial);
		lineRef.current = line;
		groupRef.current.add(line);

		// Glow line
		const glowGeometry = geometry.clone();
		const glowMaterial = new THREE.LineBasicMaterial({
			color,
			transparent: true,
			opacity: intensity * 0.4,
			blending: THREE.AdditiveBlending,
		});
		const glow = new THREE.Line(glowGeometry, glowMaterial);
		glowRef.current = glow;
		groupRef.current.add(glow);

		return () => {
			const group = groupRef.current;
			if (group) {
				if (lineRef.current) group.remove(lineRef.current);
				if (glowRef.current) group.remove(glowRef.current);
			}
			geometry.dispose();
			lineMaterial.dispose();
			glowGeometry.dispose();
			glowMaterial.dispose();
		};
	}, [active, color, intensity, generateLightningPoints]);

	useFrame((state) => {
		if (!active) return;

		// Update lightning path every 50ms for flickering effect
		if (state.clock.elapsedTime - lastUpdateRef.current > 0.05) {
			lastUpdateRef.current = state.clock.elapsedTime;

			const displacement = 0.5 + Math.random() * 0.5;
			const points = generateLightningPoints(displacement);

			if (lineRef.current) {
				const geometry = lineRef.current.geometry as THREE.BufferGeometry;
				const positions = new Float32Array(points.length * 3);
				points.forEach((p, i) => {
					positions[i * 3] = p.x;
					positions[i * 3 + 1] = p.y;
					positions[i * 3 + 2] = p.z;
				});
				geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
				geometry.attributes.position.needsUpdate = true;
			}

			if (glowRef.current) {
				const geometry = glowRef.current.geometry as THREE.BufferGeometry;
				const positions = new Float32Array(points.length * 3);
				points.forEach((p, i) => {
					positions[i * 3] = p.x;
					positions[i * 3 + 1] = p.y;
					positions[i * 3 + 2] = p.z;
				});
				geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
				geometry.attributes.position.needsUpdate = true;
			}
		}

		// Flicker intensity
		const flicker = 0.7 + Math.random() * 0.3;
		if (lineRef.current) {
			(lineRef.current.material as THREE.LineBasicMaterial).opacity = intensity * flicker;
		}
		if (glowRef.current) {
			(glowRef.current.material as THREE.LineBasicMaterial).opacity =
				intensity * flicker * 0.4;
		}
	});

	if (!active) return null;

	return <group ref={groupRef} />;
};

export default LightningArc;
