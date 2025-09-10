<template>
    <q-form ref="configForm" class="column" greedy>
        <div class="column">
            <div class="row text-caption">Wave GNSS Options</div>
            <div class="row q-gutter-x-sm">
                <q-select
                    :options="gnssInterval"
                    v-model="state.waveGnssInterval"
                    dense
                    outlined
                    label="Interval between sampling periods"
                    class="col"
                    map-options
                    emit-value
                />
                <q-select
                    :options="gnssDuration"
                    v-model="state.waveGnssSamplingLength"
                    dense
                    outlined
                    label="Sampling Duration"
                    class="col"
                    map-options
                    emit-value
                />
            </div>
        </div>
        <div class="column q-mt-sm">
            <div class="row text-caption">Acoustic Current Profiler</div>
            <div class="row q-gutter-x-sm">
                <q-select
                    :options="dopplerInterval"
                    v-model="state.dopplerInterval"
                    dense
                    outlined
                    label="Interval between sampling periods"
                    class="col"
                    map-options
                    emit-value
                />

                <q-select
                    :options="dopplerDepth"
                    v-model="state.dopplerDepth"
                    dense
                    outlined
                    label="Max depth to record currents"
                    class="col"
                    map-options
                    emit-value
                />
            </div>
        </div>
        <div class="column q-mt-sm" style="max-width: 100%">
            <div class="row text-caption">Additional Reports</div>
            <div class="row" style="max-width: 100%">
                <q-select
                    v-model="state.additionalReports"
                    dense
                    outlined
                    label="Measure and report at these conditions"
                    class="col"
                    multiple
                    clearable
                    style="max-width: 100%"
                    :options="additionalReports"
                >
                    <template
                        #option="{ itemProps, opt, selected, toggleOption }"
                    >
                        <q-item v-bind="itemProps">
                            <q-item-section>
                                {{ opt.fullLabel }}
                            </q-item-section>

                            <q-item-section side>
                                <q-toggle
                                    :model-value="selected"
                                    @update:model-value="toggleOption(opt)"
                                />
                            </q-item-section>
                        </q-item>
                    </template>
                </q-select>
            </div>
        </div>
        <div class="column q-mt-sm">
            <div class="row text-caption">Cloud Report Interval</div>
            <div class="row q-gutter-x-sm">
                <q-select
                    :options="cloudReportInterval"
                    v-model="state.cloudReportInterval"
                    dense
                    outlined
                    label="Interval between sending reports to the cloud"
                    class="col"
                    :rules="[
                        (val) =>
                            val !== null && val >= 5
                                ? true
                                : 'Interval must be at least 5 minutes',
                        (val) =>
                            val !== null && val <= 2880
                                ? true
                                : 'Interval must be at most 48 hours',
                        (val) =>
                            state.waveGnssInterval === null ||
                            (val !== null && val >= state.waveGnssInterval)
                                ? true
                                : 'Interval must be at least the GNSS interval',
                        (val) =>
                            state.dopplerInterval === null ||
                            (val !== null && val >= state.dopplerInterval)
                                ? true
                                : 'Interval must be at least 5 minutes greater than the Acoustic interval',
                    ]"
                    map-options
                    emit-value
                />

                <div class="col">
                    <slot></slot>
                </div>
            </div>
        </div>
    </q-form>
</template>
<script lang="ts" setup>
import { reactive, useTemplateRef, watch, ref, onMounted } from 'vue';
import type { DeploymentOptions } from './constants';
import {
    gnssDuration,
    gnssInterval,
    dopplerDepth,
    dopplerInterval,
    cloudReportInterval,
    additionalReports,
    defaultSettings,
} from './constants';
import type { QForm } from 'quasar';

const props = defineProps<{
    config?: DeploymentOptions;
}>();

const emit = defineEmits<{
    (e: 'update:config', value: DeploymentOptions): void;
}>();

const configForm = useTemplateRef<QForm>('configForm');
const isValid = ref(false);
const state = reactive<DeploymentOptions>({ ...defaultSettings });

watch(
    () => state,
    async () => {
        const result = (await configForm.value?.validate()) ?? false;
        isValid.value = result;
        if (result) {
            emit('update:config', { ...state });
        }
    },
    { deep: true },
);

onMounted(() => {
    if (props.config) {
        Object.assign(state, props.config);
    }
});
defineExpose({
    isValid,
});
</script>
