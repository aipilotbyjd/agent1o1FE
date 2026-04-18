import { FC, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import Modal, { ModalBody, ModalFooter, ModalHeader } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/form/Input';
import Textarea from '@/components/form/Textarea';
import FieldWrap from '@/components/form/FieldWrap';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import Icon from '@/components/icon/Icon';
import {
	IServiceWithStatus,
	SERVICES,
	TServiceCategory,
	searchServices,
} from '@/config/services.config';
import type {
	ICredentialDetail,
	ICreateCredentialDto,
	IUpdateCredentialDto,
	TSharingScope,
} from '@/types/credential.type';
import type { TWorkspaceMember } from '@/types/workspace.type';

type TAddStep = 'select' | 'configure';

interface ICredentialModalPartialProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (values: ICreateCredentialDto, selectedUserIds?: string[]) => Promise<void> | void;
	onUpdate?: (values: IUpdateCredentialDto) => Promise<void> | void;
	isLoading?: boolean;
	configuredOAuthProviders?: string[];
	workspaceMembers?: TWorkspaceMember[];
	isLoadingMembers?: boolean;
	editCredential?: ICredentialDetail | null;
	isFetchingCredential?: boolean;
}

const CATEGORY_ORDER: TServiceCategory[] = [
	'AI',
	'Productivity',
	'Communication',
	'Development',
	'Database',
	'CRM',
	'Payment',
	'File Storage',
	'Other',
];

const CATEGORY_ICONS: Record<TServiceCategory, string> = {
	AI: 'AiBrain01',
	Productivity: 'Task01',
	Communication: 'Message01',
	Development: 'SourceCodeCircle',
	Database: 'Database01',
	CRM: 'UserGroup',
	Payment: 'CreditCard',
	'File Storage': 'Folder01',
	Other: 'Settings02',
};

const SHARING_OPTIONS: { value: TSharingScope; label: string; icon: string }[] = [
	{ value: 'private', label: 'Private', icon: 'Lock' },
	{ value: 'workspace', label: 'Workspace', icon: 'UserGroup' },
	{ value: 'specific', label: 'Specific people', icon: 'UserMultiple02' },
];

const getCredentialDataSource = (credential: ICredentialDetail): Record<string, unknown> => {
	if (credential.type === 'custom' && credential.data?.data && typeof credential.data.data === 'object') {
		return credential.data.data as Record<string, unknown>;
	}
	return credential.data || {};
};

const findServiceForCredential = (credential: ICredentialDetail): IServiceWithStatus | null => {
	const service =
		SERVICES.find(
			(candidate) =>
				candidate.oauthProvider === credential.provider ||
				candidate.id === credential.provider,
		) ||
		SERVICES.find(
			(candidate) =>
				candidate.credentialType === credential.type &&
				(credential.type !== 'oauth2' || candidate.authType === 'oauth'),
		);

	return service ? { ...service, isAvailable: true, isOAuthConfigured: service.authType === 'oauth' } : null;
};

