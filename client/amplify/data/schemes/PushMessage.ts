import { a } from '@aws-amplify/backend';

export const PushMessage = a
    .model({
        id: a.id().required(),
        messageId: a.string().required(),
        tokenId: a.id().required(),
        isSeen: a.boolean().required(),
        isAcked: a.boolean().required(),
        userId: a
            .id()
            .required()
            .authorization((allow) => [
                allow.ownerDefinedIn('userId').to(['read', 'create', 'delete']),
                allow.groups(['SUPERS']),
            ]),
        // user: a.belongsTo('User', 'userId'),
        logId: a.id().required(),
        //log: a.belongsTo('Log', 'logId'),
    })
    .authorization((allow) => [
        allow.ownerDefinedIn('userId'),
        allow.groups(['SUPERS']),
    ]);
