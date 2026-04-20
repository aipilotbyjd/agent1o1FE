import { FC, memo, useState, useRef, useEffect } from 'react';
import { NodeProps, NodeResizer, useReactFlow } from '@xyflow/react';
import classNames from 'classnames';
import Icon from '@/components/icon/Icon';
import { TNoteColor } from '@/types/note.type';

interface IStickyNoteData {
	label: string;
	type: string;
	// Note ID from the Notes API (if saved)
	noteId?: string;
	// Callbacks for Notes API operations
	onNoteUpdate?: (
		noteId: string,
		data: {
			content?: string;
			color?: TNoteColor;
			position?: { x: number; y: number };
			size?: { width: number; height: number };
		},
	) => void;
	onNoteDelete?: (noteId: string) => void;
	parameters: {
		content?: string;
		color?: string;
		fontSize?: 'sm' | 'md' | 'lg';
	};
}

const colorOptions = [
	{
		value: 'yellow',
		bg: 'bg-yellow-100',
		border: 'border-yellow-300',
		darkBg: 'dark:bg-yellow-800',
		darkBorder: 'dark:border-yellow-600',
		dot: 'bg-yellow-400',
	},
	{
		value: 'blue',
		bg: 'bg-blue-100',
		border: 'border-blue-300',
		darkBg: 'dark:bg-blue-800',
		darkBorder: 'dark:border-blue-600',
		dot: 'bg-blue-400',
	},
	{
		value: 'green',
		bg: 'bg-emerald-100',
		border: 'border-emerald-300',
		darkBg: 'dark:bg-emerald-800',
		darkBorder: 'dark:border-emerald-600',
		dot: 'bg-emerald-400',
	},
	{
		value: 'pink',
		bg: 'bg-pink-100',
		border: 'border-pink-300',
		darkBg: 'dark:bg-pink-800',
		darkBorder: 'dark:border-pink-600',
		dot: 'bg-pink-400',
	},
	{
		value: 'purple',
		bg: 'bg-violet-100',
		border: 'border-violet-300',
		darkBg: 'dark:bg-violet-800',
		darkBorder: 'dark:border-violet-600',
		dot: 'bg-violet-400',
	},
	{
		value: 'orange',
		bg: 'bg-orange-100',
		border: 'border-orange-300',
		darkBg: 'dark:bg-orange-800',
		darkBorder: 'dark:border-orange-600',
		dot: 'bg-orange-400',
	},
];

const fontSizes = {
	sm: 'text-xs',
	md: 'text-sm',
	lg: 'text-base',
};

