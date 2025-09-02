import { defineStore } from 'pinia';
import type { BaseMaps } from 'client/lib/map';
import { ref } from 'vue';

export const useMapStore = defineStore('maps', () => {
    const basemap = ref<BaseMaps>('osm');
    return {
        basemap,
    };
});
