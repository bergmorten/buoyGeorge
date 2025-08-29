<template>
    <q-dialog
        ref="dialogRef"
        class="q-electron-drag--exception"
        persistent
        @hide="onDialogHide"
        :seamless="backdropVisible"
    >
        <q-card class="q-dialog-plugin inquire-dialog column no-wrap">
            <dialog-header
                title="Inquire for a demo account"
                subtitle="Provide your company and personal details"
                class="col-auto"
            />

            <q-card-section class="col column">
                <q-form ref="inquireForm" greedy @submit.prevent="">
                    <div class="q-mt-sm row q-gutter-x-md">
                        <q-input
                            v-model="company"
                            dense
                            filled
                            label="Company name"
                            class="col"
                            :rules="[(val) => !!val || 'Field is required']"
                        />
                    </div>
                    <div class="row q-gutter-x-md">
                        <q-input
                            v-model="firstName"
                            dense
                            filled
                            label="First name"
                            class="col"
                            :rules="[(val) => !!val || 'Field is required']"
                        />
                        <q-input
                            v-model="lastName"
                            dense
                            filled
                            label="Last name"
                            class="col"
                            :rules="[(val) => !!val || 'Field is required']"
                        />
                    </div>
                    <div class="row q-gutter-x-md">
                        <q-input
                            v-model="email"
                            dense
                            filled
                            label="Email address"
                            type="email"
                            class="col"
                            :rules="[
                                (val) =>
                                    isValidEmail(val) ||
                                    'Must be a valid email',
                            ]"
                        />
                        <q-input
                            v-model="phone"
                            dense
                            filled
                            label="Phone number with country code"
                            type="tel"
                            class="col"
                            :rules="[isAWSPhone]"
                        />
                    </div>
                    <div class="row q-gutter-x-md">
                        <q-input
                            v-model="where"
                            dense
                            filled
                            label="Where did you hear about us"
                            class="col"
                            :rules="[(val) => !!val || 'Field is required']"
                        />
                    </div>
                    <div class="row q-gutter-x-md">
                        <q-input
                            v-model="message"
                            dense
                            filled
                            label="An optional message to us"
                            class="col"
                        />
                    </div>
                </q-form>
                <q-space />
                <div class="text-caption">
                    If approved a demo account will be created and will be a
                    free account with limited features.
                </div>
            </q-card-section>

            <q-separator />
            <q-card-actions align="right" class="col-auto">
                <n-btn v-close-popup label="Cancel" />
                <n-btn
                    active
                    :disable="working"
                    :loading="working"
                    label="Send"
                    @click="inquire"
                />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { reactive, toRefs, ref, inject } from 'vue';
import { useDialogPluginComponent, QForm, useQuasar } from 'quasar';
import { logger } from 'cmn/lib/logger';
import { isAWSPhone, isValidEmail } from 'cmn/lib/validation';

defineEmits([
    // REQUIRED; need to specify some events that your
    // component will emit through useDialogPluginComponent()
    ...useDialogPluginComponent.emits,
]);
const backdropVisible = inject<boolean>('backdropVisible');
const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();
const inquireForm = ref<QForm | null>(null);
const working = ref(false);
const $q = useQuasar();
const state = reactive({
    company: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    where: '',
    message: null as string | null,
});

const send = async () => {
    working.value = true;

    try {
        // await inquireAccount({
        //   company: state.company,
        //   firstName: state.firstName,
        //   lastName: state.lastName,
        //   email: state.email,
        //   phone: state.phone,
        //   where: state.where,
        //   message: state.message ? state.message : undefined,
        //   domain: 'DEMO',
        // });
    } finally {
        working.value = false;
    }
};
const inquire = async () => {
    const form = inquireForm.value;
    if (!form) {
        logger.error($q, 'Internal error, please try again');
        return;
    }
    const isValid = await form.validate();
    if (!isValid) {
        logger.error($q, 'Please fill in all required fields');
        return;
    }

    try {
        await send();

        $q.notify({
            type: 'positive',
            message:
                'An inquiry has been sent, please expect one to two days for a response',
            position: 'center',
        });

        onDialogOK('SENT');
    } catch (e) {
        logger.error($q, 'Failed to send inquiry', e);
    }
};

const { company, firstName, lastName, email, phone, where, message } =
    toRefs(state);
</script>

<style lang="scss" scoped>
.inquire-dialog {
    height: 520px;
    max-height: 95vh;
    width: 800px;
    max-width: 90vw;
}
</style>
