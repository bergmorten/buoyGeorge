<template>
    <div class="small-screen bg-active text-white row items-center q-my-none">
        <div class="q-ml-md">{{ title }}</div>
        <q-space />
        <q-btn
            v-if="isDialog"
            icon="help"
            dense
            flat
            round
            color="white"
            @click="drawerStore.toggleHelp()"
        />
    </div>
    <div class="large-screen">
        <q-btn
            v-if="isDialog"
            icon="help"
            flat
            round
            class="dialog-help-button"
            color="white"
            @click="drawerStore.toggleHelp()"
        />
        <q-img
            class="dialog-header-image"
            height="100px"
            :src="headerImg"
            fit="cover"
            position="50% 50%"
        >
            <div v-if="hasMeta" class="fit column items-center justify-center">
                <div v-if="title" class="text-h6">
                    {{ title }}
                    <q-tooltip v-if="!subtitle && tooltip">{{
                        tooltip
                    }}</q-tooltip>
                </div>
                <div v-if="subtitle" class="text-subtitle2">
                    <strong> {{ subtitle }}</strong>
                    <q-tooltip>{{ tooltip }}</q-tooltip>
                </div>
            </div>
        </q-img>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import headerImg from './assets/header.jpg';
import { useHelpStore } from 'cmn/stores/help';
import { useDrawerStore } from 'cmn/stores/drawer';
import { storeToRefs } from 'pinia';
const helpStore = useHelpStore();
const drawerStore = useDrawerStore();

const { isDialog } = storeToRefs(helpStore);

const props = defineProps<{
    title?: string;
    subtitle?: string;
    tooltip?: string;
}>();

const hasMeta = computed(() => !!props.title || !!props.subtitle);
</script>

<style lang="scss" scoped>
.small-screen {
    @media only screen and (min-width: 601px) {
        display: none;
    }
}
.large-screen {
    display: block;
    &.dialog-header-image {
        height: 0px !important;
        ::after {
            height: 10px;
            display: block;
            width: 100%;
        }
    }
    @media only screen and (max-width: 600px), screen and (max-height: 600px) {
        display: none;
    }
}
</style>
