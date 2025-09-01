<template>
    <q-dialog
        id="UserManagementDialog"
        ref="dialogRef"
        class="q-electron-drag--exception"
        persistent
        @hide="onDialogHide"
        :seamless="backdropVisible"
    >
        <q-card class="q-dialog-plugin UserManagement-Dialog column no-wrap">
            <div class="col column no-wrap scroll">
                <div class="col-auto column justify-center items-center">
                    <div class="profile-image">
                        <avataaar-image
                            :config="state.avatar"
                            class="avatar-image"
                        />
                        <div
                            v-ripple
                            class="edit-image text-subtitle1 text-center cursor-pointer ripple text-white"
                            @click="editImage"
                        >
                            Edit
                        </div>
                    </div>
                    <template v-if="isEditing">
                        <div class="text-caption q-mt-sm">
                            Id: {{ state.id }}
                        </div>
                        <div class="text-caption q-mt-none">
                            Last logon: {{ state.lastLogon ?? 'Never' }}
                        </div>
                    </template>
                </div>
                <q-card-section class="col q-mt-none">
                    <q-form
                        ref="userForm"
                        class="q-gutter-y-md"
                        greedy
                        no-error-focus
                        @submit.prevent=""
                    >
                        <div v-if="!isEditing" class="text-center text-h6">
                            Create new user
                        </div>
                        <q-input
                            v-model="state.fullName"
                            filled
                            label="Full name"
                        />
                        <q-input
                            v-model="state.email"
                            filled
                            label="Email"
                            :rules="[isValidEmail]"
                            lazy-rules
                        />
                        <q-input
                            v-model="state.phone"
                            filled
                            label="Phone (with country code)"
                            :rules="[isAWSPhone]"
                            lazy-rules
                        />

                        <q-checkbox
                            v-model="state.orgAdmin"
                            label="Organization administrator"
                        />
                        <div class="dialog-messages">
                            {{ userError }}
                        </div>
                    </q-form>
                </q-card-section>
            </div>
            <q-separator />
            <q-card-actions class="row">
                <template v-if="isEditing && user">
                    <n-btn
                        v-if="user.isArchived === 'false'"
                        label="Archive"
                        danger
                        :disable="working"
                        :loading="working"
                        @click="archiveUser"
                    />
                    <n-btn
                        v-else
                        label="Restore"
                        danger
                        :disable="working"
                        :loading="working"
                        @click="unArchiveUser"
                    />
                </template>
                <q-space />
                <n-btn v-close-popup label="Cancel" />
                <template v-if="isEditing && user">
                    <n-btn
                        v-if="showInvite"
                        label="Resend Invite"
                        :disable="working"
                        :loading="working"
                        @click="sendInvite"
                    />

                    <n-btn
                        v-if="hasModified"
                        label="Reset"
                        :disable="working"
                        @click="resetUser"
                    />
                    <n-btn
                        v-if="hasModified"
                        active
                        label="Update"
                        :disable="working || !formValid"
                        :loading="working"
                        @click="updateUser"
                    />
                </template>
                <n-btn
                    v-else
                    dense
                    label="Create"
                    active
                    :disable="working || !formValid"
                    :loading="working"
                    @click="createUser"
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
import { isAWSPhone, isValidEmail } from 'cmn/lib/validation';
import { logger } from 'cmn/lib/logger';
import AvataaarImage from 'cmn/components/Avataaars/avataaarImage.vue';
import ProfileImageDialog from 'cmn/dialogs/ProfileImage/profileImage.vue';
import { clientDb } from 'client/services/database';
import type { User, NewUser, UpdateUser } from 'client/services/database/users';
import { wait } from 'cmn/lib/tools';
import UserHelp from './UserHelp.vue';
import { useHelpStore } from 'cmn/stores/help';
const helpStore = useHelpStore();
const props = defineProps<{
    user: User;
}>();
defineEmits([
    // REQUIRED; need to specify some events that your
    // component will emit through useDialogPluginComponent()
    ...useDialogPluginComponent.emits,
]);
const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();
const backdropVisible = inject<boolean>('backdropVisible');
const userForm = ref<QForm | null>(null);
const formValid = ref(true);
const $q = useQuasar();
interface State {
    id: string;
    isArchived: string;
    fullName: string;
    email: string;
    phone: string;
    avatar: string | null;
    orgAdmin: boolean;
    lastLogon: Date | null;
}
const state = reactive<State>({
    id: '',
    isArchived: 'false',
    fullName: '',
    email: '',
    phone: '',
    avatar: props.user?.avatar ?? null,
    orgAdmin: false,
    lastLogon: null as Date | null,
});
const isEditing = props.user !== undefined;

const resetUser = async () => {
    if (props.user) {
        const fullUser = await clientDb.user.getFull(props.user.id);
        state.id = fullUser.id;
        state.isArchived = fullUser.isArchived;
        state.fullName = fullUser.fullName;
        state.email = fullUser.email;
        state.phone = fullUser.phone;
        state.orgAdmin = fullUser.orgAdmin;
        state.avatar = fullUser.avatar ?? null;
        state.lastLogon = props.user.lastLogon
            ? new Date(props.user.lastLogon)
            : null;
    }
};

const hasModified = computed(() => {
    if (!props.user) return false;

    return (
        state.id !== props.user.id ||
        state.isArchived !== props.user.isArchived ||
        state.fullName !== props.user.fullName ||
        state.email !== props.user.email ||
        state.phone !== props.user.phone ||
        state.orgAdmin !== props.user.orgAdmin ||
        state.avatar !== props.user.avatar
    );
});

const userError = ref('');
const working = ref(false);

