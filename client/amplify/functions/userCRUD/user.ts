import type { FullUser } from 'client/services/database/users';
import type { AdminUpdateUserAttributesCommandInput } from '@aws-sdk/client-cognito-identity-provider';
import {
    AdminCreateUserCommand,
    AdminDeleteUserCommand,
    AdminGetUserCommand,
    ListUsersCommand,
    AdminUpdateUserAttributesCommand,
    CognitoIdentityProviderClient,
    type AttributeType,
} from '@aws-sdk/client-cognito-identity-provider';
import type { Logger } from '@aws-lambda-powertools/logger';
//import { updatePinPoint } from './pinpoint';
import type { USER_NOTIFY_SETTING } from 'client/services/database/users/models';
import _ from 'lodash';
import { env } from 'clientRoot/.amplify/generated/env/user-CRUD';

const region = env.AWS_REGION ?? env.AWS_DEFAULT_REGION;
const UserPoolId = env.AMPLIFY_AUTH_USERPOOL_ID ?? '';

const client = new CognitoIdentityProviderClient({
    region,
});

// const parseAttributes = (attr: AttributeType[]): Record<string, string> => {
//     const result: Record<string, string> = {};
//     for (const a of attr) {
//         if (a.Name && a.Value) result[a.Name] = a.Value;
//     }
//     return result;
// };

const getUser = async (logger: Logger, user: FullUser) => {
    // WTF can not search on custom attributes
    const command = new AdminGetUserCommand({
        UserPoolId,
        Username: user.id,
    });
    try {
        const response = await client.send(command);
        if (response) {
            return response;
        }
        return null;
    } catch (error) {
        const errorMsg =
            error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Failed to find user: ${user.email} - ${errorMsg}`);
    }
    return null;
};

const findUser = async (logger: Logger, user: FullUser) => {
    // WTF can not search on custom attributes
    const command = new ListUsersCommand({
        UserPoolId,
        Filter: `email = "${user.email}"`, // exact match
        Limit: 1, // optional, limit results
    });
    try {
        const response = await client.send(command);
        if (response.Users && response.Users.length > 0) {
            const user = response.Users[0];
            if (!user) return null;
            return user;
        }
        return null;
    } catch (error) {
        const errorMsg =
            error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Failed to find user: ${user.email} - ${errorMsg}`);
    }
    return null;
};

export const insertUser = async (
    logger: Logger,
    {
        user,
        isResend,
    }: {
        user: FullUser;
        isResend?: boolean;
    },
) => {
    if (!isResend) {
        const existingUser = await findUser(logger, user);
        if (existingUser) {
            logger.error(`User already exists with email: ${user.email}`);
            throw new Error(`User already exists: ${user.email}`);
        }
    }
    const createCommand = new AdminCreateUserCommand({
        Username: user.id,
        UserPoolId,
        DesiredDeliveryMediums: ['EMAIL'],
        MessageAction: isResend ? 'RESEND' : undefined,
        UserAttributes: [
            { Name: 'preferred_username', Value: user.fullName },
            { Name: 'email', Value: user.email },
            { Name: 'email_verified', Value: 'True' },
            { Name: 'phone_number', Value: user.phone },
            { Name: 'phone_number_verified', Value: 'False' },
            {
                Name: 'custom:is_Super',
                Value: 'False',
            },
        ],
    });

    const response = await client.send(createCommand);

    if ((response.$metadata.httpStatusCode ?? 0) > 299) {
        logger.error(
            `Failed to create Cognito user: ${user.id} - ${response.$metadata.httpStatusCode}`,
        );
        throw new Error(`Failed to create Cognito user: ${user.id}`);
    } else logger.info(`Cognito user created: ${user.id}`);

    if (user.notificationSetting) {
        //await updatePinPoint(logger, { newUser: user });
    }
};

