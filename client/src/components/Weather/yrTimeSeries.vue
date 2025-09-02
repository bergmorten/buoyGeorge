<template>
    <div v-if="values" class="col column">
        <div class="text-bold">{{ values.when }}</div>
        <div class="row">
            <div class="col-auto label">Temperature:</div>
            <div class="col q-ml-md value">{{ values.temperature }}</div>
        </div>
        <div class="row">
            <div class="col-auto label">Wind direction:</div>
            <div class="col q-ml-md value">{{ values.windDirection }}</div>
        </div>
        <div class="row">
            <div class="col-auto label">Wind speed:</div>
            <div class="col q-ml-md value">{{ values.windSpeed }}</div>
        </div>
        <div class="row">
            <div class="col-auto label">Wind gust:</div>
            <div class="col q-ml-md value">{{ values.windGust }}</div>
        </div>
        <div class="row">
            <div class="col-auto label">Air pressure:</div>
            <div class="col q-ml-md value">{{ values.airPressure }}</div>
        </div>
        <div class="row">
            <div class="col-auto label">Fog area fraction:</div>
            <div class="col q-ml-md value">{{ values.fogFraction }}</div>
        </div>
        <div class="row">
            <div class="col-auto label">Cloud coverage:</div>
            <div class="col q-ml-md value">{{ values.cloudCover }}</div>
        </div>
        <div class="row">
            <div class="col-auto label">precipitation:</div>
            <div class="col q-ml-md value">{{ values.precipitation }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { MinimalTimeStep } from 'client/services/yr/def/models/METJSONMinimal';
import { computed } from 'vue';
import { useUnitStore } from 'client/stores/units';

const props = defineProps<{
    timeSeries: MinimalTimeStep;
}>();

const useUnits = useUnitStore();

const convertTimeSeries = (step: MinimalTimeStep) => {
    const time = new Date(step.time).toLocaleString();

    return {
        when: time,
        temperature: step.temp ? useUnits.stringTemperature(step.temp) : '-',
        windDirection: step.wdir ? `${step.wdir} deg` : '-',
        windSpeed: step.wspeed ? `${step.wspeed} m/s` : '-',
        windGust: step.wgust ? `${step.wgust} m/s` : '-',
        fogFraction: step.fog ? `${step.fog} %` : '-',
        airPressure: step.press ? `${step.press} mbar` : '-',
        cloudCover: step.cloud ? `${step.cloud} %` : '-',
        precipitation: step.rain ? `${step.rain} mm` : '-',
    };
};

const values = computed(() => {
    const timeSeries = props.timeSeries;
    if (!timeSeries) return null;
    return convertTimeSeries(timeSeries);
});
</script>

<style lang="scss" scoped></style>
