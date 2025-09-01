<template>
    <q-layout view="hhh lpr lff" class="admin-layout">
        <q-header>
            <top-bar />
        </q-header>
        <q-drawer
            side="left"
            :model-value="menuOpen"
            :breakpoint="0"
            overlay
            class="main-drawer fit no-scroll"
            @update:model-value="setDrawer"
            @click="resetDrawerTimer"
        >
            <q-scroll-area
                class="fit"
                :content-style="{
                    flexDirection: 'column',
                    display: 'flex',
                    maxWidth: '100%',
                }"
            >
                <div class="org-selector row">
                    <q-select
                        v-if="adminMode"
                        v-model="client"
                        outlined
                        :options="clients"
                        :label="client ? 'Current client' : 'Select client'"
                        option-value="id"
                        option-label="name"
                        class="col q-ma-md"
                        clearable
                        :loading="isLoading"
                        :disable="isLoading"
                    />
                    <n-btn
                        v-else
                        dense
                        unelevated
                        color="negative"
                        label="Sign out client"
                        class="col q-ma-md"
                        @click="client = null"
                    />
                </div>
                <q-list class="col-auto">
                    <template v-if="adminMode">
                        <q-item
                            v-ripple
                            clickable
                            class="subitem"
                            :class="{ active: menuSection === 'AdminClients' }"
                            :to="{ name: 'admin_clients' }"
                        >
                            <q-item-section avatar>
                                <q-icon name="reorder" />
                            </q-item-section>
                            <q-item-section>All Clients</q-item-section>
                        </q-item>
                        <q-item
                            v-ripple
                            clickable
                            class="subitem"
                            :class="{ active: menuSection === 'AdminIridium' }"
                            :to="{ name: 'admin_iridium' }"
                        >
                            <q-item-section avatar>
                                <q-icon name="satellite_alt" />
                            </q-item-section>
                            <q-item-section>Iridium Modems</q-item-section>
                        </q-item>
                    </template>
                    <template v-else>
                        <q-item
                            v-ripple
                            clickable
                            class="subitem"
                            :class="{ active: subSection === 'Meta' }"
                            :to="{ name: 'client_meta' }"
                        >
                            <q-item-section avatar>
                                <q-icon name="corporate_fare" />
                            </q-item-section>
                            <q-item-section>Meta</q-item-section>
                        </q-item>
                        <q-item
                            v-ripple
                            clickable
                            class="subitem"
                            :to="{
                                name: 'management_fleets',
                            }"
                            :class="{ active: subSection === 'Fleets' }"
                        >
                            <q-item-section avatar>
                                <q-icon name="apps" />
                            </q-item-section>

                            <q-item-section>Fleets</q-item-section>
                        </q-item>

                        <q-item
                            v-ripple
                            clickable
                            class="subitem"
                            :to="{
                                name: 'management_producers',
                            }"
                            :class="{ active: subSection === 'Producers' }"
                        >
                            <q-item-section avatar>
                                <q-icon name="factory" />
                            </q-item-section>

                            <q-item-section>Producers</q-item-section>
                        </q-item>

                        <q-item
                            v-ripple
                            clickable
                            class="subitem"
                            :to="{
                                name: 'management_users',
                            }"
                            :class="{ active: subSection === 'Users' }"
                        >
                            <q-item-section avatar>
                                <q-icon name="people" />
                            </q-item-section>

                            <q-item-section>Users</q-item-section>
                        </q-item>
                        <q-item
                            v-ripple
                            clickable
                            class="subitem"
                            :to="{
                                name: 'management_projects',
                            }"
                            :class="{ active: subSection === 'Projects' }"
                        >
                            <q-item-section avatar>
                                <q-icon name="dashboard_customize" />
                            </q-item-section>

                            <q-item-section>Projects</q-item-section>
                        </q-item>

                        <q-item
                            v-ripple
                            clickable
                            class="subitem"
                            :to="{
                                name: 'management_billing',
                            }"
                            :class="{ active: subSection === 'Billing' }"
                        >
                            <q-item-section avatar>
                                <q-icon name="attach_money" />
                            </q-item-section>
                            <q-item-section>Billing</q-item-section>
                        </q-item>
                    </template>
                </q-list>
                <q-space />
                <q-separator />
                <q-list class="col-auto">
                    <q-item
                        v-ripple
                        bordered
                        clickable
                        class="main-item"
                        @click="userSignOut"
                    >
                        <q-item-section avatar>
                            <q-icon name="logout" />
                        </q-item-section>
                        <q-item-section>Sign out</q-item-section>
                    </q-item>
                </q-list>
                <div class="footer col-auto">
                    <q-list>
                        <q-item class="main-nav-brand">
                            <q-item-section>
                                <div class="row items-center">
                                    <div class="col-auto">
                                        <q-img
                                            width="75"
                                            height="50"
                                            src="~assets/svg/nortek-logo.svg"
                                            class="main-nav-logo"
                                        />
                                    </div>
                                    <div class="col">
                                        <div class="txt-title">
                                            Admin Cloud Service
                                        </div>
                                        <div class="txt-body">
                                            {{ version }}
                                        </div>
                                        <div class="txt-body">Nortek Group</div>
                                    </div>
                                </div>
                            </q-item-section>
                        </q-item>
                    </q-list>
                </div>
            </q-scroll-area>
        </q-drawer>

        <q-drawer
            v-model="helpOpen"
            side="right"
            class="help-drawer"
            overlay
            :breakpoint="500"
            :width="500"
            @show="showHelp = true"
            @before-hide="showHelp = false"
        >
            <context-help :show-help="showHelp" />
        </q-drawer>

        <q-page-container>
            <div v-if="menuOpen" class="overlay" @click="hideDrawer" />
            <router-view />
        </q-page-container>
    </q-layout>
