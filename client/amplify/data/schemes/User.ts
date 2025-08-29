import { a } from '@aws-amplify/backend';

export const User = a
    .model({
        id: a.id().required(),
        isArchived: a.string().required().default('false'),
        fullName: a.string().required(),
        email: a.email().required(),
        phone: a.phone().required(),
        lastLogon: a
            .datetime()
            .authorization((allow) => [
                allow.authenticated().to(['read']),
                allow.ownerDefinedIn('id').to(['read', 'update']),
                allow.groups(['ADMINS', 'SUPERS']),
            ]),
        resendInvite: a.integer(),
        orgAdmin: a.boolean().required().default(false),
        avatar: a
            .string()
            .authorization((allow) => [
                allow.authenticated().to(['read']),
                allow.ownerDefinedIn('id').to(['read', 'update']),
                allow.groups(['ADMINS', 'SUPERS']),
            ]),
        userData: a
            .string()
            .authorization((allow) => [
                allow.authenticated().to(['read']),
                allow.ownerDefinedIn('id').to(['read', 'update']),
                allow.groups(['ADMINS', 'SUPERS']),
            ]),
        notificationSetting: a
            .string()
            .authorization((allow) => [
                allow.authenticated().to(['read']),
                allow.ownerDefinedIn('id').to(['read', 'update']),
                allow.groups(['ADMINS', 'SUPERS']),
            ]),
        // fleets: a.hasMany('UserFleet', 'userId'),
        // pushTokens: a.hasMany('PushToken', 'userId'),
        // pushMessages: a.hasMany('PushMessage', 'userId'),
    })
    .secondaryIndexes((index) => [
        index('isArchived').queryField('userByArchived').name('byArchived'),
    ])
    .authorization((allow) => [
        // allow.resource(functionWithDataAccess),
        allow.authenticated().to(['read']),
        allow.groups(['ADMINS']).to(['read', 'update', 'create']),
        allow.groups(['SUPERS']),
    ]);
