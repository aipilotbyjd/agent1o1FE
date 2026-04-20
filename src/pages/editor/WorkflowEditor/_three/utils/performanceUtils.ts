export type QualityPreset = 'low' | 'medium' | 'high' | 'ultra';

export interface IQualitySettings {
	particleCount: number;
	shadows: boolean;
	postProcessing: boolean;
	bloom: boolean;
	motionBlur: boolean;
	depthOfField: boolean;
	targetFPS: number;
	gridSubdivisions: number;
	glowQuality: 'low' | 'medium' | 'high';
	beamSegments: number;
}

export const qualityPresets: Record<QualityPreset, IQualitySettings> = {
	low: {
		particleCount: 50,
		shadows: false,
		postProcessing: false,
		bloom: false,
		motionBlur: false,
		depthOfField: false,
		targetFPS: 30,
		gridSubdivisions: 20,
		glowQuality: 'low',
		beamSegments: 8,
	},
	medium: {
		particleCount: 200,
		shadows: false,
		postProcessing: true,
		bloom: true,
		motionBlur: false,
		depthOfField: false,
		targetFPS: 60,
		gridSubdivisions: 40,
		glowQuality: 'medium',
		beamSegments: 16,
	},
	high: {
		particleCount: 500,
		shadows: true,
		postProcessing: true,
		bloom: true,
		motionBlur: true,
		depthOfField: false,
		targetFPS: 60,
		gridSubdivisions: 60,
		glowQuality: 'high',
		beamSegments: 32,
	},
	ultra: {
		particleCount: 1000,
		shadows: true,
		postProcessing: true,
		bloom: true,
		motionBlur: true,
		depthOfField: true,
		targetFPS: 120,
		gridSubdivisions: 100,
		glowQuality: 'high',
		beamSegments: 64,
	},
};

export const getQualitySettings = (preset: QualityPreset): IQualitySettings => {
	return qualityPresets[preset];
};

export class FPSMonitor {
	private frames: number[] = [];
	private lastTime: number = performance.now();
	private readonly maxSamples: number = 60;

	update(): number {
		const now = performance.now();
		const delta = now - this.lastTime;
		this.lastTime = now;

		const fps = 1000 / delta;
		this.frames.push(fps);

		if (this.frames.length > this.maxSamples) {
			this.frames.shift();
		}

		return this.getAverageFPS();
	}

	getAverageFPS(): number {
		if (this.frames.length === 0) return 60;
		return this.frames.reduce((a, b) => a + b, 0) / this.frames.length;
	}

	shouldReduceQuality(targetFPS: number): boolean {
		return this.getAverageFPS() < targetFPS * 0.8;
	}
}

export class ObjectPool<T> {
	private available: T[] = [];
	private inUse: Set<T> = new Set();
	private createFn: () => T;
	private resetFn: (obj: T) => void;

	constructor(createFn: () => T, resetFn: (obj: T) => void, initialSize: number = 100) {
		this.createFn = createFn;
		this.resetFn = resetFn;

		for (let i = 0; i < initialSize; i++) {
			this.available.push(createFn());
		}
	}

	acquire(): T {
		let obj: T;
		if (this.available.length > 0) {
			obj = this.available.pop()!;
		} else {
			obj = this.createFn();
		}
		this.inUse.add(obj);
		return obj;
	}

	release(obj: T): void {
		if (this.inUse.has(obj)) {
			this.inUse.delete(obj);
			this.resetFn(obj);
			this.available.push(obj);
		}
	}

	releaseAll(): void {
		this.inUse.forEach((obj) => {
			this.resetFn(obj);
			this.available.push(obj);
		});
		this.inUse.clear();
	}

	getActiveCount(): number {
		return this.inUse.size;
	}
}

export const isWebGLSupported = (): boolean => {
	try {
		const canvas = document.createElement('canvas');
		return !!(
			window.WebGLRenderingContext &&
			(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
		);
	} catch {
		return false;
	}
};

export const isWebGL2Supported = (): boolean => {
	try {
		const canvas = document.createElement('canvas');
		return !!canvas.getContext('webgl2');
	} catch {
		return false;
	}
};

export const getRecommendedQuality = (): QualityPreset => {
	if (!isWebGLSupported()) return 'low';

	const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
		navigator.userAgent,
	);

	if (isMobile) return 'low';

	const canvas = document.createElement('canvas');
	const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

	if (!gl) return 'low';

	const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
	if (debugInfo) {
		const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
		const isIntegrated =
			/Intel|HD Graphics|UHD Graphics|Iris/i.test(renderer) &&
			!/NVIDIA|AMD|Radeon/i.test(renderer);

		if (isIntegrated) return 'medium';
	}

	return 'high';
};