</template>

<script setup lang="ts">
import { Amplify } from 'aws-amplify';
import { computed, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue';
import { fetchMFAPreference, signOut } from 'aws-amplify/auth';
import { useQuasar } from 'quasar';
import ContextHelp from 'cmn/components/Help/ContextHelp.vue';
import { useDrawerStore } from 'cmn/stores/drawer';
import { useRouterStore } from 'cmn/stores/route';
import TopBar from './TopBar/topBar.vue';
import packageJson from 'adminRoot/package.json';
import { storeToRefs } from 'pinia';
import { adminDb } from 'admin/services/database';
import { clientDb } from 'client/services/database';
import type { Client } from 'admin/services/database/client';
import awsOriginalConfig from 'adminRoot/amplify_outputs.json';
import { logger } from 'cmn/lib/logger';
import {
    signIn as AuthSignIn,
    signOut as AuthSignOut,
    fetchAuthSession,
} from 'aws-amplify/auth';
import { wait } from 'cmn/lib/tools';
import { useRouter } from 'vue-router';
import { useCredentialStore } from 'cmn/stores/credentials';

const $q = useQuasar();
const router = useRouter();
const drawerStore = useDrawerStore();
const routerStore = useRouterStore();
const credentialsStore = useCredentialStore();
const { menuOpen, helpOpen } = storeToRefs(drawerStore);
const showHelp = ref(false);
const version = packageJson.version;
type AwsConfig = typeof awsOriginalConfig;
const client = shallowRef<Client | null>(null);
const adminMode = ref(true);
const isLoading = adminDb.client.isLoading;
const activeClient = ref<Client | null>(null);

const menuSection = computed(() => {
    return routerStore.routerMeta.menuSection;
});
const subSection = computed(() => {
    return routerStore.routerMeta.subSection;
});

const hideDrawer = (ev?: Event) => {
    if (menuOpen.value && (!ev || !ev.defaultPrevented)) {
        drawerStore.hide();
    }
};

const resetDrawerTimer = (ev?: Event) => {
    if (menuOpen.value && (!ev || !ev.defaultPrevented)) {
        drawerStore.resetTimer();
    }
};

const setDrawer = (show: boolean) => {
    if (show) {
        drawerStore.show();
    } else {
        drawerStore.hide();
    }
};

const userSignOut = async () => {
    //await clearOfflineDb();

    await signOut();
    Amplify.configure(awsOriginalConfig);
};

const clients = computed(() => {
    return Array.from(adminDb.clients.values());
});

const switchClient = async (
    newClient: Client | null,
    oldClient: Client | null,
) => {
    const username = credentialsStore.username;
    const password = credentialsStore.password;

    if (
        !username ||
        !password ||
        typeof username !== 'string' ||
        typeof password !== 'string'
    ) {
        logger.warn($q, 'Missing session credentials');
        return;
    }
    $q.loading.show({
        message: newClient
            ? `Signing into client ${newClient.name}`
            : 'Signing out of client',
    });
    if (oldClient && newClient && newClient.id === oldClient.id) return; // Should not happen
    credentialsStore.isSwitching = true;

    try {
        let config: AwsConfig | undefined = undefined;
        let useSRP_AUTH = true;

        if (newClient) {
            useSRP_AUTH = false;
            const awsExport = newClient.amplifyOutput as unknown as
                | undefined
                | string
                | AwsConfig;

            if (!awsExport) {
                logger.warn(
                    $q,
                    'Missing required aws export for this client, changing to admin',
                );
                client.value = null;
                return;
            }
            if (typeof awsExport === 'string') {
                try {
                    config = JSON.parse(awsExport) as AwsConfig;
                } catch {
                    logger.warn(
                        $q,
                        'JSON data in aws export is invalid, changing to previous',
                    );
                    client.value = null;
                    return;
                }
            } else config = { ...awsExport };
        } else {
            config = awsOriginalConfig;
        }

        await AuthSignOut();
        await wait(500);

        /*
        config.aws_user_pools_web_client_id =
          awsOriginalConfig.aws_user_pools_web_client_id;
        config.aws_user_pools_id = awsOriginalConfig.aws_user_pools_id;
        */

        Amplify.configure(config);

        await AuthSignIn({
            username,
            password,
            options: {
                authFlowType: useSRP_AUTH
                    ? 'USER_SRP_AUTH'
                    : 'USER_PASSWORD_AUTH',
            },
        });

        const credentials = await fetchAuthSession();
        if (!credentials) throw new Error('No credentials');

        if (newClient) {
            adminMode.value = false;
            activeClient.value = newClient;
            adminDb.stop();
            await clientDb.start();
            if (router.currentRoute.value.name !== 'meta') {
                await router.push({ name: 'client_meta' });
            } else router.go(0); // reload current page
        } else {
            adminMode.value = true;
            activeClient.value = null;
            clientDb.stop();
            await adminDb.start();
            await router.push({ name: 'admin_clients' });
        }
    } catch (error) {
        logger.warn($q, 'Could not sign in to this client', error);
        Amplify.configure(awsOriginalConfig);
        await signOut();
        await router.push({ name: 'guest' });
    } finally {
        $q.loading.hide();
        credentialsStore.isSwitching = false;
    }
};

watch(client, async (newClient, oldClient) => {
    await switchClient(newClient, oldClient);
});
onMounted(async () => {
    console.debug('AdminLayout mounted...');

    try {
        const mfa = await fetchMFAPreference();

        if (mfa.preferred === undefined) {
            const lastShown = Number(
                $q.localStorage.getItem('OtpDialogShownAt'),
            );
            if (
                Number.isNaN(lastShown) ||
                Date.now() - lastShown > 1000 * 60 * 60 * 24
            ) {
                // $q.localStorage.setItem('OtpDialogShownAt', Date.now().valueOf());
                // $q.dialog({
                //     component: EnableOTPDialog,
                //     componentProps: {
                //         showHeader: true,
                //     },
                // }).onOk(() => {});
            }
        }
    } catch (error) {
        console.error('Error fetching MFA preference:', error);
    }

    try {
        if (adminMode.value) await adminDb.start();
    } catch (error) {
        console.error('Failed to start database connection:', error);
        $q.notify({
            type: 'negative',
            message: 'Failed to start database connection',
        });
        await signOut();
        await router.push({ name: 'guest' });
    }
});

onUnmounted(() => {
    console.debug('AdminLayout unmounted');

    try {
        adminDb.stop();
        clientDb.stop();
    } catch (error) {
        console.error('Failed to stop database connection:', error);
        $q.notify({
            type: 'negative',
            message: 'Failed to stop database connection',
        });
    }
});
</script>

<style lang="scss" scoped>
.admin-layout {
    // background: var(--container-background-color);
}
.overlay {
    background-color: rgba(0, 0, 0, 0.6);
    width: 100%;
    height: calc(100vh - 58px);
    position: absolute;
    z-index: 2;
}
</style>
<style lang="scss">
.help-drawer {
    resize: horizontal;

    //border-bottom: 2px solid var(--border-outline-color);
    margin-top: -2px;
    padding: 16px;
}
.main-drawer {
    //border-bottom: 2px solid var(--border-outline-color);
    margin-top: -2px;
    box-sizing: content-box;
    .q-item {
        padding: 0 24px;
        height: 56px;
        box-sizing: border-box;
    }

    .q-separator--horizontal {
        width: calc(100% - 48px);
        margin: 0 24px;
    }
    .q-item__section--avatar {
        width: 40px;
        min-width: 0;
    }

    .q-item__section--side {
        padding-right: 0;
    }

    .main-item {
        &.active {
            font-weight: 700;
            //color: #000;

            &.single-item {
                background: $active-color !important;
                color: $active-inverted-color !important;
                font-weight: 400;
            }
        }
    }

    .subitem {
        padding-left: 64px;
        font-weight: 400;

        &.active {
            background: $active-color !important;
            color: $active-inverted-color !important;
        }
    }

    .menu-bottom-list {
        border-top: 2px solid var(--border-outline-color);
    }
    .footer {
        width: 100%;
        border-top: 2px solid $separator-color;
        padding-bottom: 16px;

        .main-nav-brand {
            height: auto;
            padding-top: 16px;
            .main-nav-logo {
                width: 75px;
                height: 50px;
                margin-right: 16px;
            }
        }
    }
}
</style>
