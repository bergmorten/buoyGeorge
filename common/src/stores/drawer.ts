import { defineStore } from 'pinia';
import { ref, readonly, computed } from 'vue';

export const useDrawerStore = defineStore('drawer', () => {
    const menuOpen = ref(false);
    const helpOpen = ref(false);

    let _drawerTimeout: NodeJS.Timeout | undefined;

    const resetTimer = () => {
        if (_drawerTimeout) clearTimeout(_drawerTimeout);

        _drawerTimeout = setTimeout(() => {
            hide();
        }, 15000);
    };
    const show = () => {
        menuOpen.value = true;
        resetTimer();
    };
    const hide = () => {
        menuOpen.value = false;
        if (_drawerTimeout) clearTimeout(_drawerTimeout);
        _drawerTimeout = undefined;
    };

    const toggle = () => {
        if (menuOpen.value) hide();
        else show();
    };

    const showHelp = () => {
        helpOpen.value = true;
    };
    const hideHelp = () => {
        helpOpen.value = false;
    };
    const toggleHelp = () => {
        if (helpOpen.value) hideHelp();
        else showHelp();
    };

    const hideBoth = () => {
        hideHelp();
        hide();
    };

    const backdropVisible = computed(() => menuOpen.value || helpOpen.value);

    return {
        menuOpen: readonly(menuOpen),
        helpOpen: readonly(helpOpen),
        show,
        hide,
        toggle,
        showHelp,
        hideHelp,
        toggleHelp,
        resetTimer,
        hideBoth,
        backdropVisible,
    };
});
