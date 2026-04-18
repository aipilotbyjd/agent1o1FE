import { FC, useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Modal, { ModalBody, ModalFooter, ModalHeader } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/form/Input';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import Icon from '@/components/icon/Icon';
import type { TWebhook } from '@/types/webhook.type';

const webhookSchema = Yup.object({
	name: Yup.string().min(1).max(100).required('Webhook name is required'),
	path: Yup.string()
		.matches(/^[a-z0-9-_/]+$/, 'Only lowercase letters, numbers, hyphens, underscores, and slashes')
		.required('Path is required'),
	method: Yup.string().oneOf(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).required(),
	workflow_id: Yup.string().required('Workflow is required'),
	authentication: Yup.string().oneOf(['none', 'basic', 'header', 'query']).required(),
	response_mode: Yup.string().oneOf(['first_node', 'last_node', 'all_nodes']).required(),
	timeout: Yup.number().min(1).max(300).required(),
});

interface IWebhookModalPartialProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (values: Partial<TWebhook>) => Promise<void>;
	isLoading?: boolean;
	webhook?: TWebhook | null;
	workflows?: Array<{ id: string; name: string }>;
}

const WebhookModalPartial: FC<IWebhookModalPartialProps> = ({
	isOpen,
	onClose,
	onSubmit,
	isLoading,
	webhook,
	workflows = [],
}) => {
	const isEditing = !!webhook;
	const [generatedUrl, setGeneratedUrl] = useState('');

	const formik = useFormik({
		initialValues: {
			name: webhook?.name || '',
			path: webhook?.path || '',
			method: webhook?.method || 'POST',
			workflow_id: webhook?.workflow_id || '',
			authentication: webhook?.authentication || 'none',
			response_mode: webhook?.response_mode || 'last_node',
			timeout: webhook?.timeout || 30,
		},
		validationSchema: webhookSchema,
		enableReinitialize: true,
		onSubmit: async (values, { resetForm }) => {
			try {
				await onSubmit(values);
				resetForm();
			} catch {
				// Error handled by parent
			}
		},
	});

	useEffect(() => {
		if (!isOpen) {
			formik.resetForm();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen]);

	useEffect(() => {
		if (formik.values.path) {
			const baseUrl = window.location.origin;
			setGeneratedUrl(`${baseUrl}/webhook/${formik.values.path}`);
		}
	}, [formik.values.path]);

	const handleClose = () => {
		formik.resetForm();
		onClose();
	};

	return (
		<Modal isOpen={isOpen} setIsOpen={handleClose} size='lg'>
			<ModalHeader>
				<div className='flex items-center gap-3'>
					<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30'>
						<Icon icon='Webhook' color='blue' size='text-xl' />
					</div>
					<span>{isEditing ? 'Edit Webhook' : 'Create New Webhook'}</span>
				</div>
			</ModalHeader>
			<ModalBody>
				<form onSubmit={formik.handleSubmit} className='space-y-6'>
					{/* Webhook Name */}
					<div>
						<Label htmlFor='name'>Webhook Name *</Label>
						<Input
							id='name'
							name='name'
							placeholder='e.g., Order Created Webhook'
							value={formik.values.name}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
						/>
						{formik.touched.name && formik.errors.name && (
							<p className='mt-1 text-sm text-red-500'>{formik.errors.name}</p>
						)}
					</div>

					{/* Path */}
					<div>
						<Label htmlFor='path'>Webhook Path *</Label>
						<Input
							id='path'
							name='path'
							placeholder='order-created'
							value={formik.values.path}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
						/>
						{formik.touched.path && formik.errors.path && (
							<p className='mt-1 text-sm text-red-500'>{formik.errors.path}</p>
						)}
						{generatedUrl && (
							<div className='mt-2 rounded-lg bg-zinc-100 p-2 dark:bg-zinc-800'>
								<p className='text-xs text-zinc-500'>Generated URL:</p>
								<p className='break-all text-sm font-mono text-zinc-700 dark:text-zinc-300'>
									{generatedUrl}
								</p>
							</div>
						)}
					</div>

					{/* Method & Workflow */}
					<div className='grid grid-cols-2 gap-4'>
						<div>
							<Label htmlFor='method'>HTTP Method *</Label>
							<Select
								id='method'
								name='method'
								value={formik.values.method}
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}>
								<option value='GET'>GET</option>
								<option value='POST'>POST</option>
								<option value='PUT'>PUT</option>
								<option value='DELETE'>DELETE</option>
								<option value='PATCH'>PATCH</option>
							</Select>
						</div>

						<div>
							<Label htmlFor='workflow_id'>Workflow *</Label>
							<Select
								id='workflow_id'
								name='workflow_id'
								value={formik.values.workflow_id}
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}>
								<option value=''>Select workflow</option>
								{workflows.map((wf) => (
									<option key={wf.id} value={wf.id}>
										{wf.name}
									</option>
								))}
							</Select>
							{formik.touched.workflow_id && formik.errors.workflow_id && (
								<p className='mt-1 text-sm text-red-500'>
									{formik.errors.workflow_id}
								</p>
							)}
						</div>
					</div>

					{/* Authentication */}
					<div>
						<Label htmlFor='authentication'>Authentication</Label>
						<Select
							id='authentication'
							name='authentication'
							value={formik.values.authentication}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}>
							<option value='none'>None</option>
							<option value='basic'>Basic Auth</option>
							<option value='header'>Header Auth</option>
							<option value='query'>Query Parameter</option>
						</Select>
					</div>

					{/* Response Mode & Timeout */}
					<div className='grid grid-cols-2 gap-4'>
						<div>
							<Label htmlFor='response_mode'>Response Mode</Label>
							<Select
								id='response_mode'
								name='response_mode'
								value={formik.values.response_mode}
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}>
								<option value='first_node'>First Node</option>
								<option value='last_node'>Last Node</option>
								<option value='all_nodes'>All Nodes</option>
							</Select>
						</div>

						<div>
							<Label htmlFor='timeout'>Timeout (seconds)</Label>
							<Input
								type='number'
								id='timeout'
								name='timeout'
								min='1'
								max='300'
								value={formik.values.timeout}
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
							/>
						</div>
					</div>
				</form>
			</ModalBody>
			<ModalFooter>
				<Button variant='outline' onClick={handleClose} isDisable={isLoading}>
					Cancel
				</Button>
				<Button
					variant='solid'
					onClick={() => formik.handleSubmit()}
					isLoading={isLoading}
					isDisable={!formik.isValid || !formik.dirty}>
					{isEditing ? 'Update Webhook' : 'Create Webhook'}
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default WebhookModalPartial;
