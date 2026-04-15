import { Dispatch, FC, SetStateAction } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Modal, { ModalBody, ModalFooter, ModalFooterChild, ModalHeader } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/form/Input';
import Label from '@/components/form/Label';
import Icon from '@/components/icon/Icon';
import { useSendInvitation } from '@/api/hooks/useTeam';
import { ASSIGNABLE_ROLES } from '../_helper/helper';
import type { TWorkspaceRole } from '@/types/workspace.type';

interface IInviteModalProps {
	isOpen: boolean;
	setIsOpen: Dispatch<SetStateAction<boolean>>;
	workspaceId: string;
}

const inviteSchema = Yup.object({
	email: Yup.string().email('Invalid email address').required('Email is required'),
	role: Yup.string().oneOf(['admin', 'editor', 'viewer']).required('Role is required'),
});

const InviteModal: FC<IInviteModalProps> = ({ isOpen, setIsOpen, workspaceId }) => {
	const sendInvitation = useSendInvitation();

	const formik = useFormik({
		initialValues: {
			email: '',
			role: 'editor' as TWorkspaceRole,
		},
		validationSchema: inviteSchema,
		onSubmit: async (values, { resetForm }) => {
			await sendInvitation.mutateAsync({
				workspaceId,
				data: { email: values.email, role: values.role },
			});
			resetForm();
			setIsOpen(false);
		},
	});

	return (
		<Modal isOpen={isOpen} setIsOpen={setIsOpen}>
			<ModalHeader setIsOpen={setIsOpen}>Invite Team Member</ModalHeader>
			<ModalBody>
				<form id='invite-form' onSubmit={formik.handleSubmit} className='space-y-4'>
					<div>
						<Label htmlFor='invite-email'>Email Address</Label>
						<Input
							id='invite-email'
							name='email'
							type='email'
							placeholder='colleague@example.com'
							value={formik.values.email}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
						/>
						{formik.touched.email && formik.errors.email && (
							<div className='mt-1 text-xs text-red-500'>{formik.errors.email}</div>
						)}
					</div>
					<div>
						<Label htmlFor='invite-role'>Role</Label>
						<div className='space-y-2'>
							{ASSIGNABLE_ROLES.map((opt) => (
								<label
									key={opt.value}
									className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
										formik.values.role === opt.value
											? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
											: 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700'
									}`}>
									<input
										type='radio'
										name='role'
										value={opt.value}
										checked={formik.values.role === opt.value}
										onChange={formik.handleChange}
										className='hidden'
									/>
									<Icon icon={opt.icon} color={opt.color} size='text-xl' />
									<div>
										<div className='font-medium'>{opt.label}</div>
										<div className='text-xs text-zinc-500'>
											{opt.description}
										</div>
									</div>
								</label>
							))}
						</div>
					</div>
				</form>
			</ModalBody>
			<ModalFooter>
				<ModalFooterChild>
					<Button variant='outline' onClick={() => setIsOpen(false)}>
						Cancel
					</Button>
				</ModalFooterChild>
				<ModalFooterChild>
					<Button
						variant='solid'
						type='submit'
						form='invite-form'
						isLoading={sendInvitation.isPending}
						isDisable={!formik.isValid || !formik.dirty}>
						Send Invitation
					</Button>
				</ModalFooterChild>
			</ModalFooter>
		</Modal>
	);
};

export default InviteModal;
