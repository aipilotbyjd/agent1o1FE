import { FC } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Modal, { ModalBody, ModalFooter, ModalHeader } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/form/Input';
import Label from '@/components/form/Label';
import Icon from '@/components/icon/Icon';
import { IFolder, ICreateFolderDto, FOLDER_COLORS, FOLDER_ICONS } from '@/types/folder.type';

const folderSchema = Yup.object({
	name: Yup.string().min(1).max(50).required('Folder name is required'),
	color: Yup.string().required(),
	icon: Yup.string().required(),
});

interface IFolderModalPartialProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (values: ICreateFolderDto) => Promise<void>;
	isLoading?: boolean;
	folder?: IFolder | null;
}

const FolderModalPartial: FC<IFolderModalPartialProps> = ({
	isOpen,
	onClose,
	onSubmit,
	isLoading,
	folder,
}) => {
	const isEditing = !!folder;

	const formik = useFormik({
		initialValues: {
			name: folder?.name || '',
			color: folder?.color || FOLDER_COLORS[0].value,
			icon: folder?.icon || FOLDER_ICONS[0].value,
		},
		validationSchema: folderSchema,
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

	const handleClose = () => {
		formik.resetForm();
		onClose();
	};

	return (
		<Modal isOpen={isOpen} setIsOpen={handleClose}>
			<ModalHeader>{isEditing ? 'Edit Folder' : 'Create New Folder'}</ModalHeader>
			<ModalBody>
				<form onSubmit={formik.handleSubmit} className='space-y-6'>
					{/* Folder Preview */}
					<div className='flex items-center justify-center py-4'>
						<div
							className={`flex h-20 w-20 items-center justify-center rounded-2xl ${formik.values.color} bg-opacity-20`}>
							<Icon icon={formik.values.icon} size='text-4xl' className='text-white' />
						</div>
					</div>

					{/* Folder Name */}
					<div>
						<Label htmlFor='name'>Folder Name</Label>
						<Input
							id='name'
							name='name'
							placeholder='Enter folder name...'
							value={formik.values.name}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
						/>
						{formik.touched.name && formik.errors.name && (
							<p className='mt-1 text-sm text-red-500'>{formik.errors.name}</p>
						)}
					</div>

					{/* Folder Color */}
					<div>
						<Label htmlFor='color'>Color</Label>
						<div className='mt-2 flex flex-wrap gap-2'>
							{FOLDER_COLORS.map((color) => (
								<button
									key={color.value}
									type='button'
									className={`h-8 w-8 rounded-lg ${color.value} transition-all ${
										formik.values.color === color.value
											? 'scale-110 ring-2 ring-offset-2 ring-zinc-400 dark:ring-offset-zinc-800'
											: 'hover:scale-105'
									}`}
									title={color.label}
									onClick={() => formik.setFieldValue('color', color.value)}
								/>
							))}
						</div>
					</div>

					{/* Folder Icon */}
					<div>
						<Label htmlFor='icon'>Icon</Label>
						<div className='mt-2 flex flex-wrap gap-2'>
							{FOLDER_ICONS.map((icon) => (
								<button
									key={icon.value}
									type='button'
									className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-all ${
										formik.values.icon === icon.value
											? 'border-primary-500 bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
											: 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700'
									}`}
									title={icon.label}
									onClick={() => formik.setFieldValue('icon', icon.value)}>
									<Icon icon={icon.value} size='text-xl' />
								</button>
							))}
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
					{isEditing ? 'Update Folder' : 'Create Folder'}
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default FolderModalPartial;
