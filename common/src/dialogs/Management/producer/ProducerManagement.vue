<template>
    <q-dialog
        id="ProducerManagementDialog"
        ref="dialogRef"
        class="q-electron-drag--exception"
        persistent
        @hide="onDialogHide"
        :seamless="backdropVisible"
    >
        <q-card
            class="q-dialog-plugin ProducerManagement-Dialog column no-wrap"
        >
            <div class="col column no-wrap scroll">
                <div class="col-auto column justify-center items-center">
                    <template v-if="isEditing">
                        <div class="text-caption q-mt-sm">
                            Id: {{ state.id }}
                        </div>
                        <div class="text-caption q-mt-none">
                            Last seen: {{ state.lastSeen ?? 'Never' }}
                        </div>
                    </template>
                </div>
                <q-card-section class="col q-mt-none">
                    <q-form
                        ref="producerForm"
                        class="q-gutter-y-md"
                        greedy
                        no-error-focus
                        @submit.prevent=""
                    >
                        <div v-if="!isEditing" class="text-center text-h6">
                            Create new producer
                        </div>
                        <q-input
                            v-model="state.name"
                            filled
                            label="Producer Name"
                        />
                        <q-select
                            v-model="state.type"
                            :options="producerTypes"
                            filled
                            label="Producer Type"
                            clearable
                            :disable="!isSuperAdmin"
                        />
                        <q-select
                            v-model="state.fleetId"
                            :options="fleets"
                            map-options
                            emit-value
                            option-value="id"
                            option-label="name"
                            filled
                            label="Fleet"
                            clearable
                        />

                        <div class="dialog-messages">
                            {{ producerError }}
                        </div>
                    </q-form>
                </q-card-section>
            </div>
            <q-separator />
            <q-card-actions class="row">
                <template v-if="isEditing && producer">
                    <n-btn
                        v-if="producer.isArchived === 'false'"
                        label="Archive"
                        danger
                        :disable="working"
                        :loading="working"
                        @click="archiveProducer"
                    />
                    <n-btn
                        v-else
                        label="Restore"
                        danger
                        :disable="working"
                        :loading="working"
                        @click="unArchiveProducer"
                    />
                </template>
                <q-space />
                <n-btn v-close-popup label="Cancel" />
                <template v-if="isEditing && producer">
                    <n-btn
                        v-if="hasModified"
                        label="Reset"
                        :disable="working"
                        @click="resetProducer"
                    />
                    <n-btn
                        v-if="hasModified"
                        active
                        label="Update"
                        :disable="working || !formValid"
                        :loading="working"
                        @click="updateProducer"
                    />
                </template>
                <n-btn
                    v-else-if="isSuperAdmin"
                    dense
                    label="Create"
                    active
                    :disable="working || !formValid"
                    :loading="working"
                    @click="createProducer"
                />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
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
import { clientDb } from 'client/services/database';
import type {
    Producer,
    NewProducer,
    UpdateProducer,
} from 'client/services/database/producers';
import {
    ProducerType,
    producerTypes,
} from 'client/services/database/producers';
import { wait } from 'cmn/lib/tools';
import ProducerHelp from './ProducerHelp.vue';
import { useHelpStore } from 'cmn/stores/help';
import { useCognitoUserStore } from 'cmn/stores/cognitoUser';
import { storeToRefs } from 'pinia';

const helpStore = useHelpStore();
const props = defineProps<{
    producer: Producer;
}>();
defineEmits([
    // REQUIRED; need to specify some events that your
    // component will emit through useDialogPluginComponent()
    ...useDialogPluginComponent.emits,
]);
const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();
const cognitoUserStore = useCognitoUserStore();
const { isSuperAdmin } = storeToRefs(cognitoUserStore);
const backdropVisible = inject<boolean>('backdropVisible');
const producerForm = ref<QForm | null>(null);
const formValid = ref(true);
const $q = useQuasar();
interface State {
    id: string;
    isArchived: string;
    name: string;
    fleetId: string | null;
    type: ProducerType;
    manifest: Record<string, unknown>;
    lastSeen: Date | null;
}
const state = reactive<State>({
    id: '',
    isArchived: 'false',
    name: '',
    fleetId: null,
    type: ProducerType.GEORGE,
    lastSeen: null as Date | null,
    manifest: {},
});
const isEditing = props.producer !== undefined;
const fleets = clientDb.fleetArray;

