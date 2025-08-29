import { Stack } from 'aws-cdk-lib';
import { Policy, PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';
import { StartingPosition, EventSourceMapping } from 'aws-cdk-lib/aws-lambda';
import type { MyBackend } from '../../backend';

export const setupCommandTriggerFunction = (backend: MyBackend) => {
    const commandTable = backend.data.resources.tables['Command'];
    if (!commandTable || !commandTable.tableStreamArn) {
        throw new Error('Record table not found in backend resources');
    }
    const policy = new Policy(
        Stack.of(backend.commandTriggerFunction.stack),
        'CommandTriggerHandlerPolicy',
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
    backend.commandTriggerFunction.resources.lambda.role?.attachInlinePolicy(
        policy,
    );
    backend.commandTriggerFunction.resources.cfnResources.cfnFunction.tracingConfig =
        {
            mode: 'Active',
        };

    const mapping = new EventSourceMapping(
        Stack.of(commandTable),
        'CommandTriggerHandlerPolicyEventStreamMapping',
        {
            target: backend.commandTriggerFunction.resources.lambda,
            eventSourceArn: commandTable.tableStreamArn,
            startingPosition: StartingPosition.LATEST,
        },
    );

    mapping.node.addDependency(policy);
};
