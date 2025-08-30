<template>
    <q-dialog
        id="ClientManagementDialog"
        ref="dialogRef"
        class="q-electron-drag--exception"
        persistent
        @hide="onDialogHide"
    >
        <q-card class="q-dialog-plugin ClientManagement-Dialog column no-wrap">
            <dialog-header class="row">
                <div v-if="isEditing">
                    <div class="text-bold">
                        Update client id: {{ client.id }}
                        <q-icon
                            size="16px"
                            name="content_copy"
                            class="q-ml-md"
                            @click="copy('id')"
                        />
                    </div>
                </div>
                <div v-else class="text-center text-h6">Create new client</div>
            </dialog-header>
            <q-card-section class="q-mt-none q-pt-none">
                <q-form ref="clientForm">
                    <div class="row q-mt-md">
                        <div
                            class="col column q-gutter-y-xs"
                            style="max-width: 400px"
                        >
                            <div class="row">
                                <div class="text-h6">Configurable data</div>
                            </div>
                            <q-input
                                v-model="state.name"
                                dense
                                outlined
                                label="Short name"
                                hint="This is the name that will be displayed in the client list. Full company name is specified later"
                                :rules="[(val) => !!val || 'Field is required']"
                                class="q-mb-lg"
                            />
                            <q-input
                                v-model="state.url"
                                dense
                                outlined
                                label="Application url"
                                :rules="[
                                    (val: string | undefined) =>
                                        val ? isUrlValid(val) : true,
                                ]"
                                lazy-rules
                            />
                            <q-input
                                v-model="state.amplifyWebhook"
                                dense
                                outlined
                                label="Amplify Build Webhook url"
                                :rules="[
                                    (value?: string) => {
                                        if (!value) return true;
                                        return isUrlValid(value);
                                    },
                                ]"
                                lazy-rules
                            />

                            <q-checkbox
                                v-model="state.iridiumBanned"
                                dense
                                outlined
                                label="Client banned from using Iridium"
                                :rules="[
                                    (val: boolean) =>
                                        !!val || 'Field is required',
                                ]"
                            />
                            <q-checkbox
                                v-model="state.tcpBanned"
                                dense
                                outlined
                                label="Client banned from using TCP"
                                :rules="[
                                    (val: boolean) =>
                                        !!val || 'Field is required',
                                ]"
                            />
                        </div>
                        <div
                            v-if="client"
                            class="col column q-gutter-y-xs q-pl-md"
                        >
                            <div class="row">
                                <div class="text-h6">
                                    Deployment information
                                </div>
                            </div>
                            <div class="row">
                                <div class="text-bold q-mr-md">Region:</div>
                                <div>{{ client.appRegion }}</div>
                            </div>
                            <div class="row">
                                <div class="text-bold q-mr-md">App id:</div>
                                <div>
                                    {{ client.appId }}
                                    <q-icon
                                        size="16px"
                                        name="content_copy"
                                        class="q-ml-md"
                                        @click="copy('appId')"
                                    />
                                </div>
                            </div>
                            <div class="row">
                                <div class="text-bold q-mr-md">
                                    App Sync Url:
                                </div>
                                <div>
                                    {{ client.appSyncUrl }}
                                    <q-icon
                                        size="16px"
                                        name="content_copy"
                                        class="q-ml-md"
                                        @click="copy('appSyncUrl')"
                                    />
                                </div>
                            </div>

                            <div class="row">
                                <div class="text-bold q-mr-md">App env:</div>
                                <div>{{ client.environmentName }}</div>
                            </div>
                            <div class="row">
                                <div class="text-bold col-12">
                                    Iridium queue:
                                    <q-icon
                                        size="16px"
                                        name="content_copy"
                                        class="q-ml-md"
                                        @click="copy('iridiumQueueUrl')"
                                    />
                                </div>
                                <div>
                                    {{ client.iridiumQueueUrl }}
                                    <q-tooltip>{{
                                        client.iridiumQueueArn
                                    }}</q-tooltip>
                                </div>
                            </div>
                            <div class="row">
                                <div class="text-bold col-12">
                                    Socket queue:
                                    <q-icon
                                        size="16px"
                                        name="content_copy"
                                        class="q-ml-md"
                                        @click="copy('socketQueueUrl')"
                                    />
                                </div>
                                <div>
                                    {{ client.socketQueueUrl }}
                                    <q-tooltip>{{
                                        client.socketQueueArn
                                    }}</q-tooltip>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-12 text-bold">
                                    Configuration:
                                    <q-icon
                                        size="16px"
                                        name="content_copy"
                                        class="q-ml-md"
                                        @click="copy('config')"
                                    />
                                </div>
                                <q-scroll-area
                                    class="col-12"
                                    style="height: 48px"
                                >
                                    {{ client.amplifyOutput }}
                                </q-scroll-area>
                            </div>
                            <div class="row">
                                <div class="text-bold q-mr-md">
                                    Last deployed version:
                                </div>
                                <div>
                                    {{ client.latestDeploymentVersion }}
                                </div>
                            </div>
                            <div class="row">
                                <div class="text-bold q-mr-md">
                                    Required UI version:
                                </div>
                                <div>
                                    {{ client.minimumUiVersion }}
                                </div>
                            </div>
                            <div class="row">
                                <div class="text-bold q-mr-md">
                                    UI deployed:
                                </div>
                                <div>
                                    {{
                                        client.lastDeploymentTime
                                            ? new Date(
                                                  client.lastDeploymentTime,
                                              ).toLocaleString()
                                            : 'Not deployed'
                                    }}
                                </div>
                            </div>
                        </div>
                    </div>
                </q-form>
                <div v-if="clientError" class="dialog-messages q-ma-md q-pa-sm">
                    {{ clientError }}
                </div>
            </q-card-section>
            <q-separator inset />
            <q-card-actions>
                <template v-if="isEditing">
                    <n-btn
                        v-if="client.isArchived === 'false'"
                        label="Archive"
                        color="warning"
                        :disable="working"
                        @click="archiveClient"
                    />
                    <n-btn
                        v-else
                        label="Restore"
                        danger
                        :disable="working"
                        :loading="working"
                        @click="unArchiveClient"
                    />
                </template>
                <n-btn
                    v-if="canUpgrade"
                    :label="`Deploy new version ${version2String(latestVersion)}`"
                    active
                    :disable="working"
                    @click="upgradeClient"
                />
                <q-space />
                <n-btn v-close-popup label="Cancel" flat />
                <n-btn
                    v-if="isEditing && hasModified"
                    label="Reset"
                    flat
                    :disable="working"
                    @click="resetClient"
                />
                <template v-if="isEditing">
                    <n-btn
                        v-if="hasModified"
                        label="Update"
                        active
                        :disable="working || !formValid || !hasModified"
                        :loading="working"
                        @click="updateClient"
                    />
                </template>
                <n-btn
                    v-else
                    label="Create"
                    active
                    :disable="working"
                    :loading="working"
                    @click="createClient"
                />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import type { QForm } from 'quasar';
