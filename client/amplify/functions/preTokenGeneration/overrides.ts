import { Stack } from 'aws-cdk-lib';
import { Policy, PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';
import type { MyBackend } from '../../backend';

export const setupPreTokenGenerationFunction = (backend: MyBackend) => {
    const policy = new Policy(
        Stack.of(backend.preTokenGeneration.resources.lambda),
        'PreTokenGenerationPolicy',
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
    backend.preTokenGeneration.resources.lambda.role?.attachInlinePolicy(
        policy,
    );
    backend.preTokenGeneration.resources.cfnResources.cfnFunction.tracingConfig =
        {
            mode: 'Active',
        };

    backend.preTokenGeneration.resources.cfnResources.cfnFunction.tracingConfig =
        {
            mode: 'Active',
        };
};
