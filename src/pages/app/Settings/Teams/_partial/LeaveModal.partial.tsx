import { Dispatch, FC, SetStateAction } from 'react';
import Modal, { ModalBody, ModalFooter, ModalFooterChild, ModalHeader } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Icon from '@/components/icon/Icon';
import { useLeaveWorkspace } from '@/api/hooks/useTeam';

interface ILeaveModalProps {
	isOpen: boolean;
	setIsOpen: Dispatch<SetStateAction<boolean>>;
	workspaceId: string;
	workspaceName: string;
	onLeft?: () => void;
}

const LeaveModal: FC<ILeaveModalProps> = ({
	isOpen,
	setIsOpen,
	workspaceId,
	workspaceName,
	onLeft,
}) => {
	const leaveWorkspace = useLeaveWorkspace();

	const handleLeave = async () => {
		await leaveWorkspace.mutateAsync(workspaceId);
		setIsOpen(false);
		onLeft?.();
	};

	return (
		<Modal isOpen={isOpen} setIsOpen={setIsOpen}>
			<ModalHeader setIsOpen={setIsOpen}>Leave Workspace</ModalHeader>
			<ModalBody>
				<div className='flex flex-col items-center gap-4 py-4'>
					<div className='flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20'>
						<Icon icon='Logout04' color='red' size='text-2xl' />
					</div>
					<div className='text-center'>
						<p className='text-lg font-semibold'>
							Leave &quot;{workspaceName}&quot;?
						</p>
						<p className='mt-2 text-sm text-zinc-500'>
							You will lose access to all workflows, credentials, and data in this
							workspace. This action cannot be undone.
						</p>
					</div>
				</div>
			</ModalBody>
			<ModalFooter>
				<ModalFooterChild>
					<Button variant='outline' onClick={() => setIsOpen(false)}>
						Cancel
					</Button>
				</ModalFooterChild>
				<ModalFooterChild>
					<Button
						variant='solid'
						color='red'
						isLoading={leaveWorkspace.isPending}
						onClick={handleLeave}>
						Leave Workspace
					</Button>
				</ModalFooterChild>
			</ModalFooter>
		</Modal>
	);
};

export default LeaveModal;
