<template>
    <q-dialog
        id="projectManagementDialog"
        ref="dialogRef"
        class="q-electron-drag--exception"
        persistent
        @hide="onDialogHide"
        :seamless="backdropVisible"
    >
        <q-card class="q-dialog-plugin projectManagement-Dialog column no-wrap">
            <dialog-header
                v-if="isEditing"
                class="col-auto"
                title="Update project"
                :subtitle="project?.name"
                :tooltip="project?.id"
            />
            <dialog-header v-else class="col-auto" title="Create new project" />
            <q-card-section class="q-mt-none col column scroll">
                <q-form
                    ref="projectForm"
                    class="col q-gutter-y-md"
                    greedy
                    no-error-focus
                    @submit.prevent=""
                >
                    <q-input
                        v-model="state.name"
                        filled
                        label="Project name"
                        :rules="[(val) => !!val || 'Field is required']"
                    />
                    <q-input
                        v-model="state.description"
                        filled
                        label="Description"
                        type="textarea"
                        :rules="[(val) => !!val || 'Field is required']"
                    />

                    <div class="col-auto dialog-messages">
                        {{ projectError }}
                    </div>
                </q-form>
            </q-card-section>
            <q-separator inset />
            <q-card-actions class="row">
                <template v-if="isEditing && project">
                    <n-btn
                        v-if="project.isArchived === 'false'"
                        label="Archive"
                        danger
                        :disable="working"
                        :loading="working"
                        @click="archiveProject"
                    />
                    <n-btn
                        v-else
                        label="Restore"
                        danger
                        :disable="working"
                        :loading="working"
                        @click="unArchiveProject"
                    />
                </template>
                <q-space />
                <n-btn v-close-popup label="Cancel" />

                <template v-if="isEditing && project">
                    <n-btn
                        v-if="hasModified"
                        label="Reset"
                        :disable="working"
                        @click="resetProject"
                    />
                    <n-btn
                        v-if="hasModified"
                        label="Update"
                        active
                        :disable="working || !formValid"
                        :loading="working"
                        @click="updateProject"
                    />
                </template>
                <n-btn
                    v-else
                    label="Create"
                    active
                    :disable="working || !formValid"
                    :loading="working"
                    @click="createProject"
                />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { clientDb } from 'client/services/database';
import type {
    Project,
    NewProject,
    UpdateProject,
} from 'client/services/database/projects';
import {
    computed,
    reactive,
    ref,
    watch,
    inject,
    onMounted,
    onUnmounted,
    getCurrentInstance,
} from 'vue';
import type { QForm } from 'quasar';
import { useDialogPluginComponent, useQuasar } from 'quasar';
import { logger } from 'cmn/lib/logger';
import { wait } from 'cmn/lib/tools';
import ProjectHelp from './ProjectHelp.vue';
import { useHelpStore } from 'cmn/stores/help';
const helpStore = useHelpStore();
const props = defineProps<{
    project: Project;
}>();
defineEmits([
    // REQUIRED; need to specify some events that your
    // component will emit through useDialogPluginComponent()
    ...useDialogPluginComponent.emits,
]);
const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();
const backdropVisible = inject<boolean>('backdropVisible');
const projectForm = ref<QForm | null>(null);
const formValid = ref(true);
const $q = useQuasar();
interface State {
    id: string;
    isArchived: string;
    name: string;
    description: string;
}
const state = reactive<State>({
    id: '',
    isArchived: 'false',
    name: '',
    description: '',
});
const isEditing = props.project !== undefined;
const projectError = ref('');
const working = ref(false);

const resetProject = () => {
    if (props.project) {
        state.isArchived = props.project.isArchived;
        state.name = props.project.name;
        state.id = props.project.id;
        state.description = props.project.description ?? '';
    }
};

const hasModified = computed(() => {
    if (!props.project) return false;

    return (
        state.id !== props.project.id ||
        state.isArchived !== props.project.isArchived ||
        state.name !== props.project.name ||
        state.description !== props.project.description
    );
});

