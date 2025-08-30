<template>
    <q-page class="fit frontpage column">
        <div id="frontBackground" />

        <div class="col row items-center">
            <div class="col-12 col-sm-6 slogan">
                <span class="line"> With great power,&nbsp; </span>
                <span class="line">comes great responsibility</span>
            </div>
            <div
                class="col-12 col-sm-6 text-center column items-center q-gutter-y-md"
            >
                <transition-group
                    appear
                    enter-active-class="animated fadeInUp"
                    leave-active-class="animated fadeOutDown"
                >
                    <n-btn
                        v-if="!isInitializing"
                        color="negative"
                        label="Login"
                        class="login-btn"
                        size="xl"
                        @click="showLogin"
                    />
                    <n-btn
                        v-if="!isInitializing && isDemo"
                        color="positive"
                        label="Request Access"
                        class="login-btn"
                        size="xl"
                        @click="showInquire"
                    />
                </transition-group>
            </div>
        </div>

        <div class="row bottom-row">
            <q-img
                src="~assets/svg/nortek-logo.svg"
                spinner-color="white"
                class="hidden-sm logo-svg self-center"
            />
            <q-space />
            <div class="col-auto column about">
                <div class="col-auto text-h5 text-negative">
                    Restricted Access
                </div>
                This is an internal administration application for Nortek Cloud
                Services
                <q-space />
                <div class="col-auto text-right text-subtitle2">
                    Version {{ version }} -
                </div>
            </div>
        </div>
    </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { fetchAuthSession } from 'aws-amplify/auth';
import { hasExternalConfig } from 'admin/boot/amplify';
import { useCognitoUserStore } from 'cmn/stores/cognitoUser';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import LoginDialog from 'cmn/dialogs/Login/loginDialog.vue';
import packageJson from 'adminRoot/package.json';

// import { useUserDb } from '@/lib/graphQL';

const $q = useQuasar();
const router = useRouter();
const version = packageJson.version;
const isDemo = process.env.DOMAIN_NAME === 'demo';
const isInitializing = ref(true);

const useCognitoUser = useCognitoUserStore();

const login = async () => {
    await useCognitoUser.updateUser();
    try {
        // await useUserDb().update({
        //     id: useCognitoUser.getUserId(),
        //     lastLogon: new Date(),
        // });
    } catch (error) {
        // Safe to fail, e.g. super user
        console.error(error);
    }

    await router.push({ name: 'main' });
};

const tryLogin = async () => {
    try {
        // TODO use state store and with hub to listen to changes

        const { credentials } = await fetchAuthSession({ forceRefresh: true });
        if (!credentials) throw new Error('No credentials!');

        await login();
        return true;
    } catch {
        return false;
    }
};

const showLogin = async () => {
    isInitializing.value = true;
    await tryLogin();
    $q.dialog({
        component: LoginDialog,
        componentProps: {
            useExternalConfig: hasExternalConfig,
        },
    })
        .onOk(async (status: 'USER_OK' | 'INQUIRE') => {
            if (status === 'USER_OK') {
                try {
                    await login();
                } catch (error) {
                    console.error(error);
                    isInitializing.value = false;
                }
            } else if (status === 'INQUIRE') {
                showInquire();
            }
        })
        .onCancel(() => {
            isInitializing.value = false;
        });
};

const showInquire = () => {
    isInitializing.value = true;
    missing();
    // $q.dialog({
    //     component: InquireDialog,
    // })
    //     .onOk(async () => {
    //         isInitializing.value = false;
    //     })
    //     .onCancel(() => {
    //         isInitializing.value = false;
    //     });
};

const missing = () => {
    $q.notify({
        message: 'This this release is currently not available.',
        color: 'negative',
        position: 'bottom',
    });
};

onMounted(async () => {
    try {
        await tryLogin();
    } catch (error) {
        console.error(error);
    } finally {
        isInitializing.value = false;
    }
});
</script>

<style scoped lang="scss">
#frontBackground {
    position: fixed;
    right: 0;
    bottom: 0;
    min-width: 100%;
    min-height: 100%;
    z-index: -1;
    background-image:
        linear-gradient(#00000080, #42033d80),
        url('./assets/desktop-cover.webp');
    background-size: cover;
    @media only screen and (max-width: 600px), screen and (max-height: 600px) {
        width: 100%;
        background-color: #000;
        background-image: url('./assets/mobile-cover.jpg');
        background-size: contain;
        background-repeat: no-repeat;
        background-position: 100% 0%;
    }
}

.frontpage {
    //position: absolute;
    // height: 100vh;
    // width: 100vw;
    color: white;

    span.line {
        display: inline-block;
    }

    .login-btn {
        width: 400px;
        max-width: 90%;
    }

    .slogan {
        padding: 24px;
        font-size: 3em;
        text-align: center;
    }

    .badge-apple {
        height: 47px;
        width: 157px;
    }
    .badge-android {
        height: 47px;
        width: 157px;
    }
    .badge-microsoft {
        height: 47px;
        width: 157px;
    }
    .badge-snap {
        height: 47px;
        width: 157px;
    }
    .badge-mobile-browser {
        position: absolute;
        top: 5px;
        right: 5px;

        &.badge-apple {
            margin-right: 10px; // Why is this needed? SVG error?
        }
    }

    .bottom-row {
        height: 200px;
        border-top: 2px solid rgba(0, 0, 0, 05);
        background-image: linear-gradient(
            rgba(0, 0, 0, 0.3),
            rgba(0, 0, 0, 0.3)
        );
        .logo-svg {
            margin-left: 16px;
            height: 142px;
            width: 206px;
        }
        .about {
            padding: 24px;
            margin-bottom: 16px;
        }
    }
}

.electron-nav {
    position: absolute;
    color: white;
    top: 0px;
    right: 0px;
    z-index: 99999;
}
</style>
