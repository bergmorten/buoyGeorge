import type { generateClient } from 'aws-amplify/data';
import { ref } from 'vue';
import { type Schema } from 'clientRoot/amplify/data/resource';
import type { Subscription } from 'rxjs';
import type { ShallowReactive } from 'vue';
import Bugsnag from '@bugsnag/js';

let client: ReturnType<typeof generateClient<Schema>>;
//type Keys = keyof Schema['Deployment']['type'];
type Keys = keyof Schema['Deployment']['type'];

export type Deployment = Readonly<
    Omit<Schema['Deployment']['type'], 'deploymentData'>
>;
export type DeploymentState = Deployment['state'];
export const deploymentStates: ReadonlyArray<DeploymentState> = [
    'RUNNING',
    'ENDED',
] as const;
export interface FullDeployment extends Deployment {
    readonly deploymentData: string | null;
}
export type NewDeployment = Schema['Deployment']['createType'];
export type UpdateDeployment = Omit<
    Schema['Deployment']['updateType'],
    'isArchived'
>;
const selectionSet = [
    'id',
    'isArchived',
    'title',
    'description',
    'state',
    'fleetId',
    'projectId',
    'createdAt',
    'updatedAt',
] as const satisfies Keys[];
const fullSet = [...selectionSet, 'deploymentData'] as const satisfies Keys[];

// type Options = Parameters<typeof client.models.Deployment.list>[0];
const isLoading = ref(false);
const getAll = async (
    includeArchived = false,
    options?: Parameters<typeof client.models.Deployment.list>[0],
) => {
    let token: string | null = null;
    const deployments = [];
    isLoading.value = true;
    try {
        do {
            const {
                data: deploymentBatch,
                errors,
                nextToken,
            } = includeArchived
                ? await client.models.Deployment.list({
                      ...options,
                      selectionSet,
                      limit: 100,
                      nextToken: token,
                  })
                : await client.models.Deployment.deploymentByArchived(
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
                    `Failed to fetch deployments: ${errors.map((e) => e.message).join(', ')}`,
                );
            }
            token = nextToken as string | null;
            deployments.push(...deploymentBatch);
        } while (token);
        // type DeploymentFixed = Omit<(typeof deployments)[0], 'isArchived'> & {
        //     readonly isArchived: 'false' | 'true';
        // };

        return deployments as Deployment[];
    } finally {
        isLoading.value = false;
    }
};

const getFull = async (id: string) => {
    const { data: fullDeployment, errors } = await client.models.Deployment.get(
        { id },
        {
            selectionSet: fullSet,
        },
    );

    if (errors) {
        throw new Error(
            `Failed to fetch deployment: ${errors.map((e) => e.message).join(', ')}`,
        );
    }
    if (!fullDeployment) throw new Error(`Deployment with id ${id} not found`);

    return fullDeployment as FullDeployment;
};

const add = async (newDeployment: NewDeployment) => {
    const { errors, data: deployment } = await client.models.Deployment.create(
        newDeployment,
        { selectionSet: fullSet },
    );
    if (errors) {
        throw new Error(
            `Failed to create deployment: ${errors.map((e) => e.message).join(', ')}`,
        );
    }
    return deployment;
};
const update = async (updateDeployment: UpdateDeployment) => {
    const { errors, data: deployment } = await client.models.Deployment.update(
        updateDeployment,
        {
            selectionSet: fullSet,
        },
    );
    if (errors) {
        throw new Error(
            `Failed to update deployment: ${errors.map((e) => e.message).join(', ')}`,
        );
    }
    return deployment;
};

const remove = async (id: string) => {
    const { errors } = await client.models.Deployment.delete({ id });
    if (errors) {
        throw new Error(
            `Failed to remove deployment: ${errors.map((e) => e.message).join(', ')}`,
        );
    }
};

const archive = async (id: string, archive: boolean) => {
    // In case we must add additional logic to clean up invisible deployments
    const { errors, data: deployment } = await client.models.Deployment.update(
        {
            id,
            isArchived: archive ? 'true' : 'false',
        },
        { selectionSet: fullSet },
    );
    if (errors) {
        throw new Error(
            `Failed to update deployment: ${errors.map((e) => e.message).join(', ')}`,
        );
    }
    return deployment;
};
let createdSub: Subscription | null = null;
let updatedSub: Subscription | null = null;
let deletedSub: Subscription | null = null;
const startSubscriptions = (
    connection: ReturnType<typeof generateClient<Schema>>,
    map: ShallowReactive<Map<string, Deployment>>,
) => {
    client = connection;
    if (createdSub || updatedSub || deletedSub) stopSubscriptions();
    createdSub = client.models.Deployment.onCreate({ selectionSet }).subscribe({
        next: (data) => map.set(data.id, data as Deployment),
        error: (error) => Bugsnag.notify(error),
    });
    updatedSub = client.models.Deployment.onUpdate({ selectionSet }).subscribe({
        next: (data) => map.set(data.id, data as Deployment),
        error: (error) => Bugsnag.notify(error),
    });
    deletedSub = client.models.Deployment.onDelete({
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
