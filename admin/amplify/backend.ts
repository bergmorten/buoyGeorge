import { defineBackend } from '@aws-amplify/backend';
import { isSandbox } from './isSandbox';
import { auth, setupAuth } from './auth/resource';
import { data, setupData } from './data/resource';
import { storage, setupStorage } from './storage/resource';
import { setupBackup } from './backup';
import { Tags } from 'aws-cdk-lib';
import { getProjectInfo } from '@aws-amplify/cli-extensibility-helper';
/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
export const backend = defineBackend({
    auth,
    data,
    storage,
});
export type MyBackend = typeof backend;
const tags = Tags.of(backend.stack);
tags.add('stack-name', backend.stack.stackName);

setupAuth(backend);
setupData(backend);
setupStorage(backend);

// Setup backup
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

backend.addOutput({
    custom: {
        region: backend.stack.region,
        isSandbox,
        stackName: backend.stack.stackName,
    },
});
