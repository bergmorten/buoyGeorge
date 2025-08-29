import { makeSignedGraphQLRequest } from './graphql';
import type { ExistingClient } from './models';
export const fetchExisting = async (
    stackName: string,
    adminGraphqlEndpoint: string,
    adminRegion: string,
) => {
    // Your GraphQL query or mutation
    const query = `
query listClients($stackName: String = "") {
  listClients(filter: {stackName: {eq: $stackName}}) {
    items {
      id
      stackName
      name
      appId
      environmentName
      projectName
      branch
    }
  }
}
`;

    // Request body for GraphQL
    const requestBody = JSON.stringify({
        query: query,
        variables: { stackName }, // Add variables if your query/mutation requires them
    });
    const response = await makeSignedGraphQLRequest(
        adminGraphqlEndpoint,
        adminRegion,
        requestBody,
    );
    if (!response.data) {
        throw new Error('Failed to fetch existing clients');
    }
    const data: {
        listClients?: {
            items?: Array<ExistingClient>;
        };
    } = response.data;
    const list = data.listClients?.items ?? [];
    if (list.length > 2)
        throw new Error('Multiple clients found with the same stack name');
    const client = list[0];
    return client;
};
