import {
    CognitoIdentityProviderClient,
    AdminInitiateAuthCommand,
    AdminGetUserCommand,
    // AdminListGroupsForUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import adminOutput from '../../../../admin/amplify_outputs.json';

export const authenticateUser = async (username: string, password: string) => {
    const region = adminOutput?.auth?.aws_region;
    const clientId = adminOutput?.auth?.user_pool_client_id;
    const userPoolId = adminOutput?.auth?.user_pool_id;
    if (!region) throw new Error('amplify_outputs region not set');
    if (!clientId)
        throw new Error('amplify_outputs user_pool_client_id not set');
    if (!userPoolId) throw new Error('amplify_outputs user_pool_id not set');

    const cognitoClient = new CognitoIdentityProviderClient({
        region: region,
    });
    const cmd = new AdminInitiateAuthCommand({
        AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
        AuthParameters: {
            USERNAME: username,
            PASSWORD: password,
        },
        ClientId: clientId,
        UserPoolId: userPoolId,
    });
    const resAuth = await cognitoClient.send(cmd);
    if (!resAuth.AuthenticationResult) throw new Error('Bad password');
    if (resAuth.AuthenticationResult.AccessToken) {
        const adminGetUserCmd = new AdminGetUserCommand({
            Username: username,
            UserPoolId: userPoolId,
        });

        const user = await cognitoClient.send(adminGetUserCmd);

        const UserAttributes = user.UserAttributes;
        if (!UserAttributes) throw new Error('No user attributes found');
        const emailAddress = UserAttributes.find(
            (e) => e.Name === 'email',
        )?.Value;
        if (!emailAddress) throw new Error('No email address found');
        // const adminListGroupsForUserCmd = new AdminListGroupsForUserCommand({
        //     Username: username,
        //     UserPoolId: userPoolId,
        // });
        // const userGroups = await cognitoClient.send(adminListGroupsForUserCmd);
        // const groups = userGroups.Groups;
        // if (!groups) throw new Error('No groups found');
        // const isSuper =
        //     groups.find((e) => e.GroupName === 'HefringAdmin') !== undefined;
        // if (!isHefringAdmin) throw new Error('User is not HefringAdmin');
        return {
            emailAddress,
        };
    }
    return undefined;
};