const StickyNoteNodePartial: FC<NodeProps> = ({ id, data, selected }) => {
	const noteData = data as unknown as IStickyNoteData;
	const color = noteData.parameters?.color || 'yellow';
	const fontSize = noteData.parameters?.fontSize || 'md';
	const colorConfig = colorOptions.find((c) => c.value === color) || colorOptions[0];

	const { setNodes, getNode } = useReactFlow();
	const [isEditing, setIsEditing] = useState(false);
	const [content, setContent] = useState(noteData.parameters?.content || '');
	const [showToolbar, setShowToolbar] = useState(false);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		setContent(noteData.parameters?.content || '');
	}, [noteData.parameters?.content]);

	useEffect(() => {
		if (isEditing && textareaRef.current) {
			textareaRef.current.focus();
			const len = textareaRef.current.value.length;
			textareaRef.current.setSelectionRange(len, len);
		}
	}, [isEditing]);

	const handleClick = () => {
		if (!isEditing) {
			setIsEditing(true);
		}
	};

	const handleBlur = (e: React.FocusEvent) => {
		if (containerRef.current?.contains(e.relatedTarget as Node)) {
			return;
		}
		setIsEditing(false);
		updateNodeData({ content });
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Escape') {
			setIsEditing(false);
			setContent(noteData.parameters?.content || '');
		}
		e.stopPropagation();
	};

	// Update local node data and sync with Notes API
	const updateNodeData = (updates: Partial<IStickyNoteData['parameters']>) => {
		setNodes((nodes) =>
			nodes.map((node) => {
				if (node.id === id) {
					const nodeData = node.data as unknown as IStickyNoteData;
					return {
						...node,
						data: {
							...node.data,
							parameters: {
								...nodeData.parameters,
								...updates,
							},
						},
					};
				}
				return node;
			}),
		);

		// Debounce API update
		if (updateTimeoutRef.current) {
			clearTimeout(updateTimeoutRef.current);
		}
		updateTimeoutRef.current = setTimeout(() => {
			if (noteData.noteId && noteData.onNoteUpdate) {
				const currentNode = getNode(id);
				noteData.onNoteUpdate(noteData.noteId, {
					content: updates.content ?? noteData.parameters?.content,
					color: (updates.color ?? noteData.parameters?.color) as TNoteColor,
					position: currentNode?.position,
				});
			}
		}, 500);
	};

	const handleColorChange = (newColor: string) => {
		updateNodeData({ color: newColor });
	};

	const handleFontSizeChange = (newSize: 'sm' | 'md' | 'lg') => {
		updateNodeData({ fontSize: newSize });
	};

	const handleDelete = () => {
		// Delete from Notes API if it has a noteId
		if (noteData.noteId && noteData.onNoteDelete) {
			noteData.onNoteDelete(noteData.noteId);
		}
		setNodes((nodes) => nodes.filter((node) => node.id !== id));
	};

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (updateTimeoutRef.current) {
				clearTimeout(updateTimeoutRef.current);
			}
		};
	}, []);

	return (
		<div
			ref={containerRef}
			className='h-full w-full'
			style={{ minWidth: 180, minHeight: 120 }}
			onMouseEnter={() => setShowToolbar(true)}
			onMouseLeave={() => !isEditing && setShowToolbar(false)}>
			<NodeResizer
				minWidth={180}
				minHeight={120}
				isVisible={selected}
				lineClassName='!border-blue-400'
				handleClassName='!size-2.5 !bg-blue-500 !border-white'
			/>

			{/* Main Note Container */}
			<div
				onClick={handleClick}
				className={classNames(
					'relative h-full w-full cursor-text rounded-lg border-2 shadow-lg transition-shadow',
					colorConfig.bg,
					colorConfig.border,
					colorConfig.darkBg,
					colorConfig.darkBorder,
					selected ? 'shadow-xl ring-2 ring-blue-400/50' : 'hover:shadow-xl',
				)}>
				{/* Header bar with drag handle indicator */}
				<div
					className={classNames(
						'flex h-7 items-center justify-between rounded-t-md px-2',
						'bg-black/5 dark:bg-white/10',
					)}>
					<div className='flex items-center gap-1'>
						<Icon
							icon='StickyNote02'
							className='size-3.5 text-zinc-500 dark:text-zinc-400'
						/>
						<span className='text-[10px] font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400'>
							Note
						</span>
					</div>
					<div className='flex gap-0.5'>
						{[1, 2, 3].map((i) => (
							<div key={i} className='size-1 rounded-full bg-zinc-400/50' />
						))}
					</div>
				</div>

				{/* Content Area */}
				<div className='h-[calc(100%-28px)] p-3'>
					{isEditing ? (
						<textarea
							ref={textareaRef}
							value={content}
							onChange={(e) => setContent(e.target.value)}
							onBlur={handleBlur}
							onKeyDown={handleKeyDown}
							placeholder='Write your note here...'
							className={classNames(
								'h-full w-full resize-none border-none bg-transparent leading-relaxed text-zinc-700 outline-none',
								'placeholder:text-zinc-400 dark:text-zinc-200 dark:placeholder:text-zinc-500',
								fontSizes[fontSize],
							)}
							style={{ minHeight: '60px' }}
						/>
					) : (
						<div
							className={classNames(
								'h-full w-full leading-relaxed whitespace-pre-wrap text-zinc-700 dark:text-zinc-200',
								fontSizes[fontSize],
								!content && 'text-zinc-400 dark:text-zinc-500',
							)}>
							{content || 'Click to write...'}
						</div>
					)}
				</div>

				{/* Fold corner effect */}
				<div
					className={classNames(
						'absolute right-0 bottom-0 size-4',
						'bg-gradient-to-br from-transparent via-transparent to-black/10 dark:to-white/10',
					)}
					style={{
						clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
					}}
				/>
			</div>

			{/* Floating Toolbar */}
			{(showToolbar || selected) && (
				<div
					className={classNames(
						'absolute -bottom-12 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-lg bg-white px-2 py-1.5 shadow-lg',
						'border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800',
					)}>
					{/* Color Options */}
					<div className='flex items-center gap-1 border-r border-zinc-200 pr-2 dark:border-zinc-700'>
						{colorOptions.map((opt) => (
							<button
								key={opt.value}
								type='button'
								onClick={() => handleColorChange(opt.value)}
								className={classNames(
									'size-5 rounded-full transition-all hover:scale-110',
									opt.dot,
									color === opt.value &&
										'ring-2 ring-zinc-800 ring-offset-1 dark:ring-white',
								)}
								title={opt.value}
							/>
						))}
					</div>

					{/* Font Size Options */}
					<div className='flex items-center gap-0.5 border-r border-zinc-200 px-1 dark:border-zinc-700'>
						<button
							type='button'
							onClick={() => handleFontSizeChange('sm')}
							className={classNames(
								'rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors',
								fontSize === 'sm'
									? 'bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-white'
									: 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700',
							)}
							title='Small text'>
							S
						</button>
						<button
							type='button'
							onClick={() => handleFontSizeChange('md')}
							className={classNames(
								'rounded px-1.5 py-0.5 text-xs font-medium transition-colors',
								fontSize === 'md'
									? 'bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-white'
									: 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700',
							)}
							title='Medium text'>
							M
						</button>
						<button
							type='button'
							onClick={() => handleFontSizeChange('lg')}
							className={classNames(
								'rounded px-1.5 py-0.5 text-sm font-medium transition-colors',
								fontSize === 'lg'
									? 'bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-white'
									: 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700',
							)}
							title='Large text'>
							L
						</button>
					</div>

					{/* Delete Button */}
					<button
						type='button'
						onClick={handleDelete}
						className='flex size-6 items-center justify-center rounded text-zinc-400 transition-colors hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30'
						title='Delete note'>
						<Icon icon='Delete02' className='size-3.5' />
					</button>
				</div>
			)}
		</div>
	);
};

export default memo(StickyNoteNodePartial);
