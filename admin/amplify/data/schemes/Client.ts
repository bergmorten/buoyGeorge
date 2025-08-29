import { a } from '@aws-amplify/backend';
export const Client = a
    .model({
        id: a.id().required(),
        isArchived: a.string().required().default('false'),
        isSandbox: a.boolean().required().default(false),
        name: a.string().required(),
        stackName: a.string().required(),
        amplifyOutput: a.string().required(),
        appRegion: a.string().required(),
        appSyncUrl: a.string().required(),
        lastDeploymentTime: a.datetime().required(),
        latestDeploymentVersion: a.string().required(),
        url: a.url(),
        minimumUiVersion: a.string(),
        appId: a.string(),
        branch: a.string(),
        amplifyWebhook: a.string(),
        projectName: a.string(),
        environmentName: a.string(),
        tcpBanned: a.boolean().default(false),
        iridiumBanned: a.boolean().default(false),
        iridiumQueueRegion: a.string(),
        iridiumQueueUrl: a.string(),
        iridiumQueueArn: a.string(),
        socketQueueRegion: a.string(),
        socketQueueUrl: a.string(),
        socketQueueArn: a.string(),
        modems: a.hasMany('Modem', 'clientId'),
    })
    .secondaryIndexes((index) => [
        index('isArchived').queryField('clientByArchived').name('byArchived'),
    ])
    .authorization((allow) => [
        allow.authenticated('userPools'),
        allow.authenticated('identityPool'),
    ]);
