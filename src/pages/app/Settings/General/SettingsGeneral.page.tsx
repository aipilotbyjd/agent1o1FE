import { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Card, { CardBody, CardHeader, CardHeaderChild, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/form/Input';
import Label from '@/components/form/Label';
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
			<div className='flex items-center justify-center py-20'>
				<p className='text-zinc-500'>No workspace selected. Please select a workspace first.</p>
			</div>
		);
	}

	const isLoading = isDetailLoading || isSettingsLoading;

	if (isLoading) {
		return (
			<div className='flex items-center justify-center py-20'>
				<p className='text-zinc-500'>Loading workspace settings...</p>
			</div>
		);
	}

	return (
		<div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
			{/* Workspace Info */}
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
							<div className='flex gap-4 text-sm text-zinc-500'>
								<span>Members: {workspaceDetail.members_count}</span>
								<span>Workflows: {workspaceDetail.workflows_count}</span>
							</div>
						)}
						<Button
							variant='solid'
							type='submit'
							isLoading={updateWorkspace.isPending}
							isDisable={!workspaceFormik.dirty || !workspaceFormik.isValid}>
							Save Changes
						</Button>
					</form>
				</CardBody>
			</Card>

			{/* Workspace Settings */}
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
							<select
								id='timezone'
								name='timezone'
								className='w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-zinc-600'
								value={settingsFormik.values.timezone}
								onChange={settingsFormik.handleChange}
								onBlur={settingsFormik.handleBlur}>
								{TIMEZONES.map((tz) => (
									<option key={tz} value={tz}>
										{tz}
									</option>
								))}
							</select>
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
						<Button
							variant='solid'
							type='submit'
							isLoading={updateSettings.isPending}
							isDisable={!settingsFormik.dirty || !settingsFormik.isValid}>
							Save Settings
						</Button>
					</form>
				</CardBody>
			</Card>
		</div>
	);
};

export default SettingsGeneralPage;
