import { makeSignedGraphQLRequest } from './graphql';
import type { Client } from './models';

export const removeExistingClient = async (
    id: string,
    adminGraphqlEndpoint: string,
    adminRegion: string,
) => {
    const query = `
mutation MyMutation($id: ID = "") {
  deleteClient(input: {id: $id}) {
    id
  }
}`;

    // Request body for GraphQL
    const requestBody = JSON.stringify({
        query: query,
        variables: {
            id,
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
$iridiumQueueRegion: String,
$iridiumQueueUrl: String,
$iridiumQueueArn: String,
$socketQueueRegion: String,
$socketQueueUrl: String,
$socketQueueArn: String
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
      latestDeploymentVersion: $latestDeploymentVersion,
      iridiumQueueRegion: $iridiumQueueRegion,
      iridiumQueueUrl: $iridiumQueueUrl,
      iridiumQueueArn: $iridiumQueueArn,
      socketQueueRegion: $socketQueueRegion,
      socketQueueUrl: $socketQueueUrl,
      socketQueueArn: $socketQueueArn
    }
  ) {
    'id',
    'isArchived',
    'isSandbox',
    'name',
    'stackName',
    'amplifyOutput',
    'appRegion',
    'appSyncUrl',
    'lastDeploymentTime',
    'latestDeploymentVersion',
    'url',
    'minimumUiVersion',
    'appId',
    'branch',
    'amplifyWebhook',
    'projectName',
    'environmentName',
    'tcpBanned',
    'iridiumBanned',
    'iridiumQueueRegion',
    'iridiumQueueUrl',
    'iridiumQueueArn',
    'socketQueueRegion',
    'socketQueueUrl',
    'socketQueueArn',
    'createdAt',
    'updatedAt',
    '__typename'
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
            iridiumQueueRegion: client.iridiumQueueRegion ?? null,
            iridiumQueueUrl: client.iridiumQueueUrl ?? null,
            iridiumQueueArn: client.iridiumQueueArn ?? null,
            socketQueueRegion: client.socketQueueRegion ?? null,
            socketQueueUrl: client.socketQueueUrl ?? null,
            socketQueueArn: client.socketQueueArn ?? null,
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
  $lastDeploymentTime: AWSDateTime = "1970-01-01T00:00:00.000Z",
  $latestDeploymentVersion: String = "",
  $url: AWSURL,
  $minimumUiVersion: String,
  $appId: String,
  $branch: String,
  $amplifyWebhook: String,
  $projectName: String,
  $environmentName: String,
  $tcpBanned: Boolean = false,
  $iridiumBanned: Boolean = false,
  $iridiumQueueRegion: String,
  $iridiumQueueUrl: String,
  $iridiumQueueArn: String,
  $socketQueueRegion: String,
  $socketQueueUrl: String,
  $socketQueueArn: String
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
      url: $url,
      minimumUiVersion: $minimumUiVersion,
      appId: $appId,
      branch: $branch,
      amplifyWebhook: $amplifyWebhook,
      projectName: $projectName,
      environmentName: $environmentName,
      tcpBanned: $tcpBanned,
      iridiumBanned: $iridiumBanned,
      iridiumQueueRegion: $iridiumQueueRegion,
      iridiumQueueUrl: $iridiumQueueUrl,
      iridiumQueueArn: $iridiumQueueArn,
      socketQueueRegion: $socketQueueRegion,
      socketQueueUrl: $socketQueueUrl,
      socketQueueArn: $socketQueueArn
    }
  ) {
   'id',
    'isArchived',
    'isSandbox',
    'name',
    'stackName',
    'amplifyOutput',
    'appRegion',
    'appSyncUrl',
    'lastDeploymentTime',
    'latestDeploymentVersion',
    'url',
    'minimumUiVersion',
    'appId',
    'branch',
    'amplifyWebhook',
    'projectName',
    'environmentName',
    'tcpBanned',
    'iridiumBanned',
    'iridiumQueueRegion',
    'iridiumQueueUrl',
    'iridiumQueueArn',
    'socketQueueRegion',
    'socketQueueUrl',
    'socketQueueArn',
    'createdAt',
    'updatedAt',
    '__typename'
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
            url: client.url ?? null,
            minimumUiVersion: client.minimumUiVersion ?? null,
            appId: client.appId ?? null,
            branch: client.branch ?? null,
            amplifyWebhook: client.amplifyWebhook ?? null,
            projectName: client.projectName ?? null,
            environmentName: client.environmentName ?? null,
            tcpBanned: client.tcpBanned ?? null,
            iridiumBanned: client.iridiumBanned ?? null,
            iridiumQueueRegion: client.iridiumQueueRegion ?? null,
            iridiumQueueUrl: client.iridiumQueueUrl ?? null,
            iridiumQueueArn: client.iridiumQueueArn ?? null,
            socketQueueRegion: client.socketQueueRegion ?? null,
            socketQueueUrl: client.socketQueueUrl ?? null,
            socketQueueArn: client.socketQueueArn ?? null,
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
