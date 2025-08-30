import { generateClient } from 'aws-amplify/data';
import { ref } from 'vue';
import { type Schema } from 'adminRoot/amplify/data/resource';
import type { Subscription } from 'rxjs';
import type { ShallowReactive } from 'vue';
import Bugsnag from '@bugsnag/js';

const client = generateClient<Schema>({ authMode: 'userPool' });
type Keys = keyof Schema['Client']['type'] | 'modems.*';
export type Client = Omit<Readonly<Schema['Client']['type']>, 'modems'>;

const selectionSet = [
    'id',
    'isArchived',
    'isSandbox',
    'name',
    'url',
    'appRegion',
    'appId',
    'appSyncUrl',
    'amplifyWebhook',
    'environmentName',
    'lastDeploymentTime',
    'latestDeploymentVersion',
    'minimumUiVersion',
    'amplifyOutput',
    'tcpBanned',
    'iridiumBanned',
    'iridiumQueueRegion',
    'iridiumQueueUrl',
    'iridiumQueueArn',
    'socketQueueRegion',
    'socketQueueUrl',
    'socketQueueArn',
    'createdAt',
    'updatedAt',
] as const satisfies readonly Keys[];
const fullSet = [
    ...selectionSet,
    'modems.*',
] as const satisfies readonly Keys[];
export type NewClient = Schema['Client']['createType'];
export type UpdateClient = Schema['Client']['updateType'];

// type Options = Parameters<typeof client.models.User.list>[0];
const isLoading = ref(false);
const getAll = async (
    includeArchived = false,

    options?: Parameters<typeof client.models.Client.list>[0],
) => {
    let token: string | null = null;
    const users = [];
    isLoading.value = true;
    try {
        do {
            const {
                data: userBatch,
                errors,
                nextToken,
            } = includeArchived
                ? await client.models.Client.list({
                      ...options,
                      selectionSet,
                      limit: 100,
                      nextToken: token,
                  })
                : await client.models.Client.clientByArchived(
                      { isArchived: 'false' },
                      {
                          selectionSet,
                          limit: 100,
                          nextToken: token,
                      },
                  );

            if (errors) {
                throw new Error(
                    `Failed to fetch users: ${errors.map((e) => e.message).join(', ')}`,
                );
            }
            token = nextToken as string | null;
            users.push(...userBatch);
        } while (token);
        // type UserFixed = Omit<(typeof users)[0], 'isArchived'> & {
        //     readonly isArchived: 'false' | 'true';
        // };

        return users as Client[];
    } finally {
        isLoading.value = false;
    }
};

const getFull = async (id: string) => {
    const { data: fullUser, errors } = await client.models.Client.get(
        { id },
        {
            selectionSet: fullSet,
        },
    );

    if (errors) {
        throw new Error(
            `Failed to fetch user: ${errors.map((e) => e.message).join(', ')}`,
        );
    }
    if (!fullUser) throw new Error(`User with id ${id} not found`);

    return fullUser;
};

const add = async (newUser: NewClient) => {
    const { errors, data: user } = await client.models.Client.create(newUser, {
        selectionSet: fullSet,
    });
    if (errors) {
        throw new Error(
            `Failed to create user: ${errors.map((e) => e.message).join(', ')}`,
        );
    }
    return user;
};
const update = async (updateUser: UpdateClient) => {
    const { errors, data: user } = await client.models.Client.update(
        updateUser,
        {
            selectionSet: fullSet,
        },
    );
    if (errors) {
        throw new Error(
            `Failed to update user: ${errors.map((e) => e.message).join(', ')}`,
        );
    }
    return user;
};
const archive = async (id: string, archive: boolean) => {
    // In case we must add additional logic to clean up invisible users
    const { errors, data: user } = await client.models.Client.update(
        {
            id,
            isArchived: archive ? 'true' : 'false',
        },
        { selectionSet: fullSet },
    );
    if (errors) {
        throw new Error(
            `Failed to update user: ${errors.map((e) => e.message).join(', ')}`,
        );
    }
    return user;
};
let createdSub: Subscription | null = null;
let updatedSub: Subscription | null = null;
let deletedSub: Subscription | null = null;
const startSubscriptions = (map: ShallowReactive<Map<string, Client>>) => {
    if (createdSub || updatedSub || deletedSub) stopSubscriptions();
    createdSub = client.models.Client.onCreate({ selectionSet }).subscribe({
        next: (data) => {
            debugger;
            map.set(data.id, data as Client);
        },
        error: (error) => Bugsnag.notify(error),
    });
    updatedSub = client.models.Client.onUpdate({ selectionSet }).subscribe({
        next: (data) => {
            debugger;
            map.set(data.id, data as Client);
        },
        error: (error) => Bugsnag.notify(error),
    });
    deletedSub = client.models.Client.onDelete({ selectionSet }).subscribe({
        next: (data) => {
            debugger;
            map.delete(data.id);
        },
        error: (error) => Bugsnag.notify(error),
    });
};

const stopSubscriptions = () => {
    if (createdSub) createdSub.unsubscribe();
    if (updatedSub) updatedSub.unsubscribe();
    if (deletedSub) deletedSub.unsubscribe();
    createdSub = null;
    updatedSub = null;
    deletedSub = null;
};

export default {
    startSubscriptions,
    stopSubscriptions,
    getAll,
    getFull,
    add,
    update,
    archive,
    isLoading,
};
