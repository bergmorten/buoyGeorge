import type { UserMigrationTriggerHandler } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware';
import middy from '@middy/core';
import { authenticateUser } from './authenticateUser';
// import { Tracer } from '@aws-lambda-powertools/tracer';
// import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware';

// const serviceName = 'userMigrationTrigger';
// const tracer = new Tracer({ serviceName });
const logger = new Logger();

//const client = new CognitoIdentityProviderClient();

// add user to group
export const lambdaHandler: UserMigrationTriggerHandler = async (
    event,
    context,
    callback,
) => {
    logger.info(JSON.stringify(event));

    //logger.info((callback as any) ? 'Callback is set' : 'Callback is not set');
    if (event.triggerSource !== 'UserMigration_Authentication') {
        logger.warn('Unexpected trigger source', {
            triggerSource: event.triggerSource,
        });
        if (callback) callback('Unexpected trigger source');
        event.response.finalUserStatus = 'UNKNOWN';
        return 'Unexpected trigger source';
    }
    try {
        const user = await authenticateUser(
            event.userName,
            event.request.password,
        );
        if (!user)
            throw new Error('Could not authenticate user with admin pool');
        event.response.userAttributes = {
            email: user.emailAddress,
            email_verified: 'true',
            'custom:is_Super': 'true',
        };
        event.response.finalUserStatus = 'CONFIRMED';
        event.response.messageAction = 'SUPPRESS';
        logger.info('response: ', event.response);
        return event;
    } catch (error) {
        // Return error to Amazon Cognito
        logger.error(error instanceof Error ? error.message : 'Unknown error');
        event.response.finalUserStatus = 'UNKNOWN';
        if (callback)
            callback(error instanceof Error ? error.message : 'Unknown error');

        return error instanceof Error ? error.message : 'Unknown error';
    }
};
// Wrap the handler with middy
export const handler = middy(lambdaHandler)
    // Use the middleware by passing the Tracer instance as a parameter
    .use(injectLambdaContext(logger));
// .use(captureLambdaHandler(tracer));
