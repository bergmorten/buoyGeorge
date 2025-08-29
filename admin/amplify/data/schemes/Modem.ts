import { a } from '@aws-amplify/backend';
export const Modem = a
    .model({
        id: a.id().required(),
        isBanned: a.boolean().required().default(false),
        clientId: a.id().required(),
        client: a.belongsTo('Client', 'clientId'),
        type: a.enum(['IRIDIUM_SBD', 'IRIDIUM_IMT', 'CELLULAR']),
        identityString: a.string(),
        publicKey: a.string(),
        certificate: a.string(),
    })
    .authorization((allow) => [allow.authenticated()]);
