<template>
    <q-page
        :style-fn="fullHeight"
        class="column items-center justify-center animated-background"
    >
        <div class="text-bold q-mt-md">
            <q-table
                title="Organization fleets"
                :rows="fleetRows"
                :columns="fleetColumns"
                :pagination="pagination"
                row-key="id"
                flat
                bordered
                virtual-scroll
                class="fleet-table scroll-table"
                :loading="fleetIsLoading"
                @row-click="viewFleet"
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
                    <n-btn active label="New fleet" @click="newFleet" />
                </template>
                <template #body-cell-users="props">
                    <q-td :props="props">
                        <div>
                            <n-btn
                                flat
                                dense
                                icon="groups"
                                @click.stop="editUsers(props.row)"
                            />
                        </div>
                    </q-td>
                </template>
                <template #body-cell-vehicles="props">
                    <q-td :props="props">
                        <div>
                            <n-btn
                                flat
                                dense
                                icon="flight_land"
                                @click.stop="editVehicles(props.row)"
                            />
                        </div>
                    </q-td>
                </template>

                <template #body-cell-projects="props">
                    <q-td :props="props">
                        <div>
                            <n-btn
                                flat
                                dense
                                icon="dashboard_customize"
                                @click.stop="editProjects(props.row)"
                            />
                        </div>
                    </q-td>
                </template>
            </q-table>
        </div>
    </q-page>
</template>

<script setup lang="ts">
import type { QTableProps } from 'quasar';
import { useQuasar } from 'quasar';
import { computed, ref, onMounted, onUnmounted, getCurrentInstance } from 'vue';
import { fullHeight } from 'cmn/composable/helpers';
import { db } from 'client/services/database';
import type { Fleet } from 'client/services/database/fleets';
import EditFleetProjectsDialog from 'cmn/dialogs/Management/fleetProjects/EditFleetProjects.vue';
import EditFleetUsersDialog from 'cmn/dialogs/Management/fleetUsers/EditFleetUsers.vue';
//import EditFleetVehiclesDialog from 'client/dialogs/Management/editFleetVehicles.vue';
import FleetManagement from 'cmn/dialogs/Management/fleet/FleetManagement.vue';
import FleetsHelp from './FleetsHelp.vue';
import { useHelpStore } from 'cmn/stores/help';
const helpStore = useHelpStore();

const $q = useQuasar();
const filter = ref('');

const fleetIsLoading = db.fleet.isLoading;

const fleetColumns: QTableProps['columns'] = [
    {
        name: 'name',
        label: 'Name',
        field: 'name',
        sortable: true,
        align: 'left',
    },
    {
        name: 'users',
        label: 'Users',
        field: 'id',
        sortable: false,
        align: 'center',
    },
    {
        name: 'vehicles',
        label: 'Vehicles',
        field: 'id',
        sortable: false,
        align: 'center',
    },

    {
        name: 'projects',
        label: 'Projects',
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
    // rowsNumber: xx if getting data from a server
};

const fleetRows = computed(() => {
    const allRows = Array.from(db.fleets.values());

    if (filter.value) {
        const searchValue = filter.value.toLowerCase();
        return allRows
            .filter((el) => el.name.toLowerCase().includes(searchValue))
            .sort((a, b) => b.name.localeCompare(a.name));
    } else {
        return allRows;
    }
});

const viewFleet = (evt: Event, row: Fleet) => {
    $q.dialog({
        component: FleetManagement,
        componentProps: {
            fleet: row,
        },
    });
};

const newFleet = () => {
    $q.dialog({
        component: FleetManagement,
    });
};

const editUsers = (fleet: Fleet) => {
    $q.dialog({
        component: EditFleetUsersDialog,
        componentProps: { fleet },
    });
};

const editVehicles = (fleet: Fleet) => {
    $q.dialog({
        // component: EditFleetVehiclesDialog,
        componentProps: { fleet },
    });
};

const editProjects = (fleet: Fleet) => {
    $q.dialog({
        component: EditFleetProjectsDialog,
        componentProps: { fleet },
    });
};
onMounted(() => {
    const myName = getCurrentInstance()?.type.__name;

    if (myName)
        helpStore.addHelp({ name: myName, type: 'page', helpPage: FleetsHelp });
});
onUnmounted(() => {
    const myName = getCurrentInstance()?.type.__name;
    if (myName) helpStore.removeHelp(myName);
});
</script>

<style lang="scss">
.fleet-table {
    width: 800px;
    max-width: 80vw;
}
</style>
