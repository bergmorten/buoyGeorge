<template>
    <q-dialog
        id="ConnectDialog"
        ref="dialogRef"
        class="q-electron-drag--exception"
        persistent
        @hide="onDialogHide"
    >
        <q-card class="q-dialog-plugin login-dialog">
            <q-card-section class="q-py-none q-pt-md row justify-center">
                <q-img
                    src="~assets/svg/nortek-logo.svg"
                    class="logo-svg"
                    alt="Nortek Logo"
                />
            </q-card-section>
            <q-card-section class="q-py-none">
                <q-form @submit.prevent="">
                    <div v-if="requireNewPassword" class="q-gutter-y-md">
                        <div class="text-h6">A new password is required</div>

                        <q-input
                            v-model="newPassword"
                            outlined
                            autocomplete="new-password"
                            label="New password"
                            :type="isPwd ? 'password' : 'text'"
                        >
                            <template #append>
                                <q-icon
                                    :name="
                                        isPwd ? 'visibility_off' : 'visibility'
                                    "
                                    class="cursor-pointer"
                                    @click="isPwd = !isPwd"
                                />
                            </template>
                        </q-input>
                        <q-input
                            v-model="confirmNewPassword"
                            autocomplete="new-password"
                            outlined
                            bottom-slots
                            :error-message="newPasswordMessage"
                            :error="newPasswordMessage !== ''"
                            label="Confirm new password"
                            :type="isPwd ? 'password' : 'text'"
                        >
                            <template #append>
                                <q-icon
                                    :name="
                                        isPwd ? 'visibility_off' : 'visibility'
                                    "
                                    class="cursor-pointer"
                                    @click="isPwd = !isPwd"
                                />
                            </template>
                        </q-input>
                        <div
                            v-if="passwordStrength > 0"
                            class="row justify-center items-center"
                        >
                            <q-rating
                                :model-value="passwordStrength"
                                icon="stop"
                                readonly
                                size="2em"
                                :max="3"
                                color="primary"
                            />
                            <div class="q-ml-md">
                                {{ PasswordStrength[passwordStrength] }}
                                strength
                            </div>
                        </div>
                        <div v-else class="q-px-md text-negative">
                            The password must be at least 8 characters long and
                            contain special characters.
                        </div>
                        <div class="login-messages">
                            {{ loginError }}
                            <div v-if="showHelp" class="login-help">
                                Use a password that is unique and contains
                                letters, numbers and special characters.
                            </div>
                            <div
                                v-if="!showHelp && !loginError"
                                class="login-help"
                            >
                                You must select a new password before continuing
                            </div>
                        </div>
                    </div>
                    <div
                        v-else-if="showResetPassword === 'ShowForm'"
                        class="q-gutter-y-md q-mt-md"
                    >
                        <div class="text-h6">
                            A verification code is sent to your email
                        </div>
                        <q-input
                            v-model="verificationCode"
                            outlined
                            label="Verification code"
                        />
                        <q-input
                            v-model="newPassword"
                            outlined
                            autocomplete="new-password"
                            label="New password"
                            :type="isPwd ? 'password' : 'text'"
                        >
                            <template #append>
                                <q-icon
                                    :name="
                                        isPwd ? 'visibility_off' : 'visibility'
                                    "
                                    class="cursor-pointer"
                                    @click="isPwd = !isPwd"
                                />
                            </template>
                        </q-input>
                        <q-input
                            v-model="confirmNewPassword"
                            autocomplete="new-password"
                            outlined
                            bottom-slots
                            :error-message="newPasswordMessage"
                            :error="newPasswordMessage !== ''"
                            label="Confirm new password"
                            :type="isPwd ? 'password' : 'text'"
                        >
                            <template #append>
                                <q-icon
                                    :name="
                                        isPwd ? 'visibility_off' : 'visibility'
                                    "
                                    class="cursor-pointer"
                                    @click="isPwd = !isPwd"
                                />
                            </template>
                        </q-input>
                        <div
                            v-if="passwordStrength > 0"
                            class="row justify-center items-center"
                        >
                            <q-rating
                                :model-value="passwordStrength"
                                icon="stop"
                                readonly
                                size="2em"
                                :max="3"
                                color="primary"
                            />
                            <div class="q-ml-md">
                                {{ PasswordStrength[passwordStrength] }}
                                strength
                            </div>
                        </div>
                        <div v-else class="q-px-md text-negative">
                            The password must be at least 8 characters long and
                            contain special characters.
                        </div>
                        <div class="login-messages">
                            {{ loginError }}
                            <div v-if="showHelp" class="login-help">
                                Use a password that is unique and contains
                                letters, numbers and special charaters.
                            </div>
                            <div
                                v-if="!showHelp && !loginError"
                                class="login-help"
                            >
                                You must select a new password before continuing
                            </div>
                        </div>
                    </div>
                    <div
                        v-else-if="requireOtpCode"
                        class="q-gutter-y-md q-mt-md"
                    >
                        <q-input
                            v-model="verificationCode"
                            outlined
                            label="Verification code"
                            :hint="
                                requireOtpCode === 'totp'
                                    ? 'Enter the code from your authenticator app'
                                    : 'Enter the code from your SMS'
                            "
                        />
                        <q-checkbox
                            v-model="rememberDevice"
                            outlined
                            label="Remember this device"
                            hint="Remember this device only if you trust it"
                        />

                        <div class="login-messages">
                            {{ loginError }}
                            <div v-if="showHelp" class="login-help">
                                <template v-if="requireOtpCode === 'totp'">
                                    If you have lost access to authenticator
                                    app, you must contact your administrator.
                                </template>
                            </div>
                        </div>
                    </div>
                    <div v-else class="q-gutter-y-md q-mt-md">
                        <q-input
                            v-model="loginName"
                            outlined
                            autocomplete="username"
                            label="Your login (email)"
                        />
                        <q-input
                            v-model="password"
                            outlined
                            autocomplete="current-password"
                            label="Password"
                            :type="isPwd ? 'password' : 'text'"
                        >
                            <template #append>
                                <q-icon
                                    :name="
                                        isPwd ? 'visibility_off' : 'visibility'
                                    "
                                    class="cursor-pointer"
                                    @click="isPwd = !isPwd"
                                />
                            </template>
                        </q-input>
                        <q-select
                            v-if="useExternalConfig"
                            v-model="client"
                            outlined
                            label="Select client"
                            :options="configs"
                            option-label="name"
                            :loading="working"
                        />
                        <div class="login-messages">
                            {{ loginError }}
                            <div v-if="showHelp" class="login-help">
                                <template v-if="isDemo">
                                    Use the inquire button to get a demo
                                    account.
                                </template>
                                <template v-else>
                                    Contact your administrator or Nortek if you
                                    need an account.
                                </template>
                            </div>
                            <div
                                v-if="!showHelp && !loginError"
                                class="login-help"
                            >
                                Welcome to Nortek Buoy
                            </div>
                        </div>
                        <div class="row justify-center q-mt-none">
                            <n-btn
                                v-if="showResetPassword === 'ShowButton'"
                                label="Reset password"
                                class="text-center q-mb-md"
                                :disable="working"
                                @click="requestResetPassword"
                            />
                        </div>
                    </div>
                </q-form>
            </q-card-section>
            <q-separator inset />
            <q-card-actions>
                <n-btn
                    v-if="isDemo"
                    label="Inquire"
                    color="positive"
                    @click="showInquire"
                />
                <q-space />
                <n-btn v-close-popup label="Cancel" />
                <n-btn label="Help" @click="showHelp = !showHelp" />

                <n-btn
                    v-if="requireNewPassword"
                    label="Set password"
                    active
                    :disable="working || !passwordOk"
                    :loading="working"
                    autocomplete="new-password"
                    @click="setNewPassword"
                />
                <n-btn
                    v-else-if="showResetPassword === 'ShowForm'"
                    label="Set password"
                    active
                    :disable="working || !passwordOk"
                    :loading="working"
                    autocomplete="new-password"
                    @click="confirmPassword"
                />
                <n-btn
                    v-else-if="requireOtpCode"
                    label="Verify Code"
                    active
                    :disable="working || !verificationCode"
                    :loading="working"
                    @click="confirmOtpCode"
                />
                <n-btn
                    v-else
                    label="Login"
                    active
                    :disable="working"
                    :loading="working"
                    @click="tryLogin"
                />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script lang="ts">
