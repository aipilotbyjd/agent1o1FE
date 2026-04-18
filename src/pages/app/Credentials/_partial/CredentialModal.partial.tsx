import { FC, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Modal, { ModalBody, ModalFooter, ModalHeader } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/form/Input';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import Textarea from '@/components/form/Textarea';
import Icon from '@/components/icon/Icon';
import type {
	ICredentialDetail,
	ICreateCredentialDto,
	IUpdateCredentialDto,
	TCredentialType,
	TSharingScope,
} from '@/types/credential.type';

type TCredentialFormValues = {
	name: string;
	type: TCredentialType;
	description: string;
	sharing_scope: TSharingScope;
	dataJson: string;
};

interface ICredentialModalPartialProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (values: ICreateCredentialDto | IUpdateCredentialDto) => Promise<void>;
	credential?: ICredentialDetail | null;
	isEditing?: boolean;
	isLoading?: boolean;
	isDetailLoading?: boolean;
}

const CREDENTIAL_TYPES: { value: TCredentialType; label: string; helper: string }[] = [
	{ value: 'api_key', label: 'API Key', helper: 'Token or key-based authentication' },
	{ value: 'oauth2', label: 'OAuth 2', helper: 'OAuth credentials or connected account metadata' },
	{ value: 'basic', label: 'Basic Auth', helper: 'Username and password' },
	{ value: 'bearer', label: 'Bearer Token', helper: 'Authorization bearer token' },
	{ value: 'custom', label: 'Custom', helper: 'Any provider-specific credential shape' },
];

const SHARING_SCOPES: { value: TSharingScope; label: string }[] = [
	{ value: 'private', label: 'Private' },
	{ value: 'workspace', label: 'Workspace' },
	{ value: 'specific', label: 'Specific members' },
];

const parseJsonObject = (value: string): Record<string, unknown> => {
	const parsed = JSON.parse(value);
	if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
		throw new Error('Credential data must be a JSON object');
	}
	return parsed as Record<string, unknown>;
};

const buildCredentialSchema = (isEditing: boolean) =>
	Yup.object({
		name: Yup.string().min(1).max(100).required('Credential name is required'),
		type: Yup.string()
			.oneOf(CREDENTIAL_TYPES.map((type) => type.value))
			.required('Credential type is required'),
		description: Yup.string().max(500),
		sharing_scope: Yup.string()
			.oneOf(SHARING_SCOPES.map((scope) => scope.value))
			.required('Sharing scope is required'),
		dataJson: Yup.string().test(
			'json-object',
			isEditing
				? 'Credential data must be a valid JSON object when provided'
				: 'Credential data must be a valid JSON object',
			(value) => {
				if (!value?.trim()) return isEditing;
				try {
					parseJsonObject(value);
					return true;
				} catch {
					return false;
				}
			},
		),
	});

const getInitialValues = (credential?: ICredentialDetail | null): TCredentialFormValues => ({
	name: credential?.name || '',
	type: credential?.type || 'api_key',
	description: credential?.description || '',
	sharing_scope: credential?.sharing_scope || 'private',
	dataJson: credential?.data ? JSON.stringify(credential.data, null, 2) : '',
});

