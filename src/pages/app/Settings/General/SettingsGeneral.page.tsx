import { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Container from '@/components/layout/Container';
import Card, { CardBody, CardHeader, CardHeaderChild, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/form/Input';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import Icon from '@/components/icon/Icon';
import Badge from '@/components/ui/Badge';
import { useWorkspace } from '@/context/workspaceContext';
import { useFetchWorkspaceById, useUpdateWorkspace } from '@/api/hooks/useWorkspaces';
import { useFetchWorkspaceSettings, useUpdateWorkspaceSettings } from '@/api/hooks/useTeam';

const workspaceSchema = Yup.object({
	name: Yup.string().min(1).max(100).required('Name is required'),
});

const settingsSchema = Yup.object({
	timezone: Yup.string().required('Timezone is required'),
	default_workflow_timeout: Yup.number().min(60).max(86400).required('Timeout is required'),
});

const TIMEZONES = [
	'UTC',
	'America/New_York',
	'America/Chicago',
	'America/Denver',
	'America/Los_Angeles',
	'Europe/London',
	'Europe/Paris',
	'Europe/Berlin',
	'Asia/Tokyo',
	'Asia/Shanghai',
	'Asia/Kolkata',
	'Australia/Sydney',
];

const SettingsGeneralPage = () => {
	const { currentWorkspace } = useWorkspace();
	const workspaceId = currentWorkspace?.id;

	const { data: workspaceDetail, isLoading: isDetailLoading } = useFetchWorkspaceById(workspaceId ?? '');
	const { data: workspaceSettings, isLoading: isSettingsLoading } = useFetchWorkspaceSettings(workspaceId);

	const updateWorkspace = useUpdateWorkspace();
	const updateSettings = useUpdateWorkspaceSettings();

	const workspaceFormik = useFormik({
		initialValues: {
			name: '',
		},
		validationSchema: workspaceSchema,
		onSubmit: async (values) => {
			if (!workspaceId) return;
			await updateWorkspace.mutateAsync({ id: workspaceId, data: { name: values.name } });
		},
		enableReinitialize: true,
	});

	const settingsFormik = useFormik({
		initialValues: {
			timezone: 'UTC',
			default_workflow_timeout: 3600,
		},
		validationSchema: settingsSchema,
		onSubmit: async (values) => {
			if (!workspaceId) return;
			await updateSettings.mutateAsync({ workspaceId, data: values });
		},
		enableReinitialize: true,
	});

	useEffect(() => {
		if (workspaceDetail) {
			workspaceFormik.setValues({ name: workspaceDetail.name });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [workspaceDetail]);

	useEffect(() => {
		if (workspaceSettings) {
			settingsFormik.setValues({
				timezone: workspaceSettings.timezone || 'UTC',
				default_workflow_timeout: workspaceSettings.default_workflow_timeout || 3600,
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [workspaceSettings]);

	if (!workspaceId) {
		return (
			<Container>
				<div className='flex flex-col items-center justify-center py-32'>
					<Icon icon='Settings02' size='text-7xl' className='text-zinc-300 dark:text-zinc-700' />
					<p className='mt-4 text-lg text-zinc-500'>
						No workspace selected. Please select a workspace first.
					</p>
				</div>
			</Container>
		);
	}

	const isLoading = isDetailLoading || isSettingsLoading;

	if (isLoading) {
		return (
			<Container>
				<div className='flex flex-col items-center justify-center py-32'>
					<div className='h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent' />
					<p className='mt-4 text-zinc-500'>Loading workspace settings...</p>
				</div>
			</Container>
		);
	}

	return (
		<Container>
			<div className='grid grid-cols-12 gap-4'>
				{/* Workspace Info */}
				<div className='col-span-12 lg:col-span-6'>
					<Card>
						<CardHeader>
							<CardHeaderChild>
								<CardTitle
									iconProps={{
										icon: 'Building06',
										color: 'primary',
										size: 'text-3xl',
									}}>
									Workspace Information
								</CardTitle>
							</CardHeaderChild>
						</CardHeader>
						<CardBody>
							<form onSubmit={workspaceFormik.handleSubmit} className='space-y-4'>
								<div>
									<Label htmlFor='name'>Workspace Name</Label>
									<Input
										id='name'
										name='name'
										placeholder='My Workspace'
										value={workspaceFormik.values.name}
										onChange={workspaceFormik.handleChange}
										onBlur={workspaceFormik.handleBlur}
									/>
									{workspaceFormik.touched.name && workspaceFormik.errors.name && (
										<div className='mt-1 text-xs text-red-500'>
											{workspaceFormik.errors.name}
										</div>
									)}
								</div>
								<div>
									<Label htmlFor='slug'>Slug</Label>
									<Input
										id='slug'
										name='slug'
										value={currentWorkspace?.slug ?? ''}
										disabled
									/>
									<p className='mt-1 text-xs text-zinc-500'>
										The workspace slug cannot be changed after creation.
									</p>
								</div>
								{workspaceDetail && (
									<div className='flex flex-wrap gap-3'>
										<Badge variant='outline' color='primary' className='gap-1.5'>
											<Icon icon='UserMultiple' size='text-sm' />
											{workspaceDetail.members_count ?? 0} Members
										</Badge>
										<Badge variant='outline' color='violet' className='gap-1.5'>
											<Icon icon='FlowConnection' size='text-sm' />
											{workspaceDetail.workflows_count ?? 0} Workflows
										</Badge>
									</div>
								)}
								<div className='flex justify-end border-t border-zinc-200 pt-4 dark:border-zinc-700'>
									<Button
										variant='solid'
										type='submit'
										icon='FloppyDisk'
										isLoading={updateWorkspace.isPending}
										isDisable={!workspaceFormik.dirty || !workspaceFormik.isValid}>
										Save Changes
									</Button>
								</div>
							</form>
						</CardBody>
					</Card>
				</div>

				{/* Workspace Settings */}
				<div className='col-span-12 lg:col-span-6'>
					<Card>
						<CardHeader>
							<CardHeaderChild>
								<CardTitle
									iconProps={{
										icon: 'Settings02',
										color: 'primary',
										size: 'text-3xl',
									}}>
									Workspace Settings
								</CardTitle>
							</CardHeaderChild>
						</CardHeader>
						<CardBody>
							<form onSubmit={settingsFormik.handleSubmit} className='space-y-4'>
								<div>
									<Label htmlFor='timezone'>Timezone</Label>
									<Select
										id='timezone'
										name='timezone'
										value={settingsFormik.values.timezone}
										onChange={settingsFormik.handleChange}
										onBlur={settingsFormik.handleBlur}>
										{TIMEZONES.map((tz) => (
											<option key={tz} value={tz}>
												{tz}
											</option>
										))}
									</Select>
									{settingsFormik.touched.timezone && settingsFormik.errors.timezone && (
										<div className='mt-1 text-xs text-red-500'>
											{settingsFormik.errors.timezone}
										</div>
									)}
								</div>
								<div>
									<Label htmlFor='default_workflow_timeout'>
										Default Workflow Timeout (seconds)
									</Label>
									<Input
										id='default_workflow_timeout'
										name='default_workflow_timeout'
										type='number'
										value={settingsFormik.values.default_workflow_timeout}
										onChange={settingsFormik.handleChange}
										onBlur={settingsFormik.handleBlur}
									/>
									{settingsFormik.touched.default_workflow_timeout &&
										settingsFormik.errors.default_workflow_timeout && (
											<div className='mt-1 text-xs text-red-500'>
												{settingsFormik.errors.default_workflow_timeout}
											</div>
										)}
									<p className='mt-1 text-xs text-zinc-500'>
										Min: 60s (1 min), Max: 86400s (24 hours)
									</p>
								</div>
								<div className='flex justify-end border-t border-zinc-200 pt-4 dark:border-zinc-700'>
									<Button
										variant='solid'
										type='submit'
										icon='FloppyDisk'
										isLoading={updateSettings.isPending}
										isDisable={!settingsFormik.dirty || !settingsFormik.isValid}>
										Save Settings
									</Button>
								</div>
							</form>
						</CardBody>
					</Card>
				</div>

				{/* Danger Zone */}
				<div className='col-span-12'>
					<Card>
						<CardHeader>
							<CardHeaderChild>
								<CardTitle
									iconProps={{
										icon: 'Alert02',
										color: 'red',
										size: 'text-3xl',
									}}>
									<span className='text-red-600 dark:text-red-400'>
										Danger Zone
									</span>
								</CardTitle>
							</CardHeaderChild>
						</CardHeader>
						<CardBody>
							<div className='rounded-lg border border-red-200 p-4 dark:border-red-900/50'>
								<div className='flex items-center justify-between'>
									<div>
										<p className='font-semibold text-zinc-900 dark:text-white'>
											Delete this workspace
										</p>
										<p className='mt-1 text-sm text-zinc-500'>
											Once deleted, all workspace data including workflows,
											credentials, and variables will be permanently removed.
										</p>
									</div>
									<Button
										variant='outline'
										color='red'
										icon='Delete02'>
										Delete Workspace
									</Button>
								</div>
							</div>
						</CardBody>
					</Card>
				</div>
			</div>
		</Container>
	);
};

export default SettingsGeneralPage;
