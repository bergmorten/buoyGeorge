<template>
    <q-dialog
        ref="dialogRef"
        class="q-electron-drag--exception"
        @hide="onDialogHide"
        :seamless="backdropVisible"
    >
        <q-card class="q-dialog-plugin new-deployment-dialog column">
            <dialog-header class="col-auto" title="New Deployment" />
            <q-card-section class="col scroll" style="max-width: 100%">
                {{ optionsOk }}
                <q-stepper
                    v-model="step"
                    flat
                    dense
                    vertical
                    header-nav
                    color="primary"
                    animated
                    class="q-ma-none q-pa-none"
                >
                    <q-step
                        :name="1"
                        title="Select Fleet"
                        icon="apps"
                        done-color="positive"
                        :done="fleetOk"
                        :header-nav="fleetOk"
                    >
                        <div>
                            First you select a fleet to deploy to, next you have
                            the options to select all or individual producers of
                            this fleet. Deployment options could be common to
                            all or individual and finally you can review your
                            deployment before launching it.
                        </div>
                        <q-select
                            filled
                            v-model="selectedFleet"
                            label="Select a fleet"
                            :options="selectFleets"
                            use-input
                            input-debounce="0"
                            @filter="filterFleet"
                            clearable
                            class="select-btn"
                        >
                            <template #no-option>
                                <q-item>
                                    <q-item-section class="text-grey">
                                        No results
                                    </q-item-section>
                                </q-item>
                            </template>
                            <template #option="{ itemProps, opt }">
                                <q-item v-bind="itemProps">
                                    <q-item-section>
                                        {{ opt.label }}
                                    </q-item-section>
                                    <q-item-section side>
                                        <q-badge
                                            v-if="!opt.active"
                                            rounded
                                            color="positive"
                                            label="Ready"
                                        />
                                        <q-badge
                                            v-else
                                            rounded
                                            color="warning"
                                            label="Active"
                                        />
                                    </q-item-section>
                                </q-item>
                            </template>
                        </q-select>
                        <q-stepper-navigation>
                            <q-btn
                                @click="confirmFleet"
                                color="primary"
                                label="Next"
                                :disabled="!selectedFleet"
                            />
                        </q-stepper-navigation>
                    </q-step>

                    <q-step
                        :name="2"
                        title="Select producers"
                        icon="factory"
                        done-color="positive"
                        :done="producersOk"
                        :header-nav="fleetOk || producersOk"
                    >
                        <q-select
                            filled
                            v-model="selectedProducers"
                            label="Filter Producers"
                            :options="selectProducers"
                            multiple
                            use-input
                            input-debounce="0"
                            @filter="filterProducer"
                            counter
                            clearable
                            hint="Selected"
                            class="select-btn"
                        >
                            <template #no-option>
                                <q-item>
                                    <q-item-section class="text-grey">
                                        No results
                                    </q-item-section>
                                </q-item>
                            </template>
                            <template
                                #option="{
                                    itemProps,
                                    opt,
                                    selected,
                                    toggleOption,
                                }"
                            >
                                <q-item v-bind="itemProps">
                                    <q-item-section>
                                        {{ opt.label }}
                                    </q-item-section>
                                    <q-item-section side>
                                        <q-badge
                                            v-if="!opt.active"
                                            rounded
                                            color="positive"
                                            label="Ready"
                                        />
                                        <q-badge
                                            v-else
                                            rounded
                                            color="warning"
                                            label="Active"
                                        />
                                    </q-item-section>
                                    <q-item-section side>
                                        <q-toggle
                                            :model-value="selected"
                                            @update:model-value="
                                                toggleOption(opt)
                                            "
                                        />
                                    </q-item-section>
                                </q-item>
                            </template>
                        </q-select>

                        <q-stepper-navigation>
                            <q-btn
                                @click="step = 3"
                                color="primary"
                                label="Next"
                                :disabled="
                                    !selectedProducers ||
                                    !selectedProducers.length
                                "
                            />
                            <q-btn
                                flat
                                @click="step = 1"
                                color="primary"
                                label="Back"
                                class="q-ml-sm"
                            />
                        </q-stepper-navigation>
                    </q-step>

                    <q-step
                        :name="3"
                        title="Set deployment options"
                        icon="assignment"
                        done-color="positive"
                        :done="optionsOk"
                        :header-nav="optionsOk"
                        class="column items-stretch"
                    >
                        <deployment-config
                            :config="config"
                            style="width: 100%; max-width: 100%"
                            @is-valid="
                                (valid) => {
                                    configValid = valid;
                                }
                            "
                        />
                        <q-separator class="q-my-md" />
                        <q-btn-dropdown
                            color="secondary"
                            label="Individual Producers Configuration"
                            style="width: 100%; max-width: 100%"
                        >
                            <q-list>
                                <q-item
                                    v-for="selectedProducer in selectedProducers"
                                    :key="selectedProducer.id"
                                    clickable
                                    v-ripple
                                >
                                    <q-item-section>
                                        <q-item-label>
                                            {{ selectedProducer.label }}
                                        </q-item-label>
                                    </q-item-section>
                                </q-item>
                            </q-list>
                        </q-btn-dropdown>

                        <q-stepper-navigation>
                            <q-btn
                                @click="
                                    completedAllSteps = true;
                                    step = 4;
                                "
                                color="primary"
                                label="Next"
                            />
                            <q-btn
                                flat
                                @click="step = 2"
                                color="primary"
                                label="Back"
                                class="q-ml-sm"
                            />
                        </q-stepper-navigation>
                    </q-step>

                    <q-step
                        :name="4"
                        title="Review and Start Time"
                        icon="rocket_launch"
                        done-color="positive"
                        :done="deployOk"
                        :header-nav="deployOk"
                    >
                        <div>
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit, sed do eiusmod tempor incididunt ut labore et
                            dolore magna aliqua. Ut enim ad minim veniam, quis
                            nostrud exercitation ullamco laboris nisi ut aliquip
                            ex ea commodo consequat.
                        </div>
                        <q-select
                            v-model="deployWhen"
                            dense
                            outlined
                            label="Start deployment when"
                            class="col q-mt-sm"
                            style="max-width: 100%"
                            :options="deployWhenOptions"
                        >
                            <template #option="{ itemProps, opt }">
                                <q-item v-bind="itemProps">
                                    <q-item-section>
                                        {{ opt.fullLabel }}
                                    </q-item-section>
                                </q-item>
                            </template>
                        </q-select>
                    </q-step>
                </q-stepper>
            </q-card-section>
            <q-separator inset />
            <q-card-actions align="right">
                <n-btn v-close-popup label="Cancel" />
                <n-btn flat @click="reset" color="primary" label="Reset" />
                <n-btn
                    active
                    v-close-popup
                    :disabled="!deployOk"
                    icon="rocket_launch"
                    label="Deploy"
                />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import {
    inject,
    getCurrentInstance,
    onMounted,
    onUnmounted,
    ref,
    computed,
    watch,
} from 'vue';
import { useDialogPluginComponent, useQuasar } from 'quasar';
import NewDeploymentHelp from './NewDeploymentHelp.vue';
import { useHelpStore } from 'cmn/stores/help';
import { logger } from 'cmn/lib/logger';
import { clientDb } from 'client/services/database';
import DeploymentConfig from './components/DeploymentOptions.vue';
import type { DeploymentOptions } from './components/constants';
interface SelectOption {
    label: string;
    id: string;
    active: boolean;
}
const $q = useQuasar();
const helpStore = useHelpStore();

