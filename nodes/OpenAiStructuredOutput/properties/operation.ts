import { type INodeProperties } from 'n8n-workflow';
import { sendErrorPostReceive } from '../scripts/sendErrorPostReceive';
import { validateStructure } from '../scripts/validateStructure';

export const operation: INodeProperties[] = [
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
