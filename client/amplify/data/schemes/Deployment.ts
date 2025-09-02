import { a } from '@aws-amplify/backend';

export const Deployment = a
    .model({
        id: a.id().required(),
        createdAt: a.datetime().required(),
        isArchived: a.string().required().default('false'),
        title: a.string().required(),
        description: a.string().required(),
        deploymentData: a.string().required(),
        fleetId: a.id().required(),
        //fleet: a.belongsTo('Fleet', 'fleetId'),
        projectId: a.id().required(),
        // project: a.belongsTo('Project', 'projectId'),
        // logs: a.hasMany('Log', 'deploymentId'),
        // bills: a.hasMany('Bill', 'deploymentId'),
        // records: a.hasMany('Record', 'deploymentId'),
    })
    .secondaryIndexes((index) => [
        index('isArchived')
            .queryField('deploymentByArchived')
            .name('byArchived'),
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
