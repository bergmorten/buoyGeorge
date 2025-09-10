<template>
    <div class="column">
        <div class="column">
            <div class="row text-caption">Wave GNSS Options</div>
            <div class="row q-gutter-x-sm">
                <q-input
                    v-model="state.waveGnssInterval"
                    dense
                    outlined
                    label="Interval (min)"
                    class="col"
                />
                <q-input
                    v-model="state.waveGnssSamplingLength"
                    dense
                    outlined
                    label="Sampling Duration (s)"
                    class="col"
                />
            </div>
        </div>
        <div class="column q-mt-sm">
            <div class="row text-caption">Acoustic Current Profiler</div>
            <div class="row q-gutter-x-sm">
                <q-input
                    v-model="state.dopplerInterval"
                    dense
                    outlined
                    label="Interval (min)"
                    class="col"
                />

                <q-input
                    v-model="state.dopplerDepth"
                    dense
                    outlined
                    label="Max depth (m)"
                    class="col"
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
                <q-input
                    v-model="state.cloudReportInterval"
                    dense
                    outlined
                    label="Interval (min)"
                    class="col"
                />

                <div class="col">
                    <slot></slot>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { reactive } from 'vue';

const additionalReports = [
    {
        label: 'Weather forecast',
        fullLabel:
            'Weather forecast - Measure when high wind or waves are expected',
        value: 'weather_forecast',
    },
    {
        label: 'High tide',
        fullLabel: 'High tide - Measure when tide is at its highest',
        value: 'high_tide',
    },
    {
        label: 'Low tide',
        fullLabel: 'Low tide - Measure when tide is at its lowest',
        value: 'low_tide',
    },
    {
        label: 'Flood tide',
        fullLabel: 'Flood tide - When tide currents are on the strongest',
        value: 'flood_tide',
    },
    {
        label: 'Freak wave',
        fullLabel: 'Freak wave - A anomaly large wave detected',
        value: 'freak_wave',
    },
    {
        label: 'Sentry',
        fullLabel: 'Sentry - Waves caused by boat traffic',
        value: 'sentry',
    },
] as const;
type AdditionalReport = (typeof additionalReports)[number];
const state = reactive({
    waveGnssInterval: 30 as number | null,
    waveGnssSamplingLength: 20 as number | null,
    dopplerInterval: 15 as number | null,
    dopplerDepth: 50 as number | null,
    acpMaxDepth: 50 as number | null,
    additionalReports: null as AdditionalReport[] | null,
    cloudReportInterval: 60 as number | null,
});
</script>
