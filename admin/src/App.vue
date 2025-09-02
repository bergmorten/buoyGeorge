<template>
    <router-view />
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { Hub } from 'aws-amplify/utils';
import LoginDialog from 'cmn/dialogs/Login/loginDialog.vue';
import { ref, onMounted } from 'vue';
import { fetchAuthSession, signOut } from 'aws-amplify/auth';
import { useCognitoUserStore } from 'cmn/stores/cognitoUser';
import { hasExternalConfig } from 'admin/boot/amplify';
import { useRouter } from 'vue-router';
import { useCredentialStore } from 'cmn/stores/credentials';

const $q = useQuasar();
$q.dark.set(false);
const loginActive = ref(false);
const cognitoUserStore = useCognitoUserStore();
const credentialsStore = useCredentialStore();
const router = useRouter();
const showLogin = async () => {
    if (loginActive.value) return;
    try {
        const { credentials } = await fetchAuthSession();
        if (!credentials) throw new Error('No credentials');
        await cognitoUserStore.updateUser();
        return;
    } catch {
        // mute login error, continue to login dialog
    }
    loginActive.value = true;
    $q.dialog({
        component: LoginDialog,
        componentProps: {
            useExternalConfig: hasExternalConfig,
        },
    })
        .onOk(async () => {
            loginActive.value = false;
            await cognitoUserStore.updateUser();
        })
        .onDismiss(() => {
            loginActive.value = false;
        })
        .onCancel(() => {
            loginActive.value = false;
        });
};

const setUpHubEvents = () => {
    Hub.listen('core', async (data) => {
        console.warn(`Unknown core event ${data.payload.event}`);
    });

    Hub.listen('error', async (data) => {
        switch (data.payload.event) {
            case 'missing_user':
                if (credentialsStore.isSwitching) break;
                $q.notify({
                    message:
                        'You have lost your user session, please sign in again',
                    type: 'negative',
                    timeout: 1000 * 60 * 60 * 24 * 7,
                    actions: [
                        {
                            label: 'Logout',
                            color: 'white',
                            handler: async () => {
                                await signOut();
                            },
                        },
                        {
                            label: 'Login',
                            color: 'yellow',
                            handler: showLogin,
                        },
                    ],
                });
                break;
            default:
                console.warn('Unknown Error event');
                console.debug(`Unknown Error event ${data.payload.event}`);
        }
    });

    Hub.listen('auth', async (data) => {
        switch (data.payload.event) {
            case 'signedIn':
                console.debug('user signed in');
                //startSubscription(true);
                break;
            case 'signedOut':
                if (credentialsStore.isSwitching) break;
                console.warn('user signed out');
                try {
                    //stopSubscription();
                    cognitoUserStore.invalidateUser();
                    //  await clearOfflineDb();

                    void router.push({ name: 'guest' }).catch((e) => {
                        console.error('Error pushing guest route', e);
                    });
                } catch (e) {
                    console.error('Error clearing offline db', e);
                }
                break;
            // case 'signIn_failure':
            //   useCognitoUser.invalidateUser();
            //   console.log('User sign in failed');
            //   break;
            case 'tokenRefresh':
                console.warn('token refresh succeeded');
                void cognitoUserStore.updateUser().catch((e) => {
                    console.error('Error updating user after token refresh', e);
                });
                break;
            // case 'autoSignIn': // Not enabled yet
            //   console.debug('autoSignIn succeeded');
            //   void useCognitoUser.updateUser();
            //   break;
            // case 'configured':
            //   console.debug('the Auth module is configured');
            //   void useCognitoUser.updateUser();
            //   break;

            default:
                console.warn('Unknown Auth event');
                console.debug(`Unknown Auth event: ${data.payload.event}`);
            //useCognitoUser.invalidateUser();
        }
    });
};

onMounted(async () => {
    console.debug('App mounted');

    if (!credentialsStore.password || !credentialsStore.username) {
        await signOut();
        cognitoUserStore.invalidateUser();
        //  await clearOfflineDb();
        void router.push({ name: 'guest' }).catch((e) => {
            console.error('Error pushing guest route', e);
        });
    }
    // eventBus.on('lostAuth', showLogin);
    // try {
    //     await useDimming.updateDocument();
    //     await setupInlineCache();
    // } catch (e) {
    //     console.error('Error updating document', e);
    // }
    setUpHubEvents();
});
</script>
