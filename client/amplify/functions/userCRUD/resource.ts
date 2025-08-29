import { defineFunction } from '@aws-amplify/backend';
export { setupUserCrudFunction } from './overrides';
import { isSandbox } from '../../isSandbox';
export const userCRUDFunction = defineFunction({
    name: 'user-CRUD',
    resourceGroupName: 'auth',
    runtime: 22,
    logging: { format: 'json', level: 'info' },
    bundling: {
        minify: !isSandbox,
    },
});
