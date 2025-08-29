<template>
    <q-dialog
        ref="dialogRef"
        class="q-electron-drag--exception"
        persistent
        @hide="onDialogHide"
        :seamless="backdropVisible"
    >
        <q-card class="q-dialog-plugin gdpr-Dialog column no-wrap">
            <dialog-header title="Our terms for usage" class="col-auto" />
            <q-card-section class="col column scroll q-gutter-y-md">
                <q-tabs
                    v-model="tab"
                    dense
                    class="col-auto text-grey"
                    active-color="primary"
                    indicator-color="primary"
                    align="justify"
                    narrow-indicator
                >
                    <q-tab name="cookies" label="Cookies & GDPR" />
                    <q-tab name="disclaimer" label="Disclaimer" />
                </q-tabs>

                <q-tab-panels v-model="tab" animated class="col scroll">
                    <q-tab-panel name="cookies" class="q-py-none">
                        <gdpr-terms />
                    </q-tab-panel>
                    <q-tab-panel name="disclaimer" class="q-py-none">
                        <disclaimer-terms />
                    </q-tab-panel>
                </q-tab-panels>
            </q-card-section>
            <q-separator inset />
            <q-card-actions align="right">
                <n-btn v-if="!hideCancel" label="Cancel" v-close-popup />
                <n-btn label="Ok" active @click="onDialogOK" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue';
import { useDialogPluginComponent } from 'quasar';
import DisclaimerTerms from './disclaimerTerms.vue';
import GdprTerms from './gdprTerms.vue';

defineProps({
    hideCancel: {
        type: Boolean,
        default: false,
    },
});

defineEmits([
    // REQUIRED; need to specify some events that your
    // component will emit through useDialogPluginComponent()
    ...useDialogPluginComponent.emits,
]);
const backdropVisible = inject<boolean>('backdropVisible');
const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();
const tab = ref<'cookies' | 'disclaimer'>('cookies');
</script>

<style lang="scss" scoped>
.gdpr-Dialog {
    width: 600px;
    max-width: 95vw;
    height: 700px;
    max-height: 95vh;
    .label {
        font-weight: 600;
    }
}
</style>
