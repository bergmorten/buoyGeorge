<template>
    <q-page
        :style-fn="fullHeight"
        class="column items-center justify-center animated-background"
    >
        <div class="text-bold q-mt-md">
            <q-table
                title="Organization projects"
                :rows="projectRows"
                :columns="projectColumns"
                :pagination="pagination"
                :loading="projectIsLoading"
                row-key="id"
                virtual-scroll
                flat
                bordered
                class="project-table scroll-table"
                @row-click="viewProject"
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
                    <n-btn active label="New project" @click="newProject" />
                </template>
                <template #body-cell-avatar="props">
                    <q-td :props="props">
                        <div>
                            <avataaar-image :config="props.row.avatarHash" />
                        </div>
                    </q-td>
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
                            <q-btn
                                flat
                                dense
                                icon="groups"
                                @click.stop="editFleets(props.row)"
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
import {
    computed,
    ref,
    watch,
    onMounted,
    onUnmounted,
    getCurrentInstance,
} from 'vue';
import { fullHeight } from 'cmn/composable/helpers';
import { db } from 'client/services/database';
import type { Project } from 'client/services/database/projects';
import type { Ref } from 'vue';
import AvataaarImage from 'cmn/components/Avataaars/avataaarImage.vue';
import EditProjectFleetsDialog from 'cmn/dialogs/Management/projectFleet/EditProjectFleets.vue';
import ProjectManagement from 'cmn/dialogs/Management/project/ProjectManagement.vue';
import { logger } from 'cmn/lib/logger';
import ProjectsHelp from './ProjectsHelp.vue';
import { useHelpStore } from 'cmn/stores/help';

const helpStore = useHelpStore();
const $q = useQuasar();
const filter = ref('');
const showArchived = ref(false);
const archivedProjects = ref([]) as Ref<Project[]>;
const projectColumns: QTableProps['columns'] = [
    {
        name: 'name',
        label: 'Name',
        field: 'name',
        sortable: true,
        align: 'left',
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

const projectIsLoading = db.project.isLoading;

const showActiveProjects = () => {
    const allRows = Array.from(db.projects.values());

    if (filter.value) {
        const searchValue = filter.value.toLowerCase();
        return allRows
            .filter((el) => el.name.toLowerCase().includes(searchValue))
            .sort((a, b) => b.name.localeCompare(a.name));
    } else {
        return allRows;
    }
};

const updateArchivedProjects = async () => {
    try {
        const allRows = await db.project.getAll(true);

        if (filter.value) {
            const searchValue = filter.value.toLowerCase();
            archivedProjects.value = allRows
                .filter((el) => el.name.toLowerCase().includes(searchValue))
                .sort((a, b) => b.name.localeCompare(a.name));
        } else {
            archivedProjects.value = allRows;
        }
    } catch (e) {
        logger.error($q, 'Error fetching archived projects', e);
    }
};
const projectRows = computed(() => {
    if (showArchived.value) return archivedProjects.value;
    return showActiveProjects();
});

const viewProject = (evt: Event, row: Project) => {
    $q.dialog({
        component: ProjectManagement,
        componentProps: {
            project: row,
        },
    }).onOk(async () => {
        if (showArchived.value) {
            await updateArchivedProjects();
        }
    });
};
const newProject = () => {
    $q.dialog({
        component: ProjectManagement,
    }).onOk(async () => {
        if (showArchived.value) {
            await updateArchivedProjects();
        }
    });
};
const editFleets = (project: Project) => {
    $q.dialog({
        component: EditProjectFleetsDialog,
        componentProps: { project },
    });
};
watch(showArchived, async () => {
    if (showArchived.value) {
        await updateArchivedProjects();
    }
});
onMounted(() => {
    const myName = getCurrentInstance()?.type.__name;

    if (myName)
        helpStore.addHelp({
            name: myName,
            type: 'page',
            helpPage: ProjectsHelp,
        });
});
onUnmounted(() => {
    const myName = getCurrentInstance()?.type.__name;
    if (myName) helpStore.removeHelp(myName);
});
</script>

<style lang="scss">
.project-table {
    width: 800px;
    max-width: 80vw;
}
</style>
