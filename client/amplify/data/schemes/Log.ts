import { a } from '@aws-amplify/backend';

export const Log = a
    .model({
        id: a.id().required(),
        logAt: a.datetime().required(),
        ttl: a.datetime().required(), // When should it be deleted
        label: a.string().required(),
        logType: a.enum(['DEBUG', 'INFO', 'WARNING', 'ERROR']),
        logData: a.string().required(),
        state: a
            .string()
            .required()
            .default('LOG') // Can be LOG, UNACKED or ACKED
            .authorization((allow) => [
                allow.groupDefinedIn('fleetId').to(['read', 'update']),
                allow.groups(['SUPERS', 'ADMINS']).to(['read', 'update']),
            ]),
        producerId: a.id().required(),
        //producer: a.belongsTo('Producer', 'producerId'),
        deploymentId: a.id(),
        //deployment: a.belongsTo('Deployment', 'deploymentId'),
        fleetId: a.id().required(),
        // pushMessage: a.hasOne('PushMessage', 'logId'),
    })
    .secondaryIndexes((index) => [
        index('deploymentId')
            .sortKeys(['logAt'])
            .queryField('logByDeployment')
            .name('byDeployment'),
        index('producerId')
            .sortKeys(['logAt'])
            .queryField('logByProducer')
            .name('byProducer'),
    ])
    .authorization((allow) => [
        allow.groupDefinedIn('fleetId').to(['read']),
        allow.groups(['ADMINS']).to(['read', 'update', 'delete']),
        allow.groups(['SUPERS']),
    ]);
