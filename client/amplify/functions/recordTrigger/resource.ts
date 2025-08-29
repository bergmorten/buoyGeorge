import { defineFunction } from '@aws-amplify/backend';
export { setupRecordTriggerFunction } from './overrides';
import { isSandbox } from '../../isSandbox';
export const recordTriggerFunction = defineFunction({
    name: 'record-trigger',
    resourceGroupName: 'data',
    runtime: 22,
    memoryMB: 1024,
    timeoutSeconds: 30,
    logging: { format: 'json', level: 'info' },
    bundling: {
        minify: !isSandbox,
    },
});
