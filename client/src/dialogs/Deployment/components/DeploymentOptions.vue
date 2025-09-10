<template>
    <div class="column" style="max-width: 100%">
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
        <div class="column q-mt-md">
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
        <div class="column q-mt-md" style="max-width: 100%">
            <div class="row text-caption">Additional Reports</div>
            <div class="row q-gutter-x-sm" style="max-width: 100%">
                <q-select
                    v-model="state.additionalReports"
                    dense
                    outlined
                    label="Measure and report at these conditions"
                    class="col"
                    multiple
                    clearable
                    style="max-width: 100%"
                    :options="[
                        {
                            label: 'Freak wave - A anomaly wave detected',
                            value: 'freak_wave',
                        },
                        {
                            label: 'Sentry - Waves caused by boat traffic',
                            value: 'sentry',
                        },
                        {
                            label: 'High tide - Measure when tide is at its highest',
                            value: 'high_tide',
                        },
                        {
                            label: 'Low tide - Measure when tide is at its lowest',
                            value: 'low_tide',
                        },
                        {
                            label: 'Flood tide - When tide currents are on the strongest',
                            value: 'flood_tide',
                        },
                    ]"
                />
            </div>
        </div>
        <div class="column q-mt-md">
            <div class="row text-caption">Cloud Report Interval</div>
            <div class="row q-gutter-x-sm">
                <q-input
                    v-model="state.cloudReportInterval"
                    dense
                    outlined
                    label="Interval (min)"
                    class="col-6 q-pr-sm"
                />
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { reactive } from 'vue';

const state = reactive({
    waveGnssInterval: 30 as number | null,
    waveGnssSamplingLength: 20 as number | null,
    dopplerInterval: 15 as number | null,
    dopplerDepth: 50 as number | null,
    acpMaxDepth: 50 as number | null,
    additionalReports: null as string[] | null,
    cloudReportInterval: 60 as number | null,
});
</script>
