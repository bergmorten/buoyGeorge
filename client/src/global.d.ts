import type DialogHeader from 'client/components/DialogHeader/dialogHeader.vue';
import type NBtn from 'client/components/Btn/btn.vue';

declare module '@vue/runtime-core' {
    export interface GlobalComponents {
        DialogHeader: typeof DialogHeader;
        NBtn: typeof NBtn;
    }
}
declare global {
    // Note the capital "W"
    interface Window {
        MyNamespace: boolean;
    }
}
declare module '*.png';
declare module '*.svg';
declare module '*.jpeg';
declare module '*.jpg';
export {};
