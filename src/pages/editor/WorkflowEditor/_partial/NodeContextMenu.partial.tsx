import { FC, useEffect, useRef } from 'react';
import Icon from '@/components/icon/Icon';
import classNames from 'classnames';

interface INodeContextMenuPartialProps {
	x: number;
	y: number;
	nodeId: string;
	onClose: () => void;
	onDuplicate: (nodeId: string) => void;
	onDelete: (nodeId: string) => void;
	onCopy: () => void;
	onCut: () => void;
	onDisable?: (nodeId: string) => void;
	isDisabled?: boolean;
}

interface IMenuItem {
	label: string;
	icon: string;
	onClick: () => void;
	shortcut?: string;
	danger?: boolean;
	divider?: boolean;
}

const NodeContextMenuPartial: FC<INodeContextMenuPartialProps> = ({
	x,
	y,
	nodeId,
	onClose,
	onDuplicate,
	onDelete,
	onCopy,
	onCut,
	onDisable,
	isDisabled,
}) => {
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				onClose();
			}
		};

		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose();
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		document.addEventListener('keydown', handleEscape);

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
			document.removeEventListener('keydown', handleEscape);
		};
	}, [onClose]);

	const menuItems: IMenuItem[] = [
		{
			label: 'Copy',
			icon: 'Copy01',
			onClick: () => {
				onCopy();
				onClose();
			},
			shortcut: 'Ctrl+C',
		},
		{
			label: 'Cut',
			icon: 'Scissor01',
			onClick: () => {
				onCut();
				onClose();
			},
			shortcut: 'Ctrl+X',
		},
		{
			label: 'Duplicate',
			icon: 'Copy02',
			onClick: () => {
				onDuplicate(nodeId);
				onClose();
			},
			shortcut: 'Ctrl+D',
		},
		{
			label: isDisabled ? 'Enable' : 'Disable',
			icon: isDisabled ? 'CheckmarkCircle02' : 'Cancel01',
			onClick: () => {
				onDisable?.(nodeId);
				onClose();
			},
			divider: true,
		},
		{
			label: 'Delete',
			icon: 'Delete02',
			onClick: () => {
				onDelete(nodeId);
				onClose();
			},
			shortcut: 'Del',
			danger: true,
		},
	];

	// Adjust position to keep menu in viewport
	const adjustedX = Math.min(x, window.innerWidth - 200);
	const adjustedY = Math.min(y, window.innerHeight - 300);

	return (
		<div
			ref={menuRef}
			className='fixed z-50 min-w-[180px] rounded-lg border border-zinc-200 bg-white py-1 shadow-xl dark:border-zinc-700 dark:bg-zinc-800'
			style={{ left: adjustedX, top: adjustedY }}>
			{menuItems.map((item, index) => (
				<div key={item.label}>
					{item.divider && index > 0 && (
						<div className='my-1 border-t border-zinc-200 dark:border-zinc-700' />
					)}
					<button
						type='button'
						onClick={item.onClick}
						className={classNames(
							'flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors',
							item.danger
								? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
								: 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700',
						)}>
						<Icon icon={item.icon as any} className='size-4' />
						<span className='flex-1'>{item.label}</span>
						{item.shortcut && (
							<span className='text-xs text-zinc-400'>{item.shortcut}</span>
						)}
					</button>
				</div>
			))}
		</div>
	);
};

export default NodeContextMenuPartial;
