import { a } from '@aws-amplify/backend';

export const Org = a
    .model({
        id: a.id().required(),
        url: a.url().required(),
        name: a.string().required(),
        contactInformation: a.string().required(),
        primaryContactId: a.id(), // Must be created a user first
        billingData: a
            .string()
            .authorization((allow) => [
                allow.groups(['ADMINS']).to(['read']),
                allow.groups(['SUPERS']),
            ]),
    })
    .authorization((allow) => [
        // allow.resource(functionWithDataAccess),
        allow.authenticated().to(['read']),
        allow.groups(['SUPERS']),
    ]);
