/* eslint-disable react/no-unknown-property */
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface IPulse {
	id: string;
	position: [number, number, number];
	startTime: number;
	color: THREE.Color;
	maxRadius: number;
	duration: number;
}

interface IEnergyPulseProps {
	pulses: IPulse[];
	onPulseComplete: (id: string) => void;
}

const PulseRing = ({ pulse, onComplete }: { pulse: IPulse; onComplete: () => void }) => {
	const ringRef = useRef<THREE.Mesh>(null);
	const innerRingRef = useRef<THREE.Mesh>(null);
	const [, setProgress] = useState(0);

	useFrame((state) => {
		const elapsed = state.clock.elapsedTime - pulse.startTime;
		const newProgress = Math.min(elapsed / pulse.duration, 1);
		setProgress(newProgress);

		if (newProgress >= 1) {
			onComplete();
			return;
		}

		if (ringRef.current) {
			const radius = pulse.maxRadius * easeOutCubic(newProgress);
			const opacity = 1 - easeInCubic(newProgress);

			ringRef.current.scale.setScalar(radius);
			(ringRef.current.material as THREE.MeshBasicMaterial).opacity = opacity * 0.6;
		}

		if (innerRingRef.current) {
			const radius = pulse.maxRadius * 0.7 * easeOutCubic(newProgress);
			const opacity = 1 - easeInCubic(newProgress);

			innerRingRef.current.scale.setScalar(radius);
			(innerRingRef.current.material as THREE.MeshBasicMaterial).opacity = opacity * 0.4;
		}
	});

	return (
		<group position={pulse.position}>
			{/* Outer ring */}
			<mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
				<ringGeometry args={[0.9, 1, 64]} />
				<meshBasicMaterial
					color={pulse.color}
					transparent
					opacity={0.6}
					side={THREE.DoubleSide}
					blending={THREE.AdditiveBlending}
				/>
			</mesh>

			{/* Inner ring */}
			<mesh ref={innerRingRef} rotation={[Math.PI / 2, 0, 0]}>
				<ringGeometry args={[0.95, 1, 64]} />
				<meshBasicMaterial
					color={new THREE.Color(0xffffff)}
					transparent
					opacity={0.4}
					side={THREE.DoubleSide}
					blending={THREE.AdditiveBlending}
				/>
			</mesh>
		</group>
	);
};

// Easing functions
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInCubic = (t: number) => t * t * t;

const EnergyPulse = ({ pulses, onPulseComplete }: IEnergyPulseProps) => {
	return (
		<>
			{pulses.map((pulse) => (
				<PulseRing
					key={pulse.id}
					pulse={pulse}
					onComplete={() => onPulseComplete(pulse.id)}
				/>
			))}
		</>
	);
};

// Hook to manage pulses
export const useEnergyPulses = () => {
	const [pulses, setPulses] = useState<IPulse[]>([]);
	const clockRef = useRef(0);

	const triggerPulse = (
		position: [number, number, number],
		color: THREE.Color = new THREE.Color(0x10b981),
		maxRadius: number = 2,
		duration: number = 1,
	) => {
		const id = `pulse-${Date.now()}-${Math.random()}`;
		setPulses((prev) => [
			...prev,
			{
				id,
				position,
				startTime: clockRef.current,
				color,
				maxRadius,
				duration,
			},
		]);
	};

	const removePulse = (id: string) => {
		setPulses((prev) => prev.filter((p) => p.id !== id));
	};

	const updateClock = (time: number) => {
		clockRef.current = time;
	};

	return { pulses, triggerPulse, removePulse, updateClock };
};

export default EnergyPulse;
