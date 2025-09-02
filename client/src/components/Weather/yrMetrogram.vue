<template>
    <div ref="refMetrogramChart" class="chart" />
</template>

<script lang="ts">
//import ControlBar from '../ControlBar/controlBar.vue';

import type { ForecastMinimal } from 'client/services/yr';
import type { PropType } from 'vue';
import { defineComponent, onMounted, onUnmounted, ref, watchEffect } from 'vue';
import type { XYChart } from '@amcharts/amcharts5/xy';
import { drawMetroGram } from './metrogramChart';

//import { wait } from '@hefring/commons/timing';

export default defineComponent({
    name: 'YrMetrogram',
    props: {
        forecast: {
            type: Object as PropType<ForecastMinimal>,
            required: true,
        },
    },

    setup(props) {
        const refMetrogramChart = ref<HTMLDivElement | null>(null);

        let metroChart: XYChart | undefined;

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                if (metroChart) void metroChart.appear(500);
            }
        };

        watchEffect(async () => {
            if (refMetrogramChart.value === null) return;
            if (metroChart) metroChart.dispose();

            //await wait(1000);
            metroChart = await drawMetroGram(
                refMetrogramChart.value,
                props.forecast,
            );
        });

        onMounted(async () => {
            document.addEventListener(
                'visibilitychange',
                handleVisibilityChange,
            );
        });

        onUnmounted(() => {
            if (metroChart) metroChart.dispose();
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange,
            );
        });

        return {
            refMetrogramChart,
        };
    },
});
</script>

<style lang="scss" scoped>
.chart {
    width: 100%;
    height: 100%;
    overflow: hidden;
}
</style>
