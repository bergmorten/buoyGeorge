import { a } from '@aws-amplify/backend';

export const Producer = a
    .model({
        id: a.id().required(),
        isArchived: a
            .string()
            .required()
            .default('false')
            .authorization((allow) => [
                allow.groupDefinedIn('fleetId').to(['read']),
                allow.groups(['ADMINS']).to(['read', 'update']),
                allow.groups(['SUPERS']),
            ]),
        name: a
            .string()
            .required()
            .authorization((allow) => [
                allow.groupDefinedIn('fleetId').to(['read']),
                allow.groups(['ADMINS']).to(['read', 'update']),
                allow.groups(['SUPERS']),
            ]),
        lastSeen: a.timestamp(),
        location: a.customType({
            lat: a.float().required(),
            lon: a.float().required(),
        }),
        manifest: a.string(),
        type: a.string().required(), // This could been an enum, but does not want to update database for each new type
        state: a.enum(['RUNNING', 'HALTED', 'ABORTED', 'MISSING']),
        status: a.string(),
        activeDeployment: a.id(),
        activeSetup: a.string(),
        fleetId: a
            .id()
            .authorization((allow) => [
                allow.groupDefinedIn('fleetId').to(['read']),
                allow.groups(['ADMINS']).to(['read', 'update', 'delete']),
                allow.groups(['SUPERS']),
            ]),
        projectId: a
            .id()
            .authorization((allow) => [
                allow
                    .groupDefinedIn('fleetId')
                    .to(['read', 'update', 'delete']),
                allow.groups(['ADMINS']).to(['read', 'update', 'delete']),
                allow.groups(['SUPERS']),
            ]),
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
        allow.groups(['ADMINS']).to(['read']),
        allow.groups(['SUPERS']),
    ]);
