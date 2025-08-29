import { a } from '@aws-amplify/backend';

export const Fleet = a
    .model({
        id: a.id().required(),
        isArchived: a.string().required().default('false'),
        name: a.string().required(),
        description: a.string(),
        // users: a.hasMany('UserFleet', 'fleetId'), // Many-to-Many
        // producers: a.hasMany('Producer', 'fleetId'),
        // projects: a.hasMany('ProjectFleet', 'fleetId'), // Many-to-Many
        // deployments: a.hasMany('Deployment', 'fleetId'),
        // bills: a.hasMany('Bill', 'fleetId'),
    })
    .secondaryIndexes((index) => [
        index('isArchived').queryField('fleetByArchived').name('byArchived'),
    ])
    .authorization((allow) => [
        allow.groupDefinedIn('id').to(['read']),
        allow.groups(['ADMINS']).to(['read', 'update', 'create']),
        allow.groups(['SUPERS']),
    ]);
