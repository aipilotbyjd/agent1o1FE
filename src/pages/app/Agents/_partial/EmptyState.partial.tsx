import Button from '@/components/ui/Button';
import Icon from '@/components/icon/Icon';

interface IEmptyStatePartialProps {
	hasFilters: boolean;
	onClearFilters: () => void;
	onCreate: () => void;
}

const EmptyStatePartial = ({ hasFilters, onClearFilters, onCreate }: IEmptyStatePartialProps) => {
	if (hasFilters) {
		return (
			<div className='flex flex-1 flex-col items-center justify-center py-12'>
				<Icon icon='SearchList' size='text-5xl' color='zinc' />
				<p className='mt-4 text-lg font-semibold'>No agents found</p>
				<p className='mt-2 text-sm text-zinc-500'>
					Try adjusting your filters or search query
				</p>
				<Button variant='outline' className='mt-4' onClick={onClearFilters}>
					Clear Filters
				</Button>
			</div>
		);
	}

	return (
		<div className='flex flex-1 flex-col items-center justify-center py-12'>
			<Icon icon='Bot' size='text-5xl' color='zinc' />
			<p className='mt-4 text-lg font-semibold'>No agents yet</p>
			<p className='mt-2 text-sm text-zinc-500'>
				Create your first AI agent to get started
			</p>
			<Button variant='solid' icon='PlusSignCircle' className='mt-4' onClick={onCreate}>
				Create Agent
			</Button>
		</div>
	);
};

export default EmptyStatePartial;
