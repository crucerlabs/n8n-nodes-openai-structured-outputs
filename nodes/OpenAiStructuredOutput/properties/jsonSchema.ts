import { type INodeProperties } from 'n8n-workflow';

export const jsonSchema: INodeProperties[] = [
	{
		displayName: 'JSON Schema',
		name: 'jsonSchema',
		type: 'json',
		default: '',
		description: 'JSON Schema that the model will follow',
		routing: {
			send: {
				type: 'body',
				property: 'response_format',
				value:
					'={{ { type: "json_schema", json_schema: { name: "extracted", schema: JSON.parse($value), strict: true } } }}',
			},
		},
	},
];
