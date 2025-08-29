import { makeSignedGraphQLRequest } from './graphql';
import type { Client } from './models';
export const updateExistingClient = async (
    id: string,
    client: Client,
    adminGraphqlEndpoint: string,
    adminRegion: string,
) => {
    // Your GraphQL query or mutation
    const query = `
mutation UpdateClient
(
$id: ID = "",
$amplifyOutput: String = "",
$appSyncUrl: String = "",
$appRegion: String = "",
$lastDeploymentTime: AWSDateTime = "1970-01-01T00:00:00.000Z"
$latestDeploymentVersion: String = ""
)
{
  updateClient
  (
    input:
    {
      id: $id,
      amplifyOutput: $amplifyOutput,
      appSyncUrl: $appSyncUrl,
      appRegion: $appRegion,
      lastDeploymentTime: $lastDeploymentTime,
      latestDeploymentVersion: $latestDeploymentVersion
    }
  ) {
    id
  }
}
`;

    // Request body for GraphQL
    const requestBody = JSON.stringify({
        query: query,
        variables: {
            id,
            amplifyOutput: client.amplifyOutput,
            appSyncUrl: client.appSyncUrl,
            appRegion: client.appRegion,
            lastDeploymentTime: client.lastDeploymentTime,
            latestDeploymentVersion: client.latestDeploymentVersion,
        }, // Add variables if your query/mutation requires them
    });
    //console.log('Request Body:', requestBody);

    const response = await makeSignedGraphQLRequest(
        adminGraphqlEndpoint,
        adminRegion,
        requestBody,
    );
    if (!response.data) {
        throw new Error('Failed to fetch existing clients');
    }

    return response.data;
};
export const createNewClient = async (
    client: Client,
    adminGraphqlEndpoint: string,
    adminRegion: string,
) => {
    // Your GraphQL query or mutation
    const query = `
mutation NewClient
(
  $isSandbox: Boolean = false,
  $name: String = "",
  $stackName: String = "",
  $amplifyOutput: String = "",
  $appRegion: String = "",
  $appSyncUrl: String = "",
  $lastDeploymentTime: AWSDateTime = "1970-01-01T00:00:00.000Z" ,
  $latestDeploymentVersion: String = "",
  $appId: String ,
  $branch: String ,
  $projectName: String ,
  $environmentName: String
) {
  createClient(
    input: {
      isArchived: "false",
      isSandbox: $isSandbox,
      name: $name,
      stackName: $stackName,
      amplifyOutput: $amplifyOutput,
      appRegion: $appRegion,
      appSyncUrl: $appSyncUrl,
      lastDeploymentTime: $lastDeploymentTime,
      latestDeploymentVersion: $latestDeploymentVersion,
      appId: $appId,
      branch: $branch,
      projectName: $projectName,
      environmentName: $environmentName
    }
  ) {
    id
  }
}
`;

    // Request body for GraphQL
    const requestBody = JSON.stringify({
        query: query,
        variables: {
            isSandbox: client.isSandbox,
            name: client.name,
            stackName: client.stackName,
            amplifyOutput: client.amplifyOutput,
            appRegion: client.appRegion,
            appSyncUrl: client.appSyncUrl,
            lastDeploymentTime: client.lastDeploymentTime,
            latestDeploymentVersion: client.latestDeploymentVersion,
            appId: client.appId,
            branch: client.branch,
            projectName: client.projectName,
            environmentName: client.environmentName,
        }, // Add variables if your query/mutation requires them
    });

    const response = await makeSignedGraphQLRequest(
        adminGraphqlEndpoint,
        adminRegion,
        requestBody,
    );
    if (!response.data) {
        throw new Error('Failed to fetch existing clients');
    }

    return response.data;
};
