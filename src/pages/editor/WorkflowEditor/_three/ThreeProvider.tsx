import { createContext, useContext, ReactNode, useMemo, useEffect } from 'react';
import { useThreeSettings, IThreeSettings } from './hooks/useThreeSettings';
import {
	useEditorState,
	UseEditorStateReturn,
	INodePosition,
	IEdgePosition,
} from './hooks/useEditorState';
import { useExecutionState, UseExecutionStateReturn } from './hooks/useExecutionState';
import { IQualitySettings } from './utils/performanceUtils';

interface IThreeContextValue {
	// Settings
	settings: IThreeSettings;
	qualitySettings: IQualitySettings;
	setQuality: (quality: IThreeSettings['quality']) => void;
	toggleEnabled: () => void;
	updateBackgroundEffects: (updates: Partial<IThreeSettings['backgroundEffects']>) => void;
	updateNodeEffects: (updates: Partial<IThreeSettings['nodeEffects']>) => void;
	updateExecutionEffects: (updates: Partial<IThreeSettings['executionEffects']>) => void;
	updateAdvanced: (updates: Partial<IThreeSettings['advanced']>) => void;
	resetToDefaults: () => void;

	// Editor state
	editorState: UseEditorStateReturn['state'];
	setNodePositions: (positions: INodePosition[]) => void;
	setEdgePositions: (positions: IEdgePosition[]) => void;
	setSelectedNodeIds: (ids: string[]) => void;
	setHoveredNodeId: (id: string | null) => void;
	setZoom: (zoom: number) => void;
	setPan: (pan: { x: number; y: number }) => void;
	setDarkMode: (isDark: boolean) => void;
	setEditorStatus: (status: UseEditorStateReturn['state']['status']) => void;

	// Execution state
	executionState: UseExecutionStateReturn;
}

const ThreeContext = createContext<IThreeContextValue | null>(null);

export const useThreeContext = (): IThreeContextValue => {
	const context = useContext(ThreeContext);
	if (!context) {
		throw new Error('useThreeContext must be used within ThreeProvider');
	}
	return context;
};

// Safe hook that returns null if not in provider
export const useThreeContextSafe = (): IThreeContextValue | null => {
	return useContext(ThreeContext);
};

interface IThreeProviderProps {
	children: ReactNode;
	isDarkMode?: boolean;
}

export const ThreeProvider = ({ children, isDarkMode = true }: IThreeProviderProps) => {
	const {
		settings,
		qualitySettings,
		setQuality,
		toggleEnabled,
		updateBackgroundEffects,
		updateNodeEffects,
		updateExecutionEffects,
		updateAdvanced,
		resetToDefaults,
	} = useThreeSettings();

	const {
		state: editorState,
		setNodePositions,
		setEdgePositions,
		setSelectedNodeIds,
		setHoveredNodeId,
		setZoom,
		setPan,
		setDarkMode,
		setStatus: setEditorStatus,
	} = useEditorState();

	const executionState = useExecutionState();

	// Sync dark mode from parent
	useEffect(() => {
		setDarkMode(isDarkMode);
	}, [isDarkMode, setDarkMode]);

	const value = useMemo<IThreeContextValue>(
		() => ({
			settings,
			qualitySettings,
			setQuality,
			toggleEnabled,
			updateBackgroundEffects,
			updateNodeEffects,
			updateExecutionEffects,
			updateAdvanced,
			resetToDefaults,
			editorState,
			setNodePositions,
			setEdgePositions,
			setSelectedNodeIds,
			setHoveredNodeId,
			setZoom,
			setPan,
			setDarkMode,
			setEditorStatus,
			executionState,
		}),
		[
			settings,
			qualitySettings,
			setQuality,
			toggleEnabled,
			updateBackgroundEffects,
			updateNodeEffects,
			updateExecutionEffects,
			updateAdvanced,
			resetToDefaults,
			editorState,
			setNodePositions,
			setEdgePositions,
			setSelectedNodeIds,
			setHoveredNodeId,
			setZoom,
			setPan,
			setDarkMode,
			setEditorStatus,
			executionState,
		],
	);

	return <ThreeContext.Provider value={value}>{children}</ThreeContext.Provider>;
};

export default ThreeProvider;
