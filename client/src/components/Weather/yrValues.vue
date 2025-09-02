<template>
    <div class="fit column">
        <div class="col row bordered">
            <time-series v-if="instant" :time-series="instant" class="col" />
            <time-series v-if="next" :time-series="next" class="col" />
        </div>

        <div class="row q-gutter-x-sm col-auto text-caption">
            <div>
                Recorded Latitude:
                {{ useUnits.stringLocation(true, meta.latitude, 4) }}
            </div>
            <div>
                Longitude:
                {{ useUnits.stringLocation(false, meta.longitude, 4) }}
            </div>
            <div>{{ meta.when }} from Yr MET Weather API</div>
        </div>
    </div>
</template>

<script setup lang="ts">
//import ControlBar from '../ControlBar/controlBar.vue';

import type { ForecastMinimal } from 'client/services/yr/def/models/METJSONMinimal';
import { computed } from 'vue';
import TimeSeries from './yrTimeSeries.vue';
import { useUnitStore } from 'client/stores/units';

//import { wait } from '@hefring/commons/timing';
const props = defineProps<{
    forecast: ForecastMinimal;
}>();

const useUnits = useUnitStore();

const meta = computed(() => ({
    latitude: props.forecast.location.latitude,
    longitude: props.forecast.location.longitude,
    when: new Date(props.forecast.updated_at).toLocaleString(),
}));

const instant = computed(() => {
    const timeSeries = props.forecast.timesteps[0];
    if (!timeSeries) return null;
    return timeSeries;
});
const next = computed(() => {
    const timeSeries = props.forecast.timesteps[1];
    if (!timeSeries) return null;
    return timeSeries;
});
</script>

<style lang="scss" scoped></style>
