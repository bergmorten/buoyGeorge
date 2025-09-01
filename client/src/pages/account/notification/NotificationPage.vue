<template>
    <q-page
        :style-fn="fullHeight"
        class="column items-center justify-center animated-background"
    >
        <q-card class="page-card notify-card column">
            <q-inner-loading :showing="!contactMeta" />
            <q-card-section class="col-auto row justify-center items-center">
                <q-icon name="campaign" size="48px" /> Notifications
            </q-card-section>
            <q-separator />
            <q-card-section class="col-auto column q-gutter-y-md items-center">
                <div class="row items-center">
                    <div class="column items-center notify-icon">
                        <q-icon color="primary" name="language" size="32px" />
                        <div>Push</div>
                        <q-tooltip>
                            Receive notifications in browser and IOS/Android
                            apps
                        </q-tooltip>
                    </div>
                    <q-select
                        :model-value="pushNotifyLevel"
                        dense
                        :options="notifyLevels"
                        option-value="value"
                        option-label="label"
                        map-options
                        label="Level"
                        class="notify-selector"
                        @update:model-value="setGlobalPushNotifyLevel"
                    />
                </div>
                <div class="row items-center">
                    <div class="column items-center notify-icon">
                        <q-icon color="primary" name="mail" size="32px" />
                        <div>Email</div>
                        <q-tooltip
                            >Receive notifications to your email</q-tooltip
                        >
                    </div>

                    <q-select
                        :model-value="emailNotifyLevel"
                        dense
                        :options="notifyLevels"
                        option-value="value"
                        option-label="label"
                        map-options
                        label="Level"
                        class="notify-selector"
                        @update:model-value="setGlobalEmailNotifyLevel"
                    />
                </div>
                <!-- <div class="row items-center">
          <div class="column items-center notify-icon">
            <q-icon color="primary" name="phone_iphone" size="32px" />
            <div>SMS</div>
            <q-tooltip>Receive notifications with SMS</q-tooltip>
          </div>
          <div>
            <q-select
              :model-value="smsNotifyLevel"
              dense
              :options="notifyLevels"
              option-value="value"
              option-label="label"
              map-options
              label="Level"
              class="notify-selector"
              disable
              @update:model-value="setGlobalSMSNotifyLevel"
            />
            <q-tooltip>Not available yet</q-tooltip>
          </div>
        </div> -->
            </q-card-section>
            <q-separator />
            <q-card-section
                class="col-auto column q-gutter-y-xs items-start text-caption"
            >
                <div>Your email is: {{ contactMeta?.email }}</div>
                <!-- <div>Your mobile phone is: {{ contactMeta.phone }}</div> -->
                <div>Contact your administrator to change these values</div>
            </q-card-section>
        </q-card>
    </q-page>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue';
import { logger } from 'cmn/lib/logger';
//import { updateGlobalNotifySetting } from '@/services/firebaseMessaging/userNotification';
import { useCognitoUserStore } from 'cmn/stores/cognitoUser';
import { useQuasar } from 'quasar';
import { notImplemented, fullHeight } from 'cmn/composable/helpers';
import type { USER_NOTIFY_SETTING } from 'client/services/database/users/models';
import { AlertSeverity } from 'client/services/database/users/models';
import { clientDb } from 'client/services/database';

interface NotifyMeta {
    value: AlertSeverity | null;
    label: string;
}
const notifyLevels: NotifyMeta[] = [
    { value: null, label: 'None' },
    { value: AlertSeverity.CRITICAL, label: 'Only critical' },
    { value: AlertSeverity.MAJOR, label: 'Major and critical' },
    { value: AlertSeverity.WARNING, label: 'Warning, major and critical' },
    { value: AlertSeverity.INFO, label: 'All including info' },
];

const $q = useQuasar();
const userStore = useCognitoUserStore();

const contactMeta = ref<{
    email: string;
    phone: string;
} | null>(null);

const notificationsSetting = ref<USER_NOTIFY_SETTING>({ version: 1 });

