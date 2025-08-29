import { a } from '@aws-amplify/backend';

export const Record = a
    .model({
        id: a.id().required(),
        recordedAt: a.datetime().required(),
        isArchived: a.string().required().default('false'),
        data: a.string().required(),
        s3Information: a.string(), // Describes contents of s3 files
        s3Links: a.string().array(), // To store raw binary data
        deploymentId: a.id().required(),
        //deployment: a.belongsTo('Deployment', 'deploymentId'),
        fleetId: a.id().required(),
        billId: a.id(),
        // bill: a.belongsTo('Bill', 'billId'),
    })
    .secondaryIndexes((index) => [
        index('deploymentId')
            .sortKeys(['recordedAt'])
            .queryField('recordByDeployment')
            .name('byDeployment'),
    ])
    .authorization((allow) => [
        allow.groupDefinedIn('fleetId').to(['read']),
        allow.groups(['ADMINS']).to(['read']),
        allow.groups(['SUPERS']),
    ]);