const printErrorMessage = (error: unknown, defaultMessage: string) => {
    console.error(error);
    if (error instanceof Error) {
        const message = (error as { message: string }).message;

        projectError.value = message;

        return;
    }
    projectError.value = defaultMessage;
};

const verifyForm = async (newState: State) => {
    if (projectForm.value) {
        await wait(1); // Hack to make quasar update form elements
        const isValidated = await projectForm.value.validate();
        if (!isValidated) {
            throw new Error('Please correct the form before submitting');
        }
    }

    if (!newState.name) throw new Error('missing name');
    if (!newState.description) throw new Error('missing description');
    return true;
};

const createProject = async () => {
    projectError.value = '';
    working.value = true;

    try {
        await verifyForm(state);
        const newProject: NewProject = {
            isArchived: 'false',
            name: state.name.trim(),
            description: state.description.trim(),
        };
        await clientDb.project.add(newProject);

        onDialogOK();
    } catch (error: unknown) {
        printErrorMessage(error, 'Could not create project');
    } finally {
        working.value = false;
    }
};

const updateProject = async () => {
    projectError.value = '';
    working.value = true;

    if (!props.project) return;

    try {
        await verifyForm(state);
        const updatedProject: UpdateProject = {
            id: state.id,
            name: state.name.trim(),
            description: state.description.trim(),
        };

        await clientDb.project.update(updatedProject);
        onDialogOK();
    } catch (error: unknown) {
        printErrorMessage(error, 'Could not update project');
    } finally {
        working.value = false;
    }
};

const archiveProject = () => {
    $q.dialog({
        title: 'Confirm',
        message: 'Do you want to archive this project?',
        cancel: true,
        persistent: true,
        prompt: {
            model: '',
            label: 'Type ARCHIVE to confirm',
            type: 'text', // optional
        },
        ok: {
            label: 'Archive',
            color: 'negative',
        },
    })
        .onCancel(() => {
            return;
        })
        .onDismiss(() => {
            return;
        })

        .onOk(async (data: string) => {
            if (data !== 'ARCHIVE') return;
            projectError.value = '';
            working.value = true;
            try {
                if (!props.project) return;
                await clientDb.project.archive(props.project.id, true);
                logger.log($q, 'Project archived');
                onDialogOK();
            } catch (error: unknown) {
                printErrorMessage(error, 'Could not archive project');
            } finally {
                working.value = false;
            }
        });
};

const unArchiveProject = () => {
    $q.dialog({
        title: 'Confirm',
        message: 'Do you want to restore this project?',
        cancel: true,
        persistent: true,
        prompt: {
            model: '',
            label: 'Type RESTORE to confirm',
            type: 'text', // optional
        },
        ok: {
            label: 'Restore',
            color: 'negative',
        },
    })
        .onCancel(() => {
            return;
        })
        .onDismiss(() => {
            return;
        })

        .onOk(async (data: string) => {
            if (data !== 'RESTORE') return;

            projectError.value = '';
            working.value = true;
            try {
                if (!props.project) return;
                await clientDb.project.archive(props.project.id, false);
                logger.log($q, 'Project restored');
                onDialogOK();
            } catch (error: unknown) {
                printErrorMessage(error, 'Could not restore project');
            } finally {
                working.value = false;
            }
        });
};

watch(state, async () => {
    try {
        formValid.value = await verifyForm(state);
    } catch {
        formValid.value = false;
    }
});

onMounted(() => {
    try {
        if (isEditing) {
            resetProject();
        }

        const myName = getCurrentInstance()?.type.__name;

        if (myName)
            helpStore.addHelp({
                name: myName,
                type: 'dialog',
                helpPage: ProjectHelp,
            });
    } catch (e) {
        logger.error($q, 'Error occurred while mounting ProjectManagement:', e);
    }
});
onUnmounted(() => {
    const myName = getCurrentInstance()?.type.__name;
    if (myName) helpStore.removeHelp(myName);
});
</script>

<style lang="scss" scoped>
.projectManagement-Dialog {
    width: 500px;
    max-width: 95vw;
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

    .project-image {
        margin: 0;
        width: 75%;
        max-width: 200px;
    }
}
</style>
