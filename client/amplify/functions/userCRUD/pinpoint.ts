import {
    PinpointEmailClient,
    CreateEmailIdentityCommand,
    DeleteEmailIdentityCommand,
    GetEmailIdentityCommand,
} from '@aws-sdk/client-pinpoint-email'; // ES Modules import
import type { FullUser } from 'app/src/services/database/users';
import type { USER_NOTIFY_SETTING } from 'app/src/services/database/users/models';
import type { Logger } from '@aws-lambda-powertools/logger';

const PinPointRegion = 'eu-central-1'; // THIS is common for all clients

const createEmailIdentity = async (logger: Logger, user: FullUser) => {
    const client = new PinpointEmailClient({ region: PinPointRegion });
    const getInput = {
        // GetEmailIdentityRequest
        EmailIdentity: user.email, // required
    };
    try {
        const getCommand = new GetEmailIdentityCommand(getInput);
        const getResponse = await client.send(getCommand);
        if (getResponse.IdentityType) {
            logger.info(
                'Pinpoint email identity exists: ',
                getResponse.IdentityType,
            );
            return;
        }
    } catch {
        // ignore error
    }
    const input = {
        // CreateEmailIdentityRequest
        EmailIdentity: user.email, // required
        Tags: [
            // TagList
            {
                // Tag
                Key: 'Client', // required
                Value: process.env.ENV ?? 'UNKNOWN', // required
            },
        ],
    };
    const command = new CreateEmailIdentityCommand(input);
    const response = await client.send(command);

    if ((response.$metadata.httpStatusCode ?? 0) > 299)
        logger.warn(
            `Failed to created pinpoint email identity: ${user.email} - ${response.$metadata.httpStatusCode}`,
        );
    else logger.debug(`Pinpoint email identity created for ${user.email}`);
};

const removeEmailIdentity = async (logger: Logger, user: FullUser) => {
    const client = new PinpointEmailClient({ region: PinPointRegion });
    const input = {
        // DeleteEmailIdentityRequest
        EmailIdentity: user.email, // required
    };
    const command = new DeleteEmailIdentityCommand(input);
    await client.send(command);
    logger.warn(`Pinpoint email identity removed: ${user.email}`);
};

export const updatePinPoint = async (
    logger: Logger,
    {
        newUser,
        pastUser,
    }: {
        newUser?: FullUser | undefined;
        pastUser?: FullUser | undefined;
    },
) => {
    try {
        if (newUser && newUser.notificationSetting) {
            const setting = newUser.notificationSetting;
            const notificationSetting = (
                typeof setting === 'string' ? JSON.parse(setting) : setting
            ) as USER_NOTIFY_SETTING;
            if (notificationSetting.globalEmailLevel) {
                await createEmailIdentity(logger, newUser);
            } else {
                // Should we remove the endpoint?
            }
        }
        if (pastUser?.notificationSetting) {
            if (newUser?.email === pastUser?.email) return; // No need to update
            const setting = pastUser.notificationSetting;
            const notificationSetting = (
                typeof setting === 'string' ? JSON.parse(setting) : setting
            ) as USER_NOTIFY_SETTING;
            if (notificationSetting.globalEmailLevel) {
                await removeEmailIdentity(logger, pastUser);
            }
        }
    } catch (error) {
        logger.warn('Error in updatePinPoint, not critical');
        if (error instanceof Error) logger.debug(error.message);
    }
};
