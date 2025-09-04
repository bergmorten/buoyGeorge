import type { generateClient } from 'aws-amplify/data';
import { ref } from 'vue';
import { type Schema } from 'clientRoot/amplify/data/resource';
import type { Subscription } from 'rxjs';
import type { ShallowReactive } from 'vue';
import Bugsnag from '@bugsnag/js';

let client: ReturnType<typeof generateClient<Schema>>;
//type Keys = keyof Schema['Producer']['type'];
type Keys = keyof Schema['Producer']['type'] | 'location.*';

export const enum ProducerType {
    GEORGE = 'GEORGE',
    ZEPHYR = 'ZEPHYR',
    ALIZE = 'ALIZE',
}

export const producerTypes: ReadonlyArray<ProducerType> = [
    ProducerType.GEORGE,
    ProducerType.ZEPHYR,
    ProducerType.ALIZE,
] as const;

export type Producer = Readonly<
    Omit<Schema['Producer']['type'], 'manifest' | 'type'> & {
        type: ProducerType;
    }
>;

export type ProducerState = Producer['state'];
export const producerStates: ReadonlyArray<ProducerState> = [
    'RUNNING',
    'HALTED',
    'ABORTED',
    'MISSING',
] as const;

export interface FullProducer extends Producer {
    readonly status: string | null;
    readonly manifest: string | null;
}
export type NewProducer = Schema['Producer']['createType'];
export type UpdateProducer = Omit<
    Schema['Producer']['updateType'],
    'isArchived'
>;
const selectionSet = [
    'id',
    'isArchived',
    'name',
    'lastSeen',
    'location.*',
    'state',
    'status',
    'fleetId',
    'type',
    'createdAt',
    'updatedAt',
] as const satisfies Keys[];
const fullSet = [...selectionSet, 'manifest'] as const satisfies Keys[];

// type Options = Parameters<typeof client.models.Producer.list>[0];
const isLoading = ref(false);
const getAll = async (
    includeArchived = false,
    options?: Parameters<typeof client.models.Producer.list>[0],
) => {
    let token: string | null = null;
    const producers = [];
    isLoading.value = true;
    try {
        do {
            const {
                data: producerBatch,
                errors,
                nextToken,
            } = includeArchived
                ? await client.models.Producer.list({
                      ...options,
                      selectionSet,
                      limit: 100,
                      nextToken: token,
                  })
                : await client.models.Producer.producerByArchived(
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
                    `Failed to fetch producers: ${errors.map((e) => e.message).join(', ')}`,
                );
            }
            token = nextToken as string | null;
            producers.push(...producerBatch);
        } while (token);
        // type ProducerFixed = Omit<(typeof producers)[0], 'isArchived'> & {
        //     readonly isArchived: 'false' | 'true';
        // };

        return producers as Producer[];
    } finally {
        isLoading.value = false;
    }
};

const getFull = async (id: string) => {
    const { data: fullProducer, errors } = await client.models.Producer.get(
        { id },
        {
            selectionSet: fullSet,
        },
    );

    if (errors) {
        throw new Error(
            `Failed to fetch producer: ${errors.map((e) => e.message).join(', ')}`,
        );
    }
    if (!fullProducer) throw new Error(`Producer with id ${id} not found`);

    return fullProducer as FullProducer;
};

const add = async (newProducer: NewProducer) => {
    const { errors, data: producer } = await client.models.Producer.create(
        newProducer,
        { selectionSet: fullSet },
    );
    if (errors) {
        throw new Error(
            `Failed to create producer: ${errors.map((e) => e.message).join(', ')}`,
        );
    }
    return producer;
};
const update = async (updateProducer: UpdateProducer) => {
    const { errors, data: producer } = await client.models.Producer.update(
        updateProducer,
        {
            selectionSet: fullSet,
        },
    );
    if (errors) {
        throw new Error(
            `Failed to update producer: ${errors.map((e) => e.message).join(', ')}`,
        );
    }
    return producer;
};

const remove = async (id: string) => {
    const { errors } = await client.models.Producer.delete({ id });
    if (errors) {
        throw new Error(
            `Failed to remove producer: ${errors.map((e) => e.message).join(', ')}`,
        );
    }
};

const archive = async (id: string, archive: boolean) => {
    // In case we must add additional logic to clean up invisible producers
    const { errors, data: producer } = await client.models.Producer.update(
        {
            id,
            isArchived: archive ? 'true' : 'false',
        },
        { selectionSet: fullSet },
    );
    if (errors) {
        throw new Error(
            `Failed to update producer: ${errors.map((e) => e.message).join(', ')}`,
        );
    }
    return producer;
};
let createdSub: Subscription | null = null;
let updatedSub: Subscription | null = null;
let deletedSub: Subscription | null = null;
const startSubscriptions = (
    connection: ReturnType<typeof generateClient<Schema>>,
    map: ShallowReactive<Map<string, Producer>>,
) => {
    client = connection;
    if (createdSub || updatedSub || deletedSub) stopSubscriptions();
    createdSub = client.models.Producer.onCreate({ selectionSet }).subscribe({
        next: (data) => map.set(data.id, data as Producer),
        error: (error) => Bugsnag.notify(error),
    });
    updatedSub = client.models.Producer.onUpdate({ selectionSet }).subscribe({
        next: (data) => map.set(data.id, data as Producer),
        error: (error) => Bugsnag.notify(error),
    });
    deletedSub = client.models.Producer.onDelete({
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
    getFull,
    add,
    update,
    archive,
    remove,
    isLoading,
};
