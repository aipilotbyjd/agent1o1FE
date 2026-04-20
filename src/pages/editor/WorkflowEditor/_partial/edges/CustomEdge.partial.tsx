import { FC, memo, useState } from 'react';
import { BaseEdge, EdgeProps, EdgeLabelRenderer, getSmoothStepPath } from '@xyflow/react';
import { useHighlight } from '../../context/HighlightContext';

interface ICustomEdgeData {
	label?: string;
	animated?: boolean;
	status?: 'idle' | 'running' | 'success' | 'error';
	onInsertNode?: (edgeId: string, position: { x: number; y: number }) => void;
}

const CustomEdgePartial: FC<EdgeProps> = ({
	id,
	sourceX,
	sourceY,
	targetX,
	targetY,
	sourcePosition,
	targetPosition,
	selected,
	data,
}) => {
	const [isHovered, setIsHovered] = useState(false);
	const { highlightedEdgeIds } = useHighlight();
	const isHighlighted = highlightedEdgeIds.includes(id);

	const edgeData = data as ICustomEdgeData | undefined;
	const label = edgeData?.label;
	const isAnimated = edgeData?.animated || false;
	const status = edgeData?.status || 'idle';
	const [edgePath, labelX, labelY] = getSmoothStepPath({
		sourceX,
		sourceY,
		targetX,
		targetY,
		sourcePosition,
		targetPosition,
		borderRadius: 16,
	});

	const getEdgeColor = () => {
		switch (status) {
			case 'running':
				return '#3b82f6'; // blue
			case 'success':
				return '#22c55e'; // green
			case 'error':
				return '#ef4444'; // red
			default:
				return selected || isHovered || isHighlighted ? '#10b981' : '#68d391';
		}
	};

	const getGlowFilter = () => {
		if (status === 'running') return 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.5))';
		if (status === 'success') return 'drop-shadow(0 0 6px rgba(34, 197, 94, 0.5))';
		if (status === 'error') return 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.5))';
		if (selected || isHovered || isHighlighted)
			return 'drop-shadow(0 0 4px rgba(16, 185, 129, 0.4))';
		return 'none';
	};

	const getLabelStyle = () => {
		const baseStyle = {
			transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
			pointerEvents: 'all' as const,
		};

		if (label === 'true' || label === 'yes') {
			return {
				...baseStyle,
				backgroundColor: '#dcfce7',
				color: '#166534',
				border: '1px solid #86efac',
			};
		}
		if (label === 'false' || label === 'no') {
			return {
				...baseStyle,
				backgroundColor: '#fef2f2',
				color: '#991b1b',
				border: '1px solid #fca5a5',
			};
		}
		return {
			...baseStyle,
			backgroundColor: '#f4f4f5',
			color: '#3f3f46',
			border: '1px solid #d4d4d8',
		};
	};

	// Insert node functionality removed - using hover button on nodes instead
	// const handleInsertClick = (e: React.MouseEvent) => {
	// 	e.stopPropagation();
	// 	if (onInsertNode) {
	// 		onInsertNode(id, { x: labelX, y: labelY });
	// 	}
	// };

	return (
		<>
			{/* Invisible wider path for easier hover detection */}
			<path
				d={edgePath}
				fill='none'
				strokeWidth={20}
				stroke='transparent'
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
				style={{ cursor: 'pointer' }}
			/>
			<BaseEdge
				id={id}
				path={edgePath}
				style={{
					strokeWidth: selected || isHovered ? 4 : 3,
					stroke: getEdgeColor(),
					strokeDasharray: isAnimated ? undefined : '8 6',
					strokeLinecap: 'round',
					transition: 'all 0.3s ease',
					animation: isAnimated ? 'dashdraw 0.5s linear infinite' : undefined,
					pointerEvents: 'none',
					filter: getGlowFilter(),
				}}
			/>
			{/* Label (always shown when present - Make.com style) */}
			{label && (
				<EdgeLabelRenderer>
					<div
						style={getLabelStyle()}
						className='nodrag nopan absolute rounded-full px-2 py-0.5 text-xs font-medium shadow-sm'>
						{label}
					</div>
				</EdgeLabelRenderer>
			)}
			<style>{`
				@keyframes dashdraw {
					from {
						stroke-dashoffset: 20;
					}
					to {
						stroke-dashoffset: 0;
					}
				}
			`}</style>
		</>
	);
};

export default memo(CustomEdgePartial);
