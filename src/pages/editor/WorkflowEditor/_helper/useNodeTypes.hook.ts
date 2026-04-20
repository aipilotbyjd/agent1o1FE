import { useMemo } from 'react';
import { useNodeTypes as useNodeTypesApi, useNodeCategories } from '@/api/hooks/useNodeTypes';
import { INodeTypeDefinition, convertApiNodeTypes } from './nodeTypes.helper';

interface UseNodeTypesResult {
	nodeTypes: INodeTypeDefinition[];
	categories: Record<string, { label: string; icon: string; color: string }>;
	isLoading: boolean;
	isError: boolean;
	getNodesByCategory: (category: string) => INodeTypeDefinition[];
	searchNodes: (query: string) => INodeTypeDefinition[];
	getNodeTypeDefinition: (type: string) => INodeTypeDefinition | undefined;
}

/**
 * Hook to get node types from API
 */
export const useNodeTypesWithApi = (): UseNodeTypesResult => {
	const { data: apiNodeTypes, isLoading, isError } = useNodeTypesApi();
	const { data: apiCategories } = useNodeCategories();

	// Convert API nodes directly to frontend definition
	const nodeTypes = useMemo(() => {
		if (!apiNodeTypes) return [];
		return convertApiNodeTypes(apiNodeTypes);
	}, [apiNodeTypes]);

	// Convert API categories
	const categories = useMemo(() => {
		if (apiCategories && apiCategories.length > 0) {
			const categoryMap = {} as Record<
				string,
				{ label: string; icon: string; color: string }
			>;

			apiCategories.forEach((cat) => {
				categoryMap[cat.id] = {
					label: cat.name,
					// API must return icon and color, or we default
					// @ts-ignore
					icon: cat.icon || 'Circle',
					// @ts-ignore
					color: cat.color || 'zinc',
				};
			});

			return categoryMap;
		}
		return {};
	}, [apiCategories]);

	// Get nodes by category
	const getNodesByCategoryFn = useMemo(() => {
		return (category: string): INodeTypeDefinition[] => {
			return nodeTypes.filter((def) => def.category === category);
		};
	}, [nodeTypes]);

	// Search nodes
	const searchNodesFn = useMemo(() => {
		return (query: string): INodeTypeDefinition[] => {
			const lowerQuery = query.toLowerCase();
			return nodeTypes.filter(
				(def) =>
					def.label.toLowerCase().includes(lowerQuery) ||
					def.description.toLowerCase().includes(lowerQuery) ||
					def.type.toLowerCase().includes(lowerQuery),
			);
		};
	}, [nodeTypes]);

	// Get node type definition
	const getNodeTypeDefinitionFn = useMemo(() => {
		return (type: string): INodeTypeDefinition | undefined => {
			if (!type) return undefined;

			// 1. Try direct match on type or apiType
			let definition = nodeTypes.find((def) => def.type === type || def.apiType === type);

			// 2. Try match excluding prefix (if API returns 'action.http' but we look for 'http')
			if (!definition && type.includes('.')) {
				const shortType = type.split('.').pop();
				definition = nodeTypes.find(
					(def) => def.type === shortType || def.type.endsWith(`.${shortType}`),
				);
			}

			// 3. Reverse check (if definition is 'action.http' but we look for 'http')
			if (!definition && !type.includes('.')) {
				definition = nodeTypes.find((def) => def.type.endsWith(`.${type}`));
			}

			return definition;
		};
	}, [nodeTypes]);

	return {
		nodeTypes,
		categories,
		isLoading,
		isError,
		getNodesByCategory: getNodesByCategoryFn,
		searchNodes: searchNodesFn,
		getNodeTypeDefinition: getNodeTypeDefinitionFn,
	};
};

export default useNodeTypesWithApi;
