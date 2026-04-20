import { FC, memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import Icon from '@/components/icon/Icon';
import classNames from 'classnames';
import useNodeTypesWithApi from '../../_helper/useNodeTypes.hook';
import { IEditorNodeData } from '../../_helper/serializer.helper';
import { useHighlight } from '../../context/HighlightContext';

// Enhanced gradient backgrounds with glow colors
const colorConfig: Record<string, { gradient: string; glow: string; ring: string }> = {
	emerald: {
		gradient: 'bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600',
		glow: 'shadow-emerald-500/50',
		ring: 'ring-emerald-400/50',
	},
	blue: {
		gradient: 'bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600',
		glow: 'shadow-blue-500/50',
		ring: 'ring-blue-400/50',
	},
	amber: {
		gradient: 'bg-gradient-to-br from-amber-400 via-orange-500 to-red-500',
		glow: 'shadow-orange-500/50',
		ring: 'ring-orange-400/50',
	},
	violet: {
		gradient: 'bg-gradient-to-br from-violet-400 via-purple-500 to-fuchsia-600',
		glow: 'shadow-purple-500/50',
		ring: 'ring-purple-400/50',
	},
	pink: {
		gradient: 'bg-gradient-to-br from-pink-400 via-rose-500 to-red-500',
		glow: 'shadow-pink-500/50',
		ring: 'ring-pink-400/50',
	},
	zinc: {
		gradient: 'bg-gradient-to-br from-zinc-400 via-slate-500 to-zinc-600',
		glow: 'shadow-zinc-500/50',
		ring: 'ring-zinc-400/50',
	},
};

export type TNodeExecutionStatus = 'idle' | 'running' | 'success' | 'error' | 'skipped';

interface ICircularNodeData extends IEditorNodeData {
	onAddNode?: (nodeId: string) => void;
	onContextMenu?: (nodeId: string, x: number, y: number) => void;
	nodeIndex?: number;
	subtitle?: string;
	executionStatus?: TNodeExecutionStatus;
	isDisabled?: boolean;
	itemCount?: number;
	executionTime?: number;
	isHighlighted?: boolean;
}

const CircularNodePartial: FC<NodeProps> = ({ id, data, selected }) => {
	const { getNodeTypeDefinition } = useNodeTypesWithApi();
	const nodeData = data as unknown as ICircularNodeData;
	const nodeDefinition = getNodeTypeDefinition(nodeData.type);
	const color = nodeDefinition?.color || 'violet';
	const colorStyle = colorConfig[color] || colorConfig.violet;
	const inputs = nodeDefinition?.inputs ?? 1;
	const outputs = nodeDefinition?.outputs ?? 1;
	const [isHovered, setIsHovered] = useState(false);

	const executionStatus = nodeData.executionStatus || 'idle';
	const isDisabled = nodeData.isDisabled || false;
	const itemCount = nodeData.itemCount;
	// const executionTime = nodeData.executionTime;
	// Use context for highlighting to avoid re-render loops
	const { highlightedNodeIds } = useHighlight();
	const isHighlighted = highlightedNodeIds.includes(id);

	const handleAddClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		nodeData.onAddNode?.(id);
	};

	const handleContextMenu = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		nodeData.onContextMenu?.(id, e.clientX, e.clientY);
	};

	const showAddButton = outputs > 0 && (isHovered || selected);

	const getStatusIndicator = () => {
		switch (executionStatus) {
			case 'running':
				return (
					<div className='absolute -top-1 -left-1 flex size-5 items-center justify-center'>
						<div className='size-3 animate-spin rounded-full border-2 border-blue-500 border-t-transparent' />
					</div>
				);
			case 'success':
				return (
					<div className='absolute -top-1 -left-1 flex size-5 items-center justify-center rounded-full bg-emerald-500 shadow-sm'>
						<Icon icon='CheckmarkSquare02' className='size-3 text-white' />
					</div>
				);
			case 'error':
				return (
					<div className='absolute -top-1 -left-1 flex size-5 items-center justify-center rounded-full bg-red-500 shadow-sm'>
						<Icon icon='Cancel01' className='size-3 text-white' />
					</div>
				);
			case 'skipped':
				return (
					<div className='absolute -top-1 -left-1 flex size-5 items-center justify-center rounded-full bg-zinc-400 shadow-sm'>
						<Icon icon='MinusSign' className='size-3 text-white' />
					</div>
				);
			default:
				return null;
		}
	};

	return (
		<div
			className={classNames('group relative', isDisabled && 'opacity-50')}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			onContextMenu={handleContextMenu}>
			{/* Main Node - Clean Make.com style */}
			<div className='relative flex items-center justify-center'>
				<div className='relative h-24 w-24'>
					{/* Input Handle - Perfectly centered vertically using transform */}
					{inputs > 0 && (
						<Handle
							type='target'
							position={Position.Left}
							className='!-left-2 !size-3.5 !rounded-full !border-2 !border-white !bg-zinc-300 !shadow-sm !transition-all hover:!scale-150 hover:!bg-emerald-500'
							style={{ top: '50%', transform: 'translateY(-50%)' }}
						/>
					)}
					{/* Main circle - flat white background like Make.com */}
					<div
						className={classNames(
							'absolute inset-0 flex items-center justify-center rounded-full',
							'bg-white shadow-lg transition-all duration-200',
							isHovered && 'shadow-xl',
							selected && 'ring-4 ring-blue-400',
							isHighlighted && 'ring-4 ring-blue-300',
							executionStatus === 'running' && 'animate-pulse ring-2 ring-blue-300',
							executionStatus === 'success' && 'ring-2 ring-emerald-300',
							executionStatus === 'error' && 'ring-2 ring-red-300',
						)}>
						{/* Colored icon background circle */}
						<div
							className={classNames(
								'relative flex size-16 items-center justify-center rounded-full',
								colorStyle.gradient,
							)}>
							<Icon
								icon={nodeDefinition?.icon || 'Circle'}
								className='size-10 text-white'
							/>
						</div>
					</div>

					{/* Execution status indicator - small icon on top-left */}
					{getStatusIndicator()}

					{/* Node number badge (top-right, Make.com style) */}
					{nodeData.nodeIndex !== undefined && nodeData.nodeIndex > 0 && (
						<div className='absolute -top-1.5 -right-1.5 flex size-7 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white shadow-md ring-2 ring-white'>
							{nodeData.nodeIndex}
						</div>
					)}

					{/* Settings icon on hover (bottom-right, like Make.com) */}
					{isHovered && !isDisabled && (
						<button
							type='button'
							onClick={(e) => {
								e.stopPropagation();
								// Opens config panel
							}}
							className='absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-zinc-200 transition-all hover:scale-110 hover:bg-zinc-50'>
							<Icon icon='Settings02' className='size-4 text-zinc-600' />
						</button>
					)}

					{/* Disabled overlay */}
					{isDisabled && (
						<div className='absolute inset-0 flex items-center justify-center'>
							<div className='absolute inset-0 rounded-full bg-zinc-100/80' />
							<Icon icon='Cancel01' className='size-8 text-zinc-400' />
						</div>
					)}

					{/* Output Handle - Perfectly centered vertically using transform */}
					{outputs > 0 && (
						<Handle
							type='source'
							position={Position.Right}
							className='!-right-2 !size-3.5 !rounded-full !border-2 !border-white !bg-zinc-300 !shadow-sm !transition-all hover:!scale-150 hover:!bg-emerald-500'
							style={{ top: '50%', transform: 'translateY(-50%)' }}
						/>
					)}
				</div>

				{/* Label - Clean typography like Make.com - positioned absolutely below circle */}
				<div className='absolute top-full mt-3 flex w-40 flex-col items-center text-center'>
					<div className='truncate text-sm font-semibold text-zinc-900'>
						{nodeData.label}
					</div>
					{nodeData.subtitle && (
						<div className='mt-0.5 truncate text-xs text-zinc-500'>
							{nodeData.subtitle}
						</div>
					)}
					{/* Execution data */}
					{itemCount !== undefined && executionStatus === 'success' && (
						<div className='mt-1 text-[11px] text-zinc-500'>
							{itemCount} {itemCount !== 1 ? 'rows' : 'row'}
						</div>
					)}
				</div>
			</div>

			{/* Add button on hover (Make.com style) - centered on circle */}
			{showAddButton && (
				<div className='animate-in fade-in slide-in-from-left-2 absolute top-12 left-full ml-4 flex -translate-y-1/2 items-center duration-200'>
					{/* Dotted line with gradient */}
					<svg width='40' height='4' className='mr-2'>
						<defs>
							<linearGradient id='lineGradient' x1='0%' y1='0%' x2='100%' y2='0%'>
								<stop offset='0%' stopColor='#68d391' />
								<stop offset='100%' stopColor='#48bb78' />
							</linearGradient>
						</defs>
						<line
							x1='0'
							y1='2'
							x2='40'
							y2='2'
							stroke='url(#lineGradient)'
							strokeWidth='3'
							strokeDasharray='8 6'
							strokeLinecap='round'
						/>
					</svg>
					{/* Plus button with glow */}
					<button
						type='button'
						onClick={handleAddClick}
						className='group relative flex size-9 items-center justify-center rounded-full border-2 border-dashed border-zinc-300 bg-white text-zinc-400 shadow-md transition-all duration-200 hover:scale-110 hover:border-emerald-500 hover:text-emerald-500 hover:shadow-lg hover:shadow-emerald-500/25'>
						{/* Glow effect on hover */}
						<div className='absolute inset-0 rounded-full bg-emerald-500/20 opacity-0 blur-md transition-opacity group-hover:opacity-100' />
						<Icon icon='PlusSign' className='relative size-4' />
					</button>
				</div>
			)}
		</div>
	);
};

export default memo(CircularNodePartial);
