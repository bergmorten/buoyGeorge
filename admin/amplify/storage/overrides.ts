import type { MyBackend } from '../backend';
import type * as s3 from 'aws-cdk-lib/aws-s3';
import { isSandbox } from '../isSandbox';
import { RemovalPolicy } from 'aws-cdk-lib';

export const setupStorage = (backend: MyBackend) => {
    if (!isSandbox) {
        const s3Bucket = backend.storage.resources.bucket;

        const cfnBucket = s3Bucket.node.defaultChild as s3.CfnBucket;

        cfnBucket.versioningConfiguration = {
            status: 'Enabled',
        };
        cfnBucket.applyRemovalPolicy(RemovalPolicy.RETAIN);
    }
};
