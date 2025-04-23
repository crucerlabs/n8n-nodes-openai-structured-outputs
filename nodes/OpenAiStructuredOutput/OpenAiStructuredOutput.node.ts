import { INodeType, INodeTypeDescription } from 'n8n-workflow';
import { operation } from './properties/operation';
import { model } from './properties/model';
import { jsonSchema } from './properties/jsonSchema';
import { text } from './properties/text';
import { temperature } from './properties/temperature';

export class OpenAiStructuredOutput implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'OpenAI Structured Output',
		name: 'openAiStructuredOutput',
		icon: { light: 'file:openAi.svg', dark: 'file:openAi.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Consume Open AI',
		defaults: {
			name: 'OpenAI Structured Output',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'openAiApi',
				required: true,
			},
		],
		requestDefaults: {
			ignoreHttpStatusErrors: true,
			baseURL:
				'={{ $credentials.url?.split("/").slice(0,-1).join("/") ?? "https://api.openai.com" }}',
		},
		properties: [...operation, ...model, ...jsonSchema, ...text, ...temperature],
	};
}
