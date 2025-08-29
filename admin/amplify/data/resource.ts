import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { Client } from './schemes/Client';
import { Modem } from './schemes/Modem';
export { setupData } from './overrides';

const schema = a.schema({
    Client,
    Modem,
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
    schema,

    authorizationModes: {
        defaultAuthorizationMode: 'userPool',
    },
});
