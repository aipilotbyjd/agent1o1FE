import { FC, useState, useMemo } from 'react';
import Icon from '@/components/icon/Icon';
import Input from '@/components/form/Input';
import FieldWrap from '@/components/form/FieldWrap';
import Modal, { ModalBody, ModalHeader } from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import classNames from 'classnames';
import { INodeTypeDefinition, TNodeCategory } from '../_helper/nodeTypes.helper';
import useNodeTypesWithApi from '../_helper/useNodeTypes.hook';

interface INodePaletteModalPartialProps {
	isOpen: boolean;
	onClose: () => void;
	onNodeSelect: (nodeType: INodeTypeDefinition) => void;
	onNodeSelectForEdgeInsert?: (nodeType: INodeTypeDefinition) => boolean;
	isEdgeInsertMode?: boolean;
}

const colorClasses: Record<string, string> = {
	emerald: 'bg-emerald-500',
	blue: 'bg-blue-500',
	amber: 'bg-amber-500',
	violet: 'bg-violet-500',
	pink: 'bg-pink-500',
	zinc: 'bg-zinc-500',
};

const NodePaletteModalPartial: FC<INodePaletteModalPartialProps> = ({
	isOpen,
	onClose,
	onNodeSelect,
	onNodeSelectForEdgeInsert,
	isEdgeInsertMode = false,
}) => {
	const [search, setSearch] = useState('');
	const [selectedCategory, setSelectedCategory] = useState<TNodeCategory | 'all'>('all');

	// Fetch node types from API with fallback
	const {
		nodeTypes,
		categories,
		isLoading,
		isError,
		searchNodes: searchNodesFn,
	} = useNodeTypesWithApi();

	const filteredNodes = useMemo(() => {
		let nodes = nodeTypes;

		if (search.trim()) {
			nodes = searchNodesFn(search);
		}

		if (selectedCategory !== 'all') {
			nodes = nodes.filter((node) => node.category === selectedCategory);
		}

		return nodes;
	}, [search, selectedCategory, nodeTypes, searchNodesFn]);

	const handleNodeClick = (node: INodeTypeDefinition) => {
		// Check if we're inserting on an edge
		if (isEdgeInsertMode && onNodeSelectForEdgeInsert) {
			const handled = onNodeSelectForEdgeInsert(node);
			if (handled) {
				onClose();
				setSearch('');
				return;
			}
		}

		onNodeSelect(node);
		onClose();
		setSearch('');
	};

	return (
		<Modal isOpen={isOpen} setIsOpen={onClose} size='lg'>
			<ModalHeader>
				<div className='flex items-center gap-3'>
					<div className='flex size-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30'>
						<Icon
							icon={isEdgeInsertMode ? 'Link01' : 'PlusSign'}
							className='size-5 text-emerald-600 dark:text-emerald-400'
						/>
					</div>
					<div>
						<h3 className='text-lg font-semibold text-zinc-900 dark:text-zinc-100'>
							{isEdgeInsertMode ? 'Insert module' : 'Add a module'}
						</h3>
						<p className='text-sm text-zinc-500'>
							{isEdgeInsertMode
								? 'Choose a module to insert between connections'
								: 'Choose a module to add to your workflow'}
						</p>
					</div>
				</div>
			</ModalHeader>
			<ModalBody className='p-0'>
				{/* Search */}
				<div className='border-b border-zinc-200 p-4 dark:border-zinc-700'>
					<FieldWrap
						firstSuffix={<Icon icon='Search01' className='size-4 text-zinc-400' />}>
						<Input
							name='search'
							placeholder='Search modules...'
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							autoFocus
						/>
					</FieldWrap>
				</div>

				<div className='flex h-[400px]'>
					{/* Categories Sidebar */}
					<div className='w-48 shrink-0 border-r border-zinc-200 p-2 dark:border-zinc-700'>
						<button
							type='button'
							onClick={() => setSelectedCategory('all')}
							className={classNames(
								'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
								selectedCategory === 'all'
									? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
									: 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800',
							)}>
							<Icon icon='GridView' className='size-4' />
							All modules
						</button>

						{(Object.keys(categories) as TNodeCategory[]).map((category) => {
							const categoryInfo = categories[category];
							return (
								<button
									key={category}
									type='button'
									onClick={() => setSelectedCategory(category)}
									className={classNames(
										'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
										selectedCategory === category
											? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
											: 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800',
									)}>
									<Icon icon={categoryInfo.icon} className='size-4' />
									{categoryInfo.label}
								</button>
							);
						})}
					</div>

					{/* Nodes Grid */}
					<div className='flex-1 overflow-y-auto p-4'>
						{isLoading ? (
							<div className='flex h-full items-center justify-center'>
								<Spinner />
							</div>
						) : isError ? (
							<div className='flex h-full flex-col items-center justify-center text-center'>
								<Icon icon='AlertCircle' className='size-12 text-red-300' />
								<p className='mt-2 text-sm text-red-500'>Failed to load modules</p>
								<p className='mt-1 text-xs text-zinc-500'>Using fallback data</p>
							</div>
						) : filteredNodes.length === 0 ? (
							<div className='flex h-full flex-col items-center justify-center text-center'>
								<Icon
									icon='Search01'
									className='size-12 text-zinc-300 dark:text-zinc-600'
								/>
								<p className='mt-2 text-sm text-zinc-500'>No modules found</p>
							</div>
						) : (
							<div className='grid grid-cols-3 gap-3'>
								{filteredNodes.map((node) => (
									<button
										key={node.type}
										type='button'
										onClick={() => handleNodeClick(node)}
										className='group flex flex-col items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-4 transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/20'>
										<div
											className={classNames(
												'flex size-12 items-center justify-center rounded-full transition-transform group-hover:scale-110',
												colorClasses[node.color],
											)}>
											<Icon icon={node.icon} className='size-6 text-white' />
										</div>
										<div className='text-center'>
											<div className='text-sm font-medium text-zinc-900 dark:text-zinc-100'>
												{node.label}
											</div>
											<div className='mt-0.5 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400'>
												{node.description}
											</div>
										</div>
									</button>
								))}
							</div>
						)}
					</div>
				</div>
			</ModalBody>
		</Modal>
	);
};

export default NodePaletteModalPartial;
