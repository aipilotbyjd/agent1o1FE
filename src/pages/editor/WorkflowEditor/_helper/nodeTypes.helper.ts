import { TIcons } from '@/types/icons.type';
import { INodeType } from '@/types/nodeType.type';

export type TNodeCategory = string;

export interface INodeParameter {
	name: string;
	type:
		| 'string'
		| 'number'
		| 'boolean'
		| 'select'
		| 'code'
		| 'json'
		| 'expression'
		| 'credential';
	label: string;
	description?: string;
	default?: unknown;
	required?: boolean;
	options?: { label: string; value: string }[];
	placeholder?: string;
	showIf?: string;
}

// Schema field definition from API
export interface INodeSchemaField {
	name: string;
	type: string;
	label: string;
	description?: string;
	required?: boolean;
	default?: unknown;
	options?: Array<{ value: string; label: string }>;
}

// Node schema from API
export interface INodeSchema {
	inputs?: INodeSchemaField[];
	outputs?: INodeSchemaField[];
}

export interface INodeTypeDefinition {
	type: string;
	apiType?: string; // Original API type for backend calls
	label: string;
	category: TNodeCategory;
	icon: TIcons;
	color: string;
	description: string;
	inputs: number;
	outputs: number;
	parameters: INodeParameter[];
	credentials?: string[]; // Credential types required
	schema?: INodeSchema; // Detailed input/output schema from backend
	tags?: string[]; // Tags from backend
}

/**
 * Convert API node type to frontend node type definition
 */
export const convertApiNodeType = (apiNode: INodeType): INodeTypeDefinition => {
	// Use icon and color from API, default to fallbacks if missing
	const icon = (apiNode.icon as TIcons) || 'Circle';
	const color = apiNode.color || 'zinc';

	// Determine inputs/outputs count from API data
	const inputs = apiNode.inputs?.length || 0;
	const outputs = apiNode.outputs?.length || 0;

	// Convert API parameters to frontend format
	const parameters: INodeParameter[] = (apiNode.parameters || []).map((param) => {
		let type: INodeParameter['type'] = 'string';
		let options = undefined;

		// Map API types to frontend types
		switch (param.type) {
			case 'options':
			case 'select':
				type = 'select';
				options = param.options?.map((opt) => ({
					label: opt.name || opt.value,
					value: opt.value,
				}));
				break;
			case 'boolean':
				type = 'boolean';
				break;
			case 'number':
				type = 'number';
				break;
			case 'json':
				type = 'json';
				break;
			case 'code':
				type = 'code';
				break;
			case 'credential':
				type = 'string'; // Treat credentials as string inputs for now
				break;
			case 'expression':
				type = 'expression';
				break;
			default:
				type = 'string';
		}

		return {
			name: param.name,
			type,
			label:
				param.display_name ||
				param.label ||
				param.name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
			description: param.description,
			default: param.default,
			required: param.required,
			options,
			placeholder: param.placeholder,
			showIf: param.show_if,
		};
	});

	// Build schema from API inputs/outputs if not provided
	const schema: INodeSchema = apiNode.schema || {
		inputs: apiNode.inputs?.map((input) => ({
			name: input.name,
			type: input.type,
			label: input.name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
			description: input.description,
		})),
		outputs: apiNode.outputs?.map((output) => ({
			name: output.name,
			type: output.type,
			label: output.name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
			description: output.description,
		})),
	};

	return {
		type: apiNode.type, // Use API type directly
		apiType: apiNode.type,
		label: apiNode.name,
		category: apiNode.category,
		icon,
		color,
		description: apiNode.description,
		inputs: inputs > 0 ? inputs : 1,
		outputs: outputs > 0 ? outputs : 1,
		parameters,
		credentials: apiNode.credentials,
		schema,
		tags: apiNode.tags,
	};
};

/**
 * Convert multiple API node types to frontend format
 */
export const convertApiNodeTypes = (apiNodes: INodeType[]): INodeTypeDefinition[] => {
	return apiNodes.map(convertApiNodeType);
};
