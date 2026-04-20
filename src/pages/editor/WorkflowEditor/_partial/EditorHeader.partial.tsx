import { FC, useState } from 'react';
import { useNavigate } from 'react-router';
import Icon from '@/components/icon/Icon';
import Input from '@/components/form/Input';
import Button from '@/components/ui/Button';
import Dropdown, { DropdownItem, DropdownMenu, DropdownToggle } from '@/components/ui/Dropdown';
import Spinner from '@/components/ui/Spinner';
import pages from '@/Routes/pages';

interface IEditorHeaderPartialProps {
	workflowName: string;
	onNameChange: (name: string) => void;
	onShare?: () => void;
	onDuplicate?: () => void;
	onExport?: () => void;
	onImport?: () => void;
	onDelete?: () => void;
	onShowSettings?: () => void;
	isSaving?: boolean;
	hasChanges?: boolean;
	lastSavedAt?: string | null;
}

const EditorHeaderPartial: FC<IEditorHeaderPartialProps> = ({
	workflowName,
	onNameChange,
	onShare,
	onDuplicate,
	onExport,
	onImport,
	onDelete,
	onShowSettings,
	isSaving,
	hasChanges,
	lastSavedAt,
}) => {
	const navigate = useNavigate();
	const [isEditingName, setIsEditingName] = useState(false);

	const handleBack = () => {
		navigate(pages.app.appMain.subPages.workflows.to);
	};

	const handleNameBlur = () => {
		setIsEditingName(false);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			setIsEditingName(false);
		}
	};

	return (
		<header className='flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4 dark:border-zinc-700 dark:bg-zinc-900'>
			{/* Left Section - Back + Name */}
			<div className='flex items-center gap-4'>
				<button
					type='button'
					onClick={handleBack}
					className='flex size-8 items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800'>
					<Icon icon='ArrowLeft01' className='size-5 text-zinc-600 dark:text-zinc-400' />
				</button>

				<div className='flex items-center gap-3'>
					{isEditingName ? (
						<Input
							name='workflowName'
							value={workflowName}
							onChange={(e) => onNameChange(e.target.value)}
							onBlur={handleNameBlur}
							onKeyDown={handleKeyDown}
							autoFocus
							dimension='sm'
							className='w-64 border-transparent bg-transparent text-base font-medium'
						/>
					) : (
						<button
							type='button'
							onClick={() => setIsEditingName(true)}
							className='flex items-center gap-2 rounded-md px-2 py-1 text-base font-medium text-zinc-900 hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800'>
							{workflowName}
							<Icon
								icon='Edit02'
								className='size-3.5 text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100'
							/>
						</button>
					)}

					{/* Status Badge */}
					<div className='flex items-center'>
						{isSaving ? (
							<div className='flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'>
								<Spinner className='size-3 border-blue-600 border-t-transparent dark:border-blue-400' />
								<span>Saving...</span>
							</div>
						) : hasChanges ? (
							<div className='flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'>
								<span className='size-1.5 rounded-full bg-amber-500' />
								<span>Unsaved changes</span>
							</div>
						) : (
							<div className='group relative flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'>
								<Icon icon='Cloud' className='size-3.5' />
								<span>Saved</span>

								{/* Timestamp Tooltip */}
								{lastSavedAt && (
									<div className='absolute top-full left-1/2 mt-2 hidden -translate-x-1/2 rounded bg-zinc-800 px-2 py-1 text-[10px] whitespace-nowrap text-white shadow-lg group-hover:block dark:bg-zinc-700'>
										Last saved: {new Date(lastSavedAt).toLocaleTimeString()}
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Right Section - Share + More */}
			<div className='flex items-center gap-2'>
				<Button
					variant='outline'
					className='gap-2 rounded-lg border-zinc-200 px-4 dark:border-zinc-700'
					onClick={onShare}>
					<Icon icon='Share08' className='size-4' />
					Share
				</Button>

				<Dropdown>
					<DropdownToggle hasIcon={false}>
						<button
							type='button'
							className='flex size-8 items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800'>
							<Icon
								icon='MoreHorizontal'
								className='size-5 text-zinc-600 dark:text-zinc-400'
							/>
						</button>
					</DropdownToggle>
					<DropdownMenu placement='bottom-end'>
						<DropdownItem icon='Copy01' onClick={onDuplicate}>
							Duplicate
						</DropdownItem>
						<DropdownItem icon='Download04' onClick={onExport}>
							Export as JSON
						</DropdownItem>
						<DropdownItem icon='Upload04' onClick={onImport}>
							Import from JSON
						</DropdownItem>
						<DropdownItem icon='Clock01'>Version History</DropdownItem>
						<DropdownItem icon='Settings02' onClick={onShowSettings}>
							Settings
						</DropdownItem>
						<DropdownItem icon='Delete02' className='text-red-500' onClick={onDelete}>
							Delete
						</DropdownItem>
					</DropdownMenu>
				</Dropdown>
			</div>
		</header>
	);
};

export default EditorHeaderPartial;
