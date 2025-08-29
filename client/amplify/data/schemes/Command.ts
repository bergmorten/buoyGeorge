import { a } from '@aws-amplify/backend';

export const Command = a
    .model({
        id: a.id().required(),
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
        command: a.string().required(),
        isArchived: a.string().required().default('false'),
        status: a.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED']),
        fleetId: a.id().required(),
        producerId: a.id().required(),
        //  producer: a.belongsTo('Producer', 'producerId'),
    })
    .secondaryIndexes((index) => [
        index('producerId')
            .sortKeys(['createdAt'])
            .queryField('CommandByProducer')
            .name('byProducer'),
    ])
    .authorization((allow) => [
        allow.groupDefinedIn('fleetId').to(['read', 'update', 'create']),
        allow.groups(['ADMINS']).to(['read', 'update', 'create']),
        allow.groups(['SUPERS']),
    ]);
