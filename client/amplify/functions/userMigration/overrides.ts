import { Stack } from 'aws-cdk-lib';
import { Policy, PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';
import type { MyBackend } from '../../backend';

export const setupUserMigrationFunction = (backend: MyBackend) => {
    const policy = new Policy(
        Stack.of(backend.userMigration.stack),
        'UserMigrationHandlerPolicy',
        {
            statements: [
                new PolicyStatement({
                    effect: Effect.ALLOW,
                    actions: [
                        'cognito-idp:AdminInitiateAuth',
                        'cognito-idp:AdminGetUser',
                        'cognito-idp:AdminListGroupsForUser',
                    ],
                    resources: ['*'],
                }),
                new PolicyStatement({
                    effect: Effect.ALLOW,
                    actions: [
                        'xray:PutTraceSegments',
                        'xray:PutTelemetryRecords',
                    ],
                    resources: ['*'],
                }),
            ],
        },
    );
    backend.userMigration.resources.lambda.role?.attachInlinePolicy(policy);
    backend.userMigration.resources.cfnResources.cfnFunction.tracingConfig = {
        mode: 'Active',
    };
};
