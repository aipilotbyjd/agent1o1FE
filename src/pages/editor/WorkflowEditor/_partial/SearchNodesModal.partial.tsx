import { FC, useState, useMemo, useEffect, useRef } from 'react';
import { Node } from '@xyflow/react';
import Icon from '@/components/icon/Icon';
import Input from '@/components/form/Input';
import FieldWrap from '@/components/form/FieldWrap';
import classNames from 'classnames';
import useNodeTypesWithApi from '../_helper/useNodeTypes.hook';
import { IEditorNodeData } from '../_helper/serializer.helper';

interface ISearchNodesModalPartialProps {
	isOpen: boolean;
	onClose: () => void;
	nodes: Node[];
	onNodeSelect: (nodeId: string) => void;
}

const colorClasses: Record<string, string> = {
	emerald: 'bg-emerald-500',
	blue: 'bg-blue-500',
	amber: 'bg-amber-500',
	violet: 'bg-violet-500',
	pink: 'bg-pink-500',
	zinc: 'bg-zinc-500',
};

const SearchNodesModalPartial: FC<ISearchNodesModalPartialProps> = ({
	isOpen,
	onClose,
	nodes,
	onNodeSelect,
}) => {
	const { getNodeTypeDefinition } = useNodeTypesWithApi();
	const [search, setSearch] = useState('');
	const [selectedIndex, setSelectedIndex] = useState(0);
	const inputRef = useRef<HTMLInputElement>(null);
	const listRef = useRef<HTMLDivElement>(null);

	const filteredNodes = useMemo(() => {
		const searchableNodes = nodes.filter((n) => n.type !== 'addNode');
		if (!search.trim()) return searchableNodes;

		const lowerSearch = search.toLowerCase();
		return searchableNodes.filter((node) => {
			const data = node.data as IEditorNodeData;
			return (
				data.label?.toLowerCase().includes(lowerSearch) ||
				data.type?.toLowerCase().includes(lowerSearch)
			);
		});
	}, [nodes, search]);

	useEffect(() => {
		if (isOpen) {
			setSearch('');
			setSelectedIndex(0);
			setTimeout(() => inputRef.current?.focus(), 50);
		}
	}, [isOpen]);

	useEffect(() => {
		setSelectedIndex(0);
	}, [search]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!isOpen) return;

			switch (e.key) {
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
						onNodeSelect(filteredNodes[selectedIndex].id);
						onClose();
					}
					break;
				case 'Escape':
					e.preventDefault();
					onClose();
					break;
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [isOpen, filteredNodes, selectedIndex, onNodeSelect, onClose]);

	// Scroll selected item into view
	useEffect(() => {
		if (listRef.current) {
			const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
			if (selectedElement) {
				selectedElement.scrollIntoView({ block: 'nearest' });
			}
		}
	}, [selectedIndex]);

	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 z-50 flex items-start justify-center pt-24'>
			{/* Backdrop */}
			<div className='absolute inset-0 bg-black/50' onClick={onClose} />

			{/* Modal */}
			<div className='relative w-full max-w-lg rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-800'>
				{/* Search Input */}
				<div className='border-b border-zinc-200 p-4 dark:border-zinc-700'>
					<FieldWrap
						firstSuffix={<Icon icon='Search01' className='size-5 text-zinc-400' />}
						lastSuffix={
							<kbd className='rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-500 dark:bg-zinc-700'>
								ESC
							</kbd>
						}>
						<Input
							ref={inputRef}
							name='search'
							placeholder='Search nodes...'
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className='!pl-10'
						/>
					</FieldWrap>
				</div>

				{/* Results */}
				<div ref={listRef} className='max-h-80 overflow-y-auto p-2'>
					{filteredNodes.length === 0 ? (
						<div className='flex flex-col items-center justify-center py-8 text-center'>
							<Icon
								icon='Search01'
								className='size-10 text-zinc-300 dark:text-zinc-600'
							/>
							<p className='mt-2 text-sm text-zinc-500'>No nodes found</p>
						</div>
					) : (
						filteredNodes.map((node, index) => {
							const data = node.data as IEditorNodeData;
							const definition = getNodeTypeDefinition(data.type);
							const color = definition?.color || 'zinc';

							return (
								<button
									key={node.id}
									type='button'
									onClick={() => {
										onNodeSelect(node.id);
										onClose();
									}}
									className={classNames(
										'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors',
										index === selectedIndex
											? 'bg-blue-50 dark:bg-blue-900/20'
											: 'hover:bg-zinc-50 dark:hover:bg-zinc-700/50',
									)}>
									<div
										className={classNames(
											'flex size-8 items-center justify-center rounded-full',
											colorClasses[color],
										)}>
										<Icon
											icon={definition?.icon || 'Circle'}
											className='size-4 text-white'
										/>
									</div>
									<div className='min-w-0 flex-1'>
										<div className='truncate text-sm font-medium text-zinc-900 dark:text-zinc-100'>
											{data.label}
										</div>
										<div className='text-xs text-zinc-500'>
											{definition?.label || data.type}
										</div>
									</div>
									{index === selectedIndex && (
										<kbd className='rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-500 dark:bg-zinc-700'>
											Enter
										</kbd>
									)}
								</button>
							);
						})
					)}
				</div>

				{/* Footer */}
				<div className='flex items-center justify-between border-t border-zinc-200 px-4 py-2 text-xs text-zinc-500 dark:border-zinc-700'>
					<div className='flex items-center gap-3'>
						<span className='flex items-center gap-1'>
							<Icon icon='ArrowUp01' className='size-3' />
							<Icon icon='ArrowDown01' className='size-3' />
							Navigate
						</span>
						<span className='flex items-center gap-1'>
							<kbd className='rounded bg-zinc-100 px-1 text-[10px] dark:bg-zinc-700'>
								Enter
							</kbd>
							Select
						</span>
					</div>
					<span>{filteredNodes.length} nodes</span>
				</div>
			</div>
		</div>
	);
};

export default SearchNodesModalPartial;
