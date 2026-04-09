import { useState } from 'react';
import { Link } from 'react-router';
import { useFormik } from 'formik';
import { useAuth } from '@/context/authContext';
import pages from '@/Routes/pages';
import Icon from '@/components/icon/Icon';
import * as Yup from 'yup';

interface IRegisterFormValues {
	name: string;
	email: string;
	password: string;
	password_confirmation: string;
}

const passwordChecks = (password: string) => ({
	hasMinLength: password.length >= 8,
	hasUppercase: /[A-Z]/.test(password),
	hasLowercase: /[a-z]/.test(password),
	hasNumberOrSymbol: /[\d\s\W]/.test(password),
	hasNoRepeatingChars: password.length >= 3 && !/(.)\1{2,}/.test(password),
});

const validationSchema = Yup.object().shape({
	name: Yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
	email: Yup.string().email('Invalid email address').required('Email is required'),
	password: Yup.string()
		.required('Password is required')
		.min(8, 'Must be at least 8 characters')
		.matches(/[A-Z]/, 'Must contain at least one uppercase letter')
		.matches(/[a-z]/, 'Must contain at least one lowercase letter')
		.matches(/[\d\s\W]/, 'Must contain at least one number, symbol, or whitespace'),
	password_confirmation: Yup.string()
		.required('Please confirm your password')
		.oneOf([Yup.ref('password')], 'Passwords must match'),
});

