import { type INodeProperties } from 'n8n-workflow';
import { sendErrorPostReceive } from './sendErrorPostReceive';
import { validateStructure } from './validateStructure';

export const structuredOutputOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Extract JSON',
				value: 'extract',
				action: 'Extract JSON according to schema',
				routing: {
					request: {
						method: 'POST',
						url: '/v1/chat/completions',
					},
					output: {
						postReceive: [sendErrorPostReceive, validateStructure],
					},
				},
			},
		],
		default: 'extract',
	},
];

export const structuredOutputFields: INodeProperties[] = [
	{
		displayName: 'Model',
		name: 'model',
		type: 'options',
		default: 'gpt-4o',
		options: [
			{ name: 'gpt-4o', value: 'gpt-4o' },
			{ name: 'gpt-4o-mini', value: 'gpt-4o-mini' },
			{ name: 'gpt-o1', value: 'gpt-o1-model' },
			{ name: 'gpt-o1-mini', value: 'gpt-o1-mini' },
			{ name: 'gpt-o3', value: 'gpt-o3' },
			{ name: 'gpt-o3-mini', value: 'gpt-o3-mini' },
		],
		routing: {
			send: {
				type: 'body',
				property: 'model',
			},
		},
	},
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
	{
		displayName: 'Text',
		name: 'text',
		type: 'string',
		default: '',
		typeOptions: { rows: 5 },
		description: 'Input text to be processed',
		routing: {
			send: {
				type: 'body',
				property: 'messages',
				value:
					'={{ [{ role: "system", content: "Return only a JSON matching the schema from the input." },{ role: "user", content: $value }] }}',
			},
		},
	},
	{
		displayName: 'Temperature',
		name: 'temperature',
		default: 1,
		typeOptions: { maxValue: 1, minValue: 0, numberPrecision: 1 },
		description:
			'Controls randomness: Lowering results in less random completions. As the temperature approaches zero, the model will become deterministic and repetitive.',
		type: 'number',
		routing: {
			send: {
				type: 'body',
				property: 'temperature',
			},
		},
	},
];
