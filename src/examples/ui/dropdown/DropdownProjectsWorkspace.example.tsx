import Dropdown, {
	DropdownDivider,
	DropdownItem,
	DropdownMenu,
	DropdownToggle,
} from '@/components/ui/Dropdown';
import Button from '@/components/ui/Button';
import Icon from '@/components/icon/Icon';
import Avatar from '@/components/ui/Avatar';
import { useNavigate } from 'react-router';
import { useWorkspace } from '@/context/workspaceContext';

const DropdownProjectsWorkspaceExample = () => {
	const { currentWorkspace, workspaces, switchWorkspace } = useWorkspace();
	const navigate = useNavigate();

	return (
		<Dropdown>
			<DropdownToggle hasIcon={false}>
				<Button aria-label='Workspace' variant='outline' className='!px-3'>
					<Avatar
						name={currentWorkspace?.name || 'W'}
						rounded='rounded-lg'
						color='primary'
						size='w-6'
						className='me-2'
					/>
					<span className='max-w-[120px] truncate'>
						{currentWorkspace?.name || 'Workspace'}
					</span>
					<Icon icon='ArrowDown01' className='ms-1' />
				</Button>
			</DropdownToggle>
			<DropdownMenu className='min-w-xs'>
				<div className='px-1 py-1.5 text-xs font-medium text-zinc-400'>
					Workspaces ({workspaces.length})
				</div>
				{workspaces.map((ws) => (
					<DropdownItem
						key={ws.id}
						className='gap-2'
						onClick={() => switchWorkspace(ws.id)}>
						<Avatar
							name={ws.name}
							rounded='rounded-lg'
							color={ws.id === currentWorkspace?.id ? 'primary' : 'zinc'}
							size='w-8'
						/>
						<div className='flex flex-1 flex-col'>
							<div className='font-medium'>{ws.name}</div>
						</div>
						{ws.id === currentWorkspace?.id && (
							<Icon icon='Tick02' size='text-xl' className='ms-auto text-primary-500' />
						)}
					</DropdownItem>
				))}
				<DropdownDivider />
				<DropdownItem icon='PlusSignCircle' onClick={() => navigate('/app/settings/workspaces')}>
					Add new workspace
				</DropdownItem>
				<DropdownDivider />
				<DropdownItem icon='Settings02' onClick={() => navigate('/app/settings/workspaces')}>
					Manage workspaces
				</DropdownItem>
			</DropdownMenu>
		</Dropdown>
	);
};

export default DropdownProjectsWorkspaceExample;