const printErrorMessage = (error: unknown, defaultMessage: string) => {
    console.error(error);
    if (error instanceof Error) {
        const message = error.message;

        userError.value = message;

        return;
    }
    userError.value = defaultMessage;
};

const validEmail = async (email: string) => {
    try {
        if (!isValidEmail(email)) return 'Email is not valid';
        if (email === props.user?.email) return true;
        const existing = await clientDb.user.getAll(true, {
            filter: { email: { eq: email } },
        });
        const first = existing[0];
        if (!first) return true;
        if (first.isArchived === 'true')
            return `Email is already in use by an archived user ${first.fullName}`;
        else return `Email is already in use by ${first.fullName}`;
    } catch (error) {
        console.error(error);
        return 'Failed to validate email';
    }
};

const verifyForm = async (newState: State, oldState?: State) => {
    if (userForm.value) {
        await wait(1); // Hack to make quasar update form elements
        const isValidated = await userForm.value.validate();
        if (!isValidated) {
            throw new Error('Please correct the form before submitting');
        }
    }

    if (!newState.fullName) throw new Error('missing name');

    if (newState.email !== oldState?.email) {
        const isEmailValid = await validEmail(newState.email);

        if (isEmailValid !== true) throw new Error('Not valid email');
    }
    if (!newState.phone || isAWSPhone(newState.phone) !== true)
        throw new Error('Not valid phone');
    if (newState.orgAdmin === undefined) throw new Error('missing orgAdmin');

    return true;
};

const createUser = async () => {
    userError.value = '';
    working.value = true;

    try {
        await verifyForm(state);
        const newUser: NewUser = {
            resendInvite: null,
            fullName: state.fullName.trim(),
            email: state.email.trim().toLowerCase(),
            phone: state.phone.trim(),
            orgAdmin: state.orgAdmin ? true : false,
            avatar: state.avatar,
            userData: null,
            notificationSetting: null,
            isArchived: 'false',
        };

        await clientDb.user.add(newUser);
        onDialogOK();
    } catch (error: unknown) {
        printErrorMessage(error, 'Could not create user');
    } finally {
        working.value = false;
    }
};

const updateUser = async () => {
    userError.value = '';
    working.value = true;

    if (!props.user) return;

    try {
        await verifyForm(state);

        const updatedUser: UpdateUser = {
            id: state.id,
            fullName: state.fullName.trim(),
            email: state.email.trim().toLowerCase(),
            phone: state.phone.trim(),
            orgAdmin: state.orgAdmin ? true : false,
            avatar: state.avatar,
        };

        await clientDb.user.update(updatedUser);
        onDialogOK();
    } catch (error: unknown) {
        printErrorMessage(error, 'Could not update user');
    } finally {
        working.value = false;
    }
};

const archiveUser = () => {
    $q.dialog({
        title: 'Confirm',
        message: 'Do you want to archive this user?',
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

            userError.value = '';
            working.value = true;
            try {
                if (!props.user) return;
                await clientDb.user.archive(props.user.id, true);
                logger.log($q, 'User archived');
                onDialogOK();
            } catch (error: unknown) {
                printErrorMessage(error, 'Could not archive user');
            } finally {
                working.value = false;
            }
        });
};
const unArchiveUser = () => {
    $q.dialog({
        title: 'Confirm',
        message: 'Do you want to restore this user?',
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

            userError.value = '';
            working.value = true;
            try {
                if (!props.user) return;
                await clientDb.user.archive(props.user.id, false);
                logger.log($q, 'User archived');
                onDialogOK();
            } catch (error: unknown) {
                printErrorMessage(error, 'Could not archive user');
            } finally {
                working.value = false;
            }
        });
};

const editImage = () => {
    $q.dialog({
        component: ProfileImageDialog,

        componentProps: {
            config: state.avatar,
        },
    }).onOk((avatar: string) => {
        state.avatar = avatar;
    });
};

const showInvite = computed(() => {
    if (!props.user) return false;
    if (props.user.lastLogon !== undefined) return false;

    return true;
});

const sendInvite = () => {
    $q.dialog({
        title: 'Confirm',
        message:
            "A email with a new invite will be sent to the user. Please verify the email address before sending and that the user not already has received an email from 'no-reply@verificationemail.com.",
        cancel: true,
        persistent: true,
    }).onOk(async () => {
        // console.log('>>>> OK')

        try {
            if (!props.user) throw new Error('No user to send invite to');
            const fullUser = await clientDb.user.getFull(props.user.id);
            const resendInvite = !fullUser.resendInvite
                ? 1
                : fullUser.resendInvite + 1;
            await clientDb.user.update({
                id: props.user.id,
                resendInvite,
            });
            logger.log(
                $q,
                `A new invite mail with password is sent to the user as ${props.user.email}`,
            );
        } catch (error: unknown) {
            printErrorMessage(error, 'Could not resend invite');
        }
    });
};

watch(state, async (newState, oldState) => {
    try {
        formValid.value = await verifyForm(newState, oldState);
    } catch {
        formValid.value = false;
    }
});

onMounted(async () => {
    try {
        if (isEditing) {
            await resetUser();
        }

        const myName = getCurrentInstance()?.type.__name;

        if (myName)
            helpStore.addHelp({
                name: myName,
                type: 'dialog',
                helpPage: UserHelp,
            });
    } catch (e) {
        logger.error($q, 'Error occurred while mounting UserManagement:', e);
    }
});
onUnmounted(() => {
    const myName = getCurrentInstance()?.type.__name;
    if (myName) helpStore.removeHelp(myName);
});
</script>

<style lang="scss" scoped>
.UserManagement-Dialog {
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