const RegisterPage = () => {
	const { onRegister, isLoading } = useAuth();

	const [showPassword, setShowPassword] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);

	const formik = useFormik<IRegisterFormValues>({
		initialValues: {
			name: '',
			email: '',
			password: '',
			password_confirmation: '',
		},
		validationSchema,
		onSubmit: async (values, { setErrors }) => {
			try {
				await onRegister(values);
			} catch (error: unknown) {
				const err = error as { errors?: Record<string, string[]>; message?: string };
				if (err?.errors) {
					const fieldErrors: Record<string, string> = {};
					Object.entries(err.errors).forEach(([key, msgs]) => {
						fieldErrors[key] = msgs[0];
					});
					setErrors(fieldErrors);
				} else if (err?.message) {
					setErrors({ email: err.message });
				}
			}
		},
	});

	const checks = passwordChecks(formik.values.password);
	const passedCount = Object.values(checks).filter(Boolean).length;

	const strengthColors = ['bg-red-500', 'bg-red-500', 'bg-amber-500', 'bg-amber-500', 'bg-blue-500'];
	const strengthColor = passedCount === 5 ? 'bg-emerald-500' : strengthColors[passedCount] || 'bg-zinc-700';

	const handleGoogleSignUp = () => {
		console.log('Google sign up');
	};

	return (
		<div className='font-inter relative flex min-h-screen overflow-hidden bg-[#030712]'>
			{/* Animated background gradients */}
			<div className='pointer-events-none absolute inset-0'>
				<div className='from-primary-600/20 absolute -top-40 -left-40 h-[500px] w-[500px] animate-pulse rounded-full bg-gradient-to-r to-violet-600/20 blur-[120px]' />
				<div className='absolute -right-40 -bottom-40 h-[500px] w-[500px] animate-pulse rounded-full bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 blur-[120px] [animation-delay:2s]' />
				<div className='absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-purple-600/10 to-pink-600/10 blur-[150px]' />
			</div>

			{/* Grid pattern overlay */}
			<div
				className='pointer-events-none absolute inset-0 opacity-[0.02]'
				style={{
					backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
					backgroundSize: '50px 50px',
				}}
			/>

			{/* Left Panel - Auth */}
			<div className='relative z-10 flex w-full flex-col justify-center px-6 sm:px-8 lg:w-[45%] lg:px-12 xl:px-20'>
				<div className='mx-auto w-full max-w-[420px]'>
					{/* Logo */}
					<div className='mb-10'>
						<div className='flex items-center gap-3'>
							<div className='relative'>
								<div className='bg-primary-500/20 absolute inset-0 animate-pulse rounded-2xl blur-xl' />
								<div className='from-primary-400 to-primary-600 shadow-primary-500/30 relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg'>
									<Icon icon='Workflow' className='text-2xl text-white' />
								</div>
							</div>
							<span className='bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-2xl font-bold tracking-tight text-transparent'>
								Agent1o1
							</span>
						</div>
					</div>

					{/* Header */}
					<div className='mb-8'>
						<h1 className='text-3xl leading-tight font-bold tracking-tight text-white sm:text-4xl'>
							Create account
						</h1>
						<p className='mt-3 text-base text-zinc-400'>
							Get started with your AI automation journey
						</p>
					</div>

					{/* Google Sign-up */}
					<button
						type='button'
						onClick={handleGoogleSignUp}
						className='group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-medium text-white backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10'>
						<div className='absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
						<svg
							className='relative h-5 w-5 transition-transform duration-300 group-hover:scale-110'
							viewBox='0 0 24 24'>
							<path
								d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
								fill='#4285F4'
							/>
							<path
								d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
								fill='#34A853'
							/>
							<path
								d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
								fill='#FBBC05'
							/>
							<path
								d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
								fill='#EA4335'
							/>
						</svg>
						<span className='relative'>Sign up with Google</span>
					</button>

					{/* Divider */}
					<div className='my-6 flex items-center'>
						<div className='h-px flex-1 bg-gradient-to-r from-transparent via-zinc-700 to-transparent' />
						<span className='px-4 text-sm text-zinc-500'>or</span>
						<div className='h-px flex-1 bg-gradient-to-r from-transparent via-zinc-700 to-transparent' />
					</div>

					{/* Form */}
					<form onSubmit={formik.handleSubmit} className='space-y-4'>
						{/* Name */}
						<div>
							<label
								htmlFor='name'
								className='mb-1.5 block text-sm font-medium text-zinc-300'>
								Full name
							</label>
							<input
								id='name'
								name='name'
								type='text'
								autoComplete='name'
								placeholder='John Doe'
								value={formik.values.name}
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								className='focus:border-primary-500/50 focus:ring-primary-500/20 flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white backdrop-blur-sm transition-all duration-300 placeholder:text-zinc-500 focus:bg-white/10 focus:ring-2 focus:outline-none'
							/>
							{formik.touched.name && formik.errors.name && (
								<p className='mt-1.5 text-xs text-red-400'>{formik.errors.name}</p>
							)}
						</div>

						{/* Email */}
						<div>
							<label
								htmlFor='email'
								className='mb-1.5 block text-sm font-medium text-zinc-300'>
								Email
							</label>
							<input
								id='email'
								name='email'
								type='email'
								autoComplete='email'
								placeholder='you@example.com'
								value={formik.values.email}
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								className='focus:border-primary-500/50 focus:ring-primary-500/20 flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white backdrop-blur-sm transition-all duration-300 placeholder:text-zinc-500 focus:bg-white/10 focus:ring-2 focus:outline-none'
							/>
							{formik.touched.email && formik.errors.email && (
								<p className='mt-1.5 text-xs text-red-400'>{formik.errors.email}</p>
							)}
						</div>

						{/* Password */}
						<div>
							<label
								htmlFor='password'
								className='mb-1.5 block text-sm font-medium text-zinc-300'>
								Password
							</label>
							<div className='relative'>
								<input
									id='password'
									name='password'
									type={showPassword ? 'text' : 'password'}
									autoComplete='new-password'
									placeholder='Create a password'
									value={formik.values.password}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									className='focus:border-primary-500/50 focus:ring-primary-500/20 flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 pr-12 text-sm text-white backdrop-blur-sm transition-all duration-300 placeholder:text-zinc-500 focus:bg-white/10 focus:ring-2 focus:outline-none'
								/>
								<button
									type='button'
									onClick={() => setShowPassword(!showPassword)}
									className='absolute top-1/2 right-4 -translate-y-1/2 text-zinc-500 transition-colors hover:text-white'>
									<Icon
										icon={showPassword ? 'View' : 'ViewOffSlash'}
										className='text-lg'
									/>
								</button>
							</div>

							{/* Password strength bar */}
							{formik.values.password && (
								<div className='mt-2 space-y-2'>
									<div className='grid grid-cols-5 gap-1.5'>
										{[0, 1, 2, 3, 4].map((i) => (
											<div
												key={i}
												className={`h-1 rounded-full transition-colors duration-300 ${
													passedCount > i ? strengthColor : 'bg-zinc-700/50'
												}`}
											/>
										))}
									</div>
									<div className='space-y-0.5'>
										{Object.entries(checks).map(([key, passed]) => (
											<div
												key={key}
												className={`flex items-center gap-1.5 text-xs transition-colors ${
													passed ? 'text-emerald-400' : 'text-zinc-500'
												}`}>
												<Icon
													icon={passed ? 'Tick02' : 'Cancel01'}
													className='text-[10px]'
												/>
												{key === 'hasMinLength' && 'At least 8 characters'}
												{key === 'hasUppercase' && 'One uppercase letter'}
												{key === 'hasLowercase' && 'One lowercase letter'}
												{key === 'hasNumberOrSymbol' && 'One number or symbol'}
												{key === 'hasNoRepeatingChars' && 'No 3+ repeated characters'}
											</div>
										))}
									</div>
								</div>
							)}
						</div>

						{/* Confirm Password */}
						<div>
							<label
								htmlFor='password_confirmation'
								className='mb-1.5 block text-sm font-medium text-zinc-300'>
								Confirm password
							</label>
							<div className='relative'>
								<input
									id='password_confirmation'
									name='password_confirmation'
									type={showConfirm ? 'text' : 'password'}
									autoComplete='new-password'
									placeholder='Repeat your password'
									value={formik.values.password_confirmation}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									className='focus:border-primary-500/50 focus:ring-primary-500/20 flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 pr-12 text-sm text-white backdrop-blur-sm transition-all duration-300 placeholder:text-zinc-500 focus:bg-white/10 focus:ring-2 focus:outline-none'
								/>
								<button
									type='button'
									onClick={() => setShowConfirm(!showConfirm)}
									className='absolute top-1/2 right-4 -translate-y-1/2 text-zinc-500 transition-colors hover:text-white'>
									<Icon
										icon={showConfirm ? 'View' : 'ViewOffSlash'}
										className='text-lg'
									/>
								</button>
							</div>
							{formik.touched.password_confirmation && formik.errors.password_confirmation && (
								<p className='mt-1.5 text-xs text-red-400'>
									{formik.errors.password_confirmation}
								</p>
							)}
						</div>

						<button
							type='submit'
							disabled={isLoading || passedCount < 4}
							className='group from-primary-500 to-primary-600 shadow-primary-500/30 hover:shadow-primary-500/50 focus:ring-primary-500/50 relative mt-2 flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#030712] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'>
							<div className='absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100' />
							{isLoading ? (
								<>
									<svg
										className='h-4 w-4 animate-spin'
										viewBox='0 0 24 24'
										fill='none'>
										<circle
											className='opacity-25'
											cx='12'
											cy='12'
											r='10'
											stroke='currentColor'
											strokeWidth='4'
										/>
										<path
											className='opacity-75'
											fill='currentColor'
											d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
										/>
									</svg>
									<span className='relative'>Creating account...</span>
								</>
							) : (
								<span className='relative'>Create account</span>
							)}
						</button>
					</form>

					{/* Footer */}
					<p className='mt-6 text-center text-sm text-zinc-400'>
						Already have an account?{' '}
						<Link
							to={pages.pagesExamples.login.to}
							className='text-primary-400 hover:text-primary-300 font-medium transition-colors'>
							Sign in
						</Link>
					</p>
				</div>
			</div>

			{/* Right Panel - Feature Highlight */}
			<div className='relative hidden w-[55%] overflow-hidden lg:flex'>
				<div className='relative m-6 flex flex-1 flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-12 backdrop-blur-xl xl:m-8 xl:p-16'>
					{/* Animated decorative elements */}
					<div className='from-primary-500/30 absolute -top-20 -right-20 h-80 w-80 animate-pulse rounded-full bg-gradient-to-br to-violet-500/30 blur-[100px]' />
					<div className='absolute -bottom-20 -left-20 h-80 w-80 animate-pulse rounded-full bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 blur-[100px] [animation-delay:1s]' />
					<div className='absolute top-1/2 left-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-gradient-to-br from-pink-500/20 to-orange-500/20 blur-[80px] [animation-delay:2s]' />

					{/* Floating particles */}
					<div className='absolute inset-0 overflow-hidden'>
						<div className='bg-primary-400/60 absolute top-[20%] left-[10%] h-2 w-2 animate-bounce rounded-full [animation-delay:0s] [animation-duration:3s]' />
						<div className='absolute top-[60%] left-[80%] h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400/60 [animation-delay:0.5s] [animation-duration:4s]' />
						<div className='absolute top-[30%] left-[70%] h-2.5 w-2.5 animate-bounce rounded-full bg-violet-400/60 [animation-delay:1s] [animation-duration:3.5s]' />
						<div className='absolute top-[80%] left-[20%] h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400/60 [animation-delay:1.5s] [animation-duration:4.5s]' />
						<div className='absolute top-[45%] left-[40%] h-2 w-2 animate-bounce rounded-full bg-pink-400/60 [animation-delay:2s] [animation-duration:3s]' />
					</div>

					<div className='relative z-10 w-full max-w-lg'>
						{/* Header */}
						<div className='border-emerald-500/30 bg-emerald-500/10 mb-2 inline-flex items-center gap-2 rounded-full border px-4 py-1.5'>
							<span className='relative flex h-2 w-2'>
								<span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75' />
								<span className='relative inline-flex h-2 w-2 rounded-full bg-emerald-500' />
							</span>
							<span className='text-sm font-medium text-emerald-300'>
								Free to start
							</span>
						</div>

						<h2 className='mb-4 text-5xl leading-[1.1] font-bold tracking-tight text-white xl:text-6xl'>
							Start building
							<br />
							<span className='bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent'>
								in minutes
							</span>
						</h2>
						<p className='mb-12 text-lg text-zinc-400 xl:text-xl'>
							No credit card required. Build, test, and deploy AI workflows instantly.
						</p>

						{/* Benefits */}
						<div className='space-y-4'>
							<div className='flex items-start gap-3'>
								<div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/20'>
									<Icon icon='Tick02' className='text-emerald-400' />
								</div>
								<div>
									<div className='font-medium text-white'>Unlimited workflows</div>
									<div className='text-sm text-zinc-400'>Build as many automations as you need</div>
								</div>
							</div>
							<div className='flex items-start gap-3'>
								<div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-cyan-500/20'>
									<Icon icon='Tick02' className='text-cyan-400' />
								</div>
								<div>
									<div className='font-medium text-white'>100+ integrations</div>
									<div className='text-sm text-zinc-400'>Connect with your favorite tools</div>
								</div>
							</div>
							<div className='flex items-start gap-3'>
								<div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-violet-500/20'>
									<Icon icon='Tick02' className='text-violet-400' />
								</div>
								<div>
									<div className='font-medium text-white'>AI-powered nodes</div>
									<div className='text-sm text-zinc-400'>Leverage AI to supercharge your workflows</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default RegisterPage;
