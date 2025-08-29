import { createSignedFetcher } from 'aws-sigv4-fetch';

let signedFetch: ReturnType<typeof createSignedFetcher>;

export async function makeSignedGraphQLRequest(
    graphqlEndpoint: string,
    region: string,
    requestBody: string,
) {
    if (!signedFetch)
        signedFetch = createSignedFetcher({
            service: 'appsync', // The AWS service for AppSync
            region: region, // Your AWS region
            // Optionally, you can provide specific credentials if not using default AWS SDK credential providers
            // credentials: {
            //   accessKeyId: 'YOUR_ACCESS_KEY_ID',
            //   secretAccessKey: 'YOUR_SECRET_ACCESS_KEY',
            //   sessionToken: 'YOUR_SESSION_TOKEN', // If using temporary credentials
            // },
        });
    const response = await signedFetch(graphqlEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: requestBody,
    });

    if (!response.ok) {
        throw new Error(
            `GraphQL request failed with status ${response.status}`,
        );
    }

    const data = (await response.json()) as {
        data: unknown;
        errors?: {
            path: unknown;
            locations: unknown;
            message: string;
        }[];
    };
    if (data.errors && data.errors.length > 0) {
        throw new Error(
            `GraphQL request failed with errors: ${JSON.stringify(data.errors)}`,
        );
    }
    return data;
}
