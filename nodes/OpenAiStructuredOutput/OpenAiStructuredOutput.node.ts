import { INodeType, INodeTypeDescription, NodeConnectionType } from 'n8n-workflow';
import {
	structuredOutputFields,
	structuredOutputOperations,
} from './OpenAiStructuredOutputDescription';

export class OpenAiStructuredOutput implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'OpenAI Structured Output',
		name: 'openAiStructuredOutput',
		hidden: true,
		icon: { light: 'file:openAi.svg', dark: 'file:openAi.dark.svg' },
		group: ['transform'],
		version: [1, 1.1],
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Consume Open AI',
		defaults: {
			name: 'OpenAI',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
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
		properties: [...structuredOutputOperations, ...structuredOutputFields],
	};
}
