<template>
    <q-dialog
        ref="dialogRef"
        class="q-electron-drag--exception"
        @hide="onDialogHide"
        :seamless="backdropVisible"
    >
        <q-card class="q-dialog-plugin yr-dialog">
            <q-img src="images/weather.jpg">
                <div class="absolute-bottom text-center">
                    <div class="text-h6">Forecast</div>
                </div>
            </q-img>
            <q-card-section
                style="max-height: 50vh"
                class="scroll q-gutter-y-md q-mt-md"
            >
                <vue-json-pretty :path="'res'" :data="data" />
            </q-card-section>
            <q-separator inset />
            <q-card-actions align="right">
                <n-btn v-close-popup label="Ok" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import 'vue-json-pretty/lib/styles.css';

import { inject } from 'vue';
import { useDialogPluginComponent } from 'quasar';
import VueJsonPretty from 'vue-json-pretty';

//TODO MAKE SOMETHING LIKE THIS
// https://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/highcharts/demo/combo-meteogram
const backdropVisible = inject<boolean>('backdropVisible');

defineEmits([
    // REQUIRED; need to specify some events that your
    // component will emit through useDialogPluginComponent()
    ...useDialogPluginComponent.emits,
]);
const { dialogRef, onDialogHide } = useDialogPluginComponent();

defineProps<{
    data: Record<string, string | number>;
}>();
</script>

<style lang="scss" scoped>
.yr-dialog {
    width: 600px;
    max-width: 90vw;
}
</style>