export const deleteUser = async (logger: Logger, user: FullUser) => {
    const existingUser = await getUser(logger, user);

    if (
        !existingUser ||
        !existingUser.Username ||
        !existingUser.UserAttributes
    ) {
        logger.error(`Delete: User not found: ${user.id}`);
        throw new Error(`Delete: User not found: ${user.id}`);
    }

    const existingUserId = existingUser.Username;
    if (!existingUserId || existingUserId !== user.id) {
        logger.error(`User ID mismatch: ${user.id} vs ${existingUserId}`);
        throw new Error(`User ID mismatch: ${user.id} vs ${existingUserId}`);
    }
    try {
        const delCommand = new AdminDeleteUserCommand({
            Username: existingUser.Username,
            UserPoolId,
        });
        const response = await client.send(delCommand);
        if ((response.$metadata.httpStatusCode ?? 0) > 299) {
            logger.error(
                `Failed to delete Cognito user: ${user.id} - ${response.$metadata.httpStatusCode}`,
            );
            throw new Error(`Failed to delete Cognito user: ${user.id}`);
        } else logger.info(`Cognito user deleted: ${user.id}`);
    } catch (error) {
        if (error instanceof Error && error.name === 'UserNotFoundException') {
            logger.error(
                `Delete: User not found in Cognito: ${user.id}`,
                error,
            );
            return;
        }
        throw error;
    }
    if (user.notificationSetting) {
        //await updatePinPoint(logger, { pastUser: user });
    }
};

export const modifyUser = async (
    logger: Logger,
    user: FullUser,
    pastUser: FullUser,
) => {
    const UserAttributes: AttributeType[] = [];
    if (user.email !== pastUser.email) {
        const duplicateUser = await findUser(logger, user);
        if (duplicateUser) {
            logger.error(`modifyUser: Email already exists: ${user.id}`);
            throw new Error(`modifyUser: Email already exists: ${user.id}`);
        }
        UserAttributes.push(
            { Name: 'email', Value: user.email },
            { Name: 'email_verified', Value: 'True' }, // Should we set unverified?
        );
    }
    const existingUser = await getUser(logger, pastUser);
    if (
        !existingUser ||
        !existingUser.Username ||
        !existingUser.UserAttributes
    ) {
        logger.error(`Modify: User not found: ${user.id}`);
        throw new Error(`Modify: User not found: ${user.id}`);
    }
    const existingUserId = existingUser.Username;

    if (
        !existingUserId ||
        existingUserId !== pastUser.id ||
        pastUser.id !== user.id
    ) {
        logger.error(
            `User ID mismatch: ${user.id} vs ${pastUser.id} vs ${existingUserId}`,
        );
        throw new Error(
            `User ID mismatch: ${user.id} vs ${pastUser.id} vs ${existingUserId}`,
        );
    }
    if (user.phone !== pastUser.phone) {
        UserAttributes.push(
            { Name: 'phone_number', Value: user.phone },
            { Name: 'phone_number_verified', Value: 'False' },
        );
    }
    if (user.fullName !== pastUser.fullName) {
        UserAttributes.push({
            Name: 'preferred_username',
            Value: user.fullName,
        });
    }

    try {
        const input: AdminUpdateUserAttributesCommandInput = {
            Username: existingUser.Username,
            UserPoolId,
            UserAttributes,
        };
        const updateCommand = new AdminUpdateUserAttributesCommand(input);
        const response = await client.send(updateCommand);
        if ((response.$metadata.httpStatusCode ?? 0) > 299) {
            logger.error(
                `Failed to update Cognito user: ${user.id} - ${response.$metadata.httpStatusCode}`,
            );
            throw new Error(`Failed to update Cognito user: ${user.id}`);
        }
    } catch (error) {
        if (error instanceof Error && error.name === 'UserNotFoundException') {
            logger.error(
                `Modify: User not found in Cognito: ${user.id}`,
                error,
            );
            return;
        }
        throw error;
    }
    if (user.notificationSetting) {
        //   await updatePinPoint(logger, { newUser: user, pastUser });
    }
};

export const hasChanges = (user: FullUser, pastUser: FullUser): boolean => {
    if (user.email !== pastUser.email) return true;
    if (user.phone !== pastUser.phone) return true;
    if (user.resendInvite !== pastUser.resendInvite) return true;

    const oldAlertSetting: USER_NOTIFY_SETTING = pastUser.notificationSetting
        ? JSON.parse(pastUser.notificationSetting)
        : { version: 1 };

    const newAlertSetting: USER_NOTIFY_SETTING = user.notificationSetting
        ? JSON.parse(user.notificationSetting)
        : { version: 1 };

    if (!_.isEqual(oldAlertSetting, newAlertSetting)) return true;

    return false;
};
