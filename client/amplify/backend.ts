import { defineBackend } from '@aws-amplify/backend';
import { Tags } from 'aws-cdk-lib';
import { auth, setupAuth } from './auth/resource';
import { data, setupData } from './data/resource';
import { storage, setupStorage } from './storage/resource';
import {
    userCRUDFunction,
    setupUserCrudFunction,
} from './functions/userCRUD/resource';
import {
    commandTriggerFunction,
    setupCommandTriggerFunction,
} from './functions/commandTrigger/resource';
import {
    recordTriggerFunction,
    setupRecordTriggerFunction,
} from './functions/recordTrigger/resource';
import {
    preTokenGeneration,
    setupPreTokenGenerationFunction,
} from './functions/preTokenGeneration/resource';
import {
    userMigration,
    setupUserMigrationFunction,
} from './functions/userMigration/resource';
import {
    sqsHandlerFunction,
    setupSqsHandlerFunction,
} from './functions/sqsHandler/resource';
import { isSandbox } from './isSandbox';
import { setupBackup } from './backup';
import { getProjectInfo } from '@aws-amplify/cli-extensibility-helper';
import { setupCloudLoop } from './cloudloop/resource';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
export const backend = defineBackend({
    auth,
    data,
    storage,
    userCRUDFunction,
    commandTriggerFunction,
    recordTriggerFunction,
    sqsHandlerFunction,
    preTokenGeneration, // Must be placed here for custom policy
    userMigration, // Must be placed here for custom policy
});
export type MyBackend = typeof backend;
const tags = Tags.of(backend.stack);
tags.add('stack-name', backend.stack.stackName);

if (!isSandbox) {
    // Setup additional resources or configurations for non-sandbox environments
    const { projectName: project, envName: environment } = getProjectInfo();
    if (!project || !environment) {
        throw new Error('Project name or environment name is not defined');
    }
    tags.add('project-name', project);
    tags.add('environment-name', environment);
    setupBackup(backend);
}

// Setup policies and event sources
setupAuth(backend);
setupUserCrudFunction(backend);
setupCommandTriggerFunction(backend);
setupRecordTriggerFunction(backend);
setupUserMigrationFunction(backend);
setupPreTokenGenerationFunction(backend);

setupData(backend);
setupStorage(backend);

const { MOQueue, MTConfirmQueue } = setupCloudLoop(backend);
setupSqsHandlerFunction(backend, MOQueue, MTConfirmQueue);

backend.addOutput({
    custom: {
        region: backend.stack.region,
        isSandbox,
        stackName: backend.stack.stackName,
    },
});

console.log('Backend resources configured');
