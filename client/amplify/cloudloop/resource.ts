import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as kms from 'aws-cdk-lib/aws-kms';
import { Duration } from 'aws-cdk-lib';
import type { MyBackend } from '../backend';

const CloudLoopDataARN = 'arn:aws:iam::902942185257:role/CloudloopDataAgent';

export const setupCloudLoop = (backend: MyBackend) => {
    const cloudLoopPrincipal = new iam.ArnPrincipal(CloudLoopDataARN);
    const cloudLoopGrantee: iam.IGrantable = {
        grantPrincipal: cloudLoopPrincipal,
    };

    const stack = backend.data.stack;
    const encryptionKey = new kms.Key(stack, 'SQSCloudloop');

    const MOQueue = new sqs.Queue(stack, 'MO', {
        fifo: true,
        contentBasedDeduplication: true,
        enforceSSL: true,
        encryption: sqs.QueueEncryption.KMS,
        encryptionMasterKey: encryptionKey,
        visibilityTimeout: Duration.seconds(30),
    });

    const MTQueue = new sqs.Queue(stack, 'MT', {
        fifo: true,
        contentBasedDeduplication: true,
        enforceSSL: true,
        encryption: sqs.QueueEncryption.KMS,
        encryptionMasterKey: encryptionKey,
        visibilityTimeout: Duration.seconds(30),
    });

    const MTConfirmQueue = new sqs.Queue(stack, 'MTC', {
        fifo: true,
        contentBasedDeduplication: true,
        enforceSSL: true,
        encryption: sqs.QueueEncryption.KMS,
        encryptionMasterKey: encryptionKey,
        visibilityTimeout: Duration.seconds(30),
    });

    // Setup IAM policies

    MOQueue.grantSendMessages(cloudLoopGrantee);
    MTQueue.grantConsumeMessages(cloudLoopGrantee);
    MTQueue.grantSendMessages(backend.commandTriggerFunction.resources.lambda);
    MTConfirmQueue.grantSendMessages(cloudLoopGrantee);
    console.log('MOQueue ARN:', MOQueue.queueArn);
    console.log('MTQueue ARN:', MTQueue.queueArn);
    console.log('MTConfirmQueue ARN:', MTConfirmQueue.queueArn);
    console.log('MOQueue URL:', MOQueue.queueUrl);
    console.log('MTQueue URL:', MTQueue.queueUrl);
    console.log('MTConfirmQueue URL:', MTConfirmQueue.queueUrl);
    backend.addOutput({
        custom: {
            MOQueueArn: MOQueue.queueArn,
            MTQueueArn: MTQueue.queueArn,
            MTConfirmQueue: MTConfirmQueue.queueArn,
            MOQueueUrl: MOQueue.queueUrl,
            MTQueueUrl: MTQueue.queueUrl,
            MTConfirmQueueUrl: MTConfirmQueue.queueUrl,
        },
    });

    return { MOQueue, MTConfirmQueue, MTQueue };
};
