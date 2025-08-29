<template>
    <q-page
        :style-fn="fullHeight"
        class="column items-center justify-center animated-background"
    >
        <q-card class="page-card profile-card column">
            <q-card-section class="col-auto row justify-center items-end">
                <div class="col-sm-auto col-12 q-pa-md">
                    <div class="profile-image">
                        <avataaar-image
                            v-if="state.avatar"
                            :config="state.avatar"
                        />
                        <div
                            v-ripple
                            class="edit-image text-center cursor-pointer ripple"
                            @click="editImage"
                        >
                            Edit
                        </div>
                    </div>
                </div>
                <div
                    class="col-sm-auto col-12 q-pa-md column justify-center q-gutter-y-sm"
                >
                    <div>
                        <strong>Full name:</strong>
                        {{ state.name }}
                    </div>
                    <div>
                        <strong>Email:</strong>
                        {{ state.email }}
                    </div>
                    <div>
                        <strong>Phone:</strong>
                        {{ state.phone }}
                    </div>
                    <div class="text-caption q-mt-md">
                        Contact your administrator to update personnel data.
                    </div>
                    <q-space />
                    <!-- <n-btn
                        dense

                        :label="enabled2fa ? 'Configure 2FA' : 'Enable 2FA'"
                        active
                        @click="enable2fa"
                    /> -->
                </div>
            </q-card-section>

            <!-- <q-table
                flat
                bordered
                title="Deployments"
                :rows="deployments"
                :columns="deploymentsColumns"
                :rows-per-page-options="[0]"
                :pagination="{
                    sortBy: 'start',
                    descending: true,
                    rowsPerPage: 0,
                }"
                row-key="id"
                virtual-scroll
                class="col scroll-table deployment-table"
                @row-click="(evt, row) => viewDeployment(row.id)"
            /> -->
        </q-card>
    </q-page>
</template>

<script setup lang="ts">
// import type { DeploymentDb, UpdateUserDb } from '@/lib/graphQL';
// import { useDeploymentDb, useUserDb, userStore } from '@/lib/graphQL';
// import type { DeploymentMeta } from '@/lib/deployment';
// import { convertDeploymentToMeta } from '@/lib/deployment';
// import type { QTableProps } from 'quasar';
import { useQuasar } from 'quasar';
import { onMounted, reactive, onUnmounted, getCurrentInstance } from 'vue';
import { fetchMFAPreference } from 'aws-amplify/auth';
import { fullHeight } from 'cmn/composable/helpers';
import { logger } from 'cmn/lib/logger';
import { useCognitoUserStore } from 'cmn/stores/cognitoUser';
import AvataaarImage from 'cmn/components/Avataaars/avataaarImage.vue';
import { db } from 'client/services/database';
//import EnableOTPDialog from '@/dialogs/Profile/enableOTP.vue';
//import InfoDeployment from '@/dialogs/Deployments/infoDeployment.vue';
import ProfileImageDialog from 'cmn/dialogs/ProfileImage/profileImage.vue';
import ProfileHelp from './ProfileHelp.vue';
import { useHelpStore } from 'cmn/stores/help';
const helpStore = useHelpStore();
// const deploymentsColumns: QTableProps['columns'] = [
//     {
//         name: 'name',
//         required: true,
//         label: 'Name',
//         field: 'name',
//         align: 'left',
//         sortable: true,
//     },
//     {
//         name: 'fleet',
//         field: 'fleetName',
//         align: 'center',
//         label: 'Fleet',
//         sortable: true,
//     },
//     {
//         name: 'vehicle',
//         field: 'vehicleName',
//         align: 'center',
//         label: 'Vehicle',
//         sortable: true,
//     },
//     {
//         name: 'start',
//         field: 'created',
//         align: 'center',
//         label: 'Start Date',
//         style: 'width: 100px',
//         format: (val: Date) => val.toLocaleDateString(),
//         sortable: true,
//         classes: 'gt-sm',
//         headerClasses: 'gt-sm',
//     },
//     {
//         name: 'updated',
//         field: 'updated',
//         align: 'center',
//         label: 'Updated',
//         style: 'width: 170px',
//         format: (val: Date) => val.toLocaleString(),
//         sortable: true,
//         classes: 'gt-sm',
//         headerClasses: 'gt-sm',
//     },
// ];

const $q = useQuasar();
const userStore = useCognitoUserStore();

const state = reactive({
    name: 'Firstname Lastname',
    email: 'Unknown',
    phone: 'N/A',
    deployments: 0,
    avatar: null as string | null,
    enabled2fa: null as boolean | null,
});

/*
const deployments = computed<DeploymentMeta[]>(() => {
    const user = userStore.storage.asRecord[userId];
    if (user === undefined) return [];
    const deployments = user.deployments.value;

    const meta = deployments
        .filter((el) => el.userId === userId)
        .map((el) => convertDeploymentToMeta(el));

    return meta;
});

const viewDeployment = async (deploymentId: string) => {
    let deployment: DeploymentDb | undefined;

    try {
        deployment = await useDeploymentDb().getId(deploymentId);
    } catch (e) {
        logger.warn($q, 'Could not find deployment', e);
        return;
    }
    notImplemented();
    // $q.dialog({
    //   component: InfoDeployment,
    //   componentProps: {
    //     deployment,
    //   },
    // }).onOk((deploymentId: string) => {
    //   void router.push({
    //     name: 'view_deployment',
    //     params: {
    //       deploymentId: deploymentId,
    //     },
    //   });
    // });
};
*/
const editImage = () => {
    $q.dialog({
        component: ProfileImageDialog,
        componentProps: {
            config: state.avatar,
        },
    }).onOk(async (config: string) => {
        state.avatar = config;
        // const updateUser: UpdateUserDb = {
        //     id: userId,
        //     avatar: config,
        // };
        // await useUser.update(updateUser);
    });
};

// const enable2fa = async () => {
//     notImplemented();
//     // $q.dialog({
//     //     component: EnableOTPDialog,
//     // }).onOk(() => {});

//     // Open setupUri with an authenticator APP to retrieve an OTP code
// };

onMounted(async () => {
    try {
        const userId = userStore.userId;
        if (!userId) {
            throw new Error('User ID is not set');
        }
        const user = await db.user.getFull(userStore.userId);
        state.name = user.fullName;
        state.email = user.email;
        state.phone = user.phone ?? 'N/A';
        state.avatar = user.avatar ?? null;
        const MFAPreference = await fetchMFAPreference();
        state.enabled2fa = MFAPreference.preferred !== undefined;
    } catch (err) {
        logger.error($q, 'Could not load user data', err);
    }
    const myName = getCurrentInstance()?.type.__name;

    if (myName)
        helpStore.addHelp({
            name: myName,
            type: 'page',
            helpPage: ProfileHelp,
        });
});

onUnmounted(() => {
    const myName = getCurrentInstance()?.type.__name;
    if (myName) helpStore.removeHelp(myName);
});
</script>

<style lang="scss" scoped>
.profile-card {
    width: 800px;
    height: 700px;
    max-height: 95vh;
    max-width: 95vw;

    .profile-image {
        margin: auto;
        position: relative;
        width: 200px;
        height: 220px;

        .edit-image {
            position: absolute;
            bottom: 0;
            width: 100%;
            background-color: $active-color;
            color: $active-inverted-color;
            padding: 5px 0 5px 0;
            height: 34px;
        }
    }
    .deployment-table {
        width: 100%;
    }
}
</style>
