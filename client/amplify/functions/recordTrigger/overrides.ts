import { Stack } from 'aws-cdk-lib';
import { Policy, PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';
import { StartingPosition, EventSourceMapping } from 'aws-cdk-lib/aws-lambda';
import type { MyBackend } from '../../backend';

export const setupRecordTriggerFunction = (backend: MyBackend) => {
    const recordTable = backend.data.resources.tables['Record'];
    if (!recordTable || !recordTable.tableStreamArn) {
        throw new Error('Record table not found in backend resources');
    }
    const policy = new Policy(
        Stack.of(backend.recordTriggerFunction.stack),
        'RecordTriggerHandlerPolicy',
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
    backend.recordTriggerFunction.resources.lambda.role?.attachInlinePolicy(
        policy,
    );
    backend.recordTriggerFunction.resources.cfnResources.cfnFunction.tracingConfig =
        {
            mode: 'Active',
        };

    const mapping = new EventSourceMapping(
        Stack.of(recordTable),
        'RecordTriggerHandlerPolicyEventStreamMapping',
        {
            target: backend.recordTriggerFunction.resources.lambda,
            eventSourceArn: recordTable.tableStreamArn,
            startingPosition: StartingPosition.LATEST,
        },
    );

    mapping.node.addDependency(policy);
};
