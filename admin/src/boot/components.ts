import { boot } from 'quasar/wrappers';
import DialogHeader from 'admin/components/DialogHeader/dialogHeader.vue';
import NBtn from 'admin/components/Btn/NBtn.vue';

export default boot(({ app }) => {
    app.component('DialogHeader', DialogHeader);
    app.component('NBtn', NBtn);
});
