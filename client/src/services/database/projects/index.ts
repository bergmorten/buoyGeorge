import { generateClient } from 'aws-amplify/data';
import { ref } from 'vue';
import { type Schema } from 'clientRoot/amplify/data/resource';
import type { Subscription } from 'rxjs';
import type { ShallowReactive } from 'vue';
import Bugsnag from '@bugsnag/js';

const client = generateClient<Schema>({ authMode: 'userPool' });
type Keys = keyof Schema['Project']['type']; // Cause linter 100% CPU
export type Project = Readonly<Schema['Project']['type']>;
export type NewProject = Schema['Project']['createType'];
export type UpdateProject = Omit<Schema['Project']['updateType'], 'isArchived'>;
const selectionSet = [
    'id',
    'isArchived',
    'name',
    'description',
    'createdAt',
] as const satisfies readonly Keys[];
//type Options = Parameters<typeof client.models.Project.list>[0]; // Kills the linter

const isLoading = ref<boolean>(false);

const getAll = async (
    includeArchived = false,
    options?: Parameters<typeof client.models.Project.list>[0],
) => {
    let token: string | null = null;
    const projects = [];
    isLoading.value = true;
    try {
        do {
            const {
                data: projectBatch,
                errors,
                nextToken,
            } = includeArchived
                ? await client.models.Project.list({
                      ...options,
                      selectionSet,
                      limit: 100,
                      nextToken: token,
                  })
                : await client.models.Project.projectByArchived(
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
                    `Failed to fetch projects: ${errors.map((e) => e.message).join(', ')}`,
                );
            }
            token = nextToken as string | null;
            projects.push(...projectBatch);
        } while (token);
        // type ProjectFixed = Omit<(typeof projects)[0], 'isArchived'> & {
        //     readonly isArchived: 'false' | 'true';
        // };

        return projects as Project[];
    } finally {
        isLoading.value = false;
    }
};

const add = async (newProject: NewProject) => {
    const { errors, data: project } = await client.models.Project.create(
        newProject,
        {
            selectionSet,
        },
    );
    if (errors) {
        throw new Error(
            `Failed to create project: ${errors.map((e) => e.message).join(', ')}`,
        );
    }
    return project;
};
const update = async (updateProject: UpdateProject) => {
    const { errors, data: project } = await client.models.Project.update(
        updateProject,
        {
            selectionSet,
        },
    );
    if (errors) {
        throw new Error(
            `Failed to update project: ${errors.map((e) => e.message).join(', ')}`,
        );
    }
    return project;
};
const archive = async (id: string, archive: boolean) => {
    // In case we must add additional logic to clean up invisible projects
    const { errors, data: project } = await client.models.Project.update(
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
            `Failed to update project: ${errors.map((e) => e.message).join(', ')}`,
        );
    }
    return project;
};
let createdSub: Subscription | null = null;
let updatedSub: Subscription | null = null;
let deletedSub: Subscription | null = null;
const startSubscriptions = (map: ShallowReactive<Map<string, Project>>) => {
    if (createdSub || updatedSub || deletedSub) stopSubscriptions();
    createdSub = client.models.Project.onCreate({ selectionSet }).subscribe({
        next: (data) => map.set(data.id, data as Project),
        error: (error) => Bugsnag.notify(error),
    });
    updatedSub = client.models.Project.onUpdate({ selectionSet }).subscribe({
        next: (data) => map.set(data.id, data as Project),
        error: (error) => Bugsnag.notify(error),
    });
    deletedSub = client.models.Project.onDelete({ selectionSet }).subscribe({
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
    update,
    archive,
};
