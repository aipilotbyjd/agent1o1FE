import { FC, memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import Icon from '@/components/icon/Icon';
import classNames from 'classnames';

interface IAddNodeData {
	onClick?: () => void;
}

const AddNodeButtonPartial: FC<NodeProps> = ({ data, selected }) => {
	const nodeData = data as unknown as IAddNodeData;

	return (
		<div className='relative flex items-center justify-center'>
			{/* Input Handle - centered on button */}
			<Handle
				type='target'
				position={Position.Left}
				className='!-left-2 !size-3.5 !rounded-full !border-2 !border-white !bg-zinc-300 !shadow-sm !transition-all hover:!scale-150 hover:!bg-emerald-500'
				style={{ top: '50%', transform: 'translateY(-50%)' }}
			/>

			{/* Main Button - Fixed size container */}
			<div className='relative h-[82px] w-[82px]'>
				{/* Outer white ring */}
				<div
					className={classNames(
						'absolute inset-0 flex items-center justify-center rounded-full',
						'bg-white p-[6px]',
						'shadow-[0_2px_12px_rgba(0,0,0,0.15)]',
						selected && 'ring-2 ring-[#48bb78] ring-offset-2',
					)}>
					{/* Inner dashed circle */}
					<button
						type='button'
						onClick={nodeData.onClick}
						className={classNames(
							'flex items-center justify-center rounded-full',
							'size-[70px]',
							'border-[3px] border-dashed border-zinc-300',
							'bg-zinc-50 transition-colors duration-200',
							'hover:border-[#48bb78] hover:bg-green-50',
							'group',
						)}>
						<Icon
							icon='PlusSign'
							className='size-8 text-zinc-400 transition-colors duration-200 group-hover:text-[#48bb78]'
						/>
					</button>
				</div>

				{/* Label - Absolutely positioned below, doesn't affect bounds */}
				<div className='absolute top-full mt-3 w-full text-center'>
					<div className='text-sm text-zinc-500'>Click to add</div>
				</div>
			</div>

			{/* Output Handle - centered on button */}
			<Handle
				type='source'
				position={Position.Right}
				className='!-right-2 !size-3.5 !rounded-full !border-2 !border-white !bg-zinc-300 !shadow-sm !transition-all hover:!scale-150 hover:!bg-emerald-500'
				style={{ top: '50%', transform: 'translateY(-50%)' }}
			/>
		</div>
	);
};

export default memo(AddNodeButtonPartial);
