import {
	IExecuteSingleFunctions,
	IN8nHttpFullResponse,
	INodeExecutionData,
	JsonObject,
	NodeApiError,
} from 'n8n-workflow';

export async function sendErrorPostReceive(
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
