import { defineStorage } from '@aws-amplify/backend';
export { setupStorage } from './overrides';

export const storage = defineStorage({
    name: 'admin',
    isDefault: true,
    access: (allow) => ({
        'private/*': [allow.authenticated.to(['read', 'write', 'delete'])],
        'public/*': [
            allow.authenticated.to(['read', 'write', 'delete']),
            allow.guest.to(['read']),
        ],
    }),
});
