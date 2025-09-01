<template>
    <q-dialog
        id="editFleetProducersDialog"
        ref="dialogRef"
        class="q-electron-drag--exception"
        persistent
        @hide="onDialogHide"
        :seamless="backdropVisible"
    >
        <q-card
            class="q-dialog-plugin editFleetProducers-Dialog column no-wrap"
        >
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
                    :rows="producers"
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
                    @selection="updateFleetProducers"
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
import type { Producer } from 'client/services/database/producers';
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
import FleetUserHelp from './FleetProducersHelp.vue';
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
        name: 'name',
        align: 'left',
        label: 'Name',
        field: 'name',
        sortable: true,
    },
    {
        name: 'type',
        align: 'left',
        label: 'Type',
        field: 'type',
        sortable: true,
    },
];

const producers = computed(() => {
    const all = clientDb.producerArray.value;
    return Array.from(all.values()).filter((p) => {
        if (!p.fleetId || p.fleetId === props.fleet.id) return true;
        return false;
    });
});
const selected = computed(() => {
    return Array.from(producers.value).filter(
        (p) => p.fleetId === props.fleet.id,
    );
});

const updateFleetProducers = async (selection: {
    rows: readonly Producer[];
    keys: readonly string[];
    added: boolean;
}) => {
    if (!props.fleet) return;
    if (!selection) return;
    const fleet = props.fleet;
    working.value = true;

    if (selection.added) {
        for (const producer of selection.rows) {
            try {
                await clientDb.producer.update({
                    id: producer.id,
                    fleetId: fleet.id,
                });
            } catch (err) {
                logger.error($q, 'Could not add producer to fleet', err);
            }
        }
    } else {
        for (const producer of selection.rows) {
            try {
                await clientDb.producer.update({
                    id: producer.id,
                    fleetId: null,
                });
            } catch (err) {
                logger.error($q, 'Could not remove producer from fleet', err);
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
.editFleetProducers-Dialog {
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
