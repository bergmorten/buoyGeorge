<template>
    <div
        class="q-ml-md weather row q-gutter-x-sm items-center cursor-pointer"
        @click="viewDetails"
    >
        <div>
            <q-img src="weather/clearsky_day.svg" class="weather_icon" />
            <!-- <q-icon name="img:weather/clearsky_day.svg" class="weather_icon" /> -->
        </div>
        <div class="row q-gutter-x-sm items-center gt-sm">
            <div v-if="weather.temperature !== null">
                {{
                    unitStore.convertTemperature(weather.temperature).toFixed(1)
                }}
                {{ temperatureUnit }}
            </div>

            <div v-if="weather.windSpeed !== null">
                <div class="row items-center">
                    <div>
                        {{
                            unitStore.convertSpeed(weather.windSpeed).toFixed(1)
                        }}
                        <span v-if="weather.windGust !== null">
                            (
                            {{
                                unitStore
                                    .convertSpeed(weather.windGust)
                                    .toFixed(1)
                            }}
                            )
                        </span>
                        {{ speedUnit }}
                    </div>
                    <div>
                        <q-icon
                            name="arrow_circle_up"
                            :style="{
                                transform: `rotate(${weather.windDirection} deg)`,
                            }"
                            class="weather_icon"
                        />
                    </div>
                </div>
            </div>
            <div v-if="weather.precipitation !== null">
                {{ unitStore.stringPrecipitation(weather.precipitation) }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { LatLon } from 'client/lib/map';
import { logger } from 'cmn/lib/logger';
import type { METJSONForecast } from 'client/services/yr';
import { yrApi } from 'client/services/yr';
import { reactive, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useUnitStore } from 'client/stores/units';
import YrChartDialog from 'client/dialogs/Yr/yrChart.vue';
import { storeToRefs } from 'pinia';

const props = defineProps<{
    position: LatLon;
}>();
const unitStore = useUnitStore();
const currentPos = ref<LatLon>({ lat: -999, lon: -999 });
const forecast = ref<METJSONForecast | undefined>(undefined);
const $q = useQuasar();
const { temperatureUnit, speedUnit } = storeToRefs(unitStore);

const weather = reactive({
    symbol: 'img:weather/clearsky_day.svg',
    temperature: null as number | null,
    windDirection: null as number | null,
    windSpeed: null as number | null,
    windGust: null as number | null,
    precipitation: null as number | null,
});

const refreshYr = async (latLng: LatLon) => {
    const newForecast = await yrApi.getForecast(latLng.lat, latLng.lon);
    forecast.value = newForecast;
    const summary = yrApi.getSummaryNow(newForecast);
    if (summary) {
        if (summary.next_1_hours) {
            weather.symbol = `img:weather/${summary.next_1_hours.summary.symbol_code}.svg`;
            if (summary.next_1_hours.details.precipitation_amount)
                weather.precipitation =
                    summary.next_1_hours.details.precipitation_amount;
            else weather.precipitation = null;
        } else {
            weather.symbol = 'not_interested';
        }
        if (summary.instant.details) {
            if (summary.instant.details.air_temperature)
                weather.temperature = summary.instant.details.air_temperature;
            else weather.temperature = null;
            if (summary.instant.details.wind_from_direction)
                weather.windDirection =
                    summary.instant.details.wind_from_direction;
            else weather.windDirection = null;
            if (summary.instant.details.wind_speed)
                weather.windSpeed = summary.instant.details.wind_speed;
            else weather.windSpeed = null;
            if (summary.instant.details.wind_speed_of_gust)
                weather.windGust = summary.instant.details.wind_speed_of_gust;
            else weather.windGust = null;
        }
    }
};

watch(
    () => props.position,
    async (newCenter) => {
        const lat = Math.round(newCenter.lat * 10) / 10;
        const lon = Math.round(newCenter.lon * 10) / 10;

        if (currentPos.value.lat !== lat || currentPos.value.lon !== lon) {
            currentPos.value = { lat, lon };
            try {
                await refreshYr(currentPos.value);
            } catch (err) {
                if (navigator.onLine)
                    logger.warn($q, 'Could not refresh weather data', err);
            }
        }
    },
    {
        immediate: true,
    },
);

const viewDetails = () => {
    if (forecast.value)
        $q.dialog({
            component: YrChartDialog,

            componentProps: {
                position: currentPos.value,
            },
        });
};
</script>

<style lang="scss" scoped>
.weather {
    vertical-align: middle;
    height: 50px;
    .weather_icon {
        width: 40px;
        height: 40px;
        font-size: 40px;
        line-height: 40px;
    }
}
</style>
