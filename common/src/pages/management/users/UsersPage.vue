<template>
    <q-page
        :style-fn="fullHeight"
        class="column items-center justify-center animated-background"
    >
        <div class="text-bold q-mt-md">
            <q-table
                title="Organization users"
                :rows="userRows"
                :columns="userColumns"
                :pagination="pagination"
                row-key="id"
                virtual-scroll
                flat
                bordered
                class="user-table scroll-table"
                :loading="userIsLoading"
                @row-click="viewUser"
            >
                <template #top>
                    <q-input
                        v-model="filter"
                        label="Filter by name"
                        filled
                        dense
                        debounce="300"
                        color="primary"
                    >
                        <template #append>
                            <q-icon name="search" />
                        </template>
                    </q-input>
                    <q-space />
                    <n-btn active label="New user" @click="newUser" />
                </template>
                <template #body-cell-orgAdmin="props">
                    <q-td :props="props">
                        <div>
                            <q-icon :name="props.row.orgAdmin ? 'check' : ''" />
                        </div>
                    </q-td>
                </template>
                <template #body-cell-fleets="props">
                    <q-td :props="props">
                        <div>
                            <n-btn
                                dense
                                icon="groups"
                                @click.stop="editFleets(props.row)"
                            />
                        </div>
                    </q-td>
                </template>
                <template #bottom-row>
                    <div class="table-buttons row">
                        <q-checkbox
                            v-model="showArchived"
                            label="Show archived users"
                        />
                    </div>
                </template>
                <template #no-data>
                    <div
                        class="full-width row justify-end items-center q-gutter-sm"
                    >
                        <q-icon size="2em" name="warning" />
                        <span> No data! </span>
                    </div>
                </template>
            </q-table>
        </div>
    </q-page>
</template>

<script setup lang="ts">
import type { QTableProps } from 'quasar';
import { useQuasar } from 'quasar';
import { clientDb } from 'client/services/database';
import type { User } from 'client/services/database/users';
import type { Ref } from 'vue';
import {
    computed,
    ref,
    watch,
    onMounted,
    onUnmounted,
    getCurrentInstance,
} from 'vue';
import { fullHeight } from 'cmn/composable/helpers';
import EditUserFleetsDialog from 'cmn/dialogs/Management/userFleets/EditUserFleets.vue';
import UserManagement from 'cmn/dialogs/Management/user/UserManagement.vue';
import { logger } from 'cmn/lib/logger';
import UsersHelp from './UsersHelp.vue';
import { useHelpStore } from 'cmn/stores/help';

const helpStore = useHelpStore();

const $q = useQuasar();
//const router = useRouter();
const filter = ref('');
const showArchived = ref(false);
const archivedUsers = ref([]) as Ref<User[]>;
const userColumns: QTableProps['columns'] = [
    {
        name: 'name',
        label: 'Name',
        field: 'fullName',
        sortable: true,
        align: 'left',
    },
    {
        name: 'email',
        label: 'Email',
        field: 'email',
        sortable: true,
        align: 'left',
    },
    {
        name: 'phone',
        label: 'Phone',
        field: 'phone',
        sortable: true,
        align: 'left',
    },
    {
        name: 'orgAdmin',
        label: 'Admin',
        field: 'orgAdmin',
        sortable: true,
        align: 'center',
    },
    {
        name: 'fleets',
        label: 'Fleets',
        field: 'id',
        sortable: false,
        align: 'center',
    },
];
const pagination = {
    sortBy: 'name',
    descending: true,
    page: 1,
    rowsPerPage: 10,
};

const userIsLoading = clientDb.user.isLoading;

const showActiveUser = () => {
    const allRows = Array.from(clientDb.users.values());

    if (filter.value) {
        const searchValue = filter.value.toLowerCase();
        return allRows
            .filter((el) => el.fullName.toLowerCase().includes(searchValue))
            .sort((a, b) => b.fullName.localeCompare(a.fullName));
    } else {
        return allRows;
    }
};
const updateArchivedUsers = async () => {
    try {
        const allRows = await clientDb.user.getAll(true);

        if (filter.value) {
            const searchValue = filter.value.toLowerCase();
            archivedUsers.value = allRows
                .filter((el) => el.fullName.toLowerCase().includes(searchValue))
                .sort((a, b) => b.fullName.localeCompare(a.fullName));
        } else {
            archivedUsers.value = allRows;
        }
    } catch (e) {
        logger.error($q, 'Error fetching archived users', e);
    }
};

const userRows = computed(() => {
    if (showArchived.value) return archivedUsers.value;
    return showActiveUser();
});

const viewUser = (evt: Event, row: User) => {
    $q.dialog({
        component: UserManagement,
        componentProps: {
            user: row,
        },
    }).onOk(async () => {
        if (showArchived.value) {
            await updateArchivedUsers();
        }
    });
};
const newUser = () => {
    $q.dialog({
        component: UserManagement,
    }).onOk(async () => {
        if (showArchived.value) {
            await updateArchivedUsers();
        }
    });
};

const editFleets = (user: User) => {
    $q.dialog({
        component: EditUserFleetsDialog,
        componentProps: { user },
    });
};

watch(showArchived, async () => {
    if (showArchived.value) {
        await updateArchivedUsers();
    }
});

onMounted(() => {
    const myName = getCurrentInstance()?.type.__name;

    if (myName)
        helpStore.addHelp({ name: myName, type: 'page', helpPage: UsersHelp });
});
onUnmounted(() => {
    const myName = getCurrentInstance()?.type.__name;
    if (myName) helpStore.removeHelp(myName);
});
</script>

<style lang="scss">
.user-table {
    width: 800px;
    max-width: 80vw;
}
</style>
