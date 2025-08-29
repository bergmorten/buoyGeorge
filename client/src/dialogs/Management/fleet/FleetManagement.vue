<template>
    <q-dialog
        id="ManageFleetDialog"
        ref="dialogRef"
        class="q-electron-drag--exception"
        persistent
        @hide="onDialogHide"
        :seamless="backdropVisible"
    >
        <q-card class="q-dialog-plugin newFleet-Dialog column no-wrap">
            <dialog-header
                v-if="isEditing"
                class="col-auto"
                title="Update fleet"
                :subtitle="fleet?.name"
                :tooltip="fleet?.id"
            />
            <dialog-header v-else class="col-auto" title="Create new fleet" />
            <q-card-section class="col q-mt-none scroll">
                <q-form
                    ref="fleetForm"
                    class="q-gutter-y-md"
                    greedy
                    no-error-focus
                    @submit.prevent=""
                >
                    <q-input
                        v-model="state.name"
                        filled
                        label="Fleet name"
                        :rules="[(val) => !!val || 'Field is required']"
                    />
                    <q-input
                        v-model="state.description"
                        filled
                        label="Description"
                        type="textarea"
                        style="min-height: 50px"
                        :rules="[(val) => !!val || 'Field is required']"
                    />

                    <div class="dialog-messages">
                        {{ fleetError }}
                    </div>
                </q-form>
            </q-card-section>
            <q-separator />
            <q-card-actions class="row">
                <template v-if="isEditing && fleet">
                    <n-btn
                        v-if="fleet.isArchived === 'false'"
                        label="Archive"
                        danger
                        :disable="working"
                        :loading="working"
                        @click="archiveFleet"
                    />
                    <n-btn
                        v-else
                        label="Restore"
                        danger
                        :disable="working"
                        :loading="working"
                        @click="unArchiveFleet"
                    />
                </template>
                <q-space />
                <n-btn v-close-popup label="Cancel" />
                <template v-if="isEditing && fleet">
                    <n-btn
                        v-if="hasModified"
                        label="Reset"
                        :disable="working"
                        @click="resetFleet"
                    />

                    <n-btn
                        v-if="hasModified"
                        label="Update"
                        active
                        :disable="working || !formValid"
                        :loading="working"
                        @click="updateFleet"
                    />
                </template>
                <n-btn
                    v-else
                    label="Create"
                    active
                    :disable="working || !formValid"
                    :loading="working"
                    @click="createFleet"
                />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import {
    computed,
    watch,
    reactive,
    ref,
    getCurrentInstance,
    onMounted,
    onUnmounted,
    inject,
} from 'vue';
import type { QForm } from 'quasar';
import { useDialogPluginComponent, useQuasar } from 'quasar';
import { logger } from 'cmn/lib/logger';
import { db } from 'client/services/database';
import type {
    Fleet,
    NewFleet,
    UpdateFleet,
} from 'client/services/database/fleets';
import { wait } from 'cmn/lib/tools';
import FleetHelp from './FleetHelp.vue';
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

const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();
const backdropVisible = inject<boolean>('backdropVisible');
const fleetForm = ref<QForm | null>(null);
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
const isEditing = props.fleet !== undefined;
const fleetError = ref('');
const working = ref(false);
const formValid = ref(true);
const resetFleet = () => {
    if (props.fleet) {
        state.name = props.fleet.name;
        state.id = props.fleet.id;
        state.description = props.fleet.description ?? '';
    }
};
const hasModified = computed(() => {
    if (!props.fleet) return false;

    return (
        state.id !== props.fleet.id ||
        state.isArchived !== props.fleet.isArchived ||
        state.name !== props.fleet.name ||
        state.description !== props.fleet.description
    );
});

const printErrorMessage = (error: unknown, defaultMessage: string) => {
    console.error(error);
    if (error instanceof Error) {
        const message = (error as { message: string }).message;

        fleetError.value = message;

        return;
    }
    fleetError.value = defaultMessage;
};

const verifyForm = async (newState: State) => {
    if (fleetForm.value) {
        await wait(1); // Hack to make quasar update form elements
        const isValidated = await fleetForm.value.validate();
        if (!isValidated) {
            throw new Error('Please correct the form before submitting');
        }
    }

    if (!newState.name) throw new Error('missing name');
    if (!newState.description) throw new Error('missing description');
    return true;
};

const createFleet = async () => {
    fleetError.value = '';
    working.value = true;

    try {
        await verifyForm(state);
        const newFleet: NewFleet = {
            isArchived: 'false',
            name: state.name,
            description: state.description,
        };
        const fleet = await db.fleet.add(newFleet);
        if (!fleet) throw new Error('Could not create fleet');
        onDialogOK();
    } catch (error: unknown) {
        printErrorMessage(error, 'Could not create fleet');
    } finally {
        working.value = false;
    }
};

const updateFleet = async () => {
    fleetError.value = '';
    working.value = true;

    if (!isEditing) return;

    try {
        await verifyForm(state);

        const updatedFleet: UpdateFleet = {
            id: state.id,
            name: state.name.trim(),
            description: state.description.trim(),
        };

        await db.fleet.update(updatedFleet);
        onDialogOK();
    } catch (error: unknown) {
        printErrorMessage(error, 'Could not update fleet');
    } finally {
        working.value = false;
    }
};

const archiveFleet = () => {
    if (!navigator.onLine) {
        fleetError.value = 'You must be online to archive';
        return;
    }

    $q.dialog({
        title: 'Confirm',
        message: 'Do you want to archive this fleet?',
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
            fleetError.value = '';
            working.value = true;
            try {
                if (!props.fleet) return;
                await db.fleet.archive(props.fleet.id, true);

                logger.log($q, 'Fleet archived');
                onDialogOK();
            } catch (error: unknown) {
                printErrorMessage(error, 'Could not archive fleet');
            } finally {
                working.value = false;
            }
        });
};

const unArchiveFleet = () => {
    $q.dialog({
        title: 'Confirm',
        message: 'Do you want to restore this fleet?',
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

            fleetError.value = '';
            working.value = true;
            try {
                if (!props.fleet) return;
                await db.fleet.archive(props.fleet.id, false);
                logger.log($q, 'Fleet restored');
                onDialogOK();
            } catch (error: unknown) {
                printErrorMessage(error, 'Could not restore fleet');
            } finally {
                working.value = false;
            }
        });
};

if (isEditing) {
    resetFleet();
}

watch(state, async () => {
    try {
        formValid.value = await verifyForm(state);
    } catch {
        formValid.value = false;
    }
});

onMounted(() => {
    const myName = getCurrentInstance()?.type.__name;

    if (myName)
        helpStore.addHelp({
            name: myName,
            type: 'dialog',
            helpPage: FleetHelp,
        });
});
onUnmounted(() => {
    const myName = getCurrentInstance()?.type.__name;
    if (myName) helpStore.removeHelp(myName);
});
</script>

<style lang="scss" scoped>
.newFleet-Dialog {
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

    .fleet-image {
        margin: 0;
        width: 75%;
        max-width: 200px;
        max-height: 25vh;
    }
}
</style>
