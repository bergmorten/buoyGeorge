import { a } from '@aws-amplify/backend';

export const PushToken = a
    .model({
        id: a.id().required(),
        userId: a
            .id()
            .required()
            .authorization((allow) => [
                allow.ownerDefinedIn('userId').to(['read', 'create', 'delete']),
                allow.groups(['SUPERS']),
            ]),
        token: a.string().required(),
        lastSeen: a.timestamp().required(),
        lastLocation: a.customType({
            lat: a.float(),
            lon: a.float(),
        }),
        appVersion: a.string().required(),
        platform: a.string().required(),
        // user: a.belongsTo('User', 'userId'),
    })
    .authorization((allow) => [
        allow.ownerDefinedIn('userId'),
        allow.groups(['SUPERS']),
    ]);
