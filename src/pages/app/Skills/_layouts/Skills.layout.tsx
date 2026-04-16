import { Outlet } from 'react-router';
import { ReactNode, useState } from 'react';
import Header, { HeaderLeft, HeaderRight } from '@/components/layout/Header';
import Wrapper from '@/components/layout/Wrapper';

export type OutletContextType = {
	setHeaderLeft: (node: ReactNode | undefined) => void;
	setHeaderRight: (node: ReactNode | undefined) => void;
};

const SkillsLayout = () => {
	const [headerLeft, setHeaderLeft] = useState<ReactNode | undefined>(undefined);
	const [headerRight, setHeaderRight] = useState<ReactNode | undefined>(undefined);

	return (
		<>
			<Header>
				<HeaderLeft>{headerLeft}</HeaderLeft>
				<HeaderRight>{headerRight}</HeaderRight>
			</Header>
			<Wrapper>
				<Outlet context={{ setHeaderLeft, setHeaderRight }} />
			</Wrapper>
		</>
	);
};

export default SkillsLayout;
