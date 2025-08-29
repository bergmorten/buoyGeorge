import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { Bill } from './schemes/Bill';
import { Command } from './schemes/Command';
import { Deployment } from './schemes/Deployment';
import { Fleet } from './schemes/Fleet';
import { Log } from './schemes/Log';
import { Org } from './schemes/Org';
import { Producer } from './schemes/Producer';
import { Project } from './schemes/Project';
import { ProjectFleet } from './schemes/ProjectFleet';
import { PushMessage } from './schemes/PushMessage';
import { PushToken } from './schemes/PushToken';
import { Record } from './schemes/Record';
import { User } from './schemes/User';
import { UserFleet } from './schemes/UserFleet';
import { preTokenGeneration } from '../functions/preTokenGeneration/resources';
export { setupData } from './overrides';

//import { flushEvents, record } from 'aws-amplify/analytics'
//import { Project } from 'aws-cdk-lib/aws-codebuild'

const schema = a
    .schema({
        Bill,
        Command,
        Deployment,
        Fleet,
        Log,
        Org,
        Producer,
        Project,
        ProjectFleet,
        PushMessage,
        PushToken,
        Record,
        User,
        UserFleet,
    })
    .authorization((allow) => [allow.resource(preTokenGeneration)]);
export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
    schema,
    authorizationModes: {
        defaultAuthorizationMode: 'userPool',
    },
});
