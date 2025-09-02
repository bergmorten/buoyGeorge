import type { MyBackend } from '../backend';
import { isSandbox } from '../isSandbox';
export const setupAuth = (backend: MyBackend) => {
    // Enable delete protection on auth on client environments
    const { cfnUserPool, cfnIdentityPool, cfnUserPoolClient } =
        backend.auth.resources.cfnResources;
    cfnUserPool.usernameAttributes = [];
    cfnUserPool.aliasAttributes = ['email'];
    cfnUserPool.adminCreateUserConfig = {
        allowAdminCreateUserOnly: true,
        inviteMessageTemplate: {
            emailSubject: 'Your invitation to join our data management service',
            emailMessage:
                'You have been invited to join our data management service. Your temporary password is {####} and use your email ({username}) to log in.\n\nThank you!',
        },
    };
    // TODO enable email and sms MFA
    cfnUserPool.enabledMfas = ['SOFTWARE_TOKEN_MFA'];
    cfnUserPool.mfaConfiguration = 'OPTIONAL';
    cfnUserPool.deviceConfiguration = {
        challengeRequiredOnNewDevice: true,
        deviceOnlyRememberedOnUserPrompt: true,
    };

    cfnIdentityPool.allowUnauthenticatedIdentities = false;

    cfnUserPoolClient.explicitAuthFlows = [
        'ALLOW_ADMIN_USER_PASSWORD_AUTH',
        //  'ALLOW_USER_PASSWORD_AUTH',
        'ALLOW_USER_SRP_AUTH',
        'ALLOW_USER_AUTH',
        'ALLOW_REFRESH_TOKEN_AUTH',
    ];

    if (!isSandbox) {
        cfnUserPool.deletionProtection = 'ACTIVE';
        cfnUserPool.userPoolTier = 'PLUS';
        // should we also have aws waf?
    }
};
