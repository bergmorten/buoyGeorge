import { a } from '@aws-amplify/backend';

export const Project = a
    .model({
        id: a.id().required(),
        isArchived: a.string().required().default('false'),
        name: a.string().required(),
        description: a.string(),
        // fleets: a.hasMany('ProjectFleet', 'projectId'),
        // bills: a.hasMany('Bill', 'projectId'),
        // deployments: a.hasMany('Deployment', 'projectId'),
    })
    .secondaryIndexes((index) => [
        index('isArchived').queryField('projectByArchived').name('byArchived'),
    ])
    .authorization((allow) => [
        allow.authenticated().to(['read']),
        allow.groups(['ADMINS']).to(['read', 'update', 'create']),
        allow.groups(['SUPERS']),
    ]);
