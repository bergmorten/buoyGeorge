<template>
    <q-page
        :style-fn="fullHeight"
        class="column items-center justify-center animated-background"
    >
        <div class="text-bold q-mt-md">
            <q-table
                title="Organization members"
                :rows="clientRows"
                :columns="clientColumns"
                :pagination="pagination"
                row-key="id"
                virtual-scroll
                flat
                bordered
                class="client-table scroll-table"
                :loading="isLoading"
                @row-click="viewClient"
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
                    <n-btn active label="New client" @click="newClient" />
                </template>
                <template #body-cell-url="props">
                    <q-td :props="props">
                        <div>
                            <q-icon
                                v-if="props.row.url"
                                name="language"
                                @click.stop="openURL(props.row.url)"
                            />
                        </div>
                        <div class="my-table-details">
                            {{ props.row.details }}
                        </div>
                    </q-td>
                </template>
                <template #bottom-row>
                    <div class="table-buttons row">
                        <q-checkbox
                            v-model="showSandbox"
                            label="Show sandbox clients"
                            class="col-auto"
                        />
                        <q-checkbox
                            v-model="showArchived"
                            label="Show archived clients"
                            class="col-auto"
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
import { useQuasar, openURL } from 'quasar';
import { db } from 'admin/services/database';
import type { Client } from 'admin/services/database/client';
import type { Ref } from 'vue';
import { computed, ref, watch } from 'vue';
import { fullHeight } from 'cmn/composable/helpers';
import ClientManagement from 'admin/dialogs/Admin/ClientManagement.vue';
import { logger } from 'cmn/lib/logger';

const $q = useQuasar();
const filter = ref('');
const showArchived = ref(false);
const showSandbox = ref(true);
const archivedClients = ref([]) as Ref<Client[]>;
const clientColumns: QTableProps['columns'] = [
    {
        name: 'name',
        label: 'Name',
        field: 'name',
        sortable: true,
        align: 'left',
    },
    {
        name: 'appID',
        label: 'appID',
        field: 'appID',
        sortable: true,
        align: 'left',
    },
    {
        name: 'environment',
        label: 'Environment',
        field: 'environmentName',
        sortable: true,
        align: 'left',
    },
    {
        name: 'uiversion',
        label: 'UI',
        field: 'latestDeploymentVersion',
        sortable: true,
        align: 'left',
    },
    {
        name: 'deployed',
        label: 'Deployed',
        field: 'lastDeploymentTime',
        sortable: true,
        align: 'left',
        format: (val: string) => {
            if (!val) return 'N/A';
            return new Date(val).toLocaleDateString();
        },
    },
    {
        name: 'url',
        label: 'Url',
        field: 'Url',
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

const isLoading = db.client.isLoading;

const activeClients = () => {
    const allRows = Array.from(db.clients.values());

    if (filter.value) {
        const searchValue = filter.value.toLowerCase();
        return allRows
            .filter((el) => el.name.toLowerCase().includes(searchValue))
            .sort((a, b) => b.name.localeCompare(a.name));
    } else {
        return allRows;
    }
};
const updateArchivedClients = async () => {
    try {
        archivedClients.value = await db.client.getAll(true);
    } catch (e) {
        logger.error($q, 'Error fetching archived clients', e);
    }
};

const clientRows = computed(() => {
    const searchValue = filter.value.toLowerCase();
    const selected = (
        showArchived.value ? archivedClients.value : activeClients()
    ).filter((el) => {
        if (searchValue && !el.name.toLowerCase().includes(searchValue))
            return false;

        if (showSandbox.value) return true;
        return !el.isSandbox;
    });

    return selected;
});

const viewClient = (evt: Event, row: Client) => {
    $q.dialog({
        component: ClientManagement,
        componentProps: {
            client: row,
        },
    }).onOk(async () => {
        if (showArchived.value) {
            await updateArchivedClients();
        }
    });
};
const newClient = () => {
    $q.dialog({
        component: ClientManagement,
    }).onOk(async () => {
        if (showArchived.value) {
            await updateArchivedClients();
        }
    });
};

watch(showArchived, async () => {
    if (showArchived.value) {
        await updateArchivedClients();
    }
});
</script>

<style lang="scss">
.client-table {
    width: 800px;
    max-width: 80vw;
}
</style>
