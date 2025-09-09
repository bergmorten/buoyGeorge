<template>
    <q-page
        :style-fn="fullHeight"
        class="column items-center justify-center animated-background"
    >
        <q-card class="page-card deployment-table-card column">
            <q-table
                title="Deployments"
                :rows="deploymentsFiltered"
                :columns="deploymentsColumns"
                row-key="id"
                virtual-scroll
                :rows-per-page-options="[0]"
                :pagination="{
                    sortBy: 'updated',
                    descending: true,
                    rowsPerPage: 0,
                }"
                class="col deployment-table scroll-table"
                @row-click="(evt, row) => viewDeployment(row.id)"
            >
                <template #top>
                    <div class="fit row items-stretch q-gutter-x-sm">
                        <q-input
                            v-model="nameFilter"
                            label="Filter by name"
                            filled
                            debounce="300"
                            color="primary"
                            style="width: 180px"
                        >
                            <template #append>
                                <q-icon name="search" />
                            </template>
                        </q-input>
                        <q-space />
                        <q-select
                            filled
                            v-model="projects"
                            label="Filter Projects"
                            :options="projectFiltered"
                            option-label="name"
                            multiple
                            use-input
                            input-debounce="0"
                            @filter="filterProject"
                            clearable
                            class="select-btn"
                        >
                            <template #no-option>
                                <q-item>
                                    <q-item-section class="text-grey">
                                        No results
                                    </q-item-section>
                                </q-item>
                            </template>
                            <template
                                #option="{
                                    itemProps,
                                    opt,
                                    selected,
                                    toggleOption,
                                }"
                            >
                                <q-item v-bind="itemProps">
                                    <q-item-section>
                                        {{ opt.name }}
                                    </q-item-section>
                                    <q-item-section side>
                                        <q-toggle
                                            :model-value="selected"
                                            @update:model-value="
                                                toggleOption(opt)
                                            "
                                        />
                                    </q-item-section>
                                </q-item>
                            </template>
                        </q-select>
                        <q-select
                            filled
                            v-model="fleets"
                            label="Filter Fleets"
                            :options="fleetFiltered"
                            option-label="name"
                            multiple
                            use-input
                            input-debounce="0"
                            @filter="filterFleet"
                            clearable
                            class="select-btn"
                        >
                            <template #no-option>
                                <q-item>
                                    <q-item-section class="text-grey">
                                        No results
                                    </q-item-section>
                                </q-item>
                            </template>
                            <template
                                #option="{
                                    itemProps,
                                    opt,
                                    selected,
                                    toggleOption,
                                }"
                            >
                                <q-item v-bind="itemProps">
                                    <q-item-section>
                                        {{ opt.name }}
                                    </q-item-section>
                                    <q-item-section side>
                                        <q-toggle
                                            :model-value="selected"
                                            @update:model-value="
                                                toggleOption(opt)
                                            "
                                        />
                                    </q-item-section>
                                </q-item>
                            </template>
                        </q-select>
                        <q-select
                            v-model="deploymentStatus"
                            :options="deploymentStates"
                            clearable
                            filled
                            label="Status"
                            class="select-btn"
                        />
                    </div>
                </template>
            </q-table>
        </q-card>
    </q-page>
</template>

<script setup lang="ts">
import type { QTableProps } from 'quasar';
import { useQuasar } from 'quasar';
import { computed, ref, onMounted, getCurrentInstance, onUnmounted } from 'vue';
import { fullHeight } from 'cmn/composable/helpers';
import { clientDb } from 'client/services/database';
import type { Fleet } from 'client/services/database/fleets';
import type { Project } from 'client/services/database/projects';
import type { Deployment } from 'client/services/database/deployments';
import {
    type DeploymentState,
    deploymentStates,
} from 'client/services/database/deployments';
import TableHelp from './TableHelp.vue';
import { useHelpStore } from 'cmn/stores/help';
const helpStore = useHelpStore();

const deploymentsColumns: QTableProps['columns'] = [
    {
        name: 'name',
        label: 'Name',
        field: 'title',
        sortable: true,
        align: 'left',
        classes: 'text-ellipsis-auto',
    },
    {
        name: 'fleet',
        label: 'Fleet',
        field: 'fleetName',
        sortable: true,
        align: 'left',
        classes: 'text-ellipsis-200 gt-sm',
        headerClasses: 'gt-sm',
    },
    {
        name: 'project',
        label: 'Project',
        field: 'projectName',
        sortable: true,
        align: 'left',
        classes: 'text-ellipsis-100',
    },
    {
        name: 'state',
        label: 'State',
        field: 'state',
        sortable: true,
        align: 'center',
        classes: 'gt-xs',
        style: 'width: 100px',
        headerClasses: 'gt-xs',
    },
    {
        name: 'updated',
        label: 'Updated',
        field: 'updated',
        sortable: true,
        align: 'right',
        format: (val: Date) => val.toLocaleDateString(),
        style: 'width: 100px',
        classes: 'gt-sm',
        headerClasses: 'gt-sm',
    },
    {
        name: 'created',
        label: 'Created',
        field: 'created',
        sortable: true,
        align: 'right',
        format: (val: Date) => val.toLocaleDateString(),
        style: 'width: 100px',
        classes: 'gt-md',
        headerClasses: 'gt-md',
    },
];