import type { ResourcesConfig } from 'aws-amplify';
import { Amplify } from 'aws-amplify';
import { LocalStorage, useDialogPluginComponent, useQuasar } from 'quasar';
import { getPasswordStrength, PasswordStrength } from 'cmn/lib/validation';
import { computed, defineComponent, ref } from 'vue';
import {
    confirmResetPassword,
    confirmSignIn,
    rememberDevice as otpRememberDevice,
    resetPassword,
    signIn,
    signOut,
} from 'aws-amplify/auth';
//import { type ClientExport } from '@hefring/adminAPI/data';
//import { getClientConfigs } from '@/services/restAPI/clientConfig';
import { logger } from 'cmn/lib/logger';
import { onMounted } from 'vue';
import { wait } from 'cmn/lib/tools';
import { useCredentialStore } from 'cmn/stores/credentials';
// import { SavePassword } from 'capacitor-ios-autofill-save-password';

interface ClientExport {
    id: string;
    awsExport: ResourcesConfig;
}

export default defineComponent({
    props: {
        useExternalConfig: {
            type: Boolean,
            default: false,
        },
        storeCredentials: {
            type: Boolean,
            default: false,
        },
    },
    emits: [...useDialogPluginComponent.emits, 'ok'],
    setup(props) {
        const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
            useDialogPluginComponent();
        const $q = useQuasar();
        const isDemo = process.env.DOMAIN_NAME === 'demo';
        const loginName = ref('');
        const isPwd = ref(true);
        const credentialsStore = useCredentialStore();
        const password = ref('');
        const newPassword = ref('');
        const confirmNewPassword = ref('');
        const rememberDevice = ref(false);
        const loginError = ref('');
        const showHelp = ref(false);
        const working = ref(false);
        const requireNewPassword = ref(false);
        const requireOtpCode = ref<null | 'sms' | 'totp'>(null);
        const showResetPassword = ref<'ShowButton' | 'ShowForm' | 'none'>(
            'none',
        );
        const verificationCode = ref('');
        const configs = ref<ClientExport[]>([]);
        const client = ref<ClientExport | null>(null);
        const printErrorMessage = (error: unknown, defaultMessage: string) => {
            console.error(error);
            if (error instanceof Error) {
                const message = (error as { message: string }).message;

                loginError.value = message;

                return;
            }
            loginError.value = defaultMessage;
        };

        const tryLogin = async () => {
            loginName.value = loginName.value.trim();
            password.value = password.value.trim();
            if (props.useExternalConfig) {
                if (!client.value) {
                    loginError.value = 'You must select a client';
                    return;
                }
                Amplify.configure(client.value.awsExport as ResourcesConfig);
            }
            loginError.value = '';
            working.value = true;
            await wait(500); // Just to show the loading spinner
            showResetPassword.value = 'none';
            requireNewPassword.value = false;

            try {
                const { isSignedIn, nextStep } = await signIn({
                    username: loginName.value,
                    password: password.value,
                });

                if (
                    nextStep.signInStep ===
                    'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED'
                ) {
                    requireNewPassword.value = true;

                    return;
                }

                if (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_TOTP_CODE') {
                    requireOtpCode.value = 'totp';

                    return;
                }
                if (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_SMS_CODE') {
                    requireOtpCode.value = 'sms';
                    return;
                }
                if (nextStep.signInStep === 'RESET_PASSWORD') {
                    showResetPassword.value = 'ShowForm';
                    loginError.value = '';
                    return;
                }

                if (isSignedIn) {
                    if (props.useExternalConfig && client.value)
                        LocalStorage.set('clientConfig', client.value);
                    else LocalStorage.remove('clientConfig');
                    // if (false && process.env.MODE === 'capacitor' && $q.platform.is.ios) {
                    //   await SavePassword.promptDialog({
                    //     username: loginName.value,
                    //     password: password.value,
                    //   });
                    // }

                    credentialsStore.username = loginName.value;
                    credentialsStore.password = password.value;

                    onDialogOK('USER_OK'); // USER IS OK
                } else {
                    throw new Error('User is not signed in');
                }
            } catch (error: unknown) {
                if (error instanceof Error) {
                    if (error.message === 'User does not exist.') {
                        loginError.value = 'User does not exist';
                        return;
                    } else if (error.message.includes('archive')) {
                        loginError.value =
                            'Your account is archive, contact your administrator';
                        return;
                    } else if (
                        error.message === 'There is already a signed in user.'
                    ) {
                        await signOut();
                        loginError.value = 'Retry login';
                        return;
                    }
                }

                printErrorMessage(error, 'Incorrect username or password.');
                showResetPassword.value = 'ShowButton';
            } finally {
                working.value = false;
            }
        };

        const verifyPassword = () => {
            newPassword.value = newPassword.value.trim();
            confirmNewPassword.value = confirmNewPassword.value.trim();
            if (!newPassword.value || newPassword.value.length < 8) {
                loginError.value =
                    'The password cannot be empty or less than 8 characters';
                return false;
            }
            if (newPassword.value !== confirmNewPassword.value) {
                loginError.value = 'The password must be equal';
                return false;
            }
            if (passwordStrength.value < PasswordStrength.Medium) {
                loginError.value = 'The password is too weak';
                return false;
            }
            return true;
        };

        async function handleRememberDevice() {
            try {
                await otpRememberDevice();
                return true;
            } catch (error) {
                printErrorMessage(
                    error,
                    'Could not remember the device, contact support',
                );
            }
            return false;
        }

        const setNewPassword = async () => {
            loginError.value = '';

            if (!verifyPassword) return;

            try {
                working.value = true;
                await confirmSignIn({ challengeResponse: newPassword.value });

                credentialsStore.password = newPassword.value;

                onDialogOK('USER_OK'); // USER IS OK
            } catch (error: unknown) {
                printErrorMessage(
                    error,
                    'New password is not approved, try a more challenging password',
                );
            } finally {
                working.value = false;
            }
        };

        const passwordStrength = computed(() => {
            const value = getPasswordStrength(newPassword.value.trim());

            return value;
        });

        const newPasswordMessage = computed(() => {
            if (!newPassword.value) return '';
            if (newPassword.value === password.value)
                return 'You can not use the same password';
            if (newPassword.value !== confirmNewPassword.value)
                return 'The password must be equal';

            if (
                confirmNewPassword.value &&
                passwordStrength.value < PasswordStrength.Medium
            )
                return 'The password is too weak';

            return '';
        });

        const passwordOk = computed(() => {
            if (
                newPassword.value === confirmNewPassword.value &&
                passwordStrength.value > PasswordStrength.Weak
            )
                return true;
            return false;
        });

        const requestResetPassword = async () => {
            try {
                working.value = true;
                loginName.value = loginName.value.trim();
                const output = await resetPassword({
                    username: loginName.value,
                });
                if (
                    output.isPasswordReset &&
                    output.nextStep.resetPasswordStep ===
                        'CONFIRM_RESET_PASSWORD_WITH_CODE'
                ) {
                    showResetPassword.value = 'ShowForm';
                    loginError.value = '';
                } else {
                    throw new Error('Could not reset password');
                }
            } catch (error) {
                printErrorMessage(
                    error,
                    `Could not reset password for account ${loginName.value}`,
                );
                showResetPassword.value = 'none';
            } finally {
                working.value = false;
            }
        };

        const confirmPassword = async () => {
            loginError.value = '';
            if (!verifyPassword) return;
            if (!verificationCode.value) {
                loginError.value = 'You must enter a verification code';
                return;
            }
            try {
                working.value = true;
                await confirmResetPassword({
                    username: loginName.value,
                    newPassword: newPassword.value.trim(),
                    confirmationCode: verificationCode.value,
                });
                password.value = newPassword.value.trim();
                await wait(1000);
                await tryLogin();
            } catch (error) {
                printErrorMessage(
                    error,
                    `Could not reset password for account ${loginName.value}`,
                );
                showResetPassword.value = 'none';
            } finally {
                working.value = false;
            }
        };

        const getClients = async () => {
            // const adminConfigs = await getClientConfigs();
            // configs.value = adminConfigs;
        };

        const confirmOtpCode = async () => {
            loginError.value = '';

            if (!verificationCode.value) {
                loginError.value = 'You must enter a verification code';
                return;
            }
            try {
                working.value = true;
                await confirmSignIn({
                    challengeResponse: verificationCode.value,
                });
                if (rememberDevice.value) {
                    const success = await handleRememberDevice();
                    if (!success) return;
                }
                onDialogOK('USER_OK'); // USER IS OK
            } catch (error) {
                printErrorMessage(error, 'Could not confirm OTP code');
            } finally {
                working.value = false;
            }
        };

        const showInquire = () => {
            onDialogOK('INQUIRE');
        };

        onMounted(async () => {
            if (!props.useExternalConfig) return;
            try {
                working.value = true;
                await getClients();
                const pastConfig =
                    LocalStorage.getItem<ClientExport>('clientConfig');
                if (pastConfig) {
                    const found = configs.value.find(
                        (config) => config.id === pastConfig.id,
                    );
                    if (found) client.value = found;
                }
            } catch (error) {
                logger.warn($q, 'Could not fetch client configs', error);
            } finally {
                working.value = false;
            }
        });

        //

        return {
            // This is REQUIRED;
            // Need to inject these (from useDialogPluginComponent() call)
            // into the vue scope for the vue html template
            dialogRef,
            onDialogHide,
            // we can passthrough onDialogCancel directly
            onCancelClick: onDialogCancel,
            requireNewPassword,
            loginName,
            isPwd,
            password,
            loginError,
            showHelp,
            tryLogin,
            setNewPassword,
            working,
            newPassword,
            confirmPassword,
            passwordStrength,
            newPasswordMessage,
            passwordOk,
            showResetPassword,
            requestResetPassword,
            confirmNewPassword,
            verificationCode,
            configs,
            client,
            requireOtpCode,
            confirmOtpCode,
            rememberDevice,
            isDemo,
            showInquire,
            PasswordStrength,
        };
    },
});
</script>

<style lang="scss" scoped>
.login-dialog {
    width: 400px;

    .logo-svg {
        text-align: center;
        width: 200px;
    }

    .login-messages {
        min-height: 50px;
        color: $negative;
        display: flex;
        justify-content: center;
        align-items: center;

        .login-help {
            color: $input-text-color !important;
        }
    }
}
</style>
