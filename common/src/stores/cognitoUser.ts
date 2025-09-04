import { defineStore } from 'pinia';
import { ref, reactive, computed, readonly } from 'vue';
import { fetchAuthSession } from 'aws-amplify/auth';
import { startMonitorUser, stopMonitorUser } from 'cmn/lib/bugsnag';

export interface CognitoUser {
    validUser: boolean;
    sub: string;
    username: string | null; // Equals ID in user scheme database
    email: string;
    groups?: string[];
    isSuper: boolean;
    isAdmin: boolean;
}
export const useCognitoUserStore = defineStore('cognitoUser', () => {
    const state = reactive<CognitoUser>({
        validUser: false,
        sub: '',
        username: null as string | null,
        email: '',
        groups: [],
        isSuper: false,
        isAdmin: false,
    });

    const initialized = ref(false);

    const updateUser = async () => {
        try {
            initialized.value = true;
            const authSession = await fetchAuthSession();
            if (!authSession || !authSession.userSub) {
                throw new Error('No auth session found');
            }

            const idToken = authSession.tokens?.idToken;
            const sub = idToken?.payload.sub ?? '';
            const email: string = idToken?.payload.email
                ? (idToken?.payload.email as string)
                : '';
            const username =
                (idToken?.payload['cognito:username'] as string | undefined) ??
                email;

            const groups: string[] = (idToken?.payload[
                'cognito:groups'
            ] as string[]) ?? [''];

            const cognitoData = {
                sub: sub,
                username: username,
                email: email,
                groups: groups,
            };

            setCognitoData(cognitoData);
            startMonitorUser(username); // Username is id in db
            return true;
        } catch {
            //console.error('Error in updating cognito user', err);
            invalidateUser();
        }
        return false;
    };

    const setCognitoData = (
        newUserData: Omit<CognitoUser, 'validUser' | 'isSuper' | 'isAdmin'>,
    ) => {
        const isSuper =
            Array.isArray(newUserData.groups) &&
            newUserData.groups.includes('SUPERS');
        const isAdmin =
            Array.isArray(newUserData.groups) &&
            newUserData.groups.includes('ADMINS');

        state.email = newUserData.email;
        state.username = newUserData.username;
        state.sub = newUserData.sub;
        state.groups = newUserData.groups ?? [];
        state.validUser = true;
        state.isSuper = isSuper;
        state.isAdmin = isAdmin;
    };

    const invalidateUser = () => {
        state.validUser = false;
        state.sub = '';
        state.username = '';
        state.email = '';
        state.groups = [];
        state.isSuper = false;
        state.isAdmin = false;
        stopMonitorUser();
    };

    const hasAdminRights = computed(() => {
        if (!initialized.value || !state.validUser) return false;

        return state.isSuper || state.isAdmin;
    });

    const isAdmin = computed(() => {
        if (!initialized.value || !state.validUser) return false;
        return state.isAdmin;
    });

    const isSuperAdmin = computed(() => {
        if (!initialized.value || !state.validUser) return false;
        return state.isSuper;
    });

    const isValidUser = computed(() => {
        return initialized.value && state.validUser;
    });

    const userId = computed(() => {
        return state.username;
    });

    const userSub = computed(() => {
        return state.sub;
    });

    const isInitialized = computed(() => {
        return initialized.value;
    });

    return {
        initialized: readonly(initialized),
        updateUser,
        invalidateUser,
        hasAdminRights,
        isAdmin,
        isSuperAdmin,
        isValidUser,
        userId,
        userSub,
        isInitialized,
    };
});
