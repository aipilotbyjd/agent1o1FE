import { FC } from 'react';
import Icon from '@/components/icon/Icon';
import Dropdown, { DropdownItem, DropdownMenu, DropdownToggle } from '@/components/ui/Dropdown';
import Tooltip from '@/components/ui/Tooltip';
import classNames from 'classnames';

interface IBottomToolbarPartialProps {
	onRun: () => void;
	onSave: () => void;
	onUndo: () => void;
	onRedo: () => void;
	onAddNode: () => void;
	onToggleSchedule: () => void;
	onAutoArrange: () => void;
	onFitView: () => void;
	onShowShortcuts: () => void;
	onShowSettings: () => void;
	onAddNote: () => void;
	onShowVisualEffects?: () => void;
	isRunning?: boolean;
	isSaving?: boolean;
	canUndo: boolean;
	canRedo: boolean;
	isScheduleEnabled: boolean;
	scheduleInterval: string;
	hasChanges: boolean;
	isVisualEffectsEnabled?: boolean;
}

const BottomToolbarPartial: FC<IBottomToolbarPartialProps> = ({
	onRun,
	onSave,
	onUndo,
	onRedo,
	onAddNode,
	onToggleSchedule,
	onAutoArrange,
	onFitView,
	onShowShortcuts,
	onShowSettings,
	onAddNote,
	onShowVisualEffects,
	isRunning = false,
	isSaving = false,
	canUndo,
	canRedo,
	isScheduleEnabled,
	scheduleInterval,
	hasChanges,
	isVisualEffectsEnabled = false,
}) => {
	return (
		<div className='absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-2xl border border-zinc-200/80 bg-white/95 px-3 py-2 shadow-2xl backdrop-blur-sm dark:border-zinc-700/80 dark:bg-zinc-800/95'>
			{/* Run Button */}
			<Dropdown>
				<DropdownToggle hasIcon={false}>
					<button
						type='button'
						onClick={onRun}
						disabled={isRunning}
						className='flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:from-emerald-600 hover:to-emerald-700 hover:shadow-emerald-500/40 disabled:opacity-50'>
						{isRunning ? (
							<div className='size-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
						) : (
							<Icon icon='Play' className='size-4' />
						)}
						Run
						<Icon icon='ArrowDown01' className='size-3 opacity-70' />
					</button>
				</DropdownToggle>
				<DropdownMenu placement='top'>
					<DropdownItem icon='Play' onClick={onRun}>
						Run once
					</DropdownItem>
					<DropdownItem icon='PlayCircle' onClick={onRun}>
						Run all
					</DropdownItem>
				</DropdownMenu>
			</Dropdown>

			{/* Schedule Toggle */}
			<Tooltip text={isScheduleEnabled ? `Runs ${scheduleInterval}` : 'Schedule is disabled'}>
				<button
					type='button'
					onClick={onToggleSchedule}
					className={classNames(
						'flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
						isScheduleEnabled
							? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
							: 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-700/50 dark:text-zinc-400 dark:hover:bg-zinc-700',
					)}>
					<Icon icon='Clock01' className='size-4' />
					<span className='hidden sm:inline'>{isScheduleEnabled ? 'On' : 'Off'}</span>
				</button>
			</Tooltip>

			{/* Divider */}
			<div className='mx-1 h-8 w-px bg-zinc-200 dark:bg-zinc-700' />

			{/* Tool Buttons */}
			<div className='flex items-center gap-0.5'>
				<Tooltip text='Auto-arrange'>
					<button
						type='button'
						onClick={onAutoArrange}
						className='flex size-10 items-center justify-center rounded-xl text-zinc-500 transition-all hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200'>
						<Icon icon='MagicWand02' className='size-5' />
					</button>
				</Tooltip>

				<Tooltip text='Fit view'>
					<button
						type='button'
						onClick={onFitView}
						className='flex size-10 items-center justify-center rounded-xl text-zinc-500 transition-all hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200'>
						<Icon icon='Maximize01' className='size-5' />
					</button>
				</Tooltip>

				<Tooltip text='Add note'>
					<button
						type='button'
						onClick={onAddNote}
						className='flex size-10 items-center justify-center rounded-xl text-zinc-500 transition-all hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200'>
						<Icon icon='StickyNote02' className='size-5' />
					</button>
				</Tooltip>

				<Tooltip text='Shortcuts'>
					<button
						type='button'
						onClick={onShowShortcuts}
						className='flex size-10 items-center justify-center rounded-xl text-zinc-500 transition-all hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200'>
						<Icon icon='Keyboard' className='size-5' />
					</button>
				</Tooltip>
			</div>

			{/* Divider */}
			<div className='mx-1 h-8 w-px bg-zinc-200 dark:bg-zinc-700' />

			{/* Undo/Redo */}
			<div className='flex items-center gap-0.5'>
				<Tooltip text='Undo (Ctrl+Z)'>
					<button
						type='button'
						onClick={onUndo}
						disabled={!canUndo}
						className={classNames(
							'flex size-10 items-center justify-center rounded-xl transition-all',
							canUndo
								? 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200'
								: 'cursor-not-allowed text-zinc-300 dark:text-zinc-600',
						)}>
						<Icon icon='RotateLeft01' className='size-5' />
					</button>
				</Tooltip>

				<Tooltip text='Redo (Ctrl+Y)'>
					<button
						type='button'
						onClick={onRedo}
						disabled={!canRedo}
						className={classNames(
							'flex size-10 items-center justify-center rounded-xl transition-all',
							canRedo
								? 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200'
								: 'cursor-not-allowed text-zinc-300 dark:text-zinc-600',
						)}>
						<Icon icon='RotateRight01' className='size-5' />
					</button>
				</Tooltip>
			</div>

			{/* Divider */}
			<div className='mx-1 h-8 w-px bg-zinc-200 dark:bg-zinc-700' />

			{/* Save Button */}
			<Tooltip text={hasChanges ? 'Save (Ctrl+S)' : 'All saved'}>
				<button
					type='button'
					onClick={onSave}
					disabled={isSaving || !hasChanges}
					className={classNames(
						'flex size-10 items-center justify-center rounded-xl transition-all',
						hasChanges
							? 'bg-amber-100 text-amber-600 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:hover:bg-amber-900/60'
							: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
					)}>
					{isSaving ? (
						<div className='size-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
					) : (
						<Icon
							icon={hasChanges ? 'FloppyDisk' : 'CheckmarkCircle02'}
							className='size-5'
						/>
					)}
				</button>
			</Tooltip>

			{/* Visual Effects */}
			{onShowVisualEffects && (
				<Tooltip text='Visual Effects'>
					<button
						type='button'
						onClick={onShowVisualEffects}
						className={classNames(
							'flex size-10 items-center justify-center rounded-xl transition-all',
							isVisualEffectsEnabled
								? 'bg-purple-100 text-purple-600 hover:bg-purple-200 dark:bg-purple-900/40 dark:text-purple-400 dark:hover:bg-purple-900/60'
								: 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200',
						)}>
						<Icon icon='Sparkles' className='size-5' />
					</button>
				</Tooltip>
			)}

			{/* Settings */}
			<Tooltip text='Settings'>
				<button
					type='button'
					onClick={onShowSettings}
					className='flex size-10 items-center justify-center rounded-xl text-zinc-500 transition-all hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200'>
					<Icon icon='Settings02' className='size-5' />
				</button>
			</Tooltip>

			{/* Divider */}
			<div className='mx-1 h-8 w-px bg-zinc-200 dark:bg-zinc-700' />

			{/* Add Node Button */}
			<Tooltip text='Add module'>
				<button
					type='button'
					onClick={onAddNode}
					className='flex size-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/40'>
					<Icon icon='PlusSign' className='size-5' />
				</button>
			</Tooltip>
		</div>
	);
};

export default BottomToolbarPartial;
