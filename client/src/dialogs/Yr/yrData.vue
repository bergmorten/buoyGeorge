<template>
  <q-dialog
    ref="dialogRef"
    class="q-electron-drag--exception"
    @hide="onDialogHide"
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
        <ob-btn v-close-popup label="Ok" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import 'vue-json-pretty/lib/styles.css';

import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import { useDialogPluginComponent } from 'quasar';
import VueJsonPretty from 'vue-json-pretty';

//TODO MAKE SOMETHING LIKE THIS
// https://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/highcharts/demo/combo-meteogram

export default defineComponent({
  name: 'YrDataDialog',
  components: { VueJsonPretty },
  props: {
    data: {
      type: Object as PropType<Record<string, string | number>>,
      required: true,
    },
  },

  emits: [...useDialogPluginComponent.emits, 'ok'],

  setup() {
    const { dialogRef, onDialogHide, onDialogCancel } =
      useDialogPluginComponent();

    return {
      // This is REQUIRED;
      // Need to inject these (from useDialogPluginComponent() call)
      // into the vue scope for the vue html template
      dialogRef,
      onDialogHide,
      // we can passthrough onDialogCancel directly
      onCancelClick: onDialogCancel,
    };
  },
});
</script>

<style lang="scss" scoped>
.yr-dialog {
  width: 600px;
  max-width: 90vw;
}
</style>
