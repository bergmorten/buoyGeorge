<template>
    <div class="fit column">
        <div ref="mapDiv" class="col container-map">
            <n-btn flat dense round icon="settings" menu class="settings-menu">
                <q-menu>
                    <q-list style="min-width: 100px" class="content">
                        <q-item-label header> Basemap </q-item-label>
                        <!-- <q-item tag="label">
              <q-item-section side top>
                <q-radio v-model="basemap" val="esri" />
              </q-item-section>

              <q-item-section @click="basemap = 'esri'">
                <q-item-label>Esri Ocean map</q-item-label>
                <q-item-label caption>
                  A map with ocean bathymetry
                </q-item-label>
              </q-item-section>
            </q-item> -->
                        <q-item tag="label">
                            <q-item-section side top>
                                <q-radio v-model="basemap" val="emod" />
                            </q-item-section>

                            <q-item-section @click="basemap = 'emod'">
                                <q-item-label>EMODnet Ocean map</q-item-label>
                                <q-item-label caption>
                                    A detailed ocean bathymetry
                                </q-item-label>
                            </q-item-section>
                        </q-item>
                        <q-item tag="label">
                            <q-item-section side top>
                                <q-radio v-model="basemap" val="osm" />
                            </q-item-section>

                            <q-item-section @click="basemap = 'osm'">
                                <q-item-label>Open street map</q-item-label>
                                <q-item-label caption>
                                    A map showing cities and roads
                                </q-item-label>
                            </q-item-section>
                        </q-item>
                        <q-item tag="label">
                            <q-item-section side top>
                                <q-radio v-model="basemap" val="noaa" />
                            </q-item-section>

                            <q-item-section @click="basemap = 'noaa'">
                                <q-item-label>NOAA Chart</q-item-label>
                                <q-item-label caption>
                                    A chart from NOAA with ocean bathymetry
                                </q-item-label>
                            </q-item-section>
                        </q-item>
                        <q-item-label header> Overlays </q-item-label>

                        <q-item tag="label" clickable>
                            <q-item-section side top>
                                <q-checkbox v-model="enNauticalMarkers" />
                            </q-item-section>

                            <q-item-section>
                                <q-item-label>Navigation</q-item-label>
                                <q-item-label caption>
                                    Adds nautical markers
                                </q-item-label>
                            </q-item-section>
                        </q-item>
                        <!-- <q-item tag="label" clickable>
              <q-item-section side top>
                <q-checkbox v-model="enAis" />
              </q-item-section>

              <q-item-section>
                <q-item-label>AIS</q-item-label>
                <q-item-label caption>
                  Shows marin traffic. Extra API billing may occur
                </q-item-label>
              </q-item-section>
            </q-item> -->
                        <q-item v-if="showWeather" tag="label" clickable>
                            <q-item-section side top>
                                <q-checkbox v-model="enWind" />
                            </q-item-section>

                            <q-item-section>
                                <q-item-label>Wind</q-item-label>
                                <q-item-label caption>
                                    Show wind speeds
                                </q-item-label>
                            </q-item-section>
                        </q-item>
                        <q-item v-if="showWeather" tag="label" clickable>
                            <q-item-section side top>
                                <q-checkbox v-model="enPrecipitation" />
                            </q-item-section>

                            <q-item-section>
                                <q-item-label>Precipitation</q-item-label>
                                <q-item-label caption>
                                    Shows precipitation
                                </q-item-label>
                            </q-item-section>
                        </q-item>
                    </q-list>
                </q-menu>
            </n-btn>
            <n-btn
                dense
                round
                unelevated
                icon="architecture"
                class="measuring-tool"
                :class="{ active: measureActive }"
                @click="toggleMeasuringTool"
            />
            <slot />
        </div>
        <slot name="footer" />
    </div>
</template>

<script setup lang="ts">
import type { LatLon, ScaleOptions, UseMap, UseMeasure } from 'client/lib/map';
import { mapLayers, useMap, useMeasure } from 'client/lib/map';
import { logger } from 'cmn/lib/logger';
import type { Coordinate } from 'ol/coordinate';
import type { QMenu } from 'quasar';
import { useQuasar } from 'quasar';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useUnitStore } from 'client/stores/units';
import { useMapStore } from 'client/stores/baseMap';
import { storeToRefs } from 'pinia';

