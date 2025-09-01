<template>
    <q-dialog
        id="editFleetProjectsDialog"
        ref="dialogRef"
        class="q-electron-drag--exception"
        persistent
        @hide="onDialogHide"
        :seamless="backdropVisible"
    >
        <q-card class="q-dialog-plugin editFleetProjects-Dialog column no-wrap">
            <dialog-header
                class="col-auto"
                title="Project memberships for fleet"
                :subtitle="fleet.name"
                :tooltip="fleet.id"
            />
            <q-card-section class="q-mt-none col column scroll">
                <q-table
                    :selected="selected"
                    flat
                    :rows="projects"
                    :columns="columns"
                    :loading="working"
                    row-key="id"
                    selection="multiple"
                    virtual-scroll
                    class="col scroll-table"
                    :rows-per-page-options="[0]"
                    :pagination="{
                        sortBy: 'name',
                        descending: false,
                        rowsPerPage: 0,
                    }"
                    @selection="updateFleetProjects"
                    hide-bottom
                    hide-selected-banner
                    hide-no-data
                    hide-pagination
                >
                    <template #header-selection> </template>
                    <template #body-selection="scope">
                        <q-checkbox
                            v-model="scope.selected"
                            :disable="working"
                        />
                    </template>
                </q-table>
            </q-card-section>
            <q-separator />
            <q-card-actions align="right">
                <n-btn v-close-popup label="Close" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { clientDb } from 'client/services/database';
import type { Project } from 'client/services/database/projects';
import type { Fleet } from 'client/services/database/fleets';
import {
    computed,
    ref,
    inject,
    onMounted,
    onUnmounted,
    getCurrentInstance,
} from 'vue';
import type { QTableProps } from 'quasar';
import { useDialogPluginComponent, useQuasar } from 'quasar';
import { logger } from 'cmn/lib/logger';
import FleetProjectHelp from './FleetProjectHelp.vue';
import { useHelpStore } from 'cmn/stores/help';

const helpStore = useHelpStore();
const props = defineProps<{
    fleet: Fleet;
}>();
defineEmits([
    // REQUIRED; need to specify some events that your
    // component will emit through useDialogPluginComponent()
    ...useDialogPluginComponent.emits,
]);
const { dialogRef, onDialogHide } = useDialogPluginComponent();
const backdropVisible = inject<boolean>('backdropVisible');
const $q = useQuasar();
const working = ref(false);

const columns: QTableProps['columns'] = [
    {
        name: 'name',
        align: 'left',
        label: 'Project name',
        field: 'name',
        sortable: true,
    },
];

const fleetProjects = computed(() => {
    return Array.from(clientDb.projectFleets.values()).filter(
        (el) => el.fleetId === props.fleet.id,
    );
});

const projects = computed(() => {
    return Array.from(clientDb.projects.values());
});

const selected = computed(() => {
    return Array.from(projects.value).filter((el) =>
        fleetProjects.value.some((pf) => pf.projectId === el.id),
    );
});

const updateFleetProjects = async (selection: {
    rows: readonly Project[];
    keys: readonly string[];
    added: boolean;
}) => {
    if (!props.fleet) return;
    if (!selection) return;
    const fleet = props.fleet;
    working.value = true;

    if (selection.added) {
        for (const project of selection.rows) {
            try {
                await clientDb.projectFleet.add({
                    fleetId: fleet.id,
                    projectId: project.id,
                });
            } catch (err) {
                logger.error($q, 'Could not add project to fleet', err);
            }
        }
    } else {
        for (const project of selection.rows) {
            try {
                const fleetProject = fleetProjects.value.find(
                    (el) => el.projectId === project.id,
                );
                if (fleetProject)
                    await clientDb.projectFleet.remove(fleetProject.id);
            } catch (err) {
                logger.error($q, 'Could not remove project from fleet', err);
            }
        }
    }

    working.value = false;
};

onMounted(() => {
    const myName = getCurrentInstance()?.type.__name;

    if (myName)
        helpStore.addHelp({
            name: myName,
            type: 'dialog',
            helpPage: FleetProjectHelp,
        });
});
onUnmounted(() => {
    const myName = getCurrentInstance()?.type.__name;
    if (myName) helpStore.removeHelp(myName);
});
</script>

<style lang="scss" scoped>
.editFleetProjects-Dialog {
    width: 500px;
    max-width: 95vw;
    height: 700px;
    max-height: 95vh;

    .dialog-messages {
        min-height: 50px;
        color: $negative;
        display: flex;
        justify-content: center;
        align-items: center;
        .dialog-help {
            color: $input-text-color !important;
        }
    }

    .profile-image {
        margin: 0;
        width: 75%;
        max-width: 200px;
    }
}
</style>
