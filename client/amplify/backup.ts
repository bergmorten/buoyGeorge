import {
    BackupPlan,
    BackupPlanRule,
    BackupResource,
    BackupVault,
} from 'aws-cdk-lib/aws-backup';
import type { MyBackend } from './backend';

export const setupBackup = (backend: MyBackend) => {
    const backupStack = backend.createStack('backup-stack');

    let stackName = backend.stack.stackName
        .replace('amplify-', '')
        .replaceAll('-', '_');
    console.log('Setting up backup for stack:', stackName);
    if (stackName.length > 44) {
        // _vault is 6 chars
        stackName = stackName.substring(stackName.length - 44);
    }
    const myTables = Object.values(backend.data.resources.tables);
    const vault = new BackupVault(backupStack, 'BackupVault', {
        backupVaultName: stackName + '_vault',
    });

    const plan = new BackupPlan(backupStack, 'BackupPlan', {
        backupPlanName: stackName + '_plan',
        backupVault: vault,
    });
    plan.addRule(BackupPlanRule.daily(vault));
    plan.addRule(BackupPlanRule.weekly(vault));

    const resource: BackupResource[] = [];
    myTables.forEach((table) => {
        resource.push(BackupResource.fromDynamoDbTable(table));
    });
    const s3Bucket = backend.storage.resources.bucket;

    resource.push(BackupResource.fromArn(s3Bucket.bucketArn));

    plan.addSelection('BackupPlanSelection', {
        resources: myTables.map((table) =>
            BackupResource.fromDynamoDbTable(table),
        ),
        allowRestores: true,
    });
};
