import { defineFunction } from '@aws-amplify/backend';
export { setupUserMigrationFunction } from './overrides';
import { isSandbox } from '../../isSandbox';
export const userMigration = defineFunction({
    name: 'user-migration',
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
