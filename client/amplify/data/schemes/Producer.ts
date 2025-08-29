import { a } from '@aws-amplify/backend';

export const Producer = a
    .model({
        id: a.id().required(),
        createdAt: a.datetime().required(),
        isArchived: a.string().required().default('false'),
        name: a.string().required(),
        lastSeen: a.timestamp(),
        location: a.customType({
            lat: a.float(),
            lon: a.float(),
        }),
        manifest: a.string(),
        state: a.enum(['RUNNING', 'HALTED', 'ABORTED']),
        status: a.string(),
        fleetId: a.id().required(),
        //fleet: a.belongsTo('Fleet', 'fleetId'),
        // logs: a.hasMany('Log', 'producerId'),
        // deployments: a.hasMany('Deployment', 'producerId'),
        // commands: a.hasMany('Command', 'producerId'),
    })
    .secondaryIndexes((index) => [
        index('isArchived').queryField('producerByArchived').name('byArchived'),
    ])
    .authorization((allow) => [
        allow.groupDefinedIn('fleetId').to(['read']),
        allow.groups(['ADMINS']).to(['read', 'update']),
        allow.groups(['SUPERS']),
    ]);
