import type { DynamoDBStreamHandler, DynamoDBRecord } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware';
import middy from '@middy/core';
import { Tracer } from '@aws-lambda-powertools/tracer';
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware';
import eventNormalizerMiddleware from '@middy/event-normalizer';
import type { FullUser } from 'client/services/database/users';
import { insertUser, modifyUser, deleteUser, hasChanges } from './user';
import {
    BatchProcessor,
    EventType,
    processPartialResponse,
} from '@aws-lambda-powertools/batch';

const serviceName = 'userCRUDTrigger';
const tracer = new Tracer({ serviceName });
const logger = new Logger();
const processor = new BatchProcessor(EventType.DynamoDBStreams); // (1)!

// NB middy has unmarshalled the records
const recordHandler = async (record: DynamoDBRecord): Promise<void> => {
    logger.info(`Processing record: ${record.eventID}`);
    logger.info(`Event Type: ${record.eventName}`);

    if (record.eventName === 'INSERT') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = record.dynamodb?.NewImage as any as FullUser;
        await insertUser(logger, { user });
    } else if (record.eventName === 'MODIFY') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = record.dynamodb?.NewImage as any as FullUser;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pastUser = record.dynamodb?.OldImage as any as FullUser;
        if (!hasChanges(user, pastUser)) {
            logger.info('No important changes in user data', user.id);
            return;
        }
        if ((user.resendInvite ?? 0) > (pastUser.resendInvite ?? 0)) {
            logger.warn(`Resend invite to user ${user.email} ${user.id}`);

            await insertUser(logger, { user, isResend: true });

            return;
        }
        await modifyUser(logger, user, pastUser);
    } else if (record.eventName === 'REMOVE') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = record.dynamodb?.OldImage as any as FullUser;
        await deleteUser(logger, user);
    }
};

export const lambdaHandler: DynamoDBStreamHandler = async (event, context) => {
    const result = await processPartialResponse(
        event,
        recordHandler,
        processor,
        {
            context,
        },
    );
    logger.info(`Processed ${event.Records.length} records`);
    if (result.batchItemFailures.length > 0) {
        logger.warn(
            `Failed to process ${result.batchItemFailures.length} records`,
        );
    }
    return result;
};
// Wrap the handler with middy
export const handler = middy(lambdaHandler)
    // Use the middleware by passing the Tracer instance as a parameter
    .use(injectLambdaContext(logger))
    .use(captureLambdaHandler(tracer))
    .use(eventNormalizerMiddleware());
