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
                    v-model="projects"
                    label="Filter Projects"
                    :options="projectFiltered"
                    option-label="name"
                    multiple
                    use-input
                    input-debounce="0"
                    @filter="filterProject"
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
                    <q-space />
                    <q-checkbox
                        v-model="azimuthEnabled"
                        class="q-mr-lg"
                        color="dense row justify-center items-center"
                    >
                        <q-icon name="sym_o_target" size="18px" />
                        <q-tooltip>
                            Draw Azimuth with target zone and depth average '
                            current on mouse hover
                        </q-tooltip>
                    </q-checkbox>
                </q-toolbar>
            </template>
        </base-map>
    </q-page>
</template>

<script setup lang="ts">
import { logger } from 'cmn/lib/logger';
import { computed, onMounted, ref, watch, onUnmounted } from 'vue';
import { fullHeight } from 'cmn/composable/helpers';
import { useQuasar } from 'quasar';
import BaseMap from 'client/components/Map/baseMap.vue';
import type { LatLon } from 'client/lib/map';
import { getIDW } from 'client/lib/map/idw';
import YrWidget from 'client/components/Weather/yrWidget.vue';
import { clientDb } from 'client/services/database';
import { drawProducer } from 'client/lib/map/producer';
import {
    producerStates,
    type ProducerState,
} from 'client/services/database/producers';
import type { Fleet } from 'client/services/database/fleets';
import { drawAzimuth } from 'client/lib/map/azimuth/azimuth';
import type { ProducerStatus } from 'client/services/database/producers/models';
import type Feature from 'ol/Feature';
import type { Geometry } from 'ol/geom';

// import { useCognitoUserStore } from 'cmn/stores/cognitoUser';
const iwdModes = [
    { label: 'Wave height', value: 'waveHeight' },
    { label: 'Wave speed', value: 'waveSpeed' },
    { label: 'Current 10m', value: 'current10m' },
    { label: 'Current 20m', value: 'current20m' },
    { label: 'Current 50m', value: 'current50m' },
] as const;

// const cognitoUserStore = useCognitoUserStore();

// const adminAll = ref(false);
const $q = useQuasar();
const mapRef = ref<InstanceType<typeof BaseMap> | null>(null);
const center = ref<LatLon>({ lat: 0, lon: 0 });
const allProducers = clientDb.producerArray;
const allFleets = clientDb.fleetArray;
const allProjects = clientDb.projectArray;
const working = ref(false);
const azimuthEnabled = ref(true);
const states = ref<ProducerState[] | null>(['RUNNING', 'ABORTED', 'MISSING']);
const idwMode = ref<(typeof iwdModes)[number] | null>(null);
const fleets = ref<Fleet[] | null>(null);
const fleetNeedle = ref<string | null>(null);
const projects = ref<Fleet[] | null>(null);
const projectNeedle = ref<string | null>(null);
let targetId: string | undefined = undefined;

const { featureProducers } = drawProducer();

const updateProducers = () => {
    const map = mapRef.value?.getUseMap();
    if (!map) return;
    map.updateVectorLayer(
        'producers-markers',
        featureProducers(producersFiltered.value),
    );
    if (targetId) drawAzimuthLayer(targetId);
};
const filterFleet = (val: string, update: (callbackFn: () => void) => void) => {
    update(() => {
        fleetNeedle.value = val ? val.trim().toLowerCase() : null;
    });
};
const filterProject = (
    val: string,
    update: (callbackFn: () => void) => void,
) => {
    update(() => {
        projectNeedle.value = val ? val.trim().toLowerCase() : null;
    });
};
const drawAzimuthLayer = (id: string) => {
    try {
        targetId = id;
        const map = mapRef.value?.getUseMap();
        if (!map) return;
        if (azimuthEnabled.value === false) return;

        const producer = clientDb.producers.get(id);
        if (!producer) {
            //logger.warn($q, 'Producer not found for id', id);
            return;
        }
        const { location, status } = producer;
        if (!location) {
            //logger.warn($q, 'Producer has no location', producer);
            return;
        }
        if (!status) {
            //logger.warn($q, 'Producer has no status', producer);
            return;
        }

        const parsedStatus = JSON.parse(status) as ProducerStatus;
        const azimuth = drawAzimuth(location, parsedStatus);
        map.updateVectorLayer('hover-layer', azimuth);
    } catch (error) {
        logger.error($q, 'Could not draw surface target', error);
    }
};

const onHover = (hover: { active: boolean; target: Feature<Geometry> }) => {
    // console.debug(`hoover ${hover.active}`);

    const map = mapRef.value?.getUseMap();
    if (!map) return;
    if (hover.active === false) {
        map?.removeLayer('hover-layer');
        targetId = undefined;
        return;
    }
    const id = hover.target.get('id');

    if (!id) {
        logger.warn($q, 'Id not found for target', hover);
        return;
    }
    targetId = id;

    drawAzimuthLayer(id);
};

const projectFiltered = computed(() => {
    let all = allProjects.value ?? [];
    const fl = fleets.value ?? [];
    if (fl.length > 0) {
        const pf = clientDb.projectFleetArray.value ?? [];
        all = all.filter((p) =>
            pf.some(
                (pf) =>
                    pf.projectId === p.id &&
                    fl.some((f) => f.id === pf.fleetId),
            ),
        );
    }

    if (!projectNeedle.value || projectNeedle.value.length < 1) {
        return all;
    }
    return all.filter((f) =>
        f.name.toLowerCase().startsWith(projectNeedle.value as string),
    );
});

const fleetFiltered = computed(() => {
    let all = allFleets.value ?? [];
    const pr = projects.value ?? [];
    if (pr.length > 0) {
        const pf = clientDb.projectFleetArray.value ?? [];
        all = all.filter((f) =>
            pf.some(
                (pf) =>
                    pf.fleetId === f.id &&
                    pr.some((p) => p.id === pf.projectId),
            ),
        );
    }
    if (!fleetNeedle.value || fleetNeedle.value.length < 1) {
        return all;
    }
    return all.filter((f) =>
        f.name.toLowerCase().startsWith(fleetNeedle.value as string),
    );
});
const producersFiltered = computed(() => {
    const pr = projects.value ?? [];
    const fl = fleets.value ?? [];
    const st = states.value ?? [];
    if (pr.length < 1 && fl.length < 1 && st.length < 1) {
        return allProducers.value;
    }
    const result = allProducers.value.filter((p) => {
        const inState = st.length > 0 ? st.includes(p.state) : true;
        if (!inState) return false;
        const inFleet =
            fl.length > 0 ? fl.some((f) => f.id === p.fleetId) : true;
        if (!inFleet) return false;

        const inProject =
            pr.length > 0 ? pr.some((proj) => proj.id === p.projectId) : true;
        return inProject;
    });

    return result;
});
watch(
    producersFiltered,
    () => {
        updateProducers();
        const map = mapRef.value?.getUseMap();
        if (!map) return;
        map.zoomVectorLayer('producers-markers');
    },
    { immediate: true },
);

watch(
    idwMode,
    (mode) => {
        const map = mapRef.value?.getUseMap();
        if (!map) return;
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
        const map = mapRef.value?.getUseMap();
        if (!map) throw new Error('Map not loaded');

        updateProducers();

        map.zoomVectorLayer('producers-markers');
        map.setHoverHandler(onHover);
    } catch (error) {
        logger.error($q, 'Could not load producers', error);
    } finally {
        working.value = false;
    }
});

onUnmounted(() => {
    const map = mapRef.value?.getUseMap();
    if (!map) return;
    if (map) {
        map.removeHoverHandler(onHover);
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
