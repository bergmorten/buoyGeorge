import { defineFunction } from '@aws-amplify/backend';
export { setupCommandTriggerFunction } from './overrides';
import { isSandbox } from '../../isSandbox';
export const commandTriggerFunction = defineFunction({
    name: 'command-trigger',
    resourceGroupName: 'data',
    runtime: 22,
    memoryMB: 1024,
    timeoutSeconds: 30,
    logging: { format: 'json', level: 'info' },
    bundling: {
        minify: !isSandbox,
    },
});
