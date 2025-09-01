import type { generateClient } from 'aws-amplify/data';
import { ref } from 'vue';
import { type Schema } from 'clientRoot/amplify/data/resource';
import type { Subscription } from 'rxjs';
import type { ShallowReactive } from 'vue';
import Bugsnag from '@bugsnag/js';

let client: ReturnType<typeof generateClient<Schema>>;
type Keys = keyof Schema['Fleet']['type']; // Cause linter 100% CPU
export type Fleet = Readonly<Schema['Fleet']['type']>;
export type NewFleet = Schema['Fleet']['createType'];
export type UpdateFleet = Omit<Schema['Fleet']['updateType'], 'isArchived'>;
const selectionSet = [
    'id',
    'isArchived',
    'name',
    'description',
    'createdAt',
    'updatedAt',
] as const satisfies readonly Keys[];
//type Options = Parameters<typeof client.models.Fleet.list>[0]; // Kills the linter

const isLoading = ref<boolean>(false);

const getAll = async (
    includeArchived = false,
    options?: Parameters<typeof client.models.Fleet.list>[0],
) => {
    let token: string | null = null;
    const fleets = [];
    isLoading.value = true;
    try {
        do {
            const {
                data: fleetBatch,
                errors,
                nextToken,
            } = includeArchived
                ? await client.models.Fleet.list({
                      ...options,
                      selectionSet,
                      limit: 100,
                      nextToken: token,
                  })
                : await client.models.Fleet.fleetByArchived(
                      { isArchived: 'false' },
                      {
                          ...options,
                          selectionSet,
                          limit: 100,
                          nextToken: token,
                      },
                  );

            if (errors) {
                throw new Error(
                    `Failed to fetch fleets: ${errors.map((e) => e.message).join(', ')}`,
                );
            }
            token = nextToken as string | null;
            fleets.push(...fleetBatch);
        } while (token);
        // type FleetFixed = Omit<(typeof fleets)[0], 'isArchived'> & {
        //     readonly isArchived: 'false' | 'true';
        // };

        return fleets as Fleet[];
    } finally {
        isLoading.value = false;
    }
};

const add = async (newFleet: NewFleet) => {
    const { errors, data: fleet } = await client.models.Fleet.create(newFleet, {
        selectionSet,
    });
    if (errors) {
        throw new Error(
            `Failed to create fleet: ${errors.map((e) => e.message).join(', ')}`,
        );
    }
    return fleet;
};
const update = async (updateFleet: UpdateFleet) => {
    const { errors, data: fleet } = await client.models.Fleet.update(
        updateFleet,
        {
            selectionSet,
        },
    );
    if (errors) {
        throw new Error(
            `Failed to update fleet: ${errors.map((e) => e.message).join(', ')}`,
        );
    }
    return fleet;
};
const archive = async (id: string, archive: boolean) => {
    // In case we must add additional logic to clean up invisible fleets
    const { errors, data: fleet } = await client.models.Fleet.update(
        {
            id,
            isArchived: archive ? 'true' : 'false',
        },
        {
            selectionSet,
        },
    );
    if (errors) {
        throw new Error(
            `Failed to update fleet: ${errors.map((e) => e.message).join(', ')}`,
        );
    }
    return fleet;
};
let createdSub: Subscription | null = null;
let updatedSub: Subscription | null = null;
let deletedSub: Subscription | null = null;
const startSubscriptions = (
    connection: ReturnType<typeof generateClient<Schema>>,
    map: ShallowReactive<Map<string, Fleet>>,
) => {
    client = connection;
    if (createdSub || updatedSub || deletedSub) stopSubscriptions();
    createdSub = client.models.Fleet.onCreate({ selectionSet }).subscribe({
        next: (data) => map.set(data.id, data as Fleet),
        error: (error) => Bugsnag.notify(error),
    });
    updatedSub = client.models.Fleet.onUpdate({ selectionSet }).subscribe({
        next: (data) => map.set(data.id, data as Fleet),
        error: (error) => Bugsnag.notify(error),
    });
    deletedSub = client.models.Fleet.onDelete({
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
    startSubscriptions,
    stopSubscriptions,
    getAll,
    add,
    update,
    archive,
    isLoading,
};
