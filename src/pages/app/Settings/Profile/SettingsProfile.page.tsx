import { useRef, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Container from '@/components/layout/Container';
import Card, { CardBody, CardHeader, CardHeaderChild, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/form/Input';
import Label from '@/components/form/Label';
import Avatar from '@/components/ui/Avatar';
import Icon from '@/components/icon/Icon';
import { useAuth } from '@/context/authContext';
import { useUpdateProfile, useChangePassword, useUploadAvatar, useDeleteAvatar } from '@/api/hooks/useAuth';

const profileSchema = Yup.object({
	name: Yup.string().min(1).max(100).required('Name is required'),
	email: Yup.string().email('Invalid email').required('Email is required'),
});

const passwordSchema = Yup.object({
	current_password: Yup.string().required('Current password is required'),
	password: Yup.string().min(8, 'Must be at least 8 characters').required('New password is required'),
	password_confirmation: Yup.string()
		.oneOf([Yup.ref('password')], 'Passwords must match')
		.required('Confirm your new password'),
});

const SettingsProfilePage = () => {
	const { userData } = useAuth();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const updateProfile = useUpdateProfile();
	const changePassword = useChangePassword();
	const uploadAvatar = useUploadAvatar();
	const deleteAvatar = useDeleteAvatar();

	const profileFormik = useFormik({
		initialValues: {
			name: '',
			email: '',
		},
		validationSchema: profileSchema,
		onSubmit: async (values) => {
			await updateProfile.mutateAsync({ name: values.name });
		},
		enableReinitialize: true,
	});

	const passwordFormik = useFormik({
		initialValues: {
			current_password: '',
			password: '',
			password_confirmation: '',
		},
		validationSchema: passwordSchema,
		onSubmit: async (values, { resetForm }) => {
			await changePassword.mutateAsync(values);
			resetForm();
		},
	});

	useEffect(() => {
		if (userData) {
			profileFormik.setValues({
				name: userData.name || '',
				email: userData.email || '',
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userData]);

	const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			await uploadAvatar.mutateAsync(file);
		}
	};

	const handleDeleteAvatar = async () => {
		await deleteAvatar.mutateAsync();
	};

	return (
		<Container>
			<div className='grid grid-cols-12 gap-4'>
				{/* Avatar Card */}
				<div className='col-span-12 lg:col-span-8'>
					<Card>
						<CardHeader>
							<CardHeaderChild>
								<CardTitle
									iconProps={{ icon: 'Camera02', color: 'primary', size: 'text-3xl' }}>
									Profile Picture
								</CardTitle>
							</CardHeaderChild>
						</CardHeader>
						<CardBody>
							<div className='flex items-center gap-6'>
								<div className='relative'>
									<Avatar
										src={userData?.avatar ?? undefined}
										name={userData?.name ?? 'U'}
										size='w-24'
										color='primary'
									/>
									<button
										type='button'
										onClick={() => fileInputRef.current?.click()}
										className='absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-white shadow-md hover:bg-primary-600'>
										<Icon icon='Camera02' size='text-sm' />
									</button>
									<input
										ref={fileInputRef}
										type='file'
										accept='image/*'
										onChange={handleAvatarUpload}
										className='hidden'
									/>
								</div>
								<div className='space-y-2'>
									<p className='text-sm text-zinc-500'>
										Upload a new avatar. Max size: 5MB. Supported: JPG, PNG, GIF.
									</p>
									<div className='flex gap-2'>
										<Button
											variant='outline'
											dimension='sm'
											icon='Upload04'
											isLoading={uploadAvatar.isPending}
											onClick={() => fileInputRef.current?.click()}>
											Upload
										</Button>
										{userData?.avatar && (
											<Button
												variant='outline'
												dimension='sm'
												color='red'
												icon='Delete02'
												isLoading={deleteAvatar.isPending}
												onClick={handleDeleteAvatar}>
												Remove
											</Button>
										)}
									</div>
								</div>
							</div>
						</CardBody>
					</Card>
				</div>

				{/* Profile Info */}
				<div className='col-span-12 lg:col-span-6'>
					<Card>
						<CardHeader>
							<CardHeaderChild>
								<CardTitle
									iconProps={{ icon: 'User02', color: 'primary', size: 'text-3xl' }}>
									Profile Information
								</CardTitle>
							</CardHeaderChild>
						</CardHeader>
						<CardBody>
							<form onSubmit={profileFormik.handleSubmit} className='space-y-4'>
								<div>
									<Label htmlFor='profile-name'>Name</Label>
									<Input
										id='profile-name'
										name='name'
										placeholder='Your name'
										value={profileFormik.values.name}
										onChange={profileFormik.handleChange}
										onBlur={profileFormik.handleBlur}
									/>
									{profileFormik.touched.name && profileFormik.errors.name && (
										<div className='mt-1 text-xs text-red-500'>
											{profileFormik.errors.name}
										</div>
									)}
								</div>
								<div>
									<Label htmlFor='profile-email'>Email</Label>
									<Input
										id='profile-email'
										name='email'
										type='email'
										value={profileFormik.values.email}
										disabled
									/>
									<p className='mt-1 text-xs text-zinc-500'>
										Email cannot be changed.
									</p>
								</div>
								{userData?.email_verified_at && (
									<div className='flex items-center gap-2 text-sm text-emerald-600'>
										<Icon icon='CheckmarkCircle02' size='text-base' />
										Email verified
									</div>
								)}
								<div className='flex justify-end border-t border-zinc-200 pt-4 dark:border-zinc-700'>
									<Button
										variant='solid'
										type='submit'
										icon='FloppyDisk'
										isLoading={updateProfile.isPending}
										isDisable={!profileFormik.dirty || !profileFormik.isValid}>
										Save Profile
									</Button>
								</div>
							</form>
						</CardBody>
					</Card>
				</div>

				{/* Change Password */}
				<div className='col-span-12 lg:col-span-6'>
					<Card>
						<CardHeader>
							<CardHeaderChild>
								<CardTitle
									iconProps={{ icon: 'Key02', color: 'primary', size: 'text-3xl' }}>
									Change Password
								</CardTitle>
							</CardHeaderChild>
						</CardHeader>
						<CardBody>
							<form onSubmit={passwordFormik.handleSubmit} className='space-y-4'>
								<div>
									<Label htmlFor='current_password'>Current Password</Label>
									<Input
										id='current_password'
										name='current_password'
										type='password'
										placeholder='Enter current password'
										value={passwordFormik.values.current_password}
										onChange={passwordFormik.handleChange}
										onBlur={passwordFormik.handleBlur}
									/>
									{passwordFormik.touched.current_password &&
										passwordFormik.errors.current_password && (
											<div className='mt-1 text-xs text-red-500'>
												{passwordFormik.errors.current_password}
											</div>
										)}
								</div>
								<div>
									<Label htmlFor='password'>New Password</Label>
									<Input
										id='password'
										name='password'
										type='password'
										placeholder='Enter new password'
										value={passwordFormik.values.password}
										onChange={passwordFormik.handleChange}
										onBlur={passwordFormik.handleBlur}
									/>
									{passwordFormik.touched.password && passwordFormik.errors.password && (
										<div className='mt-1 text-xs text-red-500'>
											{passwordFormik.errors.password}
										</div>
									)}
								</div>
								<div>
									<Label htmlFor='password_confirmation'>Confirm New Password</Label>
									<Input
										id='password_confirmation'
										name='password_confirmation'
										type='password'
										placeholder='Confirm new password'
										value={passwordFormik.values.password_confirmation}
										onChange={passwordFormik.handleChange}
										onBlur={passwordFormik.handleBlur}
									/>
									{passwordFormik.touched.password_confirmation &&
										passwordFormik.errors.password_confirmation && (
											<div className='mt-1 text-xs text-red-500'>
												{passwordFormik.errors.password_confirmation}
											</div>
										)}
								</div>
								<div className='flex justify-end border-t border-zinc-200 pt-4 dark:border-zinc-700'>
									<Button
										variant='solid'
										type='submit'
										icon='FloppyDisk'
										isLoading={changePassword.isPending}
										isDisable={!passwordFormik.dirty || !passwordFormik.isValid}>
										Change Password
									</Button>
								</div>
							</form>
						</CardBody>
					</Card>
				</div>
			</div>
		</Container>
	);
};

export default SettingsProfilePage;
