<template>
    <q-dialog
        ref="dialogRef"
        class="q-electron-drag--exception"
        @show="showChart"
        @hide="onDialogHide"
        :seamless="backdropVisible"
    >
        <q-card class="q-dialog-plugin yr-dialog">
            <yr-metro-gram v-if="forecast" :forecast="forecast" />
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import type { LatLon } from 'client/lib/map';
import type { ForecastMinimal } from 'client/services/yr/def/models/METJSONMinimal';
import { yrApi } from 'client/services/yr';
import { ref, watchEffect, inject } from 'vue';
import { useDialogPluginComponent } from 'quasar';
import { wait } from 'cmn/lib/tools';
import YrMetroGram from 'client/components/Weather/yrMetrogram.vue';
const backdropVisible = inject<boolean>('backdropVisible');
const props = defineProps<{
    position: LatLon;
}>();

defineEmits([
    // REQUIRED; need to specify some events that your
    // component will emit through useDialogPluginComponent()
    ...useDialogPluginComponent.emits,
]);
const { dialogRef, onDialogHide } = useDialogPluginComponent();
const visible = ref(false);
const forecast = ref<ForecastMinimal | null>(null);

const showChart = async () => {
    await wait(300); // default quasar transaction time
    requestAnimationFrame(() => {
        visible.value = true;
    });
};

watchEffect(async () => {
    if (visible.value === false) {
        forecast.value = null;
        return;
    }
    try {
        const newForecast = await yrApi.getForecastMinimal(
            props.position.lat,
            props.position.lon,
        );
        forecast.value = newForecast;
    } catch (e) {
        console.error(e);
        forecast.value = null;
    }
});
</script>

<style lang="scss" scoped>
.yr-dialog {
    width: 800px;
    max-width: 90vw;
    height: 500px;
}
</style>
