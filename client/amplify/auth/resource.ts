import { defineAuth } from '@aws-amplify/backend';
import { userCRUDFunction } from '../functions/userCRUD/resource';
import { preTokenGeneration } from '../functions/preTokenGeneration/resource';
import { userMigration } from '../functions/userMigration/resource';
export { setupAuth } from './overrides';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
    loginWith: {
        email: true,
    },
    groups: ['SUPERS', 'ADMINS'],
    userAttributes: {
        email: {
            mutable: true,
            required: true,
        },
        phoneNumber: {
            mutable: true,
            required: true,
        },
        preferredUsername: {
            mutable: true,
            required: false,
        },
        'custom:is_Super': {
            dataType: 'Boolean',
            mutable: true,
        },
    },

    triggers: {
        preTokenGeneration,
        userMigration,
    },
    access: (allow) => [
        allow.resource(userCRUDFunction).to(['manageUsers', 'listUsers']),
    ],
});