const pushNotifyLevel = computed(() => {
    return notificationsSetting.value?.globalPushLevel ?? null;
});
const emailNotifyLevel = computed(() => {
    return notificationsSetting.value?.globalEmailLevel ?? null;
});
// const smsNotifyLevel = computed(() => {
//     return notificationsSetting.value?.globalSMSLevel ?? null;
// });

const setGlobalPushNotifyLevel = (pushSeverity: NotifyMeta) => {
    const level = pushSeverity.value; // NB value is select value not ref value
    if (level !== null) {
        // value is not reactive
        const systemAlerts = userStore.hasAdminRights
            ? 'system alerts and'
            : '';
        $q.dialog({
            title: 'Confirm',
            message: `You will receive push notifications for ${systemAlerts} fleets belonging your fleets with severity ${pushSeverity.label.toLowerCase()}.`,
            cancel: true,
            persistent: true,
        })
            .onOk(async () => {
                try {
                    notImplemented();
                    // await updateGlobalNotifySetting('PUSH', level);
                } catch (e) {
                    logger.error($q, 'Failed to update notify PUSH setting', e);
                }
            })
            .onCancel(() => {});
    }
};

const setGlobalEmailNotifyLevel = (pushSeverity: NotifyMeta) => {
    // const level = pushSeverity.value; // NB value is select value not ref value

    // value is not reactive
    const systemAlerts = userStore.hasAdminRights ? 'system alerts and' : '';
    $q.dialog({
        title: 'Confirm',
        message: `You will receive email notifications to ${
            contactMeta.value?.email
        } for ${systemAlerts} fleets belonging your fleets with severity ${pushSeverity.label.toLowerCase()}. You may receive an email where you must confirm your subscription.`,
        cancel: true,
        persistent: true,
    })
        .onOk(async () => {
            try {
                notImplemented();
                // await updateGlobalNotifySetting('EMAIL', level);
            } catch (e) {
                logger.error($q, 'Failed to update notify EMAIL setting', e);
            }
        })
        .onCancel(() => {});
};

// const setGlobalSMSNotifyLevel = (pushSeverity: NotifyMeta) => {
//     const level = pushSeverity.value; // NB value is select value not ref value
//     if (level !== null) {
//         // value is not reactive
//         const systemAlerts = userStore.hasAdminRights
//             ? 'system alerts and'
//             : '';
//         $q.dialog({
//             title: 'Confirm',
//             message: `You will receive sms notifications to ${
//                 contactMeta.value.phone
//             } for ${systemAlerts} fleets belonging your fleets with severity ${pushSeverity.label.toLowerCase()}.`,
//             cancel: true,
//             persistent: true,
//         })
//             .onOk(async () => {
//                 try {
//                     notImplemented();
//                     // NB SEE also userCUDTrigger which send an email to confirm address
//                     // await updateGlobalNotifySetting('SMS', level);
//                 } catch (e) {
//                     logger.error($q, 'Failed to update notify SMS setting', e);
//                 }
//             })
//             .onCancel(() => {});
//     }
// };

watchEffect(async () => {
    try {
        const userId = userStore.userId;
        if (!userId) {
            throw new Error('User ID is not set');
        }
        const user = clientDb.users.get(userStore.userId);
        if (!user) {
            throw new Error('User ID is not set');
        } else {
            const fullUser = await clientDb.user.getFull(user.id);
            if (!fullUser) {
                throw new Error('Full user not found');
            }
            notificationsSetting.value = fullUser.notificationSetting
                ? JSON.parse(fullUser.notificationSetting)
                : { version: 1 };

            contactMeta.value = {
                email: fullUser.email || 'Not set',
                phone: fullUser.phone || 'Not set',
            };
        }
    } catch (e) {
        logger.error($q, 'Failed to get full user', e);
        notificationsSetting.value = { version: 1 };
        contactMeta.value = {
            email: 'Not set',
            phone: 'Not set',
        };
    }
});
</script>

<style lang="scss" scoped>
.notify-card {
    width: 400px;

    .notify-selector {
        width: 180px;
    }
    .notify-icon {
        width: 80px;
        margin-right: 16px;
    }
}
</style>
