import type { generateClient } from 'aws-amplify/data';
import { ref } from 'vue';
import { type Schema } from 'clientRoot/amplify/data/resource';
import type { Subscription } from 'rxjs';
import Bugsnag from '@bugsnag/js';

let client: ReturnType<typeof generateClient<Schema>>;
export type Org = Schema['Org']['type'];
export type NewOrg = Schema['Org']['createType'];
export type UpdateOrg = Schema['Org']['updateType'];
// type Options = Parameters<typeof client.models.Producer.list>[0];
const isLoading = ref(false);
export const organization = ref<Org | null>(null);
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
        if (orgs.length === 0) {
            throw new Error('No orgs found');
        }

        organization.value = orgs[0] as Org;
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

let updatedSub: Subscription | null = null;

const startSubscriptions = (
    connection: ReturnType<typeof generateClient<Schema>>,
) => {
    client = connection;
    if (updatedSub) stopSubscriptions();

    updatedSub = client.models.Org.onUpdate().subscribe({
        next: (data) => {
            if (data.id === organization.value?.id) {
                organization.value = data;
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
    isLoading,
};
