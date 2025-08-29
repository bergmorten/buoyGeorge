import { Stack } from 'aws-cdk-lib';
import { Policy, PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';
import { StartingPosition, EventSourceMapping } from 'aws-cdk-lib/aws-lambda';
import type { MyBackend } from '../../backend';

export const setupUserCrudFunction = (backend: MyBackend) => {
    const userTable = backend.data.resources.tables['User'];
    if (!userTable || !userTable.tableStreamArn) {
        throw new Error('Record table not found in backend resources');
    }
    const policy = new Policy(
        Stack.of(backend.userCRUDFunction.stack),
        'UserCRUDFunctionStreamingPolicy',
        {
            statements: [
                new PolicyStatement({
                    effect: Effect.ALLOW,
                    actions: [
                        'dynamodb:DescribeStream',
                        'dynamodb:GetRecords',
                        'dynamodb:GetShardIterator',
                        'dynamodb:ListStreams',
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
    backend.userCRUDFunction.resources.lambda.role?.attachInlinePolicy(policy);
    backend.userCRUDFunction.resources.cfnResources.cfnFunction.tracingConfig =
        {
            mode: 'Active',
        };
    const mapping = new EventSourceMapping(
        Stack.of(userTable),
        'userCRUDFunctionEventStreamMapping',
        {
            target: backend.userCRUDFunction.resources.lambda,
            eventSourceArn: userTable.tableStreamArn,
            startingPosition: StartingPosition.LATEST,
        },
    );

    mapping.node.addDependency(policy);
};
