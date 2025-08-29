import type { MyBackend } from '../backend';
import { BillingMode } from 'aws-cdk-lib/aws-dynamodb';
import { isSandbox } from '../isSandbox';
export const setupData = (backend: MyBackend) => {
    const { cfnResources } = backend.data.resources;

    // Enable X-Ray tracing for the GraphQL API
    cfnResources.cfnGraphqlApi.xrayEnabled = true;

    // Enable Point In Time Recovery and pay per request for all tables
    for (const table of Object.values(cfnResources.amplifyDynamoDbTables)) {
        table.billingMode = BillingMode.PAY_PER_REQUEST;
        table.deletionProtectionEnabled = !isSandbox;
        table.pointInTimeRecoveryEnabled = !isSandbox;
    }
};
