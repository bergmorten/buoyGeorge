<template>
    <q-dialog
        id="editFleetUsersDialog"
        ref="dialogRef"
        class="q-electron-drag--exception"
        persistent
        @hide="onDialogHide"
        :seamless="backdropVisible"
    >
        <q-card class="q-dialog-plugin editFleetUsers-Dialog column no-wrap">
            <dialog-header
                class="col-auto"
                title="User memberships for fleet"
                :subtitle="fleet.name"
                :tooltip="fleet.id"
            />
            <q-card-section class="q-mt-none col column">
                <q-table
                    :selected="selected"
                    flat
                    bordered
                    :rows="users"
                    :columns="columns"
                    :loading="working"
                    row-key="id"
                    selection="multiple"
                    virtual-scroll
                    class="col scroll-table"
                    :rows-per-page-options="[0]"
                    :pagination="{
                        sortBy: 'name',
                        descending: false,
                        rowsPerPage: 0,
                    }"
                    @selection="updateFleetUsers"
                    hide-bottom
                    hide-selected-banner
                    hide-no-data
                    hide-pagination
                >
                    <template #header-selection> </template>
                    <template #body-selection="scope">
                        <q-checkbox
                            v-model="scope.selected"
                            :disable="working"
                        />
                    </template>
                    <template #body-cell-avatar="cellProps">
                        <q-td :props="cellProps">
                            <div>
                                <avataaar-image
                                    :config="cellProps.row.avatarHash"
                                />
                            </div>
                        </q-td>
                    </template>
                </q-table>
            </q-card-section>
            <q-separator />
            <q-card-actions align="right">
                <n-btn v-close-popup label="Close" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { clientDb } from 'client/services/database';
import type { User } from 'client/services/database/users';
import type { Fleet } from 'client/services/database/fleets';
import {
    computed,
    ref,
    inject,
    onMounted,
    onUnmounted,
    getCurrentInstance,
} from 'vue';
import type { QTableProps } from 'quasar';
import { useDialogPluginComponent, useQuasar } from 'quasar';
import { logger } from 'cmn/lib/logger';
import AvataaarImage from 'cmn/components/Avataaars/avataaarImage.vue';
import FleetUserHelp from './FleetUserHelp.vue';
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

const { dialogRef, onDialogHide } = useDialogPluginComponent();
const backdropVisible = inject<boolean>('backdropVisible');
const $q = useQuasar();

const working = ref(false);

const columns: QTableProps['columns'] = [
    {
        name: 'avatar',
        label: '',
        field: 'avatarHash',
        sortable: false,
        align: 'center',
    },
    {
        name: 'name',
        align: 'left',
        label: 'User name',
        field: 'fullName',
        sortable: true,
    },
];

const fleetUsers = computed(() => {
    return Array.from(clientDb.userFleets.values()).filter(
        (el) => el.fleetId === props.fleet.id,
    );
});

const users = clientDb.usersArray;
const selected = computed(() => {
    return Array.from(users.value).filter((el) =>
        fleetUsers.value.some((fu) => fu.userId === el.id),
    );
});

const updateFleetUsers = async (selection: {
    rows: readonly User[];
    keys: readonly string[];
    added: boolean;
}) => {
    if (!props.fleet) return;
    if (!selection) return;
    const fleet = props.fleet;
    working.value = true;

    if (selection.added) {
        for (const user of selection.rows) {
            try {
                await clientDb.userFleet.add({
                    fleetId: fleet.id,
                    userId: user.id,
                });
            } catch (err) {
                logger.error($q, 'Could not add user to fleet', err);
            }
        }
    } else {
        for (const user of selection.rows) {
            try {
                const fleetUser = fleetUsers.value.find(
                    (el) => el.userId === user.id,
                );
                if (fleetUser) await clientDb.userFleet.remove(fleetUser.id);
            } catch (err) {
                logger.error($q, 'Could not remove user from fleet', err);
            }
        }
    }

    working.value = false;
};

onMounted(() => {
    const myName = getCurrentInstance()?.type.__name;

    if (myName)
        helpStore.addHelp({
            name: myName,
            type: 'dialog',
            helpPage: FleetUserHelp,
        });
});
onUnmounted(() => {
    const myName = getCurrentInstance()?.type.__name;
    if (myName) helpStore.removeHelp(myName);
});
</script>

<style lang="scss" scoped>
.editFleetUsers-Dialog {
    width: 500px;
    max-width: 95vw;
    height: 700px;
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

    .profile-image {
        margin: 0;
        width: 75%;
        max-width: 200px;
    }
}
</style>
