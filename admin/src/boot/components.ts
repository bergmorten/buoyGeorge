import { boot } from 'quasar/wrappers';
import DialogHeader from 'cmn/components/DialogHeader/dialogHeader.vue';
import NBtn from 'cmn/components/Btn/NBtn.vue';

export default boot(({ app }) => {
    app.component('DialogHeader', DialogHeader);
    app.component('NBtn', NBtn);
});
