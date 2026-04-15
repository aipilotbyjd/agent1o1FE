import { useAuth } from '@/context/authContext';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import { Link, useLocation } from 'react-router';
import pages from '@/Routes/pages';

const SettingsHeaderWithTabsExample = () => {
	const settingsPages = pages.app.appMain.subPages.settings.subPages;
	const location = useLocation();
	const { userData } = useAuth();

	return (
		<>
			<div className='mb-12 flex h-48 items-end justify-center rounded-lg bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90% bg-cover bg-top p-4'>
				<Avatar
					src={userData?.avatar ?? undefined}
					name={userData?.name ?? 'User'}
					size='w-36'
					color='zinc'
					className='relative top-1/3 border-4 border-white backdrop-blur-xl dark:border-zinc-900'
					variant='outline'
				/>
			</div>
			<div className='flex flex-col items-center justify-center'>
				<div className='text-2xl font-bold'>{userData?.name ?? 'User'}</div>
				<div className='text-zinc-500'>{userData?.email ?? ''}</div>
			</div>
			<div className='flex justify-between'>
				<div>
					<Link to={settingsPages.general.to}>
						<Button
							aria-label='General'
							icon='Settings02'
							variant={
								location.pathname === settingsPages.general.to ? 'default' : 'link'
							}>
							General
						</Button>
					</Link>
					<Link to={settingsPages.profile.to}>
						<Button
							aria-label='Profile'
							icon='User02'
							variant={
								location.pathname === settingsPages.profile.to ? 'default' : 'link'
							}>
							Profile
						</Button>
					</Link>
					<Link to={settingsPages.workspaces.to}>
						<Button
							aria-label='Workspaces'
							icon='DashboardSquare03'
							variant={
								location.pathname === settingsPages.workspaces.to
									? 'default'
									: 'link'
							}>
							Workspaces
						</Button>
					</Link>
					<Link to={settingsPages.teams.to}>
						<Button
							aria-label='Teams'
							icon='UserMultiple'
							variant={
								location.pathname === settingsPages.teams.to ? 'default' : 'link'
							}>
							Teams
						</Button>
					</Link>
				</div>
			</div>
		</>
	);
};

export default SettingsHeaderWithTabsExample;
