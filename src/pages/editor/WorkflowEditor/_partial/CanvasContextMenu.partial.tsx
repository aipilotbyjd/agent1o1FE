import { FC, useEffect, useRef, useState, useMemo } from 'react';
import Icon from '@/components/icon/Icon';
import Input from '@/components/form/Input';
import classNames from 'classnames';
import { INodeTypeDefinition } from '../_helper/nodeTypes.helper';
import useNodeTypesWithApi from '../_helper/useNodeTypes.hook';

interface ICanvasContextMenuPartialProps {
	x: number;
	y: number;
	onClose: () => void;
	onAddNode: (nodeType: INodeTypeDefinition, position: { x: number; y: number }) => void;
	recentNodes: string[];
	canvasPosition: { x: number; y: number };
}

const colorClasses: Record<string, string> = {
	emerald: 'bg-emerald-500',
	blue: 'bg-blue-500',
	amber: 'bg-amber-500',
	violet: 'bg-violet-500',
	pink: 'bg-pink-500',
	zinc: 'bg-zinc-500',
};

const CanvasContextMenuPartial: FC<ICanvasContextMenuPartialProps> = ({
	x,
	y,
	onClose,
	onAddNode,
	recentNodes,
	canvasPosition,
}) => {
	const menuRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const [search, setSearch] = useState('');
	const [selectedIndex, setSelectedIndex] = useState(0);

	// Fetch node types from API with fallback
	const { nodeTypes } = useNodeTypesWithApi();

	// Get recent node definitions
	const recentNodeDefs = useMemo(() => {
		return recentNodes
			.map((type) => nodeTypes.find((n) => n.type === type))
			.filter(Boolean) as INodeTypeDefinition[];
	}, [recentNodes, nodeTypes]);

	// Filter nodes based on search
	const filteredNodes = useMemo(() => {
		if (!search.trim()) {
			// Show recent nodes first, then popular ones
			const popular = nodeTypes.filter((n) =>
				['webhook', 'httpRequest', 'if', 'code', 'slack', 'openai'].includes(n.type),
			);
			return [
				...recentNodeDefs,
				...popular.filter((p) => !recentNodes.includes(p.type)),
			].slice(0, 8);
		}

		const lowerSearch = search.toLowerCase();
		return nodeTypes
			.filter(
				(n) =>
					n.label.toLowerCase().includes(lowerSearch) ||
					n.description.toLowerCase().includes(lowerSearch) ||
					n.type.toLowerCase().includes(lowerSearch),
			)
			.slice(0, 8);
	}, [search, recentNodeDefs, recentNodes, nodeTypes]);

	useEffect(() => {
		setTimeout(() => inputRef.current?.focus(), 50);
	}, []);

	useEffect(() => {
		setSelectedIndex(0);
	}, [search]);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				onClose();
			}
		};

		const handleKeyDown = (e: KeyboardEvent) => {
			switch (e.key) {
				case 'Escape':
					e.preventDefault();
					onClose();
					break;
				case 'ArrowDown':
					e.preventDefault();
					setSelectedIndex((prev) => Math.min(prev + 1, filteredNodes.length - 1));
					break;
				case 'ArrowUp':
					e.preventDefault();
					setSelectedIndex((prev) => Math.max(prev - 1, 0));
					break;
				case 'Enter':
					e.preventDefault();
					if (filteredNodes[selectedIndex]) {
						onAddNode(filteredNodes[selectedIndex], canvasPosition);
						onClose();
					}
					break;
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [onClose, filteredNodes, selectedIndex, onAddNode, canvasPosition]);

	// Adjust position to keep menu in viewport
	const adjustedX = Math.min(x, window.innerWidth - 320);
	const adjustedY = Math.min(y, window.innerHeight - 400);

	return (
		<div
			ref={menuRef}
			className='fixed z-50 w-72 rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-800'
			style={{ left: adjustedX, top: adjustedY }}>
			{/* Search Input */}
			<div className='p-2'>
				<div className='relative'>
					<Icon
						icon='Search01'
						className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400'
					/>
					<Input
						ref={inputRef}
						name='search'
						placeholder='Search nodes...'
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className='!pl-9 !text-sm'
						dimension='sm'
					/>
				</div>
			</div>

			{/* Recent/Popular Label */}
			{!search.trim() && recentNodeDefs.length > 0 && (
				<div className='px-3 py-1'>
					<span className='text-[10px] font-semibold tracking-wider text-zinc-400 uppercase'>
						Recently Used
					</span>
				</div>
			)}

			{/* Node List */}
			<div className='max-h-64 overflow-y-auto p-1'>
				{filteredNodes.length === 0 ? (
					<div className='flex flex-col items-center justify-center py-6 text-center'>
						<Icon icon='Search01' className='size-8 text-zinc-300 dark:text-zinc-600' />
						<p className='mt-2 text-xs text-zinc-500'>No nodes found</p>
					</div>
				) : (
					filteredNodes.map((node, index) => (
						<button
							key={node.type}
							type='button'
							onClick={() => {
								onAddNode(node, canvasPosition);
								onClose();
							}}
							className={classNames(
								'flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors',
								index === selectedIndex
									? 'bg-blue-50 dark:bg-blue-900/20'
									: 'hover:bg-zinc-50 dark:hover:bg-zinc-700/50',
							)}>
							<div
								className={classNames(
									'flex size-8 items-center justify-center rounded-lg',
									colorClasses[node.color],
								)}>
								<Icon icon={node.icon} className='size-4 text-white' />
							</div>
							<div className='min-w-0 flex-1'>
								<div className='truncate text-sm font-medium text-zinc-900 dark:text-zinc-100'>
									{node.label}
								</div>
								<div className='truncate text-xs text-zinc-500'>
									{node.description}
								</div>
							</div>
							{index === selectedIndex && (
								<kbd className='shrink-0 rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-500 dark:bg-zinc-700'>
									↵
								</kbd>
							)}
						</button>
					))
				)}
			</div>

			{/* Footer Hint */}
			<div className='border-t border-zinc-200 px-3 py-2 dark:border-zinc-700'>
				<div className='flex items-center justify-between text-[10px] text-zinc-400'>
					<span>Type to search all nodes</span>
					<span>↑↓ Navigate · Enter Select</span>
				</div>
			</div>
		</div>
	);
};

export default CanvasContextMenuPartial;
