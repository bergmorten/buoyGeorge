import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Client } from 'admin/services/database/client';

export const useClientStore = defineStore('client', () => {
    const activeClient = ref<Client | null>(null);

    return {
        activeClient,
    };
});
