import { defineStore } from 'pinia';
import {
    type Component,
    type ShallowReactive,
    shallowReactive,
    computed,
} from 'vue';

export interface HelpPage {
    name: string;
    type: 'page' | 'dialog';
    helpPage: Component;
}

export const useHelpStore = defineStore('help', () => {
    const helpPages: ShallowReactive<HelpPage[]> = shallowReactive([]);

    const addHelp = (entry: HelpPage) => {
        helpPages.push(entry);
    };

    const removeHelp = (name: string) => {
        const index = helpPages.findLastIndex((el) => el.name === name);
        if (index > -1) helpPages.splice(index, 1);
    };

    const currentHelp = computed((): HelpPage | null => {
        const helpPage = helpPages.at(-1);
        if (!helpPage) return null;
        return helpPage;
    });

    const isPage = computed(() => currentHelp.value?.type === 'page');
    const isDialog = computed(() => currentHelp.value?.type === 'dialog');

    return { addHelp, removeHelp, currentHelp, isPage, isDialog };
});
