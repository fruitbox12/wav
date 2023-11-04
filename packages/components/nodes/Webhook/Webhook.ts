import {
    ICommonObject,
    IDbCollection,
    INode,
    INodeData,
    INodeOptionsValue,
    INodeParams,
    IWebhookNodeExecutionData,
    NodeType
} from '../../src/Interface'
import { compareKeys, returnWebhookNodeExecutionData } from '../../src/utils'

class Webhook implements INode {
    label: string
    name: string
    type: NodeType
    description?: string
    version: number
    icon: string
    category: string
    incoming: number
    outgoing: number
    inputParameters?: INodeParams[]

    constructor() {
        this.label = 'Webhook'
        this.icon = 'webhook.svg'
        this.name = 'webhook'
        this.type = 'webhook'
        this.category = 'Utilities'
        this.version = 2.0
        this.description = 'Start workflow when webhook is called'
        this.incoming = 0
        this.outgoing = 1
        this.inputParameters = [
            {
                label: 'HTTP Method',
                name: 'httpMethod',
                type: 'options',
                options: [
                    {
                        label: 'GET',
                        name: 'GET'
                    },
                    {
                        label: 'POST',
                        name: 'POST'
                    }
                ],
                default: 'GET',
                description: 'The HTTP method to listen to.'
            },
            {
                label: 'Authorization',
                name: 'authorization',
                type: 'options',
                options: [
                    {
                        label: 'API',
                        name: 'headerAuth',
                        description: 'Webhook header must contains "X-API-KEY" with matching key'
                    },
                    {
                        label: 'None',
                        name: 'none'
                    }
                ],
                default: 'none',
                description: 'The way to authorize incoming webhook.'
            },
            {
                label: 'API key',
                name: 'apiKey',
                type: 'asyncOptions',
                loadMethod: 'getAPIKeys',
                description:
                    'Incoming call must consists header "x-api-key" with matching API key. You can create new key from the dashboard',
                show: {
                    'inputParameters.authorization': ['headerAuth']
                }
            },
            {
                label: 'Response Code',
                name: 'responseCode',
                type: 'number',
                default: 200,
                description: 'The HTTP response code to return when a HTTP request is made to this endpoint URL. Valid range: 1XX - 5XX'
            },
            {
                label: 'What/How to Return',
                name: 'returnType',
                type: 'options',
                options: [
                    {
                        label: 'Immediate Reponse',
                        name: 'immediateResponse',
                        description: 'Returns response immediately once webhook is called'
                    },
                    {
                        label: 'When Last Node Finishes',
                        name: 'lastNodeResponse',
                        description: 'Returns output response of the last executed node'
                    }
                ],
                default: 'immediateResponse',
                description: 'What data or message, and how should Webhook node return upon successful calling'
            },
            {
                label: 'Response Data',
                name: 'responseData',
                type: 'string',
                default: '',
                description:
                    'Custom response data to return when a HTTP request is made to this webhook endpoint URL. If not provided, default to: Webhook received!',
                optional: true,
                show: {
                    'inputParameters.returnType': ['immediateResponse']
                }
            }
        ]
    }

    loadMethods = {
        async getAPIKeys(nodeData: INodeData, dbCollection?: IDbCollection, apiKeys?: ICommonObject[]): Promise<INodeOptionsValue[]> {
            const returnData: INodeOptionsValue[] = []

            if (!apiKeys || !apiKeys.length) return returnData

            for (let i = 0; i < apiKeys.length; i += 1) {
                const key = apiKeys[i]
                const data = {
                    label: key.keyName,
                    description: key.apiKey,
                    name: key.apiSecret
                } as INodeOptionsValue
                returnData.push(data)
            }
            return returnData
        }
    }

    async runWebhook(nodeData: INodeData): Promise<IWebhookNodeExecutionData[] | null> {
        const inputParametersData = nodeData.inputParameters
        const req = nodeData.req

        if (inputParametersData === undefined) {
            throw new Error('Required data missing')
        }

        if (req === undefined) {
            throw new Error('Missing request')
        }

        const responseData = (inputParametersData.responseData as string) || ''
        const authorization = inputParametersData.authorization as string
        const apiSecret = inputParametersData.apiKey as string

        const returnData: ICommonObject[] = []

        if (authorization === 'headerAuth') {
            let suppliedKey = ''
            if (req.headers['X-API-KEY']) suppliedKey = req.headers['X-API-KEY'] as string
            if (req.headers['x-api-key']) suppliedKey = req.headers['x-api-key'] as string
            if (!suppliedKey) throw new Error('401: Missing API Key')
            const isKeyValid = compareKeys(apiSecret, suppliedKey)
            if (!isKeyValid) throw new Error('403: Unauthorized API Key')
        }

        returnData.push({
            headers: req?.headers,
            params: req?.params,
            query: req?.query,
            body: req?.body,
            rawBody: (req as any).rawBody,
            url: req?.url
        })

        return returnWebhookNodeExecutionData(returnData, responseData)
    }
}

module.exports = { nodeClass: Webhook }
