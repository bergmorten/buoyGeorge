<template>
    <q-layout view="hhh lpr lff" class="user-layout">
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
                <q-list class="col-auto">
                    <q-expansion-item
                        v-model="expanded['Deployments']"
                        group="menuExpansion"
                        expand-separator
                        icon="directions_boat"
                        label="Deployments"
                        :class="{ active: menuSection === 'Deployments' }"
                        class="main-item"
                    >
                        <q-item
                            v-ripple
                            clickable
                            class="subitem"
                            :to="{ name: 'deployments_active' }"
                            :class="{ active: subSection === 'Active' }"
                        >
                            <q-item-section avatar>
                                <q-icon name="play_circle" />
                            </q-item-section>

                            <q-item-section>All Active</q-item-section>
                        </q-item>
                        <q-item
                            v-ripple
                            clickable
                            class="subitem"
                            :to="{ name: 'deployments_project' }"
                            :class="{ active: subSection === 'Project' }"
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
                            :to="{ name: 'deployments_fleet' }"
                            :class="{ active: subSection === 'Fleet' }"
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
                            :to="{ name: 'deployments_list' }"
                            :class="{ active: subSection === 'List' }"
                        >
                            <q-item-section avatar>
                                <q-icon name="view_list" />
                            </q-item-section>

                            <q-item-section>Table</q-item-section>
                        </q-item>
                        <q-item
                            v-ripple
                            clickable
                            class="gt-sm subitem"
                            :to="{ name: 'deployments_deploy' }"
                            :class="{
                                active: subSection === 'Deploy',
                            }"
                        >
                            <q-item-section avatar>
                                <q-icon name="add" />
                            </q-item-section>

                            <q-item-section>New / Deploy</q-item-section>
                        </q-item>
                    </q-expansion-item>
                    <q-item
                        v-ripple
                        clickable
                        :to="{ name: 'producers_map' }"
                        class="main-item single-item"
                        :class="{ active: menuSection === 'Producers' }"
                    >
                        <q-item-section avatar>
                            <q-icon name="factory" />
                        </q-item-section>

                        <q-item-section>Producers</q-item-section>
                    </q-item>

                    <q-item
                        v-ripple
                        clickable
                        :to="{ name: 'alerts' }"
                        class="main-item single-item"
                        :class="{ active: menuSection === 'Alerts' }"
                    >
                        <q-item-section avatar>
                            <q-icon name="notifications" />
                        </q-item-section>
                        <q-item-section>Alert list</q-item-section>
                    </q-item>
                </q-list>
                <q-space />

                <q-list class="col-auto menu-bottom-list">
                    <q-expansion-item
                        v-if="!isSuperAdmin"
                        v-model="expanded['Account']"
                        group="menuExpansion"
                        expand-separator
                        icon="person"
                        label="Account"
                        :class="{ active: menuSection === 'Account' }"
                        class="main-item"
                    >
                        <q-item
                            v-ripple
                            clickable
                            class="subitem"
                            :to="{
                                name: 'account_settings',
                            }"
                            :class="{ active: subSection === 'Profile' }"
                        >
                            <q-item-section avatar>
                                <q-icon name="settings" />
                            </q-item-section>

                            <q-item-section>Profile</q-item-section>
                        </q-item>
                        <q-item
                            v-ripple
                            clickable
                            class="subitem"
                            :class="{ active: subSection === 'Notification' }"
                            :to="{ name: 'notification' }"
                        >
                            <q-item-section avatar>
                                <q-icon name="campaign" />
                            </q-item-section>
                            <q-item-section>Notification</q-item-section>
                        </q-item>
                        <q-item
                            v-ripple
                            clickable
                            class="subitem"
                            :class="{ active: subSection === 'Units' }"
                            :to="{ name: 'units' }"
                        >
                            <q-item-section avatar>
                                <q-icon name="precision_manufacturing" />
                            </q-item-section>
                            <q-item-section>Units</q-item-section>
                        </q-item>
                        <q-item
                            v-ripple
                            clickable
                            class="subitem"
                            @click="showTerms"
                        >
                            <q-item-section avatar>
                                <q-icon name="gavel" />
                            </q-item-section>
                            <q-item-section>Show terms</q-item-section>
                        </q-item>
                        <q-item
                            v-ripple
                            clickable
                            class="subitem"
                            @click="userSignOut"
                        >
                            <q-item-section avatar>
                                <q-icon name="logout" />
                            </q-item-section>
                            <q-item-section>Sign out</q-item-section>
                        </q-item>
                    </q-expansion-item>
                    <q-item
                        v-else
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

                    <q-expansion-item
                        v-if="hasAdminRights"
                        v-model="expanded['Management']"
                        group="menuExpansion"
                        expand-separator
                        icon="admin_panel_settings"
                        label="Management"
                        :class="{ active: menuSection === 'Management' }"
                        class="main-item"
                    >
                        <q-item
                            v-ripple
                            clickable
                            class="subitem"
                            :to="{
                                name: 'management_meta',
                            }"
                            :class="{ active: subSection === 'Meta' }"
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
                    </q-expansion-item>
                    <q-expansion-item
                        v-model="expanded['Support']"
                        group="menuExpansion"
                        expand-separator
                        icon="school"
                        label="Support & Docs"
                        :class="{ active: menuSection === 'Support' }"
                        class="main-item"
                    >
                        <q-item
                            v-ripple
                            clickable
                            :to="{ name: 'getting-started' }"
                            class="subitem"
                            :class="{
                                active: subSection === 'Getting Started',
                            }"
                        >
                            <q-item-section avatar>
                                <q-icon name="sports_score" />
                            </q-item-section>
                            <q-item-section>Getting Started</q-item-section>
                        </q-item>

                        <q-item
                            v-ripple
                            clickable
                            :to="{ name: 'user-manual' }"
                            class="subitem"
                            :class="{ active: subSection === 'User Manual' }"
                        >
                            <q-item-section avatar>
                                <q-icon name="menu_book" />
                            </q-item-section>
                            <q-item-section>User Manual</q-item-section>
                        </q-item>

                        <q-item
                            v-ripple
                            clickable
                            :to="{ name: 'faq' }"
                            class="subitem"
                            :class="{ active: subSection === 'faq' }"
                        >
                            <q-item-section avatar>
                                <q-icon name="quiz" />
                            </q-item-section>
                            <q-item-section>FAQ</q-item-section>
                        </q-item>

                        <q-item
                            v-ripple
                            clickable
                            :to="{ name: 'support' }"
                            class="subitem"
                            :class="{ active: subSection === 'contact' }"
                        >
                            <q-item-section avatar>
                                <q-icon name="contact_support" />
                            </q-item-section>
                            <q-item-section>Support inquiry</q-item-section>
                        </q-item>
                    </q-expansion-item>
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
                                            Cloud Service
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
            :model-value="helpOpen"
            side="right"
            class="help-drawer"
            overlay
            :breakpoint="500"
            :width="500"
            @update:model-value="setHelp"
        >
            <context-help />
        </q-drawer>

        <q-page-container>
            <div
                v-if="menuOpen || helpOpen"
                class="overlay"
                @click="hideDrawer"
            />
            <router-view />
        </q-page-container>
    </q-layout>
