import { FC, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Modal, { ModalBody, ModalFooter, ModalHeader } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/form/Input';
import Label from '@/components/form/Label';
import Textarea from '@/components/form/Textarea';
import Select from '@/components/form/Select';
import Icon from '@/components/icon/Icon';
import type { TAgentSkill } from '@/types/agent.type';

const skillSchema = Yup.object({
	name: Yup.string().min(1).max(100).required('Skill name is required'),
	description: Yup.string().max(500),
	type: Yup.string()
		.oneOf(['api_call', 'vector_search', 'workflow', 'script'])
		.required('Skill type is required'),
	config: Yup.object(),
});

interface ISkillModalPartialProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (values: Partial<TAgentSkill>) => Promise<void>;
	isLoading?: boolean;
	skill?: TAgentSkill | null;
}

const SKILL_TYPES = [
	{
		value: 'api_call',
		label: 'API Call',
		icon: 'Link01',
		color: 'blue',
		description: 'Call external APIs and services',
	},
	{
		value: 'vector_search',
		label: 'Vector Search',
		icon: 'Search01',
		color: 'violet',
		description: 'RAG-based knowledge retrieval',
	},
	{
		value: 'workflow',
		label: 'Workflow',
		icon: 'GitMerge',
		color: 'emerald',
		description: 'Trigger existing workflows',
	},
	{
		value: 'script',
		label: 'Script',
		icon: 'Code',
		color: 'amber',
		description: 'Execute custom code',
	},
];

