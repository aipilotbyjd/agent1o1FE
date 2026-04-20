import { FC, memo, useState } from 'react';
import { NodeProps, NodeResizer } from '@xyflow/react';
import Icon from '@/components/icon/Icon';
import classNames from 'classnames';

interface IGroupNodeData {
	label?: string;
	color?: 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'gray';
	collapsed?: boolean;
}

const colorClasses: Record<string, { bg: string; border: string; text: string }> = {
	blue: {
		bg: 'bg-blue-50/50 dark:bg-blue-900/10',
		border: 'border-blue-200 dark:border-blue-800',
		text: 'text-blue-600 dark:text-blue-400',
	},
	green: {
		bg: 'bg-emerald-50/50 dark:bg-emerald-900/10',
		border: 'border-emerald-200 dark:border-emerald-800',
		text: 'text-emerald-600 dark:text-emerald-400',
	},
	purple: {
		bg: 'bg-violet-50/50 dark:bg-violet-900/10',
		border: 'border-violet-200 dark:border-violet-800',
		text: 'text-violet-600 dark:text-violet-400',
	},
	orange: {
		bg: 'bg-amber-50/50 dark:bg-amber-900/10',
		border: 'border-amber-200 dark:border-amber-800',
		text: 'text-amber-600 dark:text-amber-400',
	},
	pink: {
		bg: 'bg-pink-50/50 dark:bg-pink-900/10',
		border: 'border-pink-200 dark:border-pink-800',
		text: 'text-pink-600 dark:text-pink-400',
	},
	gray: {
		bg: 'bg-zinc-50/50 dark:bg-zinc-800/50',
		border: 'border-zinc-200 dark:border-zinc-700',
		text: 'text-zinc-600 dark:text-zinc-400',
	},
};

const GroupNodePartial: FC<NodeProps> = ({ data, selected }) => {
	const groupData = data as unknown as IGroupNodeData;
	const color = groupData.color || 'gray';
	const colors = colorClasses[color];
	const [isEditing, setIsEditing] = useState(false);
	const [labelValue, setLabelValue] = useState(groupData.label || 'Group');

	return (
		<>
			<NodeResizer
				minWidth={200}
				minHeight={150}
				isVisible={selected}
				lineClassName='!border-blue-500'
				handleClassName='!w-3 !h-3 !bg-blue-500 !border-2 !border-white !rounded'
			/>
			<div
				className={classNames(
					'h-full w-full rounded-xl border-2 border-dashed',
					colors.bg,
					colors.border,
					selected && '!border-blue-500',
				)}>
				{/* Header */}
				<div
					className={classNames(
						'absolute -top-3 left-3 flex items-center gap-2 rounded-md px-2 py-0.5',
						colors.bg,
						'border',
						colors.border,
					)}>
					<Icon icon='Folder02' className={classNames('size-3.5', colors.text)} />
					{isEditing ? (
						<input
							type='text'
							value={labelValue}
							onChange={(e) => setLabelValue(e.target.value)}
							onBlur={() => setIsEditing(false)}
							onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
							autoFocus
							className={classNames(
								'w-24 bg-transparent text-xs font-medium outline-none',
								colors.text,
							)}
						/>
					) : (
						<span
							className={classNames(
								'cursor-pointer text-xs font-medium',
								colors.text,
							)}
							onDoubleClick={() => setIsEditing(true)}>
							{labelValue}
						</span>
					)}
				</div>
			</div>
		</>
	);
};

export default memo(GroupNodePartial);
