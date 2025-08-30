import adminOutputs from '../../admin/amplify_outputs.json';
import clientOutputs from '../amplify_outputs.json';
import { fetchExisting } from './queries';
import { removeExistingClient } from './mutations';

// Configure the signed fetcher for your AppSync service and region

export const removeAmplifyOutput = async () => {
    // Your AppSync GraphQL endpoint URL
    const adminGraphqlEndpoint = adminOutputs?.data?.url;
    if (!adminGraphqlEndpoint) {
        throw new Error('GraphQL endpoint is not defined');
    }
    const adminRegion = adminOutputs?.data?.aws_region;
    if (!adminRegion) {
        throw new Error('Region is not defined');
    }
    const isSandbox = clientOutputs.custom.isSandbox ?? false;
    if (!isSandbox) {
        throw new Error('Can only remove outputs in sandbox mode');
    }
    const stackName = clientOutputs.custom.stackName;

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
    if (!existing) {
        throw new Error('Existing client not found');
    }

    await removeExistingClient(existing.id, adminGraphqlEndpoint, adminRegion);
    return true;

    //const awsAppId = p
};
