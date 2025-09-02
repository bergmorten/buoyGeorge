import type { generateClient } from 'aws-amplify/data';
import { ref, readonly } from 'vue';
import { type Schema } from 'clientRoot/amplify/data/resource';
import type { Subscription } from 'rxjs';
import Bugsnag from '@bugsnag/js';

let client: ReturnType<typeof generateClient<Schema>>;
export type Org = Schema['Org']['type'];
export type NewOrg = Schema['Org']['createType'];
export type UpdateOrg = Schema['Org']['updateType'];
// type Options = Parameters<typeof client.models.Producer.list>[0];
const isLoading = ref(false);
export const organization = ref<Readonly<Org> | null>(null);
const get = async (options?: Parameters<typeof client.models.Org.list>[0]) => {
    let token: string | null = null;
    const orgs = [];
    isLoading.value = true;
    try {
        do {
            const {
                data: orgBatch,
                errors,
                nextToken,
            } = await client.models.Org.list({
                ...options,
                limit: 2,
                nextToken: token,
            });

            if (errors) {
                throw new Error(
                    `Failed to fetch orgs: ${errors.map((e) => e.message).join(', ')}`,
                );
            }
            token = nextToken as string | null;
            orgs.push(...orgBatch);
        } while (token);
        const first = orgs[0];
        organization.value = first ? (readonly(first) as Org) : null;
        if (orgs.length > 1) {
            Bugsnag.notify(
                new Error(
                    `Multiple orgs found: ${orgs.map((o) => o.name).join(', ')}`,
                ),
            );
        }
        return organization.value;
    } finally {
        isLoading.value = false;
    }
};

const add = async (newOrg: NewOrg) => {
    const { errors, data: org } = await client.models.Org.create(newOrg);
    if (errors) {
        throw new Error(
            `Failed to create org: ${errors.map((e) => e.message).join(', ')}`,
        );
    }
    return org as Org;
};

const update = async (updateOrg: UpdateOrg) => {
    const { errors, data: org } = await client.models.Org.update(updateOrg);
    if (errors) {
        throw new Error(
            `Failed to update org: ${errors.map((e) => e.message).join(', ')}`,
        );
    }
    return org as Org;
};

const remove = async (id: string) => {
    const { errors } = await client.models.Org.delete({ id });
    if (errors) {
        throw new Error(
            `Failed to remove org: ${errors.map((e) => e.message).join(', ')}`,
        );
    }
};

let createdSub: Subscription | null = null;
let updatedSub: Subscription | null = null;
let deletedSub: Subscription | null = null;

const startSubscriptions = (
    connection: ReturnType<typeof generateClient<Schema>>,
) => {
    client = connection;
    if (createdSub || updatedSub || deletedSub) stopSubscriptions();
    createdSub = client.models.Org.onCreate().subscribe({
        next: (data) => {
            if (!organization.value) {
                organization.value = readonly(data);
            } else Bugsnag.notify('Multiple organizations found');
        },
        error: (error) => Bugsnag.notify(error),
    });
    updatedSub = client.models.Org.onUpdate().subscribe({
        next: (data) => {
            if (data.id === organization.value?.id) {
                organization.value = readonly(data);
            }
        },
        error: (error) => Bugsnag.notify(error),
    });
    deletedSub = client.models.Producer.onDelete({
        selectionSet: ['id'],
    }).subscribe({
        next: () => {
            if (!organization.value) {
                organization.value = null;
            }
        },
        error: (error) => Bugsnag.notify(error),
    });
};

const stopSubscriptions = () => {
    if (updatedSub) updatedSub.unsubscribe();

    updatedSub = null;
};

export default {
    startSubscriptions,
    stopSubscriptions,
    get,
    add,
    update,
    remove,
    isLoading,
};
