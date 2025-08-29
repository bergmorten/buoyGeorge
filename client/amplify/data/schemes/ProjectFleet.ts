import { a } from '@aws-amplify/backend';

export const ProjectFleet = a
    .model({
        id: a.id().required(),
        projectId: a.id().required(),
        // project: a.belongsTo('Project', 'projectId'),
        fleetId: a.id().required(),
        //fleet: a.belongsTo('Fleet', 'fleetId'),
    })
    .secondaryIndexes((index) => [
        index('projectId').queryField('fleetByProject').name('byProject'),
        index('fleetId').queryField('projectByFleet').name('byFleet'),
    ])
    .authorization((allow) => [
        allow.groupDefinedIn('fleetId').to(['read']),
        allow.groups(['SUPERS', 'ADMINS']),
    ]);
