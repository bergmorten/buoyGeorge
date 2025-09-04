import { defineFunction } from '@aws-amplify/backend';
export { setupSqsHandlerFunction } from './overrides';
import { isSandbox } from '../../isSandbox';
export const sqsHandlerFunction = defineFunction({
    name: 'sqs-handler',
    resourceGroupName: 'data',
    runtime: 22,
    memoryMB: 1024,
    timeoutSeconds: 30,
    logging: { format: 'json', level: 'info' },
    bundling: {
        minify: !isSandbox,
    },
});
