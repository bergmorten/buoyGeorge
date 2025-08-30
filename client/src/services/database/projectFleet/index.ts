import { generateClient } from 'aws-amplify/data';
import { ref } from 'vue';
import { type Schema } from 'clientRoot/amplify/data/resource';
import type { Subscription } from 'rxjs';
import type { ShallowReactive } from 'vue';
import Bugsnag from '@bugsnag/js';

const client = generateClient<Schema>({ authMode: 'userPool' });
type Keys = keyof Schema['ProjectFleet']['type'];

export type ProjectFleet = Readonly<Schema['ProjectFleet']['type']>;
export type NewProjectFleet = Readonly<Schema['ProjectFleet']['createType']>;
const selectionSet = [
    'id',
    'projectId',
    'fleetId',
] as const satisfies readonly Keys[];

//type Options = Parameters<typeof client.models.Fleet.list>[0]; // Kills the linter

export const isLoading = ref<boolean>(false);

const getAll = async (
    options?: Parameters<typeof client.models.ProjectFleet.list>[0],
) => {
    let token: string | null = null;
    const projectFleets = [];
    isLoading.value = true;
    try {
        do {
            const {
                data: projectFleetBatch,
                errors,
                nextToken,
            } = await client.models.ProjectFleet.list({
                ...options,
                selectionSet,
                limit: 100,
                nextToken: token,
            });

            if (errors) {
                throw new Error(
                    `Failed to fetch project fleets: ${errors.map((e) => e.message).join(', ')}`,
                );
            }
            token = nextToken as string | null;
            projectFleets.push(...projectFleetBatch);
        } while (token);
        // type FleetFixed = Omit<(typeof fleets)[0], 'isArchived'> & {
        //     readonly isArchived: 'false' | 'true';
        // };

        return projectFleets as ProjectFleet[];
    } finally {
        isLoading.value = false;
    }
};

const add = async (newFleet: NewProjectFleet) => {
    const { errors, data: fleet } = await client.models.ProjectFleet.create(
        newFleet,
        {
            selectionSet,
        },
    );
    if (errors) {
        throw new Error(
            `Failed to create project fleet: ${errors.map((e) => e.message).join(', ')}`,
        );
    }
    return fleet;
};
const remove = async (id: string) => {
    // In case we must add additional logic to clean up invisible fleets
    const { errors, data: fleet } = await client.models.ProjectFleet.delete(
        {
            id,
        },
        {
            selectionSet,
        },
    );
    if (errors) {
        throw new Error(
            `Failed to delete project fleet: ${errors.map((e) => e.message).join(', ')}`,
        );
    }

    return fleet;
};
let createdSub: Subscription | null = null;
let updatedSub: Subscription | null = null;
let deletedSub: Subscription | null = null;
const startSubscriptions = (
    map: ShallowReactive<Map<string, ProjectFleet>>,
) => {
    if (createdSub || updatedSub || deletedSub) stopSubscriptions();
    createdSub = client.models.ProjectFleet.onCreate({
        selectionSet,
    }).subscribe({
        next: (data) => map.set(data.id, data as ProjectFleet),
        error: (error) => Bugsnag.notify(error),
    });
    updatedSub = client.models.ProjectFleet.onUpdate({
        selectionSet,
    }).subscribe({
        next: (data) => map.set(data.id, data as ProjectFleet),
        error: (error) => Bugsnag.notify(error),
    });
    deletedSub = client.models.ProjectFleet.onDelete({
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
    remove,
    isLoading,
};
