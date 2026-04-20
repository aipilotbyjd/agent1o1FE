import { useState, useEffect, useCallback, useMemo } from 'react';
import {
	QualityPreset,
	IQualitySettings,
	getQualitySettings,
	getRecommendedQuality,
} from '../utils/performanceUtils';

const STORAGE_KEY = 'linkflow_three_settings_v2';

export interface IThreeSettings {
	enabled: boolean;
	quality: QualityPreset;
	backgroundEffects: {
		animatedGrid: boolean;
		ambientParticles: boolean;
		backgroundGradient: boolean;
	};
	nodeEffects: {
		glowHalos: boolean;
		connectionBeams: boolean;
	};
	executionEffects: {
		dataFlowAnimation: boolean;
		statusParticles: boolean;
	};
	advanced: {
		motionBlur: boolean;
		depthOfField: boolean;
		bloom: boolean;
	};
}

const defaultSettings: IThreeSettings = {
	enabled: false, // Disabled by default for clean Make.com-style UI
	quality: 'medium',
	backgroundEffects: {
		animatedGrid: true,
		ambientParticles: true,
		backgroundGradient: true,
	},
	nodeEffects: {
		glowHalos: true,
		connectionBeams: true,
	},
	executionEffects: {
		dataFlowAnimation: true,
		statusParticles: true,
	},
	advanced: {
		motionBlur: false,
		depthOfField: false,
		bloom: true,
	},
};

export const useThreeSettings = () => {
	const [settings, setSettings] = useState<IThreeSettings>(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				const parsed = JSON.parse(stored);
				return { ...defaultSettings, ...parsed };
			}
		} catch {
			// Ignore parse errors
		}

		const recommendedQuality = getRecommendedQuality();
		return { ...defaultSettings, quality: recommendedQuality };
	});

	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
		} catch {
			// Ignore storage errors
		}
	}, [settings]);

	const qualitySettings = useMemo<IQualitySettings>(() => {
		const base = getQualitySettings(settings.quality);
		return {
			...base,
			bloom: settings.advanced.bloom && base.bloom,
			motionBlur: settings.advanced.motionBlur && base.motionBlur,
			depthOfField: settings.advanced.depthOfField && base.depthOfField,
		};
	}, [settings.quality, settings.advanced]);

	const updateSettings = useCallback((updates: Partial<IThreeSettings>) => {
		setSettings((prev) => ({ ...prev, ...updates }));
	}, []);

	const updateBackgroundEffects = useCallback(
		(updates: Partial<IThreeSettings['backgroundEffects']>) => {
			setSettings((prev) => ({
				...prev,
				backgroundEffects: { ...prev.backgroundEffects, ...updates },
			}));
		},
		[],
	);

	const updateNodeEffects = useCallback((updates: Partial<IThreeSettings['nodeEffects']>) => {
		setSettings((prev) => ({
			...prev,
			nodeEffects: { ...prev.nodeEffects, ...updates },
		}));
	}, []);

	const updateExecutionEffects = useCallback(
		(updates: Partial<IThreeSettings['executionEffects']>) => {
			setSettings((prev) => ({
				...prev,
				executionEffects: { ...prev.executionEffects, ...updates },
			}));
		},
		[],
	);

	const updateAdvanced = useCallback((updates: Partial<IThreeSettings['advanced']>) => {
		setSettings((prev) => ({
			...prev,
			advanced: { ...prev.advanced, ...updates },
		}));
	}, []);

	const setQuality = useCallback((quality: QualityPreset) => {
		setSettings((prev) => ({ ...prev, quality }));
	}, []);

	const toggleEnabled = useCallback(() => {
		setSettings((prev) => ({ ...prev, enabled: !prev.enabled }));
	}, []);

	const resetToDefaults = useCallback(() => {
		const recommendedQuality = getRecommendedQuality();
		setSettings({ ...defaultSettings, quality: recommendedQuality });
	}, []);

	return {
		settings,
		qualitySettings,
		updateSettings,
		updateBackgroundEffects,
		updateNodeEffects,
		updateExecutionEffects,
		updateAdvanced,
		setQuality,
		toggleEnabled,
		resetToDefaults,
	};
};

export type UseThreeSettingsReturn = ReturnType<typeof useThreeSettings>;
