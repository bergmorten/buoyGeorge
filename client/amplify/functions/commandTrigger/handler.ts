import type { DynamoDBRecord, DynamoDBStreamHandler } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware';
import middy from '@middy/core';
import { Tracer } from '@aws-lambda-powertools/tracer';
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware';
import {
    BatchProcessor,
    EventType,
    processPartialResponse,
} from '@aws-lambda-powertools/batch';
import eventNormalizerMiddleware from '@middy/event-normalizer';

const logger = new Logger();
const processor = new BatchProcessor(EventType.DynamoDBStreams); // (1)!
const serviceName = 'commandTrigger';
const tracer = new Tracer({ serviceName });

// NB middy has unmarshalled the records
const recordHandler = (record: DynamoDBRecord): void => {
    logger.info(`Processing record: ${record.eventID}`);
    logger.info(`Event Type: ${record.eventName}`);

    if (record.eventName === 'INSERT') {
        // business logic to process new records
        logger.info(`New Image: ${JSON.stringify(record.dynamodb?.NewImage)}`);
    }
};

const lambdaHandler: DynamoDBStreamHandler = async (event, context) => {
    const result = await processPartialResponse(
        event,
        recordHandler,
        processor,
        {
            context,
        }
    );
    logger.info(`Processed ${event.Records.length} records`);
    if (result.batchItemFailures.length > 0) {
        logger.warn(
            `Failed to process ${result.batchItemFailures.length} records`
        );
    }
    return result;
};

// Wrap the handler with middy
export const handler = middy(lambdaHandler)
    // Use the middleware by passing the Tracer instance as a parameter
    .use(captureLambdaHandler(tracer))
    .use(injectLambdaContext(logger))
    .use(eventNormalizerMiddleware());
