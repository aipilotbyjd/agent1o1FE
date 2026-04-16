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
				<Icon icon='FileSearch' size='text-5xl' color='zinc' />
				<p className='mt-4 text-lg font-semibold'>No skills found</p>
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
			<Icon icon='Tools' size='text-5xl' color='zinc' />
			<p className='mt-4 text-lg font-semibold'>No skills yet</p>
			<p className='mt-2 text-sm text-zinc-500'>
				Create your first skill to enhance agent capabilities
			</p>
			<Button variant='solid' icon='PlusSignCircle' className='mt-4' onClick={onCreate}>
				Create Skill
			</Button>
		</div>
	);
};

export default EmptyStatePartial;