const config = ref<DeploymentOptions | null>(null);
const configValid = ref(false);
const deployWhenOptions = [
    {
        label: 'Deploy now',
        fullLabel:
            'Deploy now - The configuration will load and start when they power on',
        value: 'deploy_now',
    },
    {
        label: 'Inserted in water',
        fullLabel:
            'Inserted in water - The configuration will load and start when they are submerged',
        value: 'inserted_in_water',
    },
    {
        label: 'At specific time',
        fullLabel:
            'At specific time - The configuration will load and start at a specific time',
        value: 'at_specific_time',
    },
] as const;

type DeployWhen = (typeof deployWhenOptions)[number];

//TODO MAKE SOMETHING LIKE THIS
// https://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/highcharts/demo/combo-meteogram
const backdropVisible = inject<boolean>('backdropVisible');

const { fleetArray, producerArray } = clientDb;

defineEmits([
    // REQUIRED; need to specify some events that your
    // component will emit through useDialogPluginComponent()
    ...useDialogPluginComponent.emits,
]);
const { dialogRef, onDialogHide } = useDialogPluginComponent();
const step = ref(1);
const completedAllSteps = ref(false);
const fleetNeedle = ref<string | null>(null);
const deployWhen = ref<DeployWhen>(deployWhenOptions[0]);
const producerNeedle = ref<string | null>(null);
const filterFleet = (val: string, update: (callbackFn: () => void) => void) => {
    update(() => {
        fleetNeedle.value = val ? val.trim().toLowerCase() : null;
    });
};
const filterProducer = (
    val: string,
    update: (callbackFn: () => void) => void,
) => {
    update(() => {
        producerNeedle.value = val ? val.trim().toLowerCase() : null;
    });
};
const selectedFleet = ref<SelectOption | null>(null);
const selectFleets = computed<SelectOption[]>(() => {
    return fleetArray.value.map((f) => ({
        label: f.name,
        id: f.id,
        active: Math.random() < 0.5,
    }));
});
const selectedProducers = ref<SelectOption[] | null>(null);
const selectProducers = computed<SelectOption[]>(() => {
    const fleet = selectedFleet.value;
    if (!fleet) return [];
    return producerArray.value
        .filter((p) => p.fleetId === fleet.id)
        .map((p) => ({
            label: p.name,
            id: p.id,
            active: Math.random() < 0.5,
        }));
});
const fleetOk = computed(() => {
    return selectedFleet.value !== null;
});
const producersOk = computed(() => {
    return (
        selectedProducers.value !== null && selectedProducers.value.length > 0
    );
});
const optionsOk = computed(() => {
    return configValid.value;
});
const deployOk = computed(() => {
    return (
        completedAllSteps.value &&
        optionsOk.value &&
        producersOk.value &&
        fleetOk.value
    );
});