import { useDialogPluginComponent, useQuasar, copyToClipboard } from 'quasar';
import { logger } from 'cmn/lib/logger';
import { db } from 'admin/services/database';
import type { Client, UpdateClient } from 'admin/services/database/client';
import { wait } from 'cmn/lib/tools';
import {
    type ClientVersion,
    parseAmplifyVersion,
    version2String,
} from 'cmn/lib/version';
import { isUrlValid } from 'cmn/lib/validation';

const props = defineProps<{
    client: Client;
    latestVersion: ClientVersion;
}>();
defineEmits([
    // REQUIRED; need to specify some events that your
    // component will emit through useDialogPluginComponent()
    ...useDialogPluginComponent.emits,
]);
const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();

const clientForm = ref<QForm | null>(null);
const formValid = ref(true);
const $q = useQuasar();
interface State {
    name: string;
    url: string | null;
    amplifyWebhook: string | null;
    iridiumBanned: boolean | null;
    tcpBanned: boolean | null;
}
const state = reactive<State>({
    name: '',
    url: '',
    amplifyWebhook: '',
    iridiumBanned: false,
    tcpBanned: false,
});
const isEditing = props.client !== undefined;

const resetClient = async () => {
    if (props.client) {
        const fullClient = await db.client.getFull(props.client.id);
        state.name = fullClient.name;
        state.url = fullClient.url;
        state.amplifyWebhook = fullClient.amplifyWebhook;
        state.iridiumBanned = fullClient.iridiumBanned;
        state.tcpBanned = fullClient.tcpBanned;
    }
};

const hasModified = computed(() => {
    if (!props.client) return false;

    return (
        state.url !== props.client.url ||
        state.amplifyWebhook !== props.client.amplifyWebhook ||
        state.iridiumBanned !== props.client.iridiumBanned ||
        state.tcpBanned !== props.client.tcpBanned
    );
});

const clientError = ref('');
const working = ref(false);

const printErrorMessage = (error: unknown, defaultMessage: string) => {
    console.error(error);
    if (error instanceof Error) {
        const message = error.message;

        clientError.value = message;

        return;
    }
    clientError.value = defaultMessage;
};

const verifyForm = async (newState: State) => {
    if (clientForm.value) {
        await wait(1); // Hack to make quasar update form elements
        const isValidated = await clientForm.value.validate();
        if (!isValidated) {
            throw new Error('Please correct the form before submitting');
        }
    }
    if (!newState.name) throw new Error('missing name');

    return true;
};

const createClient = async () => {
    $q.notify({
        type: 'negative',
        message: 'Not yet implemented',
    });
};

