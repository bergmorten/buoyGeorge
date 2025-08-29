import { defineStorage } from '@aws-amplify/backend';
export { setupStorage } from './overrides';

export const storage = defineStorage({
    name: 'main',
    isDefault: true,
    access: (allow) => ({
        'record/*': [allow.authenticated.to(['read'])],
        'public/*': [
            //allow.groups(['SUPERS', 'ADMINS']).to(['read', 'write', 'delete']), // WTF does not work
            allow.authenticated.to(['read', 'write', 'delete']), // Should only have read....
        ],
    }),
});
