import type { PreTokenGenerationTriggerHandler } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware';
import middy from '@middy/core';
// import { Tracer } from '@aws-lambda-powertools/tracer';
// import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware';
//import type { Context } from 'aws-lambda';
import { type Schema } from '../../data/resource';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from 'clientRoot/.amplify/generated/env/pre-token-generation'; ///env/pre-token-generation';

// Do not know how to enable X-ray tracing and auth functions
//const serviceName = 'preTokenTrigger';
//const tracer = new Tracer({ serviceName });
const logger = new Logger();
const { resourceConfig, libraryOptions } =
    await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);
const client = generateClient<Schema>();

// add user to group SUPERS or ADMINS
const lambdaHandler: PreTokenGenerationTriggerHandler = async (
    event,
    //   context: Context
) => {
    const groups: string[] = [];
    logger.info(`Received event: ${JSON.stringify(event)}`);
    const userId = event.userName;
    if (!userId) throw new Error('No user id found');
    const isSuper =
        (
            event.request.userAttributes['custom:is_Super'] ?? 'false'
        ).toLowerCase() === 'true';

    if (isSuper) {
        logger.info(`User ${userId} is a super user`);
        groups.push('SUPERS');
    } else {
        const dbUser = await client.models.User.get(
            { id: userId },
            { selectionSet: ['id', 'orgAdmin'] },
        );
        if (dbUser.errors?.length) {
            logger.error(`Error fetching user ${dbUser.errors.join(', ')}`);
            throw new Error('Error fetching user');
        }
        if (!dbUser.data) {
            logger.warn(`User ${userId} not found`);
            throw new Error('User not found');
        }
        if (dbUser.data.orgAdmin) {
            groups.push('ADMINS');
        } else {
            const fleets = await client.models.UserFleet.fleetByUser(
                {
                    userId: dbUser.data.id,
                },
                { limit: 32 },
            );
            if (fleets.errors?.length) {
                logger.error(
                    `Error fetching fleets for user ${userId}: ${fleets.errors.join(', ')}`,
                );
                throw new Error('Error fetching fleets');
            }
            if (fleets.data?.length === 32) {
                logger.warn(`User ${userId} has 32 or more fleets`);
            }
            for (const fleet of fleets.data || []) {
                groups.push(fleet.id);
            }
        }
    }
    if (groups.length) {
        const response = {
            claimsOverrideDetails: {
                groupOverrideDetails: {
                    groupsToOverride: groups,
                },
            },
        };
        event.response = response;
        return event;
    }
    return event;
};

// Wrap the handler with middy
export const handler = middy(lambdaHandler)
    //  .use(captureLambdaHandler(tracer))
    .use(injectLambdaContext(logger));
