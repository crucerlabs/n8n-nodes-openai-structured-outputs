import { type INodeProperties } from 'n8n-workflow';

export const model: INodeProperties[] = [
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
];
