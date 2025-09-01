import { ref } from 'vue';
import { type Schema } from 'adminRoot/amplify/data/resource';
import type { Subscription } from 'rxjs';
import type { ShallowReactive } from 'vue';
import Bugsnag from '@bugsnag/js';
import type { generateClient } from 'aws-amplify/data';

let admin: ReturnType<typeof generateClient<Schema>>;
type Keys = keyof Schema['Modem']['type'] | 'client.*';

export type Modem = Readonly<Schema['Modem']['type']>;
export type NewModem = Readonly<Schema['Modem']['createType']>;
export type UpdateModem = Readonly<Schema['Modem']['updateType']>;

/*
  .model({
    id: a.id().required(),
    clientId: a.id().required(),
    client: a.belongsTo("Client", "clientId"),
    type: a.enum(["IRIDIUM_SBD", "IRIDIUM_IMT", "CELLULAR"]),
    identityString: a.string(),
    publicKey: a.string(),
    certificate: a.string(),
  })
    */
const selectionSet = [
    'id',
    'isBanned',
    'clientId',
    'type',
    'identityString',
    'publicKey',
    'certificate',
] as const satisfies readonly Keys[];

//type Options = Parameters<typeof client.models.Fleet.list>[0]; // Kills the linter

const isLoading = ref<boolean>(false);

const getAll = async (
    options?: Parameters<typeof admin.models.Modem.list>[0],
) => {
    let token: string | null = null;
    const modems = [];
    isLoading.value = true;
    try {
        do {
            const {
                data: modemBatch,
                errors,
                nextToken,
            } = await admin.models.Modem.list({
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
            modems.push(...modemBatch);
        } while (token);
        // type FleetFixed = Omit<(typeof fleets)[0], 'isArchived'> & {
        //     readonly isArchived: 'false' | 'true';
        // };

        return modems as Modem[];
    } finally {
        isLoading.value = false;
    }
};

const update = async (UpdateModem: UpdateModem) => {
    const { errors, data: user } = await admin.models.Modem.update(
        UpdateModem,
        {
            selectionSet: selectionSet,
        },
    );
    if (errors) {
        throw new Error(
            `Failed to update modem: ${errors.map((e) => e.message).join(', ')}`,
        );
    }
    return user;
};

const add = async (newModem: NewModem) => {
    const { errors, data: modem } = await admin.models.Modem.create(newModem, {
        selectionSet,
    });
    if (errors) {
        throw new Error(
            `Failed to create modem: ${errors.map((e) => e.message).join(', ')}`,
        );
    }
    return modem;
};
const remove = async (id: string) => {
    // In case we must add additional logic to clean up invisible modems
    const { errors, data: modem } = await admin.models.Modem.delete(
        {
            id,
        },
        {
            selectionSet,
        },
    );
    if (errors) {
        throw new Error(
            `Failed to delete modem: ${errors.map((e) => e.message).join(', ')}`,
        );
    }

    return modem;
};
let createdSub: Subscription | null = null;
let updatedSub: Subscription | null = null;
let deletedSub: Subscription | null = null;
const startSubscriptions = (
    connection: ReturnType<typeof generateClient<Schema>>,
    map: ShallowReactive<Map<string, Modem>>,
) => {
    admin = connection;
    if (createdSub || updatedSub || deletedSub) stopSubscriptions();
    createdSub = admin.models.Modem.onCreate({ selectionSet }).subscribe({
        next: (data) => map.set(data.id, data as Modem),
        error: (error) => Bugsnag.notify(error),
    });
    updatedSub = admin.models.Modem.onUpdate({ selectionSet }).subscribe({
        next: (data) => map.set(data.id, data as Modem),
        error: (error) => Bugsnag.notify(error),
    });
    deletedSub = admin.models.Modem.onDelete({
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
    update,
    add,
    remove,
};