const resetProducer = async () => {
    if (props.producer) {
        const fullProducer = await clientDb.producer.getFull(props.producer.id);
        state.id = fullProducer.id;
        state.isArchived = fullProducer.isArchived;
        state.name = fullProducer.name;
        state.fleetId = fullProducer.fleetId ?? null;
        state.type = fullProducer.type;

        state.lastSeen = props.producer.lastSeen
            ? new Date(props.producer.lastSeen)
            : null;

        try {
            state.manifest = fullProducer.manifest
                ? JSON.parse(fullProducer.manifest)
                : {};
        } catch (error) {
            state.manifest = {};
            console.error('Failed to parse manifest:', error);
        }
    }
};

const hasModified = computed(() => {
    if (!props.producer) return false;
    return (
        state.id !== props.producer.id ||
        state.isArchived !== props.producer.isArchived ||
        state.name !== props.producer.name ||
        state.fleetId !== props.producer.fleetId ||
        state.type !== props.producer.type
    );
});

const producerError = ref('');
const working = ref(false);

const printErrorMessage = (error: unknown, defaultMessage: string) => {
    console.error(error);
    if (error instanceof Error) {
        const message = error.message;
        producerError.value = message;

        return;
    }
    producerError.value = defaultMessage;
};

const verifyForm = async (newState: State) => {
    if (producerForm.value) {
        await wait(1); // Hack to make quasar update form elements
        const isValidated = await producerForm.value.validate();
        if (!isValidated) {
            throw new Error('Please correct the form before submitting');
        }
    }

    if (!newState.name) throw new Error('missing name');

    return true;
};

const createProducer = async () => {
    producerError.value = '';
    working.value = true;

    try {
        if (!isSuperAdmin)
            throw new Error('Only super admins can create producers');
        await verifyForm(state);
        const newProducer: NewProducer = {
            name: state.name.trim(),
            fleetId: state.fleetId,
            type: state.type,
            state: 'HALTED',
            isArchived: 'false',
        };

        await clientDb.producer.add(newProducer);
        onDialogOK();
    } catch (error: unknown) {
        printErrorMessage(error, 'Could not create producer');
    } finally {
        working.value = false;
    }
};

const updateProducer = async () => {
    producerError.value = '';
    working.value = true;

    if (!props.producer) return;

    try {
        await verifyForm(state);

        const updatedProducer: UpdateProducer = {
            id: state.id,
            name: state.name.trim(),
            fleetId: state.fleetId,
        };

        if (isSuperAdmin.value) {
            updatedProducer.type = state.type;
        }

        await clientDb.producer.update(updatedProducer);
        onDialogOK();
    } catch (error: unknown) {
        printErrorMessage(error, 'Could not update producer');
    } finally {
        working.value = false;
    }
};

const archiveProducer = () => {
    $q.dialog({
        title: 'Confirm',
        message: 'Do you want to archive this producer?',
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

            producerError.value = '';
            working.value = true;
            try {
                if (!props.producer) return;
                await clientDb.producer.archive(props.producer.id, true);
                logger.log($q, 'Producer archived');
                onDialogOK();
            } catch (error: unknown) {
                printErrorMessage(error, 'Could not archive producer');
            } finally {
                working.value = false;
            }
        });
};
const unArchiveProducer = () => {
    $q.dialog({
        title: 'Confirm',
        message: 'Do you want to restore this producer?',
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

            producerError.value = '';
            working.value = true;
            try {
                if (!props.producer) return;
                await clientDb.producer.archive(props.producer.id, false);
                logger.log($q, 'Producer archived');
                onDialogOK();
            } catch (error: unknown) {
                printErrorMessage(error, 'Could not archive producer');
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
            resetProducer();
        }

        const myName = getCurrentInstance()?.type.__name;

        if (myName)
            helpStore.addHelp({
                name: myName,
                type: 'dialog',
                helpPage: ProducerHelp,
            });
    } catch (e) {
        logger.error(
            $q,
            'Error occurred while mounting ProducerManagement:',
            e,
        );
    }
});
onUnmounted(() => {
    const myName = getCurrentInstance()?.type.__name;
    if (myName) helpStore.removeHelp(myName);
});
</script>

<style lang="scss" scoped>
.ProducerManagement-Dialog {
    width: 520px;
    max-width: 95vw;
    max-height: 95vh;

    .dialog-messages {
        min-height: 50px;
        color: $negative;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .profile-image {
        position: relative;
        margin: 0;
        width: 75%;
        max-width: 200px;

        .avatar-image {
            margin: auto;
        }

        .edit-image {
            position: absolute;
            bottom: 0;
            width: 100%;
            background-color: $dimmed-background;
            padding: 5px 0 5px 0;
            color: var(--element-active-inverted-color);
        }
    }
}
</style>