const copy = async (
    what:
        | 'id'
        | 'appId'
        | 'iridiumQueueUrl'
        | 'config'
        | 'appSyncUrl'
        | 'socketQueueUrl',
) => {
    switch (what) {
        case 'id':
            if (!props.client) return;
            await copyToClipboard(props.client.id ?? '');
            break;
        case 'appId':
            if (!props.client) return;
            await copyToClipboard(props.client.appId ?? '');
            break;
        case 'iridiumQueueUrl':
            if (!props.client) return;
            await copyToClipboard(props.client.iridiumQueueUrl ?? '');
            break;
        case 'socketQueueUrl':
            if (!props.client) return;
            await copyToClipboard(props.client.socketQueueUrl ?? '');
            break;
        case 'appSyncUrl':
            if (!props.client) return;
            await copyToClipboard(props.client.appSyncUrl ?? '');
            break;
        case 'config':
            if (!props.client) return;
            await copyToClipboard(props.client.amplifyOutput ?? '');
            break;
        default:
            break;
    }
};

const updateClient = async () => {
    clientError.value = '';
    working.value = true;

    if (!props.client) return;

    try {
        await verifyForm(state);

        const updatedClient: UpdateClient = {
            id: props.client.id,
            name: state.name,
            url: state.url,
            amplifyWebhook: state.amplifyWebhook,
            iridiumBanned: state.iridiumBanned,
            tcpBanned: state.tcpBanned,
        };

        await db.client.update(updatedClient);
        onDialogOK();
    } catch (error: unknown) {
        printErrorMessage(error, 'Could not update client');
    } finally {
        working.value = false;
    }
};

const upgradeClient = async () => {
    if (!props.client) return;

    try {
        const amplifyWebhook = state.amplifyWebhook;
        if (!amplifyWebhook) throw new Error('missing amplifyWebhook');
        if (!canUpgrade.value) throw new Error('Client is up to date');
        $q.dialog({
            title: 'Confirm',
            message: `Are you sure you want upgrade Client code to ${version2String(
                props.latestVersion,
            )}?\n\nThis will trigger a new build in AWS Amplify. See amplify console for build status`,
            ok: {
                label: 'Upgrade',
                color: 'primary',
            },
            cancel: true,
            persistent: true,
        })
            .onCancel(() => {
                return;
            })
            .onDismiss(() => {
                return;
            })

            .onOk(async () => {
                try {
                    working.value = true;
                    const response = await fetch(
                        amplifyWebhook + '&operation=startbuild',
                        {
                            method: 'POST',
                            mode: 'no-cors',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        },
                    );

                    if (!response.ok && response.status !== 0) {
                        throw new Error(`Response status: ${response.status}`);
                    }

                    $q.notify({
                        message:
                            'Build command sent, allow at least 15 minutes for build to complete',
                        color: 'positive',
                        position: 'center',
                    });

                    onDialogOK();
                } catch (error: unknown) {
                    printErrorMessage(error, 'Could not upgrade client');
                    console.error(error);
                } finally {
                    working.value = false;
                }
            });
    } catch (error: unknown) {
        printErrorMessage(error, 'Could not update client');
        console.error(error);
    }
};

const archiveClient = () => {
    $q.dialog({
        title: 'Confirm',
        message: 'Do you want to archive this client?',
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

            clientError.value = '';
            working.value = true;
            try {
                if (!props.client) return;
                await db.client.archive(props.client.id, true);
                logger.log($q, 'Client archived');
                onDialogOK();
            } catch (error: unknown) {
                printErrorMessage(error, 'Could not archive client');
            } finally {
                working.value = false;
            }
        });
};
const unArchiveClient = () => {
    $q.dialog({
        title: 'Confirm',
        message: 'Do you want to restore this client?',
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

            clientError.value = '';
            working.value = true;
            try {
                if (!props.client) return;
                await db.client.archive(props.client.id, false);
                logger.log($q, 'Client archived');
                onDialogOK();
            } catch (error: unknown) {
                printErrorMessage(error, 'Could not archive client');
            } finally {
                working.value = false;
            }
        });
};

const canUpgrade = computed(() => {
    const amplifyWebhook = state.amplifyWebhook;
    if (!amplifyWebhook) return false;
    const latestVersion = props.latestVersion;
    const clientVersion = parseAmplifyVersion(
        props.client?.latestDeploymentVersion ?? undefined,
    );
    if (!latestVersion || !clientVersion) return false;

    if (clientVersion.major > latestVersion.major) return false;
    if (clientVersion.major < latestVersion.major) return true;
    // equal major version
    if (clientVersion.minor > latestVersion.minor) return false;
    if (clientVersion.minor < latestVersion.minor) return true;
    // equal minor version
    if (clientVersion.patch > latestVersion.patch) return false;
    if (clientVersion.patch < latestVersion.patch) return true;

    return false;
});

if (isEditing) {
    resetClient();
}

watch(state, async () => {
    try {
        formValid.value = await verifyForm(state);
    } catch {
        formValid.value = false;
    }
});
</script>

<style lang="scss" scoped>
.ClientManagement-Dialog {
    width: 800px;
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
