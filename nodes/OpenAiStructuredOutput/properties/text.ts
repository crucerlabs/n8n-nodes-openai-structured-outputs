import { type INodeProperties } from 'n8n-workflow';

export const text: INodeProperties[] = [
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
];
