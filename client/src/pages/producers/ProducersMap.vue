<template>
    <q-page :style-fn="fullHeight" class="column">
        <base-map
            ref="mapRef"
            show-weather
            class="col"
            @update:center="center = $event"
        >
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
import { onMounted, ref } from 'vue';
import { fullHeight } from 'cmn/composable/helpers';
import { useQuasar } from 'quasar';
import BaseMap from 'client/components/Map/baseMap.vue';
import type { LatLon, UseMap } from 'client/lib/map';
import YrWidget from 'client/components/Weather/yrWidget.vue';
// import { useCognitoUserStore } from 'cmn/stores/cognitoUser';

let map: UseMap;
// const cognitoUserStore = useCognitoUserStore();

// const adminAll = ref(false);
const $q = useQuasar();
const mapRef = ref<InstanceType<typeof BaseMap> | null>(null);
const center = ref<LatLon>({ lat: 0, lon: 0 });

onMounted(async () => {
    try {
        if (!mapRef.value) throw new Error('Missing map container');
        map = mapRef.value.getUseMap();

        map.zoomVectorLayer('producers-markers');
    } catch (error) {
        logger.error($q, 'Could not load producers', error);
    }
});
</script>

<style lang="scss" scoped></style>
