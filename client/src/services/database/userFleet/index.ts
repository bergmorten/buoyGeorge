import { generateClient } from 'aws-amplify/data';
import { ref } from 'vue';
import { type Schema } from 'clientRoot/amplify/data/resource';
import type { Subscription } from 'rxjs';
import type { ShallowReactive } from 'vue';
import Bugsnag from '@bugsnag/js';

const client = generateClient<Schema>({ authMode: 'userPool' });
type Keys = keyof Schema['UserFleet']['type'];

export type UserFleet = Readonly<Schema['UserFleet']['type']>;
export type NewUserFleet = Readonly<Schema['UserFleet']['createType']>;
const selectionSet = [
    'id',
    'userId',
    'fleetId',
] as const satisfies readonly Keys[];

//type Options = Parameters<typeof client.models.Fleet.list>[0]; // Kills the linter

const isLoading = ref<boolean>(false);

const getAll = async (
    options?: Parameters<typeof client.models.UserFleet.list>[0],
) => {
    let token: string | null = null;
    const userFleets = [];
    isLoading.value = true;
    try {
        do {
            const {
                data: userFleetBatch,
                errors,
                nextToken,
            } = await client.models.UserFleet.list({
                ...options,
                selectionSet,
                limit: 100,
                nextToken: token,
            });

            if (errors) {
                throw new Error(
                    `Failed to fetch user fleets: ${errors.map((e) => e.message).join(', ')}`,
                );
            }
            token = nextToken as string | null;
            userFleets.push(...userFleetBatch);
        } while (token);
        // type FleetFixed = Omit<(typeof fleets)[0], 'isArchived'> & {
        //     readonly isArchived: 'false' | 'true';
        // };

        return userFleets as UserFleet[];
    } finally {
        isLoading.value = false;
    }
};

const add = async (newFleet: NewUserFleet) => {
    const { errors, data: fleet } = await client.models.UserFleet.create(
        newFleet,
        {
            selectionSet,
        },
    );
    if (errors) {
        throw new Error(
            `Failed to create user fleet: ${errors.map((e) => e.message).join(', ')}`,
        );
    }
    return fleet;
};
const remove = async (id: string) => {
    // In case we must add additional logic to clean up invisible fleets
    const { errors, data: fleet } = await client.models.UserFleet.delete(
        {
            id,
        },
        {
            selectionSet,
        },
    );
    if (errors) {
        throw new Error(
            `Failed to delete user fleet: ${errors.map((e) => e.message).join(', ')}`,
        );
    }

    return fleet;
};
let createdSub: Subscription | null = null;
let updatedSub: Subscription | null = null;
let deletedSub: Subscription | null = null;
const startSubscriptions = (map: ShallowReactive<Map<string, UserFleet>>) => {
    if (createdSub || updatedSub || deletedSub) stopSubscriptions();
    createdSub = client.models.UserFleet.onCreate({ selectionSet }).subscribe({
        next: (data) => map.set(data.id, data as UserFleet),
        error: (error) => Bugsnag.notify(error),
    });
    updatedSub = client.models.UserFleet.onUpdate({ selectionSet }).subscribe({
        next: (data) => map.set(data.id, data as UserFleet),
        error: (error) => Bugsnag.notify(error),
    });
    deletedSub = client.models.UserFleet.onDelete({
        selectionSet: ['id'],
    }).subscribe({
        next: (data) => map.delete(data.id),
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
    isLoading,
    startSubscriptions,
    stopSubscriptions,
    getAll,
    add,
    remove,
};
