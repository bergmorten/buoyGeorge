import { defineFunction } from '@aws-amplify/backend';
export { setupPreTokenGenerationFunction } from './overrides';
import { isSandbox } from '../../isSandbox';
export const preTokenGeneration = defineFunction({
    name: 'pre-token-generation',
    // optionally define an environment variable for your group name
    // environment: {
    //    GROUP_NAME: 'EVERYONE',
    //  },
    resourceGroupName: 'auth',
    runtime: 22,
    logging: { format: 'json', level: 'info' },
    bundling: {
        minify: !isSandbox,
    },
});
