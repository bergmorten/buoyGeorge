<template>
    <q-dialog
        id="editUserFleetsDialog"
        ref="dialogRef"
        class="q-electron-drag--exception"
        persistent
        @hide="onDialogHide"
        :seamless="backdropVisible"
    >
        <q-card class="q-dialog-plugin editUserFleets-Dialog column no-wrap">
            <dialog-header
                class="col-auto"
                title="Fleets memberships for user"
                :subtitle="user.fullName"
                :tooltip="user.id"
            />
            <q-card-section class="q-mt-none col scroll column">
                <q-table
                    :selected="selected"
                    flat
                    bordered
                    :rows="fleets"
                    :columns="columns"
                    :loading="working"
                    row-key="id"
                    selection="multiple"
                    class="col"
                    :rows-per-page-options="[0]"
                    :pagination="{
                        sortBy: 'name',
                        descending: false,
                        rowsPerPage: 0,
                    }"
                    @selection="updateUserFleets"
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
import { db } from 'client/services/database';
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
import UserFleetHelp from './UserFleetHelp.vue';
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

const { dialogRef, onDialogHide } = useDialogPluginComponent();

const $q = useQuasar();
const working = ref(false);
const backdropVisible = inject<boolean>('backdropVisible');
const columns: QTableProps['columns'] = [
    {
        name: 'name',
        align: 'left',
        label: 'Fleet name',
        field: 'name',
        sortable: true,
    },
];

const fleetUsers = computed(() => {
    return Array.from(db.userFleets.values()).filter(
        (el) => el.userId === props.user.id,
    );
});

const fleets = computed(() => {
    return Array.from(db.fleets.values());
});

const selected = computed(() => {
    return Array.from(fleets.value).filter((el) =>
        fleetUsers.value.some((fu) => fu.fleetId === el.id),
    );
});

const updateUserFleets = async (selection: {
    rows: readonly Fleet[];
    keys: readonly string[];
    added: boolean;
}) => {
    if (!props.user) return;
    if (!selection) return;
    const user = props.user;
    working.value = true;

    if (selection.added) {
        for (const fleet of selection.rows) {
            try {
                await db.userFleet.add({
                    fleetId: fleet.id,
                    userId: user.id,
                });
            } catch (err) {
                logger.error($q, 'Could not add user to fleet', err);
            }
        }
    } else {
        for (const fleet of selection.rows) {
            try {
                const fleetUser = fleetUsers.value.find(
                    (el) => el.fleetId === fleet.id,
                );
                if (fleetUser) await db.userFleet.remove(fleetUser.id);
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
            helpPage: UserFleetHelp,
        });
});
onUnmounted(() => {
    const myName = getCurrentInstance()?.type.__name;
    if (myName) helpStore.removeHelp(myName);
});
</script>

<style lang="scss" scoped>
.editUserFleets-Dialog {
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
