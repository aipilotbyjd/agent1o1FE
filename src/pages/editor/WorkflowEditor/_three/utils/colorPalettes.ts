import * as THREE from 'three';

export interface IColorPalette {
	primary: THREE.Color;
	secondary: THREE.Color;
	accent: THREE.Color;
	background: THREE.Color;
	grid: THREE.Color;
	particles: THREE.Color[];
	success: THREE.Color;
	error: THREE.Color;
	warning: THREE.Color;
	running: THREE.Color;
}

export const darkPalette: IColorPalette = {
	primary: new THREE.Color(0x10b981), // Emerald
	secondary: new THREE.Color(0x6366f1), // Indigo
	accent: new THREE.Color(0x8b5cf6), // Purple
	background: new THREE.Color(0x18181b), // Zinc-900
	grid: new THREE.Color(0x3f3f46), // Zinc-700
	particles: [
		new THREE.Color(0x10b981), // Emerald
		new THREE.Color(0x06b6d4), // Cyan
		new THREE.Color(0x6366f1), // Indigo
		new THREE.Color(0x8b5cf6), // Purple
	],
	success: new THREE.Color(0x22c55e), // Green
	error: new THREE.Color(0xef4444), // Red
	warning: new THREE.Color(0xf59e0b), // Amber
	running: new THREE.Color(0x3b82f6), // Blue
};

export const lightPalette: IColorPalette = {
	primary: new THREE.Color(0x059669), // Emerald-600
	secondary: new THREE.Color(0x4f46e5), // Indigo-600
	accent: new THREE.Color(0x7c3aed), // Purple-600
	background: new THREE.Color(0xfafafa), // Zinc-50
	grid: new THREE.Color(0xd4d4d8), // Zinc-300
	particles: [
		new THREE.Color(0x059669),
		new THREE.Color(0x0891b2),
		new THREE.Color(0x4f46e5),
		new THREE.Color(0x7c3aed),
	],
	success: new THREE.Color(0x16a34a),
	error: new THREE.Color(0xdc2626),
	warning: new THREE.Color(0xd97706),
	running: new THREE.Color(0x2563eb),
};

export const getPalette = (isDark: boolean): IColorPalette => {
	return isDark ? darkPalette : lightPalette;
};

export const nodeTypeColors: Record<string, THREE.Color> = {
	trigger: new THREE.Color(0x3b82f6), // Blue
	webhook: new THREE.Color(0x8b5cf6), // Purple
	schedule: new THREE.Color(0xf59e0b), // Amber
	http: new THREE.Color(0x06b6d4), // Cyan
	code: new THREE.Color(0xec4899), // Pink
	if: new THREE.Color(0xf97316), // Orange
	switch: new THREE.Color(0xf97316), // Orange
	loop: new THREE.Color(0x84cc16), // Lime
	merge: new THREE.Color(0x14b8a6), // Teal
	split: new THREE.Color(0x14b8a6), // Teal
	wait: new THREE.Color(0x6b7280), // Gray
	set: new THREE.Color(0x10b981), // Emerald
	filter: new THREE.Color(0xeab308), // Yellow
	sort: new THREE.Color(0xa855f7), // Purple
	aggregate: new THREE.Color(0x0ea5e9), // Sky
	email: new THREE.Color(0xef4444), // Red
	slack: new THREE.Color(0x7c3aed), // Violet
	database: new THREE.Color(0x22c55e), // Green
	ai: new THREE.Color(0x6366f1), // Indigo
	default: new THREE.Color(0x71717a), // Zinc
};

export const getNodeColor = (nodeType: string): THREE.Color => {
	return nodeTypeColors[nodeType] || nodeTypeColors.default;
};

export const lerpColor = (color1: THREE.Color, color2: THREE.Color, t: number): THREE.Color => {
	return new THREE.Color().lerpColors(color1, color2, t);
};

export const pulseColor = (
	baseColor: THREE.Color,
	intensity: number,
	time: number,
): THREE.Color => {
	const pulse = (Math.sin(time * 2) + 1) / 2;
	const brightColor = baseColor.clone().multiplyScalar(1 + intensity);
	return lerpColor(baseColor, brightColor, pulse);
};
