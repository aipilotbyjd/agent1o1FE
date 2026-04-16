import Aside, { AsideBody, AsideQuickContainer } from '@/components/layout/Aside';
import { useNavigate } from 'react-router';
import useAsideStatus from '@/hooks/useAsideStatus';
import Icon from '@/components/icon/Icon';
import Nav, { NavItem, NavTitle } from '@/components/layout/Navigation/Nav';
import pages from '@/Routes/pages';
import classNames from 'classnames';
import AsideHeaderPart from '@/templates/asides/_parts/AsideHeader.part';
import AsideFooterPart from '@/templates/asides/_parts/AsideFooter.part';

const AppAsideTemplate = () => {
	const navigate = useNavigate();
	const { asideStatus } = useAsideStatus();

	return (
		<Aside>
			<AsideHeaderPart />
			<AsideBody>
				<AsideQuickContainer>
					<div
						className={classNames(
							'flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl',
							'bg-primary-500 hover:bg-primary-500/50 text-zinc-900',
							{ 'p-4': asideStatus, 'p-2.5': !asideStatus },
							{ 'col-span-2': asideStatus },
							'transition-colors duration-300 ease-in-out',
						)}
						onClick={() => navigate('/app/story-builder/new')}>
						<Icon icon='PlusSignCircle' size={asideStatus ? 'text-2xl' : 'text-xl'} />
						{asideStatus && <div className=''>Create Workflow</div>}
					</div>
				</AsideQuickContainer>
				<Nav>
					<NavTitle>Menu</NavTitle>
					<NavItem id='workflows' to='/app/workflows' text='Workflows' icon='GitMerge' />
					<NavItem {...pages.app.appMain.subPages.agents} />
					<NavItem {...pages.app.appMain.subPages.credentials} />
					<NavItem
						id='executions'
						to='/app/executions'
						text='Executions'
						icon='PlayCircle'
					/>
					<NavItem {...pages.app.appMain.subPages.variables} />
					<NavItem {...pages.app.appMain.subPages.templates} />
				</Nav>
			</AsideBody>
			<AsideFooterPart />
		</Aside>
	);
};

export default AppAsideTemplate;
