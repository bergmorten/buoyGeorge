<template>
    <q-page
        :style-fn="fullHeight"
        class="column items-center justify-center animated-background"
    >
        <q-card class="q-dialog-plugin demo-page">
            <q-card-section class="row q-my-md justify-center items-center">
                <n-btn
                    active
                    label="Gen random fleet"
                    @click="generateRandomFleet"
                    :disable="working"
                />
            </q-card-section>
        </q-card>
    </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, getCurrentInstance } from 'vue';
import { fullHeight } from 'cmn/composable/helpers';
import { logger } from 'cmn/lib/logger';
import { useQuasar } from 'quasar';
import OrgHelp from './DemoHelp.vue';
import { useHelpStore } from 'cmn/stores/help';
import { type DemoDataType, genDemoData } from './demoData';
import { fillDatabaseWithDemoData } from './fillDatabase';

const helpStore = useHelpStore();

const $q = useQuasar();

const working = ref(false);
const generateRandomFleet = async () => {
    try {
        if (!process.env.DEV) throw new Error('Not in development mode');
        working.value = true;
        const demoData: DemoDataType = genDemoData();
        await fillDatabaseWithDemoData(demoData);

        $q.notify({
            type: 'positive',
            message: 'Demo data generated',
        });
    } catch (err) {
        logger.error($q, 'Could not generate demo data', err);
    } finally {
        working.value = false;
    }
};
onMounted(async () => {
    try {
        const myName = getCurrentInstance()?.type.__name;

        if (myName)
            helpStore.addHelp({
                name: myName,
                type: 'page',
                helpPage: OrgHelp,
            });
    } catch (err) {
        logger.error($q, 'Could not load org data', err);
    }
});

onUnmounted(() => {
    const myName = getCurrentInstance()?.type.__name;
    if (myName) helpStore.removeHelp(myName);
});
</script>

<style lang="scss">
.demo-page {
    width: 800px;
    max-width: 95vw;
}
</style>
