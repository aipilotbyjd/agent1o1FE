// Node type category
export type TNodeCategory =
	| 'trigger'
	| 'action'
	| 'logic'
	| 'transform'
	| 'integration'
	| 'ai'
	| 'utility'
	| 'interaction';

// Node parameter types
export type TNodeParameterType =
	| 'string'
	| 'number'
	| 'boolean'
	| 'options' // API uses 'options'
	| 'select' // Legacy/Frontend
	| 'code'
	| 'json'
	| 'credential' // API uses 'credential'
	| 'expression';

// Node parameter definition from API
export interface INodeParameter {
	name: string;
	display_name?: string; // API uses display_name
	label?: string; // Frontend uses label
	type: TNodeParameterType;
	required?: boolean;
	description?: string;
	default?: unknown;
	placeholder?: string;
	options?: Array<{ name: string; value: string; description?: string }>; // API options
	show_if?: string; // API uses show_if condition
}

// Node input/output definition
export interface INodeIO {
	name: string;
	type: string;
	description?: string;
}

// Schema field definition from backend
export interface INodeSchemaField {
	name: string;
	type: string;
	label: string;
	description?: string;
	required?: boolean;
	default?: unknown;
	options?: Array<{ value: string; label: string }>;
}

// Node schema from backend
export interface INodeSchema {
	inputs?: INodeSchemaField[];
	outputs?: INodeSchemaField[];
}

// Node type definition from API
export interface INodeType {
	type: string;
	name: string;
	description: string;
	category: TNodeCategory;
	version: string;
	icon?: string;
	color?: string;
	tags?: string[];
	inputs: INodeIO[];
	outputs: INodeIO[];
	parameters?: INodeParameter[];
	credentials?: string[];
	schema?: INodeSchema;
}

// Node category from API
export interface INodeCategory {
	id: TNodeCategory;
	name: string;
	description: string;
}

// Filters for node types list
export interface INodeTypeFilters {
	category?: TNodeCategory;
	search?: string;
}
