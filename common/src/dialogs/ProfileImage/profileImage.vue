<template>
    <q-dialog
        ref="dialogRef"
        class="q-electron-drag--exception"
        persistent
        @hide="onDialogHide"
        :seamless="backdropVisible"
    >
        <q-card class="q-dialog-plugin image-dialog">
            <q-card-section class="row">
                <div class="col q-gutter-y-md">
                    <q-select
                        v-model="draftConfig.eyeType"
                        dense
                        :options="options.eyeTypes"
                        label="Eyes"
                        popup-content-class="selector-content"
                    />
                    <q-select
                        v-model="draftConfig.eyebrowType"
                        dense
                        :options="options.eyebrowTypes"
                        label="Eyebrown"
                        popup-content-class="selector-content"
                    />
                    <q-select
                        v-model="draftConfig.facialHairType"
                        dense
                        :options="options.facialHairTypes"
                        label="Facial hair"
                        popup-content-class="selector-content"
                    />
                    <q-select
                        v-model="draftConfig.mouthType"
                        dense
                        :options="options.mouthTypes"
                        label="Mouth"
                        popup-content-class="selector-content"
                    />
                    <q-select
                        v-model="draftConfig.clotheType"
                        dense
                        :options="options.clothesTypes"
                        label="Cloth"
                        popup-content-class="selector-content"
                    />
                    <q-select
                        v-model="draftConfig.accessoriesType"
                        dense
                        :options="options.accessoriesTypes"
                        label="Glasses"
                        popup-content-class="selector-content"
                    />
                </div>
                <avataaar-image
                    :config="JSON.stringify(draftConfig)"
                    class="col-auto profile-image"
                />
                <div v-if="draftConfig" class="col q-gutter-y-md">
                    <q-select
                        v-model="draftConfig.topType"
                        dense
                        :options="options.topTypes"
                        label="Hair / Hat"
                        popup-content-class="selector-content"
                    />
                    <q-select
                        v-if="hasTopColor"
                        v-model="draftConfig.topColor"
                        dense
                        :options="options.hatAndShirtColors"
                        label="Top color"
                        popup-content-class="selector-content"
                    />
                    <q-select
                        v-model="draftConfig.skinColor"
                        dense
                        :options="options.skinColors"
                        label="Skin color"
                        popup-content-class="selector-content"
                    />
                    <q-select
                        v-model="draftConfig.hairColor"
                        dense
                        :options="options.hairColors"
                        label="Hair color"
                        popup-content-class="selector-content"
                    />
                    <q-select
                        v-model="draftConfig.facialHairColor"
                        dense
                        :options="options.hairColors"
                        label="Facial hair color"
                        popup-content-class="selector-content"
                    />
                    <q-select
                        v-model="draftConfig.clotheColor"
                        dense
                        :options="options.hatAndShirtColors"
                        label="Cloth color"
                        popup-content-class="selector-content"
                    />
                    <q-select
                        v-if="draftConfig.clotheType === 'GraphicShirt'"
                        v-model="draftConfig.graphicType"
                        dense
                        :options="options.graphicShirtTypes"
                        label="Graphics"
                        popup-content-class="selector-content"
                    />
                </div>
            </q-card-section>

            <q-separator inset />
            <q-card-actions align="right">
                <n-btn v-close-popup label="cancel" />
                <n-btn active label="Save" @click="saveImage" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import type { AvataaarModel } from 'cmn/components/Avataaars/models';
import { accessoriesTypes } from 'cmn/components/Avataaars/assetsTypes/accessories';
import { clothesTypes } from 'cmn/components/Avataaars/assetsTypes/clothes';
import { computed, ref, inject } from 'vue';
import { eyeTypes } from 'cmn/components/Avataaars/assetsTypes/eyes';
import { eyebrowTypes } from 'cmn/components/Avataaars/assetsTypes/eyebrows';
import { facialHairTypes } from 'cmn/components/Avataaars/assetsTypes/facial-hair';
import { graphicShirtTypes } from 'cmn/components/Avataaars/assetsTypes/graphic-shirt';
import {
    hairColors,
    hatAndShirtColors,
    skinColors,
} from 'cmn/components/Avataaars/assetsTypes/colors';
import { mouthTypes } from 'cmn/components/Avataaars/assetsTypes/mouth';
import { topTypes } from 'cmn/components/Avataaars/assetsTypes/top';
import AvataaarImage from 'cmn/components/Avataaars/avataaarImage.vue';
import { useDialogPluginComponent } from 'quasar';
import { randomAvataaar } from 'cmn/components/Avataaars/tools';

defineEmits([
    // REQUIRED; need to specify some events that your
    // component will emit through useDialogPluginComponent()
    ...useDialogPluginComponent.emits,
]);
const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();
const backdropVisible = inject<boolean>('backdropVisible');
const props = defineProps<{
    config: string | null;
}>();

const draftConfig = ref<AvataaarModel>(
    JSON.parse(props.config ? props.config : randomAvataaar()),
);

const saveImage = () => {
    onDialogOK(JSON.stringify(draftConfig.value));
};

const hasTopColor = computed(() => {
    if (!draftConfig.value) return false;
    if (!draftConfig.value.topType) return false;
    if (draftConfig.value.topType === 'Eyepatch') return false;
    if (draftConfig.value.topType.includes('Hair')) return false;
    return true;
});

const options = {
    topTypes: Object.keys(topTypes),
    eyeTypes: Object.keys(eyeTypes),
    eyebrowTypes: Object.keys(eyebrowTypes),
    facialHairTypes: Object.keys(facialHairTypes),
    mouthTypes: Object.keys(mouthTypes),
    clothesTypes: Object.keys(clothesTypes),
    accessoriesTypes: Object.keys(accessoriesTypes),
    hairColors: Object.keys(hairColors),
    skinColors: Object.keys(skinColors),
    hatAndShirtColors: Object.keys(hatAndShirtColors),
    graphicShirtTypes: Object.keys(graphicShirtTypes),
};
</script>

<style lang="scss" scoped>
.image-dialog {
    width: 600px;
    max-width: 90vw;

    .profile-image {
        position: relative;
        width: 200px;
        height: 220px;
    }
}
</style>
