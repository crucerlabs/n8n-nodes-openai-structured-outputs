import {
	NodeOperationError,
	type IExecuteSingleFunctions,
	type IN8nHttpFullResponse,
	type INodeExecutionData,
} from 'n8n-workflow';

import Ajv from 'ajv';

const ajv = new Ajv({ strict: true, coerceTypes: true, useDefaults: true, removeAdditional: true });

export async function validateStructure(
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

	return [
		{
			...data[0],
			json: {
				parsed,
				errors,
			},
		},
	];
}
