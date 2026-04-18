import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Icon from '@/components/icon/Icon';
import pages from '@/Routes/pages';

const OAuthCallbackPage = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
	const [errorMessage, setErrorMessage] = useState('');

	useEffect(() => {
		const error = searchParams.get('error');
		const errorDescription = searchParams.get('error_description');
		const success = searchParams.get('success');
		const credentialId = searchParams.get('credential_id');

		if (error) {
			const message = errorDescription || error || 'OAuth authentication failed';
			setStatus('error');
			setErrorMessage(message);

			if (window.opener) {
				window.opener.postMessage(
					{ type: 'oauth_callback', status: 'error', error: message },
					window.location.origin,
				);
				window.setTimeout(() => window.close(), 1500);
			}
			return;
		}

		if (success === 'true' || credentialId) {
			setStatus('success');

			if (window.opener) {
				window.opener.postMessage(
					{ type: 'oauth_callback', status: 'success', credentialId },
					window.location.origin,
				);
				window.setTimeout(() => window.close(), 1000);
				return;
			}

			window.setTimeout(() => navigate(pages.app.appMain.subPages.credentials.to), 1500);
			return;
		}

		const timeout = window.setTimeout(() => {
			setStatus('error');
			setErrorMessage('OAuth callback did not receive expected parameters');
		}, 5000);

		return () => window.clearTimeout(timeout);
	}, [navigate, searchParams]);

	const handleReturn = () => {
		if (window.opener) {
			window.close();
			return;
		}
		navigate(pages.app.appMain.subPages.credentials.to);
	};

	return (
		<div className='flex min-h-screen items-center justify-center bg-zinc-50 p-6 dark:bg-zinc-950'>
			<div className='w-full max-w-md rounded-lg border border-zinc-200 bg-white p-8 text-center shadow-xl dark:border-zinc-800 dark:bg-zinc-900'>
				{status === 'loading' && (
					<>
						<div className='mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/30'>
							<Spinner color='blue' />
						</div>
						<h2 className='mb-2 text-xl font-semibold text-zinc-900 dark:text-white'>
							Completing authentication
						</h2>
						<p className='text-zinc-500'>Finishing the OAuth connection.</p>
					</>
				)}

				{status === 'success' && (
					<>
						<div className='mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/30'>
							<Icon icon='CheckmarkCircle02' className='text-3xl text-emerald-500' />
						</div>
						<h2 className='mb-2 text-xl font-semibold text-zinc-900 dark:text-white'>
							Connection successful
						</h2>
						<p className='mb-6 text-zinc-500'>
							{window.opener
								? 'This window will close automatically.'
								: 'Returning to credentials.'}
						</p>
						{!window.opener && (
							<Button variant='solid' color='primary' icon='ArrowRight01' onClick={handleReturn}>
								Go to Credentials
							</Button>
						)}
					</>
				)}

				{status === 'error' && (
					<>
						<div className='mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30'>
							<Icon icon='Cancel01' className='text-3xl text-red-500' />
						</div>
						<h2 className='mb-2 text-xl font-semibold text-zinc-900 dark:text-white'>
							Connection failed
						</h2>
						<p className='mb-6 text-zinc-500'>
							{errorMessage || 'OAuth authentication failed.'}
						</p>
						<Button variant='solid' color='primary' icon='Refresh' onClick={handleReturn}>
							Return to Credentials
						</Button>
					</>
				)}
			</div>
		</div>
	);
};

export default OAuthCallbackPage;
