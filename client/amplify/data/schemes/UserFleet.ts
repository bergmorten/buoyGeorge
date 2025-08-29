import { a } from '@aws-amplify/backend';

export const UserFleet = a
    .model({
        id: a.id().required(),
        userId: a.id().required(),
        //  user: a.belongsTo('User', 'userId'),
        fleetId: a.id().required(),
        // fleet: a.belongsTo('Fleet', 'fleetId'),
    })
    .secondaryIndexes((index) => [
        index('userId').queryField('fleetByUser').name('byUser'),
        index('fleetId').queryField('userByFleet').name('byFleet'),
    ])
    .authorization((allow) => [
        allow.groupDefinedIn('fleetId').to(['read']),
        allow.groups(['ADMINS', 'SUPERS']),
    ]);