const CredentialModalPartial: FC<ICredentialModalPartialProps> = ({
	isOpen,
	onClose,
	onSubmit,
	credential,
	isEditing = !!credential,
	isLoading,
	isDetailLoading,
}) => {
	const formik = useFormik<TCredentialFormValues>({
		initialValues: getInitialValues(credential),
		validationSchema: buildCredentialSchema(isEditing),
		enableReinitialize: true,
		onSubmit: async (values, { resetForm }) => {
			const basePayload = {
				name: values.name.trim(),
				description: values.description.trim() || undefined,
			};

			const data = values.dataJson.trim()
				? parseJsonObject(values.dataJson)
				: undefined;

			const payload = isEditing
				? ({ ...basePayload, ...(data ? { data } : {}) } satisfies IUpdateCredentialDto)
				: ({
						...basePayload,
						type: values.type,
						sharing_scope: values.sharing_scope,
						data: data || {},
					} satisfies ICreateCredentialDto);

			await onSubmit(payload);
			resetForm();
		},
	});

	const selectedType = CREDENTIAL_TYPES.find((type) => type.value === formik.values.type);

	useEffect(() => {
		if (!isOpen) formik.resetForm();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen]);

	const handleClose = () => {
		formik.resetForm();
		onClose();
	};

	return (
		<Modal isOpen={isOpen} setIsOpen={handleClose} size='lg' isScrollable>
			<ModalHeader>
				<div className='flex items-center gap-3'>
					<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30'>
						<Icon icon='Key01' color='blue' />
					</div>
					<div>
						<span>{isEditing ? 'Edit Credential' : 'New Credential'}</span>
						<p className='text-sm font-normal text-zinc-500'>
							Store connection details for workflows and agents.
						</p>
					</div>
				</div>
			</ModalHeader>
			<ModalBody>
				{isDetailLoading ? (
					<div className='flex items-center justify-center py-16'>
						<Icon icon='Loading03' size='text-3xl' className='animate-spin' />
					</div>
				) : (
					<form id='credential-form' onSubmit={formik.handleSubmit} className='space-y-5'>
						<div>
							<Label htmlFor='credential-name'>Name</Label>
							<Input
								id='credential-name'
								name='name'
								placeholder='Production Stripe key'
								value={formik.values.name}
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
							/>
							{formik.touched.name && formik.errors.name && (
								<p className='mt-1 text-xs text-red-500'>{formik.errors.name}</p>
							)}
						</div>

						<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
							<div>
								<Label htmlFor='credential-type'>Type</Label>
								<Select
									id='credential-type'
									name='type'
									value={formik.values.type}
									disabled={isEditing}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}>
									{CREDENTIAL_TYPES.map((type) => (
										<option key={type.value} value={type.value}>
											{type.label}
										</option>
									))}
								</Select>
								<p className='mt-1 text-xs text-zinc-500'>
									{isEditing
										? selectedType?.helper || 'Credential type cannot be changed.'
										: CREDENTIAL_TYPES.find((type) => type.value === formik.values.type)?.helper}
								</p>
							</div>

							<div>
								<Label htmlFor='sharing-scope'>Sharing</Label>
								<Select
									id='sharing-scope'
									name='sharing_scope'
									value={formik.values.sharing_scope}
									disabled={isEditing}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}>
									{SHARING_SCOPES.map((scope) => (
										<option key={scope.value} value={scope.value}>
											{scope.label}
										</option>
									))}
								</Select>
								<p className='mt-1 text-xs text-zinc-500'>
									Use the share action after creation to change access.
								</p>
							</div>
						</div>

						<div>
							<Label htmlFor='credential-description'>Description</Label>
							<Textarea
								id='credential-description'
								name='description'
								placeholder='Where this credential is used'
								value={formik.values.description}
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								rows={3}
							/>
							{formik.touched.description && formik.errors.description && (
								<p className='mt-1 text-xs text-red-500'>{formik.errors.description}</p>
							)}
						</div>

						<div>
							<Label htmlFor='credential-data'>Credential Data JSON</Label>
							<Textarea
								id='credential-data'
								name='dataJson'
								placeholder={'{\n  "api_key": "sk_live_..."\n}'}
								value={formik.values.dataJson}
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								rows={8}
								className='font-mono text-sm'
							/>
							<p className='mt-1 text-xs text-zinc-500'>
								{isEditing
									? 'Leave blank to keep the saved secret data unchanged.'
									: 'Use a JSON object. Sensitive values are stored by the backend.'}
							</p>
							{formik.touched.dataJson && formik.errors.dataJson && (
								<p className='mt-1 text-xs text-red-500'>{formik.errors.dataJson}</p>
							)}
						</div>
					</form>
				)}
			</ModalBody>
			<ModalFooter>
				<Button variant='outline' onClick={handleClose} isDisable={isLoading}>
					Cancel
				</Button>
				<Button
					variant='solid'
					type='submit'
					form='credential-form'
					isLoading={isLoading}
					isDisable={!formik.isValid || isDetailLoading}>
					{isEditing ? 'Save Credential' : 'Create Credential'}
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default CredentialModalPartial;
