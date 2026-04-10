import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useFormik } from 'formik';
import { useAuth } from '@/context/authContext';
import pages from '@/Routes/pages';
import Icon from '@/components/icon/Icon';
import * as Yup from 'yup';

interface ILoginFormValues {
	email: string;
	password: string;
}

const validationSchema = Yup.object().shape({
	email: Yup.string().email('Invalid email address').required('Email is required'),
	password: Yup.string().required('Password is required'),
});

// Typewriter effect hook
const useTypewriter = (
	texts: string[],
	typingSpeed = 100,
	deletingSpeed = 50,
	pauseDuration = 2000,
) => {
	const [displayText, setDisplayText] = useState('');
	const [textIndex, setTextIndex] = useState(0);
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		const currentText = texts[textIndex];

		const timeout = setTimeout(
			() => {
				if (!isDeleting) {
					if (displayText.length < currentText.length) {
						setDisplayText(currentText.slice(0, displayText.length + 1));
					} else {
						setTimeout(() => setIsDeleting(true), pauseDuration);
					}
				} else {
					if (displayText.length > 0) {
						setDisplayText(displayText.slice(0, -1));
					} else {
						setIsDeleting(false);
						setTextIndex((prev) => (prev + 1) % texts.length);
					}
				}
			},
			isDeleting ? deletingSpeed : typingSpeed,
		);

		return () => clearTimeout(timeout);
	}, [displayText, isDeleting, textIndex, texts, typingSpeed, deletingSpeed, pauseDuration]);

	return displayText;
};

