import { a } from '@aws-amplify/backend';

export const Bill = a
    .model({
        id: a.id().required(),
        createdAt: a.datetime().required(),
        isBilled: a.string().required().default('false'),
        amount: a.float().required(),
        isArchived: a.string().required().default('false'),
        label: a.string().required(),
        billData: a.string().required(),
        projectId: a.id().required(),
        // project: a.belongsTo('Project', 'projectId'),
        deploymentId: a.id(),
        // deployment: a.belongsTo('Deployment', 'deploymentId'),
        fleetId: a.id(),
        //  fleet: a.belongsTo('Fleet', 'fleetId'),
        commandId: a.id(),
        recordId: a.id(),
        //command: a.hasOne('Command', 'billId'),
        //record: a.hasOne('Record', 'billId'),
    })
    .secondaryIndexes((index) => [
        index('deploymentId')
            .sortKeys(['createdAt'])
            .queryField('billByDeployment')
            .name('byDeployment'),
        index('projectId')
            .sortKeys(['createdAt'])
            .queryField('billByProject')
            .name('byProject'),
        index('fleetId')
            .sortKeys(['createdAt'])
            .queryField('billByFleet')
            .name('byFleet'),
        index('commandId').queryField('billByCommand').name('byCommand'),
        index('recordId').queryField('billByRecord').name('byRecord'),
    ])
    .authorization((allow) => [
        allow.groupDefinedIn('fleetId').to(['read']),
        allow.groups(['ADMINS']).to(['read']),
        allow.groups(['SUPERS']),
    ]);
