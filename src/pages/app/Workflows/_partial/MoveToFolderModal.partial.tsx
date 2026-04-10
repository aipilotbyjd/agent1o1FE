import { FC, useState } from 'react';
import Modal, { ModalBody, ModalFooter, ModalHeader } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Icon from '@/components/icon/Icon';
import { IFolder } from '@/types/folder.type';

interface IMoveToFolderModalPartialProps {
	isOpen: boolean;
	onClose: () => void;
	onMove: (folderId: string | null) => Promise<void>;
	folders: IFolder[];
	isLoading?: boolean;
	workflowCount?: number;
}

const MoveToFolderModalPartial: FC<IMoveToFolderModalPartialProps> = ({
	isOpen,
	onClose,
	onMove,
	folders,
	isLoading,
	workflowCount = 1,
}) => {
	const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

	const handleMove = async () => {
		await onMove(selectedFolderId);
		onClose();
	};

	return (
		<Modal isOpen={isOpen} setIsOpen={onClose}>
			<ModalHeader>
				Move {workflowCount > 1 ? `${workflowCount} Workflows` : 'Workflow'} to Folder
			</ModalHeader>
			<ModalBody>
				<div className='space-y-1'>
					{/* Uncategorized option */}
					<button
						type='button'
						className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors ${
							selectedFolderId === null
								? 'bg-primary-50 border-primary-200 dark:bg-primary-900/20 dark:border-primary-800 border'
								: 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
						}`}
						onClick={() => setSelectedFolderId(null)}>
						<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-200 dark:bg-zinc-700'>
							<Icon icon='Folder02' size='text-xl' className='text-zinc-500' />
						</div>
						<div className='flex-1'>
							<div className='font-medium text-zinc-900 dark:text-white'>
								Uncategorized
							</div>
							<div className='text-xs text-zinc-500'>No folder</div>
						</div>
						{selectedFolderId === null && (
							<Icon icon='Tick02' className='text-primary-500' size='text-xl' />
						)}
					</button>

					{/* Folder options */}
					{folders.map((folder) => (
						<button
							key={folder.id}
							type='button'
							className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors ${
								selectedFolderId === folder.id
									? 'bg-primary-50 border-primary-200 dark:bg-primary-900/20 dark:border-primary-800 border'
									: 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
							}`}
							onClick={() => setSelectedFolderId(folder.id)}>
							<div
								className={`flex h-10 w-10 items-center justify-center rounded-lg ${folder.color} bg-opacity-20`}>
								<Icon icon={folder.icon} size='text-xl' className='text-white' />
							</div>
							<div className='flex-1'>
								<div className='font-medium text-zinc-900 dark:text-white'>
									{folder.name}
								</div>
								<div className='text-xs text-zinc-500'>
									{folder.workflow_count} workflow
									{folder.workflow_count !== 1 ? 's' : ''}
								</div>
							</div>
							{selectedFolderId === folder.id && (
								<Icon icon='Tick02' className='text-primary-500' size='text-xl' />
							)}
						</button>
					))}

					{folders.length === 0 && (
						<div className='py-8 text-center text-zinc-500'>
							<Icon icon='Folder02' size='text-4xl' className='mb-2 opacity-30' />
							<p className='text-sm'>No folders yet</p>
						</div>
					)}
				</div>
			</ModalBody>
			<ModalFooter>
				<Button variant='outline' onClick={onClose} isDisable={isLoading}>
					Cancel
				</Button>
				<Button variant='solid' onClick={handleMove} isLoading={isLoading}>
					Move Here
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default MoveToFolderModalPartial;
