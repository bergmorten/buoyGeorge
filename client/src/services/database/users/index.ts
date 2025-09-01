import type { generateClient } from 'aws-amplify/data';
import { ref } from 'vue';
import { type Schema } from 'clientRoot/amplify/data/resource';
import type { Subscription } from 'rxjs';
import type { ShallowReactive } from 'vue';
import Bugsnag from '@bugsnag/js';

let client: ReturnType<typeof generateClient<Schema>>;
type Keys = keyof Schema['User']['type'];
export type User = Omit<
    Readonly<Schema['User']['type']>,
    'notificationSetting' | 'userData'
>;
export interface FullUser extends User {
    readonly notificationSetting: string | null;
    readonly userData: string | null;
}

export type NewUser = Schema['User']['createType'];
export type UpdateUser = Schema['User']['updateType'];

const selectionSet = [
    'id',
    'isArchived',
    'fullName',
    'email',
    'phone',
    'lastLogon',
    'orgAdmin',
    'avatar',
    'createdAt',
    'updatedAt',
] as const satisfies readonly Keys[];
const fullSet = [
    ...selectionSet,
    'resendInvite',
    'userData',
    'notificationSetting',
] as const satisfies readonly Keys[];

// type Options = Parameters<typeof client.models.User.list>[0];
const isLoading = ref(false);
const getAll = async (
    includeArchived = false,

    options?: Parameters<typeof client.models.User.list>[0],
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
                ? await client.models.User.list({
                      ...options,
                      selectionSet,
                      limit: 100,
                      nextToken: token,
                  })
                : await client.models.User.userByArchived(
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

        return users as User[];
    } finally {
        isLoading.value = false;
    }
};

const getFull = async (id: string) => {
    const { data: fullUser, errors } = await client.models.User.get(
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
    const { notificationSetting, userData } = fullUser;
    if (notificationSetting) {
        if (typeof notificationSetting !== 'object')
            throw new Error(
                `User with id ${id} has invalid notificationSetting`,
            );
    }
    if (userData) {
        if (typeof userData !== 'object')
            throw new Error(`User with id ${id} has invalid userData`);
    }
    return fullUser as FullUser;
};

const add = async (newUser: NewUser) => {
    const { errors, data: user } = await client.models.User.create(
        {
            ...newUser,
            avatar: newUser.avatar ?? null,
            userData: newUser.userData ?? null,
            notificationSetting: newUser.notificationSetting ?? null,
        },
        { selectionSet: fullSet },
    );
    if (errors) {
        throw new Error(
            `Failed to create user: ${errors.map((e) => e.message).join(', ')}`,
        );
    }
    return user;
};
const update = async (updateUser: UpdateUser) => {
    const { errors, data: user } = await client.models.User.update(updateUser, {
        selectionSet: fullSet,
    });
    if (errors) {
        throw new Error(
            `Failed to update user: ${errors.map((e) => e.message).join(', ')}`,
        );
    }
    return user;
};
const archive = async (id: string, archive: boolean) => {
    // In case we must add additional logic to clean up invisible users
    const { errors, data: user } = await client.models.User.update(
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
const startSubscriptions = (
    connection: ReturnType<typeof generateClient<Schema>>,
    map: ShallowReactive<Map<string, User>>,
) => {
    client = connection;
    if (createdSub || updatedSub || deletedSub) stopSubscriptions();
    createdSub = client.models.User.onCreate({ selectionSet }).subscribe({
        next: (data) => map.set(data.id, data as User),
        error: (error) => Bugsnag.notify(error),
    });
    updatedSub = client.models.User.onUpdate({ selectionSet }).subscribe({
        next: (data) => map.set(data.id, data as User),
        error: (error) => Bugsnag.notify(error),
    });
    deletedSub = client.models.User.onDelete({
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
    isLoading,
};
