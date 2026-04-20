import { FC, useState, useMemo } from 'react';
import Icon from '@/components/icon/Icon';
import Input from '@/components/form/Input';
import FieldWrap from '@/components/form/FieldWrap';
import Collapse from '@/components/ui/Collapse';
import classNames from 'classnames';
import { INodeTypeDefinition, TNodeCategory } from '../_helper/nodeTypes.helper';
import useNodeTypesWithApi from '../_helper/useNodeTypes.hook';

interface INodePalettePartialProps {
	isOpen: boolean;
	onToggle: () => void;
	onDragStart: (event: React.DragEvent, nodeType: INodeTypeDefinition) => void;
	onNodeAdd: (nodeType: INodeTypeDefinition) => void;
}

const colorClasses: Record<string, string> = {
	emerald: 'bg-emerald-500',
	blue: 'bg-blue-500',
	amber: 'bg-amber-500',
	violet: 'bg-violet-500',
	pink: 'bg-pink-500',
	zinc: 'bg-zinc-500',
};

const NodePalettePartial: FC<INodePalettePartialProps> = ({
	isOpen,
	onToggle,
	onDragStart,
	onNodeAdd,
}) => {
	const [search, setSearch] = useState('');
	const [expandedCategories, setExpandedCategories] = useState<TNodeCategory[]>([
		'trigger',
		'action',
	]);

	// Fetch node types from API with fallback
	const { nodeTypes, categories, searchNodes: searchNodesFn } = useNodeTypesWithApi();

	const filteredNodes = useMemo(() => {
		if (search.trim()) {
			return searchNodesFn(search);
		}
		return nodeTypes;
	}, [search, nodeTypes, searchNodesFn]);

	const toggleCategory = (category: TNodeCategory) => {
		setExpandedCategories((prev) =>
			prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
		);
	};

	const getNodesByCategory = (category: TNodeCategory) => {
		return filteredNodes.filter((node) => node.category === category);
	};

	const handleDragStart = (e: React.DragEvent, node: INodeTypeDefinition) => {
		e.dataTransfer.setData('application/reactflow', JSON.stringify(node));
		e.dataTransfer.effectAllowed = 'move';
		onDragStart(e, node);
	};

	if (!isOpen) {
		return (
			<button
				type='button'
				onClick={onToggle}
				className='absolute top-4 left-4 z-10 flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-lg transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700'>
				<Icon icon='PlusSign' className='size-4' />
				<span className='text-sm font-medium'>Add Node</span>
			</button>
		);
	}

	return (
		<aside className='absolute top-4 left-4 z-10 flex h-[calc(100%-2rem)] w-72 flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-800'>
			{/* Header */}
			<div className='flex items-center justify-between border-b border-zinc-200 p-3 dark:border-zinc-700'>
				<span className='text-sm font-semibold text-zinc-900 dark:text-zinc-100'>
					Add Nodes
				</span>
				<button
					type='button'
					onClick={onToggle}
					className='flex size-7 items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700'>
					<Icon icon='Cancel01' className='size-4 text-zinc-500' />
				</button>
			</div>

			{/* Search */}
			<div className='border-b border-zinc-200 p-3 dark:border-zinc-700'>
				<FieldWrap firstSuffix={<Icon icon='Search01' className='size-4 text-zinc-400' />}>
					<Input
						name='search'
						dimension='sm'
						placeholder='Search nodes...'
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</FieldWrap>
			</div>

			{/* Node List */}
			<div className='flex-1 overflow-y-auto p-2'>
				{search.trim() ? (
					// Search results
					<div className='space-y-1'>
						{filteredNodes.length === 0 ? (
							<div className='p-4 text-center text-sm text-zinc-500'>
								No nodes found
							</div>
						) : (
							filteredNodes.map((node) => (
								<NodeItem
									key={node.type}
									node={node}
									onDragStart={handleDragStart}
									onNodeAdd={onNodeAdd}
								/>
							))
						)}
					</div>
				) : (
					// Categorized list
					<div className='space-y-1'>
						{(Object.keys(categories) as TNodeCategory[]).map((category) => {
							const nodes = getNodesByCategory(category);
							const categoryInfo = categories[category];
							const isExpanded = expandedCategories.includes(category);

							if (nodes.length === 0) return null;

							return (
								<div key={category}>
									<button
										type='button'
										onClick={() => toggleCategory(category)}
										className='flex w-full items-center justify-between rounded-lg px-2 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-700'>
										<span className='flex items-center gap-2'>
											<div
												className={classNames(
													'flex size-6 items-center justify-center rounded-md',
													colorClasses[categoryInfo.color],
												)}>
												<Icon
													icon={categoryInfo.icon}
													className='size-3.5 text-white'
												/>
											</div>
											<span className='text-sm font-medium text-zinc-700 dark:text-zinc-300'>
												{categoryInfo.label}
											</span>
											<span className='text-xs text-zinc-400'>
												({nodes.length})
											</span>
										</span>
										<Icon
											icon='ArrowDown01'
											className={classNames(
												'size-4 text-zinc-400 transition-transform',
												isExpanded && 'rotate-180',
											)}
										/>
									</button>
									<Collapse isOpen={isExpanded}>
										<div className='mt-1 space-y-1 pb-2 pl-2'>
											{nodes.map((node) => (
												<NodeItem
													key={node.type}
													node={node}
													onDragStart={handleDragStart}
													onNodeAdd={onNodeAdd}
												/>
											))}
										</div>
									</Collapse>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</aside>
	);
};

interface INodeItemProps {
	node: INodeTypeDefinition;
	onDragStart: (e: React.DragEvent, node: INodeTypeDefinition) => void;
	onNodeAdd: (node: INodeTypeDefinition) => void;
}

const NodeItem: FC<INodeItemProps> = ({ node, onDragStart, onNodeAdd }) => {
	return (
		<div
			draggable
			onDragStart={(e) => onDragStart(e, node)}
			onDoubleClick={() => onNodeAdd(node)}
			className='group flex cursor-grab items-center gap-2 rounded-lg border border-transparent bg-zinc-50 p-2 transition-all hover:border-zinc-200 hover:bg-zinc-100 hover:shadow-sm active:cursor-grabbing dark:bg-zinc-800/50 dark:hover:border-zinc-600 dark:hover:bg-zinc-700'>
			<div
				className={classNames(
					'flex size-8 shrink-0 items-center justify-center rounded-lg',
					colorClasses[node.color],
				)}>
				<Icon icon={node.icon} className='size-4 text-white' />
			</div>
			<div className='min-w-0 flex-1'>
				<div className='truncate text-sm font-medium text-zinc-900 dark:text-zinc-100'>
					{node.label}
				</div>
				<div className='truncate text-xs text-zinc-500 dark:text-zinc-400'>
					{node.description}
				</div>
			</div>
			<button
				type='button'
				onClick={(e) => {
					e.stopPropagation();
					onNodeAdd(node);
				}}
				className='flex size-6 shrink-0 items-center justify-center rounded-md opacity-0 transition-opacity group-hover:opacity-100 hover:bg-zinc-200 dark:hover:bg-zinc-600'>
				<Icon icon='PlusSign' className='size-3.5 text-zinc-500' />
			</button>
		</div>
	);
};

export default NodePalettePartial;
