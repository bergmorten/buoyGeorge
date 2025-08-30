<template>
    <q-layout view="hhh lpr lff" class="public-layout">
        <q-drawer
            v-model="helpOpen"
            side="right"
            class="help-drawer"
            overlay
            :breakpoint="500"
            :width="500"
            @show="drawerStore.showHelp"
            @before-hide="drawerStore.hideHelp"
        >
            <context-help :show-help="showHelp" />
        </q-drawer>

        <q-page-container>
            <router-view />
        </q-page-container>
    </q-layout>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useDrawerStore } from 'cmn/stores/drawer';
import ContextHelp from 'cmn/components/Help/ContextHelp.vue';
import { storeToRefs } from 'pinia';

const drawerStore = useDrawerStore();

const showHelp = ref(false);
const { helpOpen } = storeToRefs(drawerStore);

onUnmounted(() => {
    console.debug('Public layout unmounted');

    //stopSubscription();
});

onMounted(async () => {
    console.debug('Public layout mounted');
});
</script>

<style lang="scss" scoped>
.public-layout {
}
</style>
