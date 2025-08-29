<template>
    <q-toolbar class="topbar q-electron-drag">
        <n-btn
            flat
            menu
            dense
            icon="menu"
            aria-label="Menu"
            class="topbar-btn"
            @click="toggleDrawer"
        />
        <q-toolbar-title shrink class="gt-sm txt-title">
            Nortek Group {{ routerStore.routerMeta.subSection }}
        </q-toolbar-title>
        <status-radio
            :checked="isConnected"
            :color="isConnected ? 'green' : 'negative'"
        >
            <q-tooltip> {{ isConnected ? 'Online' : 'Offline' }} </q-tooltip>
            <div class="lt-sm q-pl-sm">
                {{ isConnected ? 'Online' : 'Offline' }}
            </div>
        </status-radio>

        <q-space />

        <q-separator vertical class="gt-sm q-mx-sm" />

        <n-btn
            v-if="isPage"
            dense
            icon="help"
            aria-label="Menu"
            :active="helpOpen"
            class="topbar-btn"
            @click="drawerStore.toggleHelp()"
        />
        <!-- <template v-if="isElectron">
            <n-btn dense flat icon="minimize" @click="minimize" />
            <n-btn dense flat icon="crop_square" @click="toggleWindow" />
            <n-btn dense flat icon="close" class="q-mr-sm" @click="close" />
        </template> -->
    </q-toolbar>
</template>

<script setup lang="ts">
import { watch } from 'vue';
//import { isConnected } from '@/lib/graphQL/lib/subscription';
//import { useAlerts } from '@/lib/alerts';
import { useDrawerStore } from 'cmn/stores/drawer';
import { useRouterStore } from 'cmn/stores/route';
//import { useElectron } from '@hefring/commons/electron';
import { useQuasar } from 'quasar';
//import AlertCenter from '@/components/AlertCenter/alertCenter.vue';
import StatusRadio from 'cmn/components/Status/StatusRadio.vue';
import { storeToRefs } from 'pinia';
import { db } from 'client/services/database';
import { useHelpStore } from 'cmn/stores/help';
const helpStore = useHelpStore();
//import ControlBar from '../ControlBar/controlBar.vue';

const $q = useQuasar();
const drawerStore = useDrawerStore();
const routerStore = useRouterStore();

const { isPage } = storeToRefs(helpStore);
const { helpOpen } = storeToRefs(drawerStore);
//const isElectron = $q.platform.is.electron ? true : false;

const { isConnected } = db;
//const { minimize, toggle: toggleWindow, close: windowClose } = useElectron();

// const { highestAlertValue: alertLevel } = useAlerts();

const toggleDrawer = (ev: Event) => {
    ev.preventDefault();
    drawerStore.toggle();
};

let activeOnlineNotification: undefined | ReturnType<typeof $q.notify>;

watch(isConnected, (now) => {
    if (now === false) {
        console.warn($q, 'Lost connection to cloud');
        if (activeOnlineNotification) activeOnlineNotification();
        activeOnlineNotification = $q.notify({
            type: 'negative',
            message: 'Lost connection to cloud',
            position: 'center',
            timeout: 0,
            actions: [
                {
                    label: 'Dismiss',
                    color: 'white',
                    handler: () => {
                        /* ... */
                    },
                },
            ],
        });
    } else {
        console.warn('Connection to cloud restored');
        if (activeOnlineNotification) activeOnlineNotification();
        activeOnlineNotification = $q.notify({
            type: 'positive',
            message: 'Connection to cloud restored',
        });
    }
});
</script>

<style lang="scss">
.topbar {
    height: 58px;
    background-color: var(--container-global-color);
    color: var(--element-neutral-color);
    border-bottom: 2px solid var(--border-outline-color);
    .topbar-btn {
        background-color: var(--container-global-color);
        color: var(--element-neutral-color);
    }
    .q-separator--vertical {
        width: 2px;
    }
    .topbar-alerts {
        &.alarm {
            background: var(--alert-alarm-color);
            color: var(--on-running-active-color);
        }
        &.caution {
            background: var(--alert-caution-color);
            color: var(--on-running-active-color);
        }
        &.warning {
            background: var(--alert-warning-color) !important;
            color: var(--on-running-active-color) !important;
        }
        &.running {
            background: var(--alert-running-color);
            color: var(--on-running-active-color);
        }
    }
}
</style>
