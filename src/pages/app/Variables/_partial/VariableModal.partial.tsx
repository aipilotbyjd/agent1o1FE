import { FC, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Modal, { ModalBody, ModalFooter, ModalHeader } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Checkbox from '@/components/form/Checkbox';
import Input from '@/components/form/Input';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import Textarea from '@/components/form/Textarea';
import Icon from '@/components/icon/Icon';
import type {
	ICreateVariableDto,
	IUpdateVariableDto,
	IVariable,
	TVariableScope,
} from '@/types/variable.type';

type TVariableFormValues = {
	key: string;
	value: string;
	scope: TVariableScope;
	is_secret: boolean;
	description: string;
};

interface IVariableModalPartialProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (values: ICreateVariableDto | IUpdateVariableDto) => Promise<void>;
	variable?: IVariable | null;
	isLoading?: boolean;
}

const variableSchema = Yup.object({
	key: Yup.string()
		.matches(/^[A-Za-z_][A-Za-z0-9_]*$/, 'Use letters, numbers, and underscores. Start with a letter or underscore.')
		.max(100)
		.required('Variable key is required'),
	value: Yup.string().required('Variable value is required'),
	scope: Yup.string().oneOf(['Global', 'Local']).required('Scope is required'),
	is_secret: Yup.boolean(),
	description: Yup.string().max(500),
});

const getInitialValues = (variable?: IVariable | null): TVariableFormValues => ({
	key: variable?.key || '',
	value: variable?.value || '',
	scope: variable?.scope || 'Global',
	is_secret: variable?.is_secret || false,
	description: variable?.description || '',
});

const VariableModalPartial: FC<IVariableModalPartialProps> = ({
	isOpen,
	onClose,
	onSubmit,
	variable,
	isLoading,
}) => {
	const isEditing = !!variable;

	const formik = useFormik<TVariableFormValues>({
		initialValues: getInitialValues(variable),
		validationSchema: variableSchema,
		enableReinitialize: true,
		onSubmit: async (values, { resetForm }) => {
			await onSubmit({
				key: values.key.trim(),
				value: values.value,
				scope: values.scope,
				is_secret: values.is_secret,
				description: values.description.trim() || undefined,
			});
			resetForm();
		},
	});

	useEffect(() => {
		if (!isOpen) formik.resetForm();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen]);

	const handleClose = () => {
		formik.resetForm();
		onClose();
	};

	return (
		<Modal isOpen={isOpen} setIsOpen={handleClose} size='md'>
			<ModalHeader>
				<div className='flex items-center gap-3'>
					<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30'>
						<Icon icon='Variable' color='violet' />
					</div>
					<div>
						<span>{isEditing ? 'Edit Variable' : 'Create Variable'}</span>
						<p className='text-sm font-normal text-zinc-500'>
							Reuse values across workflows without hardcoding them.
						</p>
					</div>
				</div>
			</ModalHeader>
			<ModalBody>
				<form id='variable-form' onSubmit={formik.handleSubmit} className='space-y-5'>
					<div>
						<Label htmlFor='variable-key'>Key</Label>
						<Input
							id='variable-key'
							name='key'
							placeholder='SLACK_CHANNEL_ID'
							value={formik.values.key}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
						/>
						{formik.touched.key && formik.errors.key && (
							<p className='mt-1 text-xs text-red-500'>{formik.errors.key}</p>
						)}
					</div>

					<div>
						<Label htmlFor='variable-value'>Value</Label>
						<Input
							id='variable-value'
							name='value'
							type={formik.values.is_secret ? 'password' : 'text'}
							placeholder='Value used at runtime'
							value={formik.values.value}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
						/>
						{formik.touched.value && formik.errors.value && (
							<p className='mt-1 text-xs text-red-500'>{formik.errors.value}</p>
						)}
					</div>

					<div>
						<Label htmlFor='variable-scope'>Scope</Label>
						<Select
							id='variable-scope'
							name='scope'
							value={formik.values.scope}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}>
							<option value='Global'>Global</option>
							<option value='Local'>Local</option>
						</Select>
					</div>

					<Checkbox
						id='variable-is-secret'
						name='is_secret'
						variant='switch'
						checked={formik.values.is_secret}
						onChange={(e) => formik.setFieldValue('is_secret', e.target.checked)}
						label='Mask this value'
						description='Hide the value in lists while keeping copy actions available.'
					/>

					<div>
						<Label htmlFor='variable-description'>Description</Label>
						<Textarea
							id='variable-description'
							name='description'
							placeholder='What this variable controls'
							value={formik.values.description}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							rows={3}
						/>
						{formik.touched.description && formik.errors.description && (
							<p className='mt-1 text-xs text-red-500'>{formik.errors.description}</p>
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
					type='submit'
					form='variable-form'
					isLoading={isLoading}
					isDisable={!formik.isValid || !formik.dirty}>
					{isEditing ? 'Save Variable' : 'Create Variable'}
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default VariableModalPartial;
