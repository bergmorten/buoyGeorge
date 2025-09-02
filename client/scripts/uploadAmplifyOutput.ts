import { getProjectInfo } from '@aws-amplify/cli-extensibility-helper';
import type { Client } from './models';
import { version } from '../package.json';
import { fetchExisting } from './queries';
import { updateExistingClient, createNewClient } from './mutations';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
// Configure the signed fetcher for your AppSync service and region

export const storeAmplifyOutput = async () => {
    // Your AppSync GraphQL endpoint URL

    const clientPath = fileURLToPath(
        new URL('../amplify_outputs.json', import.meta.url),
    );
    const adminPath = fileURLToPath(
        new URL('../../admin/amplify_outputs.json', import.meta.url),
    );
    if (!existsSync(clientPath))
        throw new Error('client amplify_outputs.json does not exist');
    if (!existsSync(adminPath))
        throw new Error('admin amplify_outputs.json does not exist');
    const adminOutputs = JSON.parse(readFileSync(adminPath, 'utf-8'));
    const adminGraphqlEndpoint = adminOutputs?.data?.url;
    if (!adminGraphqlEndpoint) {
        throw new Error('GraphQL endpoint is not defined');
    }
    const adminRegion = adminOutputs?.data?.aws_region;
    if (!adminRegion) {
        throw new Error('Region is not defined');
    }
    const clientOutputs = JSON.parse(readFileSync(clientPath, 'utf-8'));
    const isSandbox = clientOutputs.custom.isSandbox ?? false;
    const stackName = clientOutputs.custom.stackName;

    let appId: string | undefined = undefined;
    let branch: string | undefined = undefined;
    let projectName: string | undefined = undefined;
    let environmentName: string | undefined = undefined;
    if (!isSandbox) {
        // Handle non-sandbox environment
        appId = process.env.AWS_APP_ID;
        branch = process.env.AWS_BRANCH;
        if (!appId) {
            throw new Error('AWS_APP_ID is not defined');
        }
        if (!branch) {
            throw new Error('AWS_BRANCH is not defined');
        }
        const { projectName: project, envName: environment } = getProjectInfo();
        if (!project || !environment) {
            throw new Error('Project name or environment name is not defined');
        }
        projectName = project;
        environmentName = environment;
    }

    const appRegion = clientOutputs.data.aws_region;
    const appSyncUrl = clientOutputs.data.url;
    if (!appRegion || !appSyncUrl) {
        throw new Error('AppSync URL or region is not defined');
    }

    const existing = await fetchExisting(
        stackName,
        adminGraphqlEndpoint,
        adminRegion,
    );
    const client: Client = {
        isSandbox,
        name: existing?.name ?? stackName,
        stackName,
        amplifyOutput: JSON.stringify(clientOutputs),
        appRegion,
        appSyncUrl,
        lastDeploymentTime: new Date().toISOString(),
        latestDeploymentVersion: version,
        appId,
        branch,
        environmentName,
        // amplifyWebhook: clientOutputs.data.amplifyWebhook,
        // tcpBanned: clientOutputs.custom.tcpBanned,
        // iridiumBanned: clientOutputs.custom.iridiumBanned,
        // iridiumQueueRegion: clientOutputs.custom.iridiumQueueRegion,
        // iridiumQueueUrl: clientOutputs.custom.iridiumQueueUrl,
        // iridiumQueueArn: clientOutputs.custom.iridiumQueueArn,
        // socketQueueRegion: clientOutputs.custom.socketQueueRegion,
        // socketQueueUrl: clientOutputs.custom.socketQueueUrl,
        // socketQueueArn: clientOutputs.custom.socketQueueArn,
    };

    if (existing) {
        if (existing.stackName !== stackName)
            throw new Error('Stack name mismatch');
        if ((existing.appId ?? null) !== (appId ?? null))
            throw new Error(`App ID mismatch ${existing.appId} !== ${appId}`);
        if ((existing.branch ?? null) !== (branch ?? null))
            throw new Error(`Branch mismatch ${existing.branch} !== ${branch}`);
        if ((existing.projectName ?? null) !== (projectName ?? null))
            throw new Error(
                `Project name mismatch ${existing.projectName} !== ${projectName}`,
            );
        if ((existing.environmentName ?? null) !== (environmentName ?? null))
            throw new Error(
                `Environment name mismatch ${existing.environmentName} !== ${environmentName}`,
            );
        console.log('Updating existing client:', existing.id);
        await updateExistingClient(
            existing.id,
            client,
            adminGraphqlEndpoint,
            adminRegion,
        );
        return true;
    } else {
        await createNewClient(client, adminGraphqlEndpoint, adminRegion);
        return true;
    }

    //const awsAppId = p
};
