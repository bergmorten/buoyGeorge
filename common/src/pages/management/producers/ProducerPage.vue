<template>
    <q-page
        :style-fn="fullHeight"
        class="column items-center justify-center animated-background"
    >
        <div class="text-bold q-mt-md">
            <q-table
                title="Organization producers"
                :rows="producerRows"
                :columns="producerColumns"
                :pagination="pagination"
                row-key="id"
                virtual-scroll
                flat
                bordered
                class="producer-table scroll-table"
                :loading="producerIsLoading"
                @row-click="viewProducer"
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
                    <n-btn active label="New producer" @click="newProducer" />
                </template>

                <template #bottom-row>
                    <div class="table-buttons row">
                        <q-checkbox
                            v-model="showArchived"
                            label="Show archived producers"
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
import type { Producer } from 'client/services/database/producers';
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
import ProducerManagement from 'cmn/dialogs/Management/producer/ProducerManagement.vue';
import { logger } from 'cmn/lib/logger';
import ProducersHelp from './ProducerHelp.vue';
import { useHelpStore } from 'cmn/stores/help';

const helpStore = useHelpStore();

const $q = useQuasar();
//const router = useRouter();
const filter = ref('');
const showArchived = ref(false);
const archivedProducers = ref([]) as Ref<Producer[]>;
const producerColumns: QTableProps['columns'] = [
    {
        name: 'name',
        label: 'Name',
        field: 'fullName',
        sortable: true,
        align: 'left',
    },
    {
        name: 'fleet',
        label: 'Fleet',
        field: 'fleet',
        sortable: true,
        align: 'left',
    },
];
const pagination = {
    sortBy: 'name',
    descending: true,
    page: 1,
    rowsPerPage: 10,
};

const producerIsLoading = clientDb.producer.isLoading;

const showActiveProducer = () => {
    const allRows = clientDb.producerArray.value;

    return allRows;
};
const updateArchivedProducers = async () => {
    try {
        const allRows = await clientDb.producer.getAll(true);

        return allRows;
    } catch (e) {
        logger.error($q, 'Error fetching archived producers', e);
    }
};

const producerRows = computed(() => {
    let rows: (Producer & { fleet?: string })[] = [];
    if (showArchived.value) rows = archivedProducers.value;
    else rows = showActiveProducer();

    if (filter.value) {
        const searchValue = filter.value.toLowerCase();
        rows = rows
            .filter((el) => el.name.toLowerCase().includes(searchValue))
            .sort((a, b) => b.name.localeCompare(a.name));
    }
    rows.map((r) => {
        const fleet = r.fleetId ? clientDb.fleets.get(r.fleetId) : undefined;
        if (fleet) r.fleet = fleet.name;
        else r.fleet = 'Not set';
    });

    return rows;
});

const viewProducer = (evt: Event, row: Producer) => {
    $q.dialog({
        component: ProducerManagement,
        componentProps: {
            producer: row,
        },
    }).onOk(async () => {
        if (showArchived.value) {
            await updateArchivedProducers();
        }
    });
};
const newProducer = () => {
    $q.dialog({
        component: ProducerManagement,
    }).onOk(async () => {
        if (showArchived.value) {
            await updateArchivedProducers();
        }
    });
};

watch(showArchived, async () => {
    if (showArchived.value) {
        await updateArchivedProducers();
    }
});

onMounted(() => {
    const myName = getCurrentInstance()?.type.__name;

    if (myName)
        helpStore.addHelp({
            name: myName,
            type: 'page',
            helpPage: ProducersHelp,
        });
});
onUnmounted(() => {
    const myName = getCurrentInstance()?.type.__name;
    if (myName) helpStore.removeHelp(myName);
});
</script>

<style lang="scss">
.producer-table {
    width: 800px;
    max-width: 80vw;
}
</style>