const $q = useQuasar();
const allDeployments = clientDb.deploymentArray;
const allFleets = clientDb.fleetArray;
const allProjects = clientDb.projectArray;
const nameFilter = ref('');
const deploymentStatus = ref<DeploymentState | null>(null);
const fleets = ref<Fleet[] | null>(null);
const fleetNeedle = ref<string | null>(null);
const projects = ref<Project[] | null>(null);
const projectNeedle = ref<string | null>(null);

const filterFleet = (val: string, update: (callbackFn: () => void) => void) => {
    update(() => {
        fleetNeedle.value = val ? val.trim().toLowerCase() : null;
    });
};
const filterProject = (
    val: string,
    update: (callbackFn: () => void) => void,
) => {
    update(() => {
        projectNeedle.value = val ? val.trim().toLowerCase() : null;
    });
};

const deploymentMeta = (deployments: Deployment[]) => {
    return deployments.map((d) => ({
        title: d.title,
        created: new Date(d.createdAt),
        updated: new Date(d.updatedAt),
        state: d.state,
        fleetName: clientDb.fleets.get(d.fleetId)?.name ?? 'Unknown',
        projectName: clientDb.projects.get(d.projectId)?.name ?? 'Unknown',
    }));
};
const deploymentsFiltered = computed(() => {
    const name = nameFilter.value?.toLowerCase() ?? '';
    const pr = projects.value ?? [];
    const fl = fleets.value ?? [];
    const st = deploymentStatus.value;

    if (!name && pr.length < 1 && fl.length < 1 && !st) {
        return deploymentMeta(allDeployments.value);
    }
    const result = allDeployments.value.filter((p) => {
        if (name && !p.title.toLowerCase().includes(name)) return false;
        if (st && p.state !== st) return false;
        const inFleet =
            fl.length > 0 ? fl.some((f) => f.id === p.fleetId) : true;
        if (!inFleet) return false;

        const inProject =
            pr.length > 0 ? pr.some((proj) => proj.id === p.projectId) : true;
        return inProject;
    });

    return deploymentMeta(result);
});

const projectFiltered = computed(() => {
    let all = allProjects.value ?? [];
    const fl = fleets.value ?? [];
    if (fl.length > 0) {
        const pf = clientDb.projectFleetArray.value ?? [];
        all = all.filter((p) =>
            pf.some(
                (pf) =>
                    pf.projectId === p.id &&
                    fl.some((f) => f.id === pf.fleetId),
            ),
        );
    }

    if (!projectNeedle.value || projectNeedle.value.length < 1) {
        return all;
    }
    return all.filter((f) =>
        f.name.toLowerCase().startsWith(projectNeedle.value as string),
    );
});

const fleetFiltered = computed(() => {
    let all = allFleets.value ?? [];
    const pr = projects.value ?? [];
    if (pr.length > 0) {
        const pf = clientDb.projectFleetArray.value ?? [];
        all = all.filter((f) =>
            pf.some(
                (pf) =>
                    pf.fleetId === f.id &&
                    pr.some((p) => p.id === pf.projectId),
            ),
        );
    }
    if (!fleetNeedle.value || fleetNeedle.value.length < 1) {
        return all;
    }
    return all.filter((f) =>
        f.name.toLowerCase().startsWith(fleetNeedle.value as string),
    );
});
const viewDeployment = async (deploymentId: string) => {
    console.log('View deployment', deploymentId);
    $q.notify({
        message: 'Not yet implemented...',
        color: 'primary',
        position: 'center',
        timeout: 1000,
    });
};

onMounted(() => {
    const myName = getCurrentInstance()?.type.__name;

    if (myName)
        helpStore.addHelp({ name: myName, type: 'page', helpPage: TableHelp });
});
onUnmounted(() => {
    const myName = getCurrentInstance()?.type.__name;
    if (myName) helpStore.removeHelp(myName);
});
</script>
<style lang="scss" scoped>
.deployment-table-card {
    width: 1024px;
    max-width: 95vw;
    .deployment-table {
        width: 100%;
        max-width: 100%;

        .select-btn {
            min-width: 180px;
            max-width: 250px;
        }
    }
}
</style>