const SkillModalPartial: FC<ISkillModalPartialProps> = ({
	isOpen,
	onClose,
	onSubmit,
	isLoading,
	skill,
}) => {
	const isEditing = !!skill;

	const formik = useFormik({
		initialValues: {
			name: skill?.name || '',
			description: skill?.description || '',
			type: skill?.type || 'api_call',
			config: skill?.config || {},
		},
		validationSchema: skillSchema,
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

	const handleClose = () => {
		formik.resetForm();
		onClose();
	};

	const selectedSkillType = SKILL_TYPES.find((t) => t.value === formik.values.type);

	return (
		<Modal isOpen={isOpen} setIsOpen={handleClose} size='lg'>
			<ModalHeader>
				<div className='flex items-center gap-3'>
					<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30'>
						<Icon icon='Tools' color='violet' size='text-xl' />
					</div>
					<span>{isEditing ? 'Edit Skill' : 'Create New Skill'}</span>
				</div>
			</ModalHeader>
			<ModalBody>
				<form onSubmit={formik.handleSubmit} className='space-y-6'>
					{/* Skill Type Selection */}
					<div>
						<Label htmlFor='type'>Skill Type *</Label>
						<div className='mt-2 grid grid-cols-2 gap-3'>
							{SKILL_TYPES.map((type) => (
								<button
									key={type.value}
									type='button'
									className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-all ${
										formik.values.type === type.value
											? `border-${type.color}-500 bg-${type.color}-50 dark:bg-${type.color}-900/20`
											: 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700'
									}`}
									onClick={() => formik.setFieldValue('type', type.value)}>
									<div
										className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-${type.color}-100 dark:bg-${type.color}-900/30`}>
										<Icon
											icon={type.icon}
											color={type.color as any}
											size='text-xl'
										/>
									</div>
									<div>
										<div className='font-semibold text-zinc-900 dark:text-white'>
											{type.label}
										</div>
										<div className='text-xs text-zinc-500'>
											{type.description}
										</div>
									</div>
								</button>
							))}
						</div>
						{formik.touched.type && formik.errors.type && (
							<p className='mt-1 text-sm text-red-500'>{formik.errors.type}</p>
						)}
					</div>

					{/* Skill Name */}
					<div>
						<Label htmlFor='name'>Skill Name *</Label>
						<Input
							id='name'
							name='name'
							placeholder='e.g., Order Status Lookup'
							value={formik.values.name}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
						/>
						{formik.touched.name && formik.errors.name && (
							<p className='mt-1 text-sm text-red-500'>{formik.errors.name}</p>
						)}
					</div>

					{/* Description */}
					<div>
						<Label htmlFor='description'>Description</Label>
						<Textarea
							id='description'
							name='description'
							placeholder='Describe what this skill does...'
							value={formik.values.description}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							rows={3}
						/>
						{formik.touched.description && formik.errors.description && (
							<p className='mt-1 text-sm text-red-500'>
								{formik.errors.description}
							</p>
						)}
					</div>

					{/* Configuration Section */}
					<div className='rounded-lg border border-zinc-200 p-4 dark:border-zinc-700'>
						<div className='mb-3 flex items-center gap-2'>
							<Icon
								icon={selectedSkillType?.icon || 'Settings02'}
								color={selectedSkillType?.color as any}
							/>
							<h4 className='font-semibold text-zinc-900 dark:text-white'>
								{selectedSkillType?.label} Configuration
							</h4>
						</div>

						{/* API Call Config */}
						{formik.values.type === 'api_call' && (
							<div className='space-y-4'>
								<div>
									<Label htmlFor='endpoint'>API Endpoint</Label>
									<Input
										id='endpoint'
										name='endpoint'
										placeholder='https://api.example.com/endpoint'
										value={formik.values.config.endpoint || ''}
										onChange={(e) =>
											formik.setFieldValue('config.endpoint', e.target.value)
										}
									/>
								</div>
								<div>
									<Label htmlFor='method'>HTTP Method</Label>
									<Select
										id='method'
										name='method'
										value={formik.values.config.method || 'GET'}
										onChange={(e) =>
											formik.setFieldValue('config.method', e.target.value)
										}>
										<option value='GET'>GET</option>
										<option value='POST'>POST</option>
										<option value='PUT'>PUT</option>
										<option value='DELETE'>DELETE</option>
										<option value='PATCH'>PATCH</option>
									</Select>
								</div>
							</div>
						)}

						{/* Vector Search Config */}
						{formik.values.type === 'vector_search' && (
							<div className='space-y-4'>
								<div>
									<Label htmlFor='collection'>Collection Name</Label>
									<Input
										id='collection'
										name='collection'
										placeholder='knowledge-base'
										value={formik.values.config.collection || ''}
										onChange={(e) =>
											formik.setFieldValue(
												'config.collection',
												e.target.value,
											)
										}
									/>
								</div>
								<div>
									<Label htmlFor='top_k'>Top K Results</Label>
									<Input
										type='number'
										id='top_k'
										name='top_k'
										placeholder='5'
										value={formik.values.config.top_k || 5}
										onChange={(e) =>
											formik.setFieldValue('config.top_k', e.target.value)
										}
									/>
								</div>
							</div>
						)}

						{/* Workflow Config */}
						{formik.values.type === 'workflow' && (
							<div className='space-y-4'>
								<div>
									<Label htmlFor='workflow_id'>Workflow ID</Label>
									<Input
										id='workflow_id'
										name='workflow_id'
										placeholder='workflow-uuid'
										value={formik.values.config.workflow_id || ''}
										onChange={(e) =>
											formik.setFieldValue(
												'config.workflow_id',
												e.target.value,
											)
										}
									/>
								</div>
							</div>
						)}

						{/* Script Config */}
						{formik.values.type === 'script' && (
							<div className='space-y-4'>
								<div>
									<Label htmlFor='language'>Language</Label>
									<Select
										id='language'
										name='language'
										value={formik.values.config.language || 'python'}
										onChange={(e) =>
											formik.setFieldValue('config.language', e.target.value)
										}>
										<option value='python'>Python</option>
										<option value='javascript'>JavaScript</option>
										<option value='bash'>Bash</option>
									</Select>
								</div>
								<div>
									<Label htmlFor='code'>Code</Label>
									<Textarea
										id='code'
										name='code'
										placeholder='# Your code here'
										value={formik.values.config.code || ''}
										onChange={(e) =>
											formik.setFieldValue('config.code', e.target.value)
										}
										rows={6}
										className='font-mono text-sm'
									/>
								</div>
							</div>
						)}
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
					{isEditing ? 'Update Skill' : 'Create Skill'}
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default SkillModalPartial;
