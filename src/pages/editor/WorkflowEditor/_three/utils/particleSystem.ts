import * as THREE from 'three';

export interface IParticle {
	position: THREE.Vector3;
	velocity: THREE.Vector3;
	acceleration: THREE.Vector3;
	color: THREE.Color;
	size: number;
	life: number;
	maxLife: number;
	opacity: number;
	rotation: number;
	rotationSpeed: number;
}

export const createParticle = (options?: Partial<IParticle>): IParticle => ({
	position: options?.position?.clone() || new THREE.Vector3(),
	velocity: options?.velocity?.clone() || new THREE.Vector3(),
	acceleration: options?.acceleration?.clone() || new THREE.Vector3(),
	color: options?.color?.clone() || new THREE.Color(0xffffff),
	size: options?.size ?? 1,
	life: options?.life ?? 1,
	maxLife: options?.maxLife ?? 1,
	opacity: options?.opacity ?? 1,
	rotation: options?.rotation ?? 0,
	rotationSpeed: options?.rotationSpeed ?? 0,
});

export const updateParticle = (particle: IParticle, delta: number): void => {
	particle.velocity.add(particle.acceleration.clone().multiplyScalar(delta));
	particle.position.add(particle.velocity.clone().multiplyScalar(delta));
	particle.life -= delta;
	particle.opacity = Math.max(0, particle.life / particle.maxLife);
	particle.rotation += particle.rotationSpeed * delta;
};

export const isParticleAlive = (particle: IParticle): boolean => particle.life > 0;

export interface IEmitterConfig {
	position: THREE.Vector3;
	direction: THREE.Vector3;
	spread: number;
	rate: number;
	particleLife: number;
	particleLifeVariance: number;
	speed: number;
	speedVariance: number;
	size: number;
	sizeVariance: number;
	colors: THREE.Color[];
	gravity: THREE.Vector3;
}

export const defaultEmitterConfig: IEmitterConfig = {
	position: new THREE.Vector3(),
	direction: new THREE.Vector3(0, 1, 0),
	spread: Math.PI / 6,
	rate: 10,
	particleLife: 2,
	particleLifeVariance: 0.5,
	speed: 1,
	speedVariance: 0.2,
	size: 0.1,
	sizeVariance: 0.02,
	colors: [new THREE.Color(0x10b981)],
	gravity: new THREE.Vector3(0, -0.1, 0),
};

export class ParticleEmitter {
	config: IEmitterConfig;
	particles: IParticle[] = [];
	private accumulator: number = 0;

	constructor(config: Partial<IEmitterConfig> = {}) {
		this.config = { ...defaultEmitterConfig, ...config };
	}

	emit(count: number = 1): void {
		for (let i = 0; i < count; i++) {
			const phi = Math.random() * Math.PI * 2;
			const theta = Math.random() * this.config.spread;

			const direction = this.config.direction.clone();
			const perpendicular = new THREE.Vector3(1, 0, 0);
			if (Math.abs(direction.dot(perpendicular)) > 0.9) {
				perpendicular.set(0, 1, 0);
			}
			perpendicular.cross(direction).normalize();

			const rotationAxis = direction.clone();
			direction.applyAxisAngle(perpendicular, theta);
			direction.applyAxisAngle(rotationAxis, phi);

			const speed = this.config.speed + (Math.random() - 0.5) * 2 * this.config.speedVariance;
			const life =
				this.config.particleLife +
				(Math.random() - 0.5) * 2 * this.config.particleLifeVariance;
			const size = this.config.size + (Math.random() - 0.5) * 2 * this.config.sizeVariance;

			const color =
				this.config.colors[Math.floor(Math.random() * this.config.colors.length)].clone();

			this.particles.push(
				createParticle({
					position: this.config.position.clone(),
					velocity: direction.multiplyScalar(speed),
					acceleration: this.config.gravity.clone(),
					color,
					size,
					life,
					maxLife: life,
					rotation: Math.random() * Math.PI * 2,
					rotationSpeed: (Math.random() - 0.5) * 2,
				}),
			);
		}
	}

	update(delta: number): void {
		this.accumulator += delta;
		const interval = 1 / this.config.rate;

		while (this.accumulator >= interval) {
			this.emit(1);
			this.accumulator -= interval;
		}

		for (const particle of this.particles) {
			updateParticle(particle, delta);
		}

		this.particles = this.particles.filter(isParticleAlive);
	}

	setPosition(position: THREE.Vector3): void {
		this.config.position.copy(position);
	}

	clear(): void {
		this.particles = [];
	}
}

export const createBurstEffect = (
	position: THREE.Vector3,
	color: THREE.Color,
	count: number = 50,
): IParticle[] => {
	const particles: IParticle[] = [];

	for (let i = 0; i < count; i++) {
		const theta = Math.random() * Math.PI * 2;
		const phi = Math.acos(2 * Math.random() - 1);

		const direction = new THREE.Vector3(
			Math.sin(phi) * Math.cos(theta),
			Math.sin(phi) * Math.sin(theta),
			Math.cos(phi),
		);

		const speed = 2 + Math.random() * 3;
		const life = 0.5 + Math.random() * 1;

		particles.push(
			createParticle({
				position: position.clone(),
				velocity: direction.multiplyScalar(speed),
				acceleration: new THREE.Vector3(0, -2, 0),
				color: color.clone(),
				size: 0.05 + Math.random() * 0.1,
				life,
				maxLife: life,
			}),
		);
	}

	return particles;
};

export const createTrailEffect = (
	startPosition: THREE.Vector3,
	endPosition: THREE.Vector3,
	color: THREE.Color,
	segments: number = 20,
): IParticle[] => {
	const particles: IParticle[] = [];
	const direction = endPosition.clone().sub(startPosition);
	const length = direction.length();
	direction.normalize();

	for (let i = 0; i < segments; i++) {
		const t = i / segments;
		const position = startPosition.clone().add(direction.clone().multiplyScalar(length * t));

		const perpendicular = new THREE.Vector3(1, 0, 0);
		if (Math.abs(direction.dot(perpendicular)) > 0.9) {
			perpendicular.set(0, 1, 0);
		}
		perpendicular.cross(direction).normalize();

		const offset = perpendicular
			.clone()
			.multiplyScalar((Math.random() - 0.5) * 0.2)
			.add(new THREE.Vector3(0, (Math.random() - 0.5) * 0.2, 0));

		position.add(offset);

		const life = 1 + Math.random() * 0.5;

		particles.push(
			createParticle({
				position,
				velocity: direction.clone().multiplyScalar(0.5 + Math.random() * 0.5),
				color: color.clone(),
				size: 0.03 + Math.random() * 0.05,
				life,
				maxLife: life,
				opacity: 1 - t * 0.5,
			}),
		);
	}

	return particles;
};