defineProps<{
    showWeather: boolean;
}>();
const emit = defineEmits(['update:center', 'update:pointerCoordinate']);

const $q = useQuasar();
const mapDiv = ref<HTMLDivElement>();
const unitStore = useUnitStore();
const mapStore = useMapStore();
const { distanceUnit } = storeToRefs(unitStore);
const { basemap } = storeToRefs(mapStore);
let map: UseMap | undefined;
let measureTool: UseMeasure;
const measureActive = ref<boolean>(false);
const enPrecipitation = ref<boolean>(false);
const enWind = ref<boolean>(false);
const enNauticalMarkers = ref<boolean>(false);

const onMove = (newCenter: LatLon) => {
    emit('update:center', newCenter);
};
const pointerMove = (pointerCoordinate: Coordinate) => {
    emit('update:pointerCoordinate', pointerCoordinate);
};

watch(basemap, (newValue) => {
    map?.setBaseMap(newValue);
});

watch(enNauticalMarkers, (newValue, oldValue) => {
    if (newValue === false && oldValue === true) {
        map?.removeLayer('NauticalMarkers');
    }
    if (newValue === true && oldValue === false) {
        map?.addXYZLayer('NauticalMarkers', mapLayers().getNauticalMarkers());
    }
});

watch(enPrecipitation, (newValue, oldValue) => {
    if (newValue === false && oldValue === true) {
        map?.removeLayer('precipitation');
    }
    if (newValue === true && oldValue === false) {
        map?.addXYZLayer(
            'precipitation',
            mapLayers().getWeatherMaps('precipitation'),
        );
    }
});

watch(enWind, (newValue, oldValue) => {
    if (newValue === false && oldValue === true) {
        map?.removeLayer('wind');
    }
    if (newValue === true && oldValue === false) {
        map?.addXYZLayer('wind', mapLayers().getWeatherMaps('wind'));
    }
});

const updateSize = () => {
    map?.updateSize();
};

const focusAt = (latLng: LatLon, zoom?: number) => {
    map?.focusAt(latLng, zoom ?? 10);
};
const getUseMap = (): UseMap => {
    if (!map) throw new Error('Map not initialized');
    return map;
};
const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
        map?.updateSize();
    }
};

const toggleMeasuringTool = () => {
    if (measureTool) {
        measureTool.toggleMeasure();
        measureActive.value = measureTool.hasMeasure();
    } else {
        logger.error($q, 'No measuring tool found');
    }
};

onMounted(() => {
    if (!mapDiv.value) {
        logger.error($q, 'No map container found');
        return;
    }
    map = useMap({
        id: mapDiv.value,
        centerMove: onMove,
        pointerMove: pointerMove,
        isTouch: $q.platform.is.mobile,
    });
    map.setBaseMap(basemap.value);

    let unit: ScaleOptions['unit'] = 'metric';

    if (distanceUnit.value === 'NM') unit = 'nautical';
    else if (distanceUnit.value === 'ft' || distanceUnit.value === 'miles')
        unit = 'imperial';

    map.scaleControl({
        type: 'scalebar',
        unit,
        steps: 4,
        text: true,
        minWidth: 400,
    });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    measureTool = useMeasure(map, (distance: number) =>
        unitStore.stringDistance(distance),
    );
});

onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    map?.dispose();
});

defineExpose({
    getUseMap,
    focusAt,
    updateSize,
});
</script>

<style lang="scss" scoped>
.settings-menu {
    position: absolute;
    right: 10px;
    top: 10px;
    z-index: 10;
    width: 32px;
    height: 32px;
    @media (max-width: 400px) {
        top: 90px;
        right: auto;
        left: 10px;
    }
    .content {
        background-color: var(--container-background-color);
    }
}

.measuring-tool {
    position: absolute;
    left: 10px;
    bottom: 40px;
    z-index: 10;
    background: var(--element-active-color) !important;
    color: var(--element-active-inverted-color) !important;
    &.active {
        background: var(--element-active-inverted-color) !important;
        color: var(--element-active-color) !important;
    }
}
</style>
