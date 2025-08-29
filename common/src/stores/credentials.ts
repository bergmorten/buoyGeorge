import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useCredentialStore = defineStore('credentials', () => {
    const username = ref<string | null>(null);
    const password = ref<string | null>(null);
    const isSwitching = ref<boolean>(false);

    return {
        username,
        password,
        isSwitching,
    };
});
