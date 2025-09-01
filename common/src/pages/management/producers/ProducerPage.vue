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
import { db } from 'client/services/database';
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
import EditProducerFleetsDialog from 'cmn/dialogs/Management/producerFleets/EditProducerFleets.vue';
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

const producerIsLoading = db.producer.isLoading;

const showActiveProducer = () => {
    const allRows = Array.from(db.producers.values());

    if (filter.value) {
        const searchValue = filter.value.toLowerCase();
        return allRows
            .filter((el) => el.fullName.toLowerCase().includes(searchValue))
            .sort((a, b) => b.fullName.localeCompare(a.fullName));
    } else {
        return allRows;
    }
};
const updateArchivedProducers = async () => {
    try {
        const allRows = await db.producer.getAll(true);

        if (filter.value) {
            const searchValue = filter.value.toLowerCase();
            archivedProducers.value = allRows
                .filter((el) => el.fullName.toLowerCase().includes(searchValue))
                .sort((a, b) => b.fullName.localeCompare(a.fullName));
        } else {
            archivedProducers.value = allRows;
        }
    } catch (e) {
        logger.error($q, 'Error fetching archived producers', e);
    }
};

const producerRows = computed(() => {
    if (showArchived.value) return archivedProducers.value;
    return showActiveProducer();
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

const editFleets = (producer: Producer) => {
    $q.dialog({
        component: EditProducerFleetsDialog,
        componentProps: { producer },
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
