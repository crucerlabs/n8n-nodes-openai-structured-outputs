import {
	JsonObject,
	NodeApiError,
	NodeOperationError,
	type IExecuteSingleFunctions,
	type IN8nHttpFullResponse,
	type INodeExecutionData,
	type INodeProperties,
} from 'n8n-workflow';

import Ajv from 'ajv';

const ajv = new Ajv({ strict: true, coerceTypes: true, useDefaults: true, removeAdditional: true });

async function sendErrorPostReceive(
	this: IExecuteSingleFunctions,
	data: INodeExecutionData[],
	response: IN8nHttpFullResponse,
): Promise<INodeExecutionData[]> {
	if (String(response.statusCode).startsWith('4') || String(response.statusCode).startsWith('5')) {
		throw new NodeApiError(this.getNode(), {
			message: `OpenAI Error: ${response.statusCode} ${response.statusMessage} ${JSON.stringify(response.body, null, 2)}`,
			response,
		} as unknown as JsonObject);
	}
	return data;
}

function validateStructure(
	this: IExecuteSingleFunctions,
	data: INodeExecutionData[],
	response: IN8nHttpFullResponse,
): Promise<INodeExecutionData[]> {
	const stringData = JSON.stringify(data, null, 2);
	const stringResponse = JSON.stringify(response, null, 2);

	this.logger.debug('Structured Output - postReceive', {
		data: stringData,
		response: stringResponse,
	});

	const rawSchema = this.getNodeParameter('jsonSchema', 0) as string;

	let schema: object;
	try {
		schema = JSON.parse(rawSchema);
	} catch {
		throw new NodeOperationError(this.getNode(), 'JSON Schema inválido');
	}
	const validate = ajv.compile(schema);

	const item = data[0];
	const json = item.json as Record<string, unknown>;

	if (!Array.isArray(json.choices)) {
		throw new NodeOperationError(
			this.getNode(),
			'Invalid response: missing or malformed `choices` array',
		);
	}

	const firstChoice = json.choices[0] as Record<string, unknown> | undefined;
	const message = firstChoice?.message as { content?: unknown } | undefined;
	const rawContent = message?.content;

	if (typeof rawContent !== 'string') {
		throw new NodeOperationError(this.getNode(), 'Invalid response: `content` is not a string');
	}

	let parsed: Record<string, unknown>;
	try {
		parsed = JSON.parse(rawContent);
	} catch {
		throw new NodeOperationError(
			this.getNode(),
			`Invalid response: ${rawContent} is not valid JSON`,
		);
	}

	validate(parsed);

	const errors = validate.errors;

	return new Promise((resolve) =>
		resolve([
			{
				...data[0],
				json: {
					parsed,
					errors,
				},
			},
		]),
	);
}

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
