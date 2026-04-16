import { FC, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Modal, { ModalBody, ModalFooter, ModalHeader } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/form/Input';
import Label from '@/components/form/Label';
import Textarea from '@/components/form/Textarea';
import Select from '@/components/form/Select';
import Checkbox from '@/components/form/Checkbox';
import Icon from '@/components/icon/Icon';
import type { TAgent } from '@/types/agent.type';

const agentSchema = Yup.object({
	name: Yup.string().min(1).max(100).required('Agent name is required'),
	description: Yup.string().max(500),
	model: Yup.string().required('Model is required'),
	system_prompt: Yup.string().required('System prompt is required'),
	temperature: Yup.number().min(0).max(2).required('Temperature is required'),
	max_tokens: Yup.number().min(1).max(100000),
	is_active: Yup.boolean(),
});

interface IAgentModalPartialProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (values: Partial<TAgent>) => Promise<void>;
	isLoading?: boolean;
	agent?: TAgent | null;
}

const AI_MODELS = [
	{ value: 'gpt-4o', label: 'GPT-4o (OpenAI)' },
	{ value: 'gpt-4o-mini', label: 'GPT-4o Mini (OpenAI)' },
	{ value: 'gpt-4-turbo', label: 'GPT-4 Turbo (OpenAI)' },
	{ value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet (Anthropic)' },
	{ value: 'claude-3-opus', label: 'Claude 3 Opus (Anthropic)' },
	{ value: 'claude-3-haiku', label: 'Claude 3 Haiku (Anthropic)' },
	{ value: 'gemini-pro', label: 'Gemini Pro (Google)' },
	{ value: 'gemini-flash', label: 'Gemini Flash (Google)' },
];

const AgentModalPartial: FC<IAgentModalPartialProps> = ({
	isOpen,
	onClose,
	onSubmit,
	isLoading,
	agent,
}) => {
	const isEditing = !!agent;

	const formik = useFormik({
		initialValues: {
			name: agent?.name || '',
			description: agent?.description || '',
			model: agent?.model || 'gpt-4o',
			system_prompt:
				agent?.system_prompt ||
				'You are a helpful AI assistant. Be concise, accurate, and friendly.',
			temperature: agent?.temperature ?? 0.7,
			max_tokens: agent?.max_tokens || 1000,
			is_active: agent?.is_active ?? true,
		},
		validationSchema: agentSchema,
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

	return (
		<Modal isOpen={isOpen} setIsOpen={handleClose} size='lg'>
			<ModalHeader>
				<div className='flex items-center gap-3'>
					<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30'>
						<Icon icon='Bot' color='primary' size='text-xl' />
					</div>
					<span>{isEditing ? 'Edit Agent' : 'Create New Agent'}</span>
				</div>
			</ModalHeader>
			<ModalBody>
				<form onSubmit={formik.handleSubmit} className='space-y-6'>
					{/* Agent Name */}
					<div>
						<Label htmlFor='name'>Agent Name *</Label>
						<Input
							id='name'
							name='name'
							placeholder='e.g., Customer Support Bot'
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
							placeholder='Describe what this agent does...'
							value={formik.values.description}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							rows={2}
						/>
						{formik.touched.description && formik.errors.description && (
							<p className='mt-1 text-sm text-red-500'>
								{formik.errors.description}
							</p>
						)}
					</div>

					{/* AI Model */}
					<div>
						<Label htmlFor='model'>AI Model *</Label>
						<Select
							id='model'
							name='model'
							value={formik.values.model}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}>
							{AI_MODELS.map((model) => (
								<option key={model.value} value={model.value}>
									{model.label}
								</option>
							))}
						</Select>
						{formik.touched.model && formik.errors.model && (
							<p className='mt-1 text-sm text-red-500'>{formik.errors.model}</p>
						)}
					</div>

					{/* System Prompt */}
					<div>
						<Label htmlFor='system_prompt'>System Prompt *</Label>
						<Textarea
							id='system_prompt'
							name='system_prompt'
							placeholder='Define the agent personality and behavior...'
							value={formik.values.system_prompt}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							rows={4}
						/>
						{formik.touched.system_prompt && formik.errors.system_prompt && (
							<p className='mt-1 text-sm text-red-500'>
								{formik.errors.system_prompt}
							</p>
						)}
						<p className='mt-1 text-xs text-zinc-500'>
							This defines how your agent behaves and responds
						</p>
					</div>

					{/* Advanced Settings */}
					<div className='rounded-lg border border-zinc-200 p-4 dark:border-zinc-700'>
						<h4 className='mb-4 font-semibold text-zinc-900 dark:text-white'>
							Advanced Settings
						</h4>

						<div className='space-y-4'>
							{/* Temperature */}
							<div>
								<Label htmlFor='temperature'>
									Temperature: {formik.values.temperature}
								</Label>
								<input
									type='range'
									id='temperature'
									name='temperature'
									min='0'
									max='2'
									step='0.1'
									value={formik.values.temperature}
									onChange={formik.handleChange}
									className='w-full'
								/>
								<div className='mt-1 flex justify-between text-xs text-zinc-500'>
									<span>Precise (0)</span>
									<span>Balanced (1)</span>
									<span>Creative (2)</span>
								</div>
								{formik.touched.temperature && formik.errors.temperature && (
									<p className='mt-1 text-sm text-red-500'>
										{formik.errors.temperature}
									</p>
								)}
							</div>

							{/* Max Tokens */}
							<div>
								<Label htmlFor='max_tokens'>Max Tokens</Label>
								<Input
									type='number'
									id='max_tokens'
									name='max_tokens'
									placeholder='1000'
									value={formik.values.max_tokens}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
								/>
								{formik.touched.max_tokens && formik.errors.max_tokens && (
									<p className='mt-1 text-sm text-red-500'>
										{formik.errors.max_tokens}
									</p>
								)}
								<p className='mt-1 text-xs text-zinc-500'>
									Maximum length of the response
								</p>
							</div>
						</div>
					</div>

					{/* Active Status */}
					<div className='flex items-center gap-2'>
						<Checkbox
							id='is_active'
							name='is_active'
							checked={formik.values.is_active}
							onChange={formik.handleChange}
						/>
						<Label htmlFor='is_active' className='mb-0 cursor-pointer'>
							Activate agent immediately
						</Label>
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
					{isEditing ? 'Update Agent' : 'Create Agent'}
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default AgentModalPartial;
