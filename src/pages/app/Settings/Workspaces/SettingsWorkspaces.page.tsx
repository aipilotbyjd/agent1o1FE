import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Subheader, {
	SubheaderLeft,
	SubheaderRight,
} from '@/components/layout/Subheader';
import Button from '@/components/ui/Button';
import Input from '@/components/form/Input';
import Label from '@/components/form/Label';
import Badge from '@/components/ui/Badge';
import Icon from '@/components/icon/Icon';
import Modal, { ModalBody, ModalFooter, ModalFooterChild, ModalHeader } from '@/components/ui/Modal';
import { useWorkspace } from '@/context/workspaceContext';
import {
	useFetchWorkspaces,
	useCreateWorkspace,
	useDeleteWorkspace,
} from '@/api/hooks/useWorkspaces';
import { ROLE_COLORS } from '../Teams/_helper/helper';
import type { TWorkspace, TWorkspaceRole } from '@/types/workspace.type';

const createSchema = Yup.object({
	name: Yup.string().min(1).max(100).required('Name is required'),
	slug: Yup.string()
		.min(1)
		.max(50)
		.matches(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens')
		.required('Slug is required'),
});

const SettingsWorkspacesPage = () => {
	const { currentWorkspace, switchWorkspace } = useWorkspace();
	const { data: workspaces = [], isLoading } = useFetchWorkspaces();
	const createWorkspace = useCreateWorkspace();
	const deleteWorkspace = useDeleteWorkspace();

	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState<TWorkspace | null>(null);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);

	const createFormik = useFormik({
		initialValues: { name: '', slug: '' },
		validationSchema: createSchema,
		onSubmit: async (values, { resetForm }) => {
			await createWorkspace.mutateAsync(values);
			resetForm();
			setIsCreateOpen(false);
		},
	});

	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		createFormik.handleChange(e);
		if (!createFormik.touched.slug) {
			const slug = e.target.value
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/^-|-$/g, '');
			createFormik.setFieldValue('slug', slug);
		}
	};

	const handleDelete = async () => {
		if (!deleteTarget) return;
		await deleteWorkspace.mutateAsync(deleteTarget.id);
		setIsDeleteOpen(false);
		setDeleteTarget(null);
	};

	if (isLoading) {
		return (
			<div className='flex items-center justify-center py-20'>
				<p className='text-zinc-500'>Loading workspaces...</p>
			</div>
		);
	}

	return (
		<>
			<Subheader>
				<SubheaderLeft>
					<div className='flex items-center gap-3'>
						<Icon icon='DashboardSquare03' color='primary' size='text-2xl' />
						<span className='font-semibold'>Workspaces</span>
						<Badge variant='solid' color='zinc'>
							{workspaces.length}
						</Badge>
					</div>
				</SubheaderLeft>
				<SubheaderRight>
					<Button
						variant='soft'
						icon='Add01'
						onClick={() => setIsCreateOpen(true)}>
						New Workspace
					</Button>
				</SubheaderRight>
			</Subheader>
			<div className='mx-auto w-full bg-white px-2 pt-4 pb-2 dark:bg-zinc-950'>
				{workspaces.length === 0 ? (
					<div className='flex flex-col items-center justify-center py-10'>
						<Icon
							icon='DashboardSquare03'
							size='text-5xl'
							color='zinc'
						/>
						<p className='mt-4 text-zinc-500'>No workspaces yet.</p>
						<Button
							variant='outline'
							dimension='sm'
							icon='Add01'
							className='mt-2'
							onClick={() => setIsCreateOpen(true)}>
							Create Your First Workspace
						</Button>
					</div>
				) : (
					<div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
						{workspaces.map((ws) => {
							const isCurrent = ws.id === currentWorkspace?.id;
							return (
								<div
									key={ws.id}
									className={`group relative rounded-xl border p-4 transition-all ${
										isCurrent
											? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/20'
											: 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600'
									}`}>
									{isCurrent && (
										<Badge
											variant='solid'
											color='primary'
											className='absolute right-3 top-3'>
											Current
										</Badge>
									)}
									<div className='mb-3 flex items-center gap-3'>
										<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30'>
											<Icon
												icon='DashboardSquare03'
												color='primary'
												size='text-xl'
											/>
										</div>
										<div>
											<div className='font-semibold text-zinc-900 dark:text-white'>
												{ws.name}
											</div>
											<div className='text-xs text-zinc-500'>
												/{ws.slug}
											</div>
										</div>
									</div>
									<div className='mb-3 flex items-center gap-2'>
										<Badge
											variant='outline'
											color={
												(ws.role && ROLE_COLORS[ws.role]) ||
												ROLE_COLORS['viewer' as TWorkspaceRole]
											}>
											{ws.role
												? ws.role.charAt(0).toUpperCase() + ws.role.slice(1)
												: 'Member'}
										</Badge>
										<span className='text-xs text-zinc-400'>
											Created{' '}
											{new Date(ws.created_at).toLocaleDateString()}
										</span>
									</div>
									<div className='flex gap-2'>
										{!isCurrent && (
											<Button
												variant='outline'
												dimension='sm'
												icon='ArrowRight01'
												onClick={() => switchWorkspace(ws.id)}>
												Switch
											</Button>
										)}
										{ws.role === 'owner' && (
											<Button
												variant='outline'
												dimension='sm'
												color='red'
												icon='Delete02'
												onClick={() => {
												setDeleteTarget(ws);
												setIsDeleteOpen(true);
											}}>
												Delete
											</Button>
										)}
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>

			{/* Create Workspace Modal */}
			<Modal isOpen={isCreateOpen} setIsOpen={setIsCreateOpen}>
				<ModalHeader setIsOpen={setIsCreateOpen}>Create Workspace</ModalHeader>
				<ModalBody>
					<form
						id='create-workspace-form'
						onSubmit={createFormik.handleSubmit}
						className='space-y-4'>
						<div>
							<Label htmlFor='ws-name'>Workspace Name</Label>
							<Input
								id='ws-name'
								name='name'
								placeholder='My New Workspace'
								value={createFormik.values.name}
								onChange={handleNameChange}
								onBlur={createFormik.handleBlur}
							/>
							{createFormik.touched.name && createFormik.errors.name && (
								<div className='mt-1 text-xs text-red-500'>
									{createFormik.errors.name}
								</div>
							)}
						</div>
						<div>
							<Label htmlFor='ws-slug'>Slug</Label>
							<Input
								id='ws-slug'
								name='slug'
								placeholder='my-new-workspace'
								value={createFormik.values.slug}
								onChange={createFormik.handleChange}
								onBlur={createFormik.handleBlur}
							/>
							{createFormik.touched.slug && createFormik.errors.slug && (
								<div className='mt-1 text-xs text-red-500'>
									{createFormik.errors.slug}
								</div>
							)}
							<p className='mt-1 text-xs text-zinc-500'>
								Used in URLs. Only lowercase letters, numbers, and hyphens.
							</p>
						</div>
					</form>
				</ModalBody>
				<ModalFooter>
					<ModalFooterChild>
						<Button variant='outline' onClick={() => setIsCreateOpen(false)}>
							Cancel
						</Button>
					</ModalFooterChild>
					<ModalFooterChild>
						<Button
							variant='solid'
							type='submit'
							form='create-workspace-form'
							isLoading={createWorkspace.isPending}
							isDisable={!createFormik.isValid || !createFormik.dirty}>
							Create Workspace
						</Button>
					</ModalFooterChild>
				</ModalFooter>
			</Modal>

			{/* Delete Workspace Confirmation */}
			<Modal isOpen={isDeleteOpen} setIsOpen={setIsDeleteOpen}>
				<ModalHeader setIsOpen={setIsDeleteOpen}>
					Delete Workspace
				</ModalHeader>
				<ModalBody>
					<div className='flex flex-col items-center gap-4 py-4'>
						<div className='flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20'>
							<Icon icon='Delete02' color='red' size='text-2xl' />
						</div>
						<div className='text-center'>
							<p className='text-lg font-semibold'>
								Delete &quot;{deleteTarget?.name}&quot;?
							</p>
							<p className='mt-2 text-sm text-zinc-500'>
								This will permanently delete the workspace and all its data
								including workflows, credentials, and variables. This action
								cannot be undone.
							</p>
						</div>
					</div>
				</ModalBody>
				<ModalFooter>
					<ModalFooterChild>
						<Button variant='outline' onClick={() => setIsDeleteOpen(false)}>
							Cancel
						</Button>
					</ModalFooterChild>
					<ModalFooterChild>
						<Button
							variant='solid'
							color='red'
							isLoading={deleteWorkspace.isPending}
							onClick={handleDelete}>
							Delete Workspace
						</Button>
					</ModalFooterChild>
				</ModalFooter>
			</Modal>
		</>
	);
};

export default SettingsWorkspacesPage;
