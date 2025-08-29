import type DialogHeader from 'admin/components/DialogHeader/dialogHeader.vue';
import type NBtn from 'admin/components/Btn/btn.vue';

declare module '@vue/runtime-core' {
    export interface GlobalComponents {
        DialogHeader: typeof DialogHeader;
        NBtn: typeof NBtn;
    }
}

export {};