</template>

<script setup lang="ts">
//import { clearOfflineDb } from '@/lib/graphQL/lib/offline';
import { computed, onMounted, onUnmounted, reactive } from 'vue';
import { fetchMFAPreference, signOut } from 'aws-amplify/auth';
//import { initMessaging } from '@/services/firebaseMessaging';
// import {
//     isOfflineInitialized,
//     startMemoryEngines,
//     stopMemoryEngines,
// } from '@/lib/graphQL/inMemory';
import { logger } from 'cmn/lib/logger';
// import { stopSubscription } from '@/lib/graphQL/lib/subscription/useSubscriptions';
//import { until } from '@vueuse/core';

import { useQuasar } from 'quasar';
import ContextHelp from 'cmn/components/Help/ContextHelp.vue';
//import EnableOTPDialog from 'client/dialogs/Profile/enableOTP.vue';
import GDPRdialog from 'client/dialogs/GDPR/gdprDisclaimer.vue';
import { useDrawerStore } from 'cmn/stores/drawer';
import { useRouterStore } from 'cmn/stores/route';
import { useCognitoUserStore } from 'cmn/stores/cognitoUser';
import { useGeoLocationStore } from 'cmn/stores/goeLocation';
import TopBar from './TopBar/topBar.vue';
import packageJson from 'clientRoot/package.json';
import { storeToRefs } from 'pinia';
import { clientDb } from 'client/services/database';

const $q = useQuasar();
const drawerStore = useDrawerStore();
const routerStore = useRouterStore();
const cognitoUserStore = useCognitoUserStore();
const geoLocationStore = useGeoLocationStore();
const { menuOpen, helpOpen } = storeToRefs(drawerStore);

const version = packageJson.version;
const { hasAdminRights, isSuperAdmin } = storeToRefs(cognitoUserStore);
const expanded = reactive({
    Templates: false,
    Management: false,
    Account: false,
    Deployments: false,
    Support: false,
});

const menuSection = computed(() => {
    return routerStore.routerMeta.menuSection;
});
const subSection = computed(() => {
    return routerStore.routerMeta.subSection;
});

const showTerms = () => {
    drawerStore.hideBoth();
    $q.dialog({
        component: GDPRdialog,
        componentProps: {
            hideCancel: true,
        },
    }).onOk(async () => {
        $q.localStorage.set('cookiesApproved', true);
    });
};

const hideDrawer = (ev?: Event) => {
    if (!ev || !ev.defaultPrevented) {
        drawerStore.hideBoth();
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
const setHelp = (show: boolean) => {
    if (show) {
        drawerStore.showHelp();
    } else {
        drawerStore.hideHelp();
    }
};
const userSignOut = async () => {
    //await clearOfflineDb();

    await signOut();
};

onMounted(async () => {
    console.debug('UserLayout mounted');

    try {
        await geoLocationStore.start();
    } catch (e) {
        logger.warn($q, 'Failed to init geo location', e);
    }

    const ms = menuSection.value;

    if (ms === 'Templates') expanded.Templates = true;
    else if (ms === 'Management') expanded.Management = true;
    else if (ms === 'Account') expanded.Account = true;
    else if (ms === 'Support') expanded.Support = true;
    else if (ms === 'Deployments') expanded.Deployments = true;

    // await startMemoryEngines();
    // await until(isOfflineInitialized).toBe(true);

    if (!isSuperAdmin.value) {
        try {
            // void initMessaging($q).catch((e) => {
            //     logger.warn($q, 'Failed to init messaging', e);
            // });
        } catch (e) {
            logger.warn($q, 'Failed to init messaging', e);
        }
    }

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
        await clientDb.start();
    } catch (error) {
        console.error('Failed to start database connection:', error);
        $q.notify({
            type: 'negative',
            message: 'Failed to start database connection',
        });
    }
});

onUnmounted(() => {
    console.debug('UserLayout unmounted');
    try {
        clientDb.stop();
    } catch (error) {
        console.error('Failed to stop database connection:', error);
        $q.notify({
            type: 'negative',
            message: 'Failed to stop database connection',
        });
    }
    geoLocationStore.stop();
});
</script>

<style lang="scss" scoped>
.user-layout {
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
            color: $active-color !important;

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
