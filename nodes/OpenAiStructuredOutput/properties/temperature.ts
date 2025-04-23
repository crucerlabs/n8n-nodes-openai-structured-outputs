import { type INodeProperties } from 'n8n-workflow';

export const temperature: INodeProperties[] = [
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