const reset = () => {
    step.value = 1;
    fleetNeedle.value = null;
    producerNeedle.value = null;
    selectedFleet.value = null;
    selectedProducers.value = null;
};

const confirmFleet = () => {
    if (!selectedFleet.value) return;
    if (selectedFleet.value.active === false) {
        step.value = 2;
        return;
    } else {
        $q.dialog({
            title: 'Active Fleet',
            message: `The selected fleet is currently active. Are you sure you want to proceed?
                You may want to select individual producers instead of all, and can choose to keep existing settings in the next steps.`,
            cancel: true,
            persistent: true,
        })
            .onOk(() => {
                step.value = 2;
            })
            .onCancel(() => {
                // User cancelled, do nothing
            });
    }
};
onMounted(() => {
    try {
        const myName = getCurrentInstance()?.type.__name;

        if (myName)
            helpStore.addHelp({
                name: myName,
                type: 'dialog',
                helpPage: NewDeploymentHelp,
            });
    } catch (e) {
        logger.error($q, 'Error occurred while mounting FleetManagement:', e);
    }
});
onUnmounted(() => {
    const myName = getCurrentInstance()?.type.__name;
    if (myName) helpStore.removeHelp(myName);
});
watch(selectedFleet, (newFleet, oldFleet) => {
    if (!newFleet) {
        selectedProducers.value = null;
        return;
    }
    if (newFleet.id === oldFleet?.id) return;
    if (newFleet.active === false) {
        selectProducers.value.forEach((p) => {
            if (!selectedProducers.value) selectedProducers.value = [p];
            else if (!selectedProducers.value.find((sp) => sp.id === p.id))
                selectedProducers.value.push(p);
        });
        return;
    }
    selectProducers.value.forEach((p) => {
        if (p.active === true) return;
        if (!selectedProducers.value) selectedProducers.value = [p];
        else if (!selectedProducers.value.find((sp) => sp.id === p.id))
            selectedProducers.value.push(p);
    });
});
</script>

<style lang="scss" scoped>
.new-deployment-dialog {
    height: calc(100vh - 140px);
    width: 800px;
    max-width: 90vw;

    .select-btn {
        width: 100%;
        max-width: 100%;
    }
}
</style>
