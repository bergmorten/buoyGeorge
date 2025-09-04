import { Stack } from 'aws-cdk-lib';
import { Policy, PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';
import type { MyBackend } from '../../backend';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import type * as sqs from 'aws-cdk-lib/aws-sqs';

export const setupSqsHandlerFunction = (
    backend: MyBackend,
    MOQueue: sqs.IQueue,
    MTConfirmQueue: sqs.IQueue,
) => {
    const policy = new Policy(
        Stack.of(backend.sqsHandlerFunction.stack),
        'SqsHandlerFunctionPolicy',
        {
            statements: [
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
    backend.sqsHandlerFunction.resources.lambda.role?.attachInlinePolicy(
        policy,
    );
    backend.sqsHandlerFunction.resources.cfnResources.cfnFunction.tracingConfig =
        {
            mode: 'Active',
        };

    const moEventSource = new SqsEventSource(MOQueue, {
        batchSize: 10,
        reportBatchItemFailures: true,
    });
    const mtConfirmEventSource = new SqsEventSource(MTConfirmQueue, {
        batchSize: 10,
        reportBatchItemFailures: true,
    });
    backend.sqsHandlerFunction.resources.lambda.addEventSource(moEventSource);
    backend.sqsHandlerFunction.resources.lambda.addEventSource(
        mtConfirmEventSource,
    );
};
