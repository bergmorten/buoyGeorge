<template>
    <q-page :style-fn="fullHeight" class="column">
        <base-map
            ref="mapRef"
            show-weather
            class="col"
            @update:center="center = $event"
        >
            <q-inner-loading
                :showing="working"
                label="Loading data...."
                style="z-index: 100"
            />
            <div class="menu-bar row q-gutter-sm">
                <q-select
                    filled
                    v-model="states"
                    multiple
                    label="Filter States"
                    :options="producerStates"
                    counter
                    clearable
                    hint="Selected"
                    class="select-btn"
                >
                    <template
                        #option="{ itemProps, opt, selected, toggleOption }"
                    >
                        <q-item v-bind="itemProps">
                            <q-item-section>
                                {{ opt }}
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
                <q-select
                    filled
                    v-model="fleets"
                    label="Filter Fleets"
                    :options="fleetFiltered"
                    option-label="name"
                    multiple
                    use-input
                    input-debounce="0"
                    @filter="filterFleet"
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
                        #option="{ itemProps, opt, selected, toggleOption }"
                    >
                        <q-item v-bind="itemProps">
                            <q-item-section>
                                {{ opt.name }}
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
                <q-select
                    filled
                    v-model="idwMode"
                    label="IWD"
                    :options="iwdModes"
                    clearable
                    class="select-btn-small"
                />
            </div>
            <template #footer>
                <q-toolbar class="col-auto">
                    <div class="gt-sm q-ml-sm">
                        Center Lat:
                        {{ center.lat.toFixed(4) }}
                        Lon:
                        {{ center.lon.toFixed(4) }}
                    </div>
                    <yr-widget :position="center" />
                </q-toolbar>
            </template>
        </base-map>
    </q-page>
</template>

<script setup lang="ts">
import { logger } from 'cmn/lib/logger';
import { computed, onMounted, ref, watch } from 'vue';
import { fullHeight } from 'cmn/composable/helpers';
import { useQuasar } from 'quasar';
import BaseMap from 'client/components/Map/baseMap.vue';
import type { LatLon, UseMap } from 'client/lib/map';
import { getIDW } from 'client/lib/map/idw';
import YrWidget from 'client/components/Weather/yrWidget.vue';
import { clientDb } from 'client/services/database';
import { drawProducer } from 'client/lib/map/producer';
import {
    producerStates,
    type ProducerState,
} from 'client/services/database/producers';
import type { Fleet } from 'client/services/database/fleets';

// import { useCognitoUserStore } from 'cmn/stores/cognitoUser';
const iwdModes = [
    { label: 'Wave height', value: 'waveHeight' },
    { label: 'Current 10m', value: 'current10m' },
    { label: 'Current 20m', value: 'current20m' },
    { label: 'Current 50m', value: 'current50m' },
] as const;
let map: UseMap;
// const cognitoUserStore = useCognitoUserStore();

// const adminAll = ref(false);
const $q = useQuasar();
const mapRef = ref<InstanceType<typeof BaseMap> | null>(null);
const center = ref<LatLon>({ lat: 0, lon: 0 });
const allProducers = clientDb.producerArray;
const allFleets = clientDb.fleetArray;
const working = ref(false);
const states = ref<ProducerState[] | null>(null);
const idwMode = ref<(typeof iwdModes)[number] | null>(null);
const fleets = ref<Fleet[] | null>(null);
const fleetNeedle = ref<string | null>(null);
const { featureProducers } = drawProducer();

const updateProducers = () => {
    if (!map) return;
    map.updateVectorLayer(
        'producers-markers',
        featureProducers(producersFiltered.value),
    );
};
const filterFleet = (val: string, update: (callbackFn: () => void) => void) => {
    update(() => {
        fleetNeedle.value = val ? val.trim().toLowerCase() : null;
    });
};

const fleetFiltered = computed(() => {
    if (!fleetNeedle.value || fleetNeedle.value.length < 1) {
        return allFleets.value;
    }
    return allFleets.value.filter((f) =>
        f.name.toLowerCase().startsWith(fleetNeedle.value as string),
    );
});
const producersFiltered = computed(() => {
    const st = states.value ?? [];
    const fl = fleets.value ?? [];
    if (st.length < 1 && fl.length < 1) {
        return allProducers.value;
    }
    const result = allProducers.value.filter((p) => {
        const inState = st.length > 0 ? st.includes(p.state) : true;
        if (!inState) return false;
        const inFleet =
            fl.length > 0 ? fl.some((f) => f.id === p.fleetId) : true;
        return inFleet;
    });

    return result;
});
watch(
    producersFiltered,
    () => {
        updateProducers();
        map.zoomVectorLayer('producers-markers');
    },
    { immediate: true },
);

watch(
    idwMode,
    (mode) => {
        if (mode) {
            const producerLayer = map.getVectorLayer('producers-markers');
            if (producerLayer) {
                map.removeLayer('idw-layer');

                const source = producerLayer.source;
                const idw = getIDW({
                    source,
                    layerName: 'idw-layer',
                    lookupString: mode.value,
                });
                map.addLayer(idw);
            }
        } else {
            map.removeLayer('idw-layer');
        }
    },
    { immediate: true },
);

onMounted(async () => {
    working.value = true;
    try {
        if (!mapRef.value) throw new Error('Map not loaded');

        map = mapRef.value.getUseMap();
        updateProducers();

        map.zoomVectorLayer('producers-markers');
    } catch (error) {
        logger.error($q, 'Could not load producers', error);
    } finally {
        working.value = false;
    }
});
</script>

<style lang="scss" scoped>
.menu-bar {
    position: absolute;
    top: 10px;
    left: 50px;
    margin-right: 80px;
    z-index: 2;

    .select-btn {
        width: 250px;
    }
    .select-btn-small {
        width: 175px;
    }
}
</style>