const CredentialModalPartial: FC<ICredentialModalPartialProps> = ({
	isOpen,
	onClose,
	onSave,
	onUpdate,
	isLoading = false,
	configuredOAuthProviders = [],
	workspaceMembers = [],
	isLoadingMembers = false,
	editCredential = null,
	isFetchingCredential = false,
}) => {
	const isEditMode = !!editCredential;
	const [addStep, setAddStep] = useState<TAddStep>('select');
	const [selectedService, setSelectedService] = useState<IServiceWithStatus | null>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [credentialName, setCredentialName] = useState('');
	const [description, setDescription] = useState('');
	const [formData, setFormData] = useState<Record<string, string | number>>({});
	const [sharingScope, setSharingScope] = useState<TSharingScope>('workspace');
	const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
	const [memberSearchQuery, setMemberSearchQuery] = useState('');

	const servicesWithStatus: IServiceWithStatus[] = useMemo(
		() =>
			SERVICES.map((service) => {
				const isOAuthService = service.authType === 'oauth';
				const isOAuthConfigured = service.oauthProvider
					? configuredOAuthProviders.includes(service.oauthProvider)
					: undefined;
				return {
					...service,
					isOAuthConfigured,
					isAvailable: !isOAuthService || !!isOAuthConfigured,
				};
			}),
		[configuredOAuthProviders],
	);

	const filteredServices = useMemo(() => {
		const services = searchQuery
			? searchServices(searchQuery).map(
					(service) =>
						servicesWithStatus.find((candidate) => candidate.id === service.id) || {
							...service,
							isAvailable: true,
						},
				)
			: servicesWithStatus;

		return services;
	}, [searchQuery, servicesWithStatus]);

	const servicesByCategory = useMemo(() => {
		const grouped: Partial<Record<TServiceCategory, IServiceWithStatus[]>> = {};
		filteredServices.forEach((service) => {
			grouped[service.category] = [...(grouped[service.category] || []), service];
		});
		return grouped;
	}, [filteredServices]);

	const filteredMembers = useMemo(() => {
		const query = memberSearchQuery.trim().toLowerCase();
		if (!query) return workspaceMembers;
		return workspaceMembers.filter(
			(member) =>
				member.name.toLowerCase().includes(query) ||
				member.email.toLowerCase().includes(query),
		);
	}, [memberSearchQuery, workspaceMembers]);

	useEffect(() => {
		if (!isOpen) return;
		if (!editCredential) {
			resetState();
			return;
		}

		const service = findServiceForCredential(editCredential);
		setSelectedService(service);
		setAddStep('configure');
		setCredentialName(editCredential.name);
		setDescription(editCredential.description || '');
		setSharingScope(editCredential.sharing_scope);

		const dataSource = getCredentialDataSource(editCredential);
		const nextFormData: Record<string, string | number> = {};
		Object.entries(dataSource).forEach(([key, value]) => {
			if (typeof value === 'string' || typeof value === 'number') nextFormData[key] = value;
		});
		setFormData(nextFormData);
	}, [editCredential, isOpen]);

	const resetState = () => {
		setAddStep('select');
		setSelectedService(null);
		setSearchQuery('');
		setCredentialName('');
		setDescription('');
		setFormData({});
		setSharingScope('workspace');
		setSelectedUserIds([]);
		setMemberSearchQuery('');
	};

	const handleClose = () => {
		resetState();
		onClose();
	};

	const handleServiceSelect = (service: IServiceWithStatus) => {
		if (!service.isAvailable) return;

		const nextData: Record<string, string | number> = {};
		service.fields?.forEach((field) => {
			if (field.defaultValue !== undefined) nextData[field.name] = field.defaultValue;
		});

		setSelectedService(service);
		setCredentialName(service.defaultName || `My ${service.name}`);
		setDescription('');
		setFormData(nextData);
		setAddStep('configure');
	};

	const handleBack = () => {
		if (isEditMode) {
			handleClose();
			return;
		}
		setAddStep('select');
		setSelectedService(null);
	};

	const handleFieldChange = (fieldName: string, value: string | number) => {
		setFormData((current) => ({ ...current, [fieldName]: value }));
	};

	const toggleUserSelection = (userId: string) => {
		setSelectedUserIds((current) =>
			current.includes(userId)
				? current.filter((id) => id !== userId)
				: [...current, userId],
		);
	};

	const buildCredentialData = () => {
		if (!selectedService) return {};

		const credentialData: Record<string, unknown> = {};
		selectedService.fields?.forEach((field) => {
			const value = formData[field.name];
			if (value !== undefined && value !== '') credentialData[field.name] = value;
		});

		return selectedService.credentialType === 'custom'
			? { data: credentialData }
			: credentialData;
	};

	const handleSubmit = async () => {
		if (!selectedService) return;

		if (isEditMode && onUpdate) {
			await onUpdate({
				name: credentialName.trim(),
				description: description.trim() || undefined,
				...(selectedService.authType !== 'oauth' ? { data: buildCredentialData() } : {}),
			});
			return;
		}

		await onSave(
			{
				name: credentialName.trim(),
				type: selectedService.credentialType,
				description: description.trim() || undefined,
				data: buildCredentialData(),
				sharing_scope: sharingScope,
			},
			sharingScope === 'specific' ? selectedUserIds : undefined,
		);
	};

	const handleOAuthConnect = async () => {
		if (!selectedService?.oauthProvider) return;
		await onSave(
			{
				name: credentialName.trim(),
				type: 'oauth2',
				description: description.trim() || undefined,
				data: { provider: selectedService.oauthProvider },
				sharing_scope: sharingScope,
			},
			sharingScope === 'specific' ? selectedUserIds : undefined,
		);
	};

	const isFormValid = useMemo(() => {
		if (!selectedService || !credentialName.trim()) return false;
		if (selectedService.authType === 'oauth') return true;
		return (
			selectedService.fields?.every((field) => {
				if (!field.required) return true;
				const value = formData[field.name];
				return value !== undefined && value !== '';
			}) ?? true
		);
	}, [credentialName, formData, selectedService]);

	const showFooter =
		addStep === 'configure' &&
		!!selectedService &&
		(selectedService.authType !== 'oauth' || isEditMode);

	const renderServiceCard = (service: IServiceWithStatus) => {
		const isDisabled = !service.isAvailable;
		const isSelected = selectedService?.id === service.id;

		return (
			<button
				key={service.id}
				type='button'
				disabled={isDisabled}
				onClick={() => handleServiceSelect(service)}
				className={classNames(
					'relative flex min-h-24 items-start gap-3 rounded-lg border p-3 text-left transition-colors',
					isSelected
						? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
						: isDisabled
							? 'cursor-not-allowed border-zinc-200 bg-zinc-100 opacity-60 dark:border-zinc-800 dark:bg-zinc-900'
							: 'border-zinc-200 hover:border-blue-400 dark:border-zinc-800 dark:hover:border-blue-500',
				)}>
				<div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'>
					<Icon icon={service.icon} className='text-xl' />
				</div>
				<div className='min-w-0 flex-1'>
					<div className='truncate font-semibold text-zinc-900 dark:text-white'>
						{service.name}
					</div>
					<div className='mt-1 line-clamp-2 text-xs text-zinc-500'>
						{service.description || service.category}
					</div>
				</div>
				{service.authType === 'oauth' && (
					<Badge
						variant={service.isAvailable ? 'soft' : 'outline'}
						color={service.isAvailable ? 'violet' : 'zinc'}
						className='absolute top-2 right-2 text-[10px]'>
						{service.isAvailable ? 'OAuth' : 'Setup needed'}
					</Badge>
				)}
			</button>
		);
	};

	const renderServiceSelector = () => (
		<div className='flex h-full flex-col'>
			<div className='border-b border-zinc-200 p-4 dark:border-zinc-800'>
				<FieldWrap firstSuffix={<Icon icon='Search02' className='text-zinc-400' />}>
					<Input
						name='credential-service-search'
						variant='solid'
						dimension='sm'
						placeholder='Search services...'
						value={searchQuery}
						onChange={(event) => setSearchQuery(event.target.value)}
					/>
				</FieldWrap>
			</div>
			<div className='min-h-0 flex-1 overflow-y-auto p-4'>
				{searchQuery ? (
					<div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
						{filteredServices.map(renderServiceCard)}
					</div>
				) : (
					<div className='space-y-6'>
						{CATEGORY_ORDER.filter((category) => servicesByCategory[category]?.length).map(
							(category) => (
								<div key={category}>
									<div className='mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300'>
										<Icon icon={CATEGORY_ICONS[category]} className='text-zinc-400' />
										{category}
										<span className='text-xs font-normal text-zinc-400'>
											{servicesByCategory[category]?.length}
										</span>
									</div>
									<div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
										{servicesByCategory[category]?.map(renderServiceCard)}
									</div>
								</div>
							),
						)}
					</div>
				)}
				{filteredServices.length === 0 && (
					<div className='py-14 text-center text-sm text-zinc-500'>No services found.</div>
				)}
			</div>
		</div>
	);

	const renderSharingOptions = () => {
		if (isEditMode) return null;

		return (
			<div className='border-t border-zinc-200 pt-5 dark:border-zinc-800'>
				<label className='mb-3 flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300'>
					<Icon icon='Share01' className='text-zinc-400' />
					Sharing
				</label>
				<div className='grid grid-cols-1 gap-2 md:grid-cols-3'>
					{SHARING_OPTIONS.map((option) => (
						<button
							key={option.value}
							type='button'
							onClick={() => setSharingScope(option.value)}
							className={classNames(
								'flex items-center gap-2 rounded-lg border p-3 text-left text-sm transition-colors',
								sharingScope === option.value
									? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300'
									: 'border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-800 dark:text-zinc-400',
							)}>
							<Icon icon={option.icon} />
							{option.label}
						</button>
					))}
				</div>
				{sharingScope === 'specific' && (
					<div className='mt-3'>
						<FieldWrap firstSuffix={<Icon icon='Search02' className='text-zinc-400' />}>
							<Input
								name='credential-member-search'
								variant='solid'
								dimension='sm'
								placeholder='Search members...'
								value={memberSearchQuery}
								onChange={(event) => setMemberSearchQuery(event.target.value)}
							/>
						</FieldWrap>
						{isLoadingMembers ? (
							<div className='flex justify-center py-4'>
								<Spinner color='primary' />
							</div>
						) : filteredMembers.length === 0 ? (
							<div className='mt-2 rounded-lg border border-zinc-200 p-3 text-sm text-zinc-500 dark:border-zinc-800'>
								No workspace members found.
							</div>
						) : (
							<div className='mt-2 max-h-36 space-y-1 overflow-y-auto'>
								{filteredMembers.map((member) => {
									const isSelected = selectedUserIds.includes(member.user_id);
									return (
										<button
											key={member.user_id}
											type='button'
											onClick={() => toggleUserSelection(member.user_id)}
											className={classNames(
												'flex w-full items-center justify-between rounded-lg p-2 text-left transition-colors',
												isSelected
													? 'bg-emerald-50 dark:bg-emerald-950/20'
													: 'hover:bg-zinc-50 dark:hover:bg-zinc-900',
											)}>
											<div>
												<div className='text-sm font-medium text-zinc-800 dark:text-zinc-100'>
													{member.name}
												</div>
												<div className='text-xs text-zinc-500'>{member.email}</div>
											</div>
											{isSelected && <Icon icon='CheckmarkCircle02' color='emerald' />}
										</button>
									);
								})}
							</div>
						)}
					</div>
				)}
			</div>
		);
	};

	const renderConfiguration = () => {
		if (isFetchingCredential && isEditMode) {
			return (
				<div className='flex h-full items-center justify-center'>
					<Spinner color='primary' />
				</div>
			);
		}

		if (!selectedService) {
			return (
				<div className='flex h-full items-center justify-center p-6 text-center text-sm text-zinc-500'>
					Select a service to configure credentials.
				</div>
			);
		}

		const isOAuth = selectedService.authType === 'oauth';

		return (
			<div className='space-y-5 overflow-y-auto p-6'>
				<div className='flex items-center gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800'>
					<div className='flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500 text-white'>
						<Icon icon={selectedService.icon} className='text-2xl' />
					</div>
					<div className='min-w-0 flex-1'>
						<div className='font-semibold text-zinc-900 dark:text-white'>
							{selectedService.name}
						</div>
						<div className='text-sm text-zinc-500'>
							{selectedService.description || selectedService.category}
						</div>
					</div>
					<Badge variant='outline' color={isOAuth ? 'violet' : 'zinc'}>
						{isOAuth ? 'OAuth 2.0' : selectedService.credentialType.replace('_', ' ')}
					</Badge>
				</div>

				<div>
					<label className='mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300'>
						Credential name
					</label>
					<Input
						name='credential-name'
						placeholder='Production API key'
						value={credentialName}
						onChange={(event) => setCredentialName(event.target.value)}
					/>
				</div>

				<div>
					<label className='mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300'>
						Description
					</label>
					<Textarea
						placeholder='Where this credential is used'
						value={description}
						onChange={(event) => setDescription(event.target.value)}
						rows={2}
					/>
				</div>

				{isOAuth ? (
					<div className='space-y-4'>
						<div className='rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700 dark:border-blue-900 dark:bg-blue-950/20 dark:text-blue-300'>
							{isEditMode
								? 'OAuth credentials can update name and description here. Reconnect by creating a new credential or using refresh from the table action.'
								: `Connect ${selectedService.name} through the secure OAuth 2.0 flow.`}
						</div>
						{!isEditMode && (
							<Button
								variant='solid'
								color='primary'
								icon='Link01'
								className='w-full'
								isLoading={isLoading}
								isDisable={!isFormValid}
								onClick={handleOAuthConnect}>
								Connect with {selectedService.name}
							</Button>
						)}
						{editCredential?.token_expires_at && (
							<div className='rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-800'>
								<span className='text-zinc-500'>Token expires: </span>
								<span className='font-medium text-zinc-900 dark:text-white'>
									{new Date(editCredential.token_expires_at * 1000).toLocaleString()}
								</span>
							</div>
						)}
					</div>
				) : (
					<div className='space-y-4'>
						{selectedService.fields?.map((field) => (
							<div key={field.name}>
								<label className='mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300'>
									{field.label}
									{field.required && <span className='text-red-500'> *</span>}
								</label>
								{field.type === 'textarea' ? (
									<Textarea
										placeholder={field.placeholder}
										value={String(formData[field.name] ?? '')}
										onChange={(event) =>
											handleFieldChange(field.name, event.target.value)
										}
										rows={4}
										className='font-mono text-sm'
									/>
								) : (
									<Input
										name={field.name}
										type={field.type}
										placeholder={field.placeholder}
										value={String(formData[field.name] ?? '')}
										onChange={(event) =>
											handleFieldChange(
												field.name,
												field.type === 'number'
													? Number(event.target.value)
													: event.target.value,
											)
										}
									/>
								)}
								{field.helpText && (
									<p className='mt-1 text-xs text-zinc-500'>{field.helpText}</p>
								)}
							</div>
						))}
						{selectedService.helpUrl && !isEditMode && (
							<a
								href={selectedService.helpUrl}
								target='_blank'
								rel='noreferrer'
								className='inline-flex items-center gap-2 text-sm font-medium text-blue-500 hover:text-blue-600'>
								<Icon icon='Link01' />
								View {selectedService.name} docs
							</a>
						)}
					</div>
				)}

				{renderSharingOptions()}
			</div>
		);
	};

	return (
		<Modal isOpen={isOpen} setIsOpen={handleClose} size={900} isScrollable isCentered>
			<ModalHeader className='border-b border-zinc-200 dark:border-zinc-800'>
				<div className='flex w-full items-center justify-between pr-4'>
					<div className='flex items-center gap-3'>
						{addStep === 'configure' && (
							<Button icon='ArrowLeft01' variant='outline' dimension='sm' onClick={handleBack} />
						)}
						<div>
							<span>{isEditMode ? 'Edit Credential' : addStep === 'select' ? 'Select Service' : 'Configure Credential'}</span>
							<p className='text-sm font-normal text-zinc-500'>
								{isEditMode
									? 'Update credential details'
									: 'Choose OAuth, API key, basic auth, bearer, or custom credentials'}
							</p>
						</div>
					</div>
					<div className='hidden items-center gap-2 md:flex'>
						<Badge variant='outline' color='zinc'>
							{SERVICES.length} services
						</Badge>
						<Badge variant='outline' color='violet'>
							{configuredOAuthProviders.length} OAuth ready
						</Badge>
					</div>
				</div>
			</ModalHeader>
			<ModalBody className='p-0'>
				<div className='h-[620px] overflow-hidden'>
					<AnimatePresence mode='wait'>
						{addStep === 'select' ? (
							<motion.div
								key='select'
								initial={{ opacity: 0, x: -12 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: 12 }}
								className='h-full'>
								{renderServiceSelector()}
							</motion.div>
						) : (
							<motion.div
								key='configure'
								initial={{ opacity: 0, x: 12 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -12 }}
								className='h-full'>
								{renderConfiguration()}
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</ModalBody>
			<ModalFooter className={classNames({ hidden: !showFooter })}>
				<Button variant='outline' onClick={handleClose} isDisable={isLoading}>
					Cancel
				</Button>
				<Button
					variant='solid'
					icon='Tick02'
					onClick={handleSubmit}
					isLoading={isLoading}
					isDisable={!isFormValid || isFetchingCredential}>
					{isEditMode ? 'Save Changes' : 'Save Credential'}
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default CredentialModalPartial;
