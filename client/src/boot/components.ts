import { boot } from 'quasar/wrappers';
import DialogHeader from 'cmn/components/DialogHeader/dialogHeader.vue';
import NBtn from 'cmn/components/Btn/NBtn.vue';
import { useDrawerStore } from 'cmn/stores/drawer';
import { storeToRefs } from 'pinia';

export default boot(({ app }) => {
    const drawerStore = useDrawerStore();
    const { backdropVisible } = storeToRefs(drawerStore);
    app.component('DialogHeader', DialogHeader);
    app.component('NBtn', NBtn);

    app.provide('backdropVisible', backdropVisible);
});
