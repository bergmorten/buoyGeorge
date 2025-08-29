import { a } from '@aws-amplify/backend';

export const Deployment = a
    .model({
        id: a.id().required(),
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
        isArchived: a.string().required().default('false'),
        title: a.string().required(),
        description: a.string().required(),
        initialLocation: a.customType({
            lat: a.float(),
            lon: a.float(),
        }),
        deploymentData: a.string().required(),
        fleetId: a.id().required(),
        //fleet: a.belongsTo('Fleet', 'fleetId'),
        projectId: a.id().required(),
        // project: a.belongsTo('Project', 'projectId'),
        producerId: a.id().required(),
        // producer: a.belongsTo('Producer', 'producerId'),
        // logs: a.hasMany('Log', 'deploymentId'),
        // bills: a.hasMany('Bill', 'deploymentId'),
        // records: a.hasMany('Record', 'deploymentId'),
    })
    .secondaryIndexes((index) => [
        index('isArchived')
            //      .sortKeys(['createdAt'])
            .queryField('deploymentByIsArchived')
            .name('byIsArchived'),
        index('fleetId')
            .sortKeys(['isArchived', 'createdAt'])
            .queryField('deploymentByFleet')
            .name('byFleet'),
        index('projectId')
            .sortKeys(['isArchived', 'createdAt'])
            .queryField('deploymentByProject')
            .name('byProject'),
    ])
    .authorization((allow) => [
        allow.groupDefinedIn('fleetId').to(['read', 'update', 'create']),
        allow.groups(['ADMINS']).to(['read', 'update', 'create']),
        allow.groups(['SUPERS']),
    ]);
