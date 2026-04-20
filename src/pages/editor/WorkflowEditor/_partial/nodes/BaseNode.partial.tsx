import { FC, memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import Icon from '@/components/icon/Icon';
import classNames from 'classnames';
import useNodeTypesWithApi from '../../_helper/useNodeTypes.hook';
import { IEditorNodeData } from '../../_helper/serializer.helper';
import { validateNode, getNodeValidationStatus } from '../../utils/node-validator.util';

const colorClasses: Record<
	string,
	{ bg: string; border: string; icon: string; borderSelected: string }
> = {
	emerald: {
		bg: 'bg-emerald-50 dark:bg-emerald-950/40',
		border: 'border-emerald-200 dark:border-emerald-800',
		borderSelected: 'border-emerald-500 dark:border-emerald-500',
		icon: 'bg-emerald-500 text-white',
	},
	blue: {
		bg: 'bg-blue-50 dark:bg-blue-950/40',
		border: 'border-blue-200 dark:border-blue-800',
		borderSelected: 'border-blue-500 dark:border-blue-500',
		icon: 'bg-blue-500 text-white',
	},
	amber: {
		bg: 'bg-amber-50 dark:bg-amber-950/40',
		border: 'border-amber-200 dark:border-amber-800',
		borderSelected: 'border-amber-500 dark:border-amber-500',
		icon: 'bg-amber-500 text-white',
	},
	violet: {
		bg: 'bg-violet-50 dark:bg-violet-950/40',
		border: 'border-violet-200 dark:border-violet-800',
		borderSelected: 'border-violet-500 dark:border-violet-500',
		icon: 'bg-violet-500 text-white',
	},
	pink: {
		bg: 'bg-pink-50 dark:bg-pink-950/40',
		border: 'border-pink-200 dark:border-pink-800',
		borderSelected: 'border-pink-500 dark:border-pink-500',
		icon: 'bg-pink-500 text-white',
	},
	zinc: {
		bg: 'bg-zinc-50 dark:bg-zinc-800/40',
		border: 'border-zinc-200 dark:border-zinc-700',
		borderSelected: 'border-zinc-500 dark:border-zinc-500',
		icon: 'bg-zinc-500 text-white',
	},
};

const handleStyles = {
	width: '12px',
	height: '12px',
	border: '2px solid white',
	boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
};

const BaseNodePartial: FC<NodeProps> = ({ data, selected }) => {
	const { getNodeTypeDefinition } = useNodeTypesWithApi();
	const nodeData = data as unknown as IEditorNodeData;
	const nodeDefinition = getNodeTypeDefinition(nodeData.type);
	const color = nodeDefinition?.color || 'blue';
	const colors = colorClasses[color] || colorClasses.blue;
	const inputs = nodeDefinition?.inputs ?? 1;
	const outputs = nodeDefinition?.outputs ?? 1;

	// Get validation status
	const validationStatus = nodeDefinition
		? getNodeValidationStatus(nodeData, nodeDefinition)
		: 'valid';

	return (
		<div
			className={classNames(
				'relative min-w-[200px] rounded-xl border-2 shadow-lg transition-all duration-200',
				colors.bg,
				selected ? colors.borderSelected : colors.border,
				selected && 'shadow-xl',
				nodeData.isExecuting && 'animate-pulse',
				nodeData.hasError && 'border-red-500 dark:border-red-500',
				validationStatus === 'invalid' && 'border-red-500 dark:border-red-500',
				validationStatus === 'warning' && 'border-amber-500 dark:border-amber-500',
			)}>
			{inputs > 0 && (
				<Handle
					type='target'
					position={Position.Left}
					className={classNames('!bg-zinc-400 dark:!bg-zinc-500')}
					style={{ ...handleStyles, left: '-7px' }}
				/>
			)}

			<div className='flex items-center gap-3 p-3'>
				<div
					className={classNames(
						'flex size-10 shrink-0 items-center justify-center rounded-lg',
						colors.icon,
					)}>
					<Icon icon={nodeDefinition?.icon || 'Circle'} className='size-5' />
				</div>
				<div className='min-w-0 flex-1'>
					<div className='truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100'>
						{nodeData.label}
					</div>
					<div className='truncate text-xs text-zinc-500 dark:text-zinc-400'>
						{nodeDefinition?.label || nodeData.type}
					</div>
				</div>
				{validationStatus === 'invalid' && (
					<div className='flex size-6 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30'>
						<Icon icon='AlertCircle' className='size-4 text-red-500' />
					</div>
				)}
				{validationStatus === 'warning' && (
					<div className='flex size-6 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30'>
						<Icon icon='AlertTriangle' className='size-4 text-amber-500' />
					</div>
				)}
				{nodeData.hasError && !['invalid', 'warning'].includes(validationStatus) && (
					<div className='flex size-6 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30'>
						<Icon icon='AlertCircle' className='size-4 text-red-500' />
					</div>
				)}
				{nodeData.isExecuting && (
					<div className='flex size-6 items-center justify-center'>
						<div className='size-4 animate-spin rounded-full border-2 border-zinc-300 border-t-blue-500' />
					</div>
				)}
			</div>

			{outputs > 0 && (
				<>
					{outputs === 1 && (
						<Handle
							type='source'
							position={Position.Right}
							className={classNames('!bg-zinc-400 dark:!bg-zinc-500')}
							style={{ ...handleStyles, right: '-7px' }}
						/>
					)}
					{outputs === 2 && (
						<>
							<Handle
								type='source'
								position={Position.Right}
								id='true'
								className='!bg-emerald-500'
								style={{ ...handleStyles, right: '-7px', top: '35%' }}
							/>
							<Handle
								type='source'
								position={Position.Right}
								id='false'
								className='!bg-red-500'
								style={{ ...handleStyles, right: '-7px', top: '65%' }}
							/>
						</>
					)}
					{outputs > 2 && (
						<>
							{Array.from({ length: outputs }).map((_, i) => (
								<Handle
									key={i}
									type='source'
									position={Position.Right}
									id={`output-${i}`}
									className='!bg-zinc-400 dark:!bg-zinc-500'
									style={{
										...handleStyles,
										right: '-7px',
										top: `${((i + 1) / (outputs + 1)) * 100}%`,
									}}
								/>
							))}
						</>
					)}
				</>
			)}
		</div>
	);
};

export default memo(BaseNodePartial);