const LoginPage = () => {
	const { onLogin, isLoading } = useAuth();

	const [showPassword, setShowPassword] = useState(false);
	const [rememberMe, setRememberMe] = useState(true);

	const typewriterTexts = ['Automate your workflows with AI-powered automation.'];

	const typedText = useTypewriter(typewriterTexts, 30, 15, 2000);

	const formik = useFormik<ILoginFormValues>({
		initialValues: {
			email: 'demo@agent1o1.com',
			password: 'Password@123',
		},
		validationSchema,
		onSubmit: async (values, { setErrors }) => {
			try {
				await onLogin(values.email, values.password, rememberMe);
			} catch (error: unknown) {
				const err = error as { message?: string };
				if (err?.message) {
					setErrors({ email: err.message });
				}
			}
		},
	});

	const handleGitHubSignIn = () => {
		console.log('GitHub sign in');
	};

	const handleGoogleSignIn = () => {
		console.log('Google sign in');
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
							Welcome back
						</h1>
						<p className='mt-3 text-base text-zinc-400'>
							Sign in to continue to your workflows
						</p>
					</div>

					{/* Social Sign-in Buttons */}
					<div className='flex gap-3'>
						{/* GitHub Button */}
						<button
							type='button'
							onClick={handleGitHubSignIn}
							className='group relative flex flex-1 items-center justify-center gap-2.5 overflow-hidden rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-medium text-white backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10'>
							<div className='absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
							<svg
								className='relative h-5 w-5 transition-transform duration-300 group-hover:scale-110'
								fill='currentColor'
								viewBox='0 0 24 24'>
								<path
									fillRule='evenodd'
									d='M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z'
									clipRule='evenodd'
								/>
							</svg>
							<span className='relative'>GitHub</span>
						</button>

						{/* Google Button */}
						<button
							type='button'
							onClick={handleGoogleSignIn}
							className='group relative flex flex-1 items-center justify-center gap-2.5 overflow-hidden rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-medium text-white backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10'>
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
							<span className='relative'>Google</span>
						</button>
					</div>

					{/* Divider */}
					<div className='my-6 flex items-center'>
						<div className='h-px flex-1 bg-gradient-to-r from-transparent via-zinc-700 to-transparent' />
						<span className='px-4 text-sm text-zinc-500'>or</span>
						<div className='h-px flex-1 bg-gradient-to-r from-transparent via-zinc-700 to-transparent' />
					</div>

					{/* Form */}
					<form onSubmit={formik.handleSubmit} className='space-y-4'>
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

						<div>
							<div className='mb-1.5 flex items-center justify-between'>
								<label
									htmlFor='password'
									className='block text-sm font-medium text-zinc-300'>
									Password
								</label>
								<Link
									to='#'
									className='text-primary-400 hover:text-primary-300 text-sm transition-colors'>
									Forgot password?
								</Link>
							</div>
							<div className='relative'>
								<input
									id='password'
									name='password'
									type={showPassword ? 'text' : 'password'}
									autoComplete='current-password'
									placeholder='Enter your password'
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
							{formik.touched.password && formik.errors.password && (
								<p className='mt-1.5 text-xs text-red-400'>
									{formik.errors.password}
								</p>
							)}
						</div>

						{/* Remember me */}
						<div className='flex items-center gap-2'>
							<button
								type='button'
								onClick={() => setRememberMe(!rememberMe)}
								className={`flex h-5 w-5 items-center justify-center rounded-md border transition-all duration-200 ${rememberMe
										? 'border-primary-500 bg-primary-500'
										: 'border-white/20 bg-white/5'
									}`}>
								{rememberMe && (
									<Icon icon='Tick02' className='text-xs text-white' />
								)}
							</button>
							<span className='text-sm text-zinc-400'>Remember me</span>
						</div>

						<button
							type='submit'
							disabled={isLoading}
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
									<span className='relative'>Signing in...</span>
								</>
							) : (
								<span className='relative'>Sign in</span>
							)}
						</button>
					</form>

					{/* Footer */}
					<p className='mt-6 text-center text-sm text-zinc-400'>
						Don&apos;t have an account?{' '}
						<Link
							to={pages.pagesExamples.signup.to}
							className='text-primary-400 hover:text-primary-300 font-medium transition-colors'>
							Create account
						</Link>
					</p>
				</div>
			</div>

			{/* Right Panel - Feature Highlight */}
			<div className='relative hidden w-[55%] overflow-hidden lg:flex'>
				{/* Container */}
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
						<div className='border-primary-500/30 bg-primary-500/10 mb-2 inline-flex items-center gap-2 rounded-full border px-4 py-1.5'>
							<span className='relative flex h-2 w-2'>
								<span className='bg-primary-400 absolute inline-flex h-full w-full animate-ping rounded-full opacity-75' />
								<span className='bg-primary-500 relative inline-flex h-2 w-2 rounded-full' />
							</span>
							<span className='text-primary-300 text-sm font-medium'>
								Now with AI
							</span>
						</div>

						<h2 className='mb-4 text-5xl leading-[1.1] font-bold tracking-tight text-white xl:text-6xl'>
							Build workflows
							<br />
							<span className='from-primary-400 bg-gradient-to-r via-violet-400 to-emerald-400 bg-clip-text text-transparent'>
								visually
							</span>
						</h2>
						<p className='mb-12 text-lg text-zinc-400 xl:text-xl'>
							Connect apps and automate tasks with our intuitive drag-and-drop editor
						</p>

						{/* Typewriter Input Box */}
						<div className='relative'>
							<div className='group flex items-center rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-2xl backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10'>
								<div className='flex-1 overflow-hidden'>
									<span className='text-base text-zinc-300'>{typedText}</span>
									<span className='bg-primary-400 ml-0.5 inline-block h-5 w-[2px] animate-pulse' />
								</div>
								<button className='from-primary-500 to-primary-600 shadow-primary-500/30 hover:shadow-primary-500/50 ml-4 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-r text-white shadow-lg transition-all duration-300 hover:scale-105'>
									<Icon icon='ArrowUp01' className='text-lg' />
								</button>
							</div>
						</div>

						{/* Feature badges */}
						<div className='mt-10 flex flex-wrap gap-3'>
							<span className='flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 backdrop-blur-sm'>
								<Icon icon='Link01' className='text-primary-400' />
								100+ Integrations
							</span>
							<span className='flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 backdrop-blur-sm'>
								<Icon icon='Zap' className='text-emerald-400' />
								Real-time Sync
							</span>
							<span className='flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 backdrop-blur-sm'>
								<Icon icon='AiCloud' className='text-violet-400' />
								AI-Powered
							</span>
						</div>

						{/* Stats */}
						<div className='mt-10 flex gap-8'>
							<div>
								<div className='text-3xl font-bold text-white'>50K+</div>
								<div className='text-sm text-zinc-500'>Active Users</div>
							</div>
							<div>
								<div className='text-3xl font-bold text-white'>1M+</div>
								<div className='text-sm text-zinc-500'>Workflows Run</div>
							</div>
							<div>
								<div className='text-3xl font-bold text-white'>99.9%</div>
								<div className='text-sm text-zinc-500'>Uptime</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
