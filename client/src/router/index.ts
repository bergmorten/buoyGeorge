import { defineRouter } from '#q-app/wrappers';
import {
    createMemoryHistory,
    createRouter,
    createWebHashHistory,
    createWebHistory,
} from 'vue-router';
import routes from './routes';
import { useRouterStore } from 'cmn/stores/route';
import { useCognitoUserStore } from 'cmn/stores/cognitoUser';
/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
    const cognitoUserStore = useCognitoUserStore();
    const routerStore = useRouterStore();
    const createHistory = process.env.SERVER
        ? createMemoryHistory
        : process.env.VUE_ROUTER_MODE === 'history'
          ? createWebHistory
          : createWebHashHistory;

    const Router = createRouter({
        scrollBehavior: () => ({ left: 0, top: 0 }),
        routes,

        // Leave this as is and make changes in quasar.conf.js instead!
        // quasar.conf.js -> build -> vueRouterMode
        // quasar.conf.js -> build -> publicPath
        history: createHistory(process.env.VUE_ROUTER_BASE),
    });

    routerStore.initRouterStore(Router);

    Router.beforeEach(async (to, from, next) => {
        // Not logged into a guarded route?

        if (!cognitoUserStore.isInitialized) {
            await cognitoUserStore.updateUser();
        }

        if (to.meta.requiresAuth) {
            if (!cognitoUserStore.isValidUser) {
                next({ name: 'guest' });
                return;
            }
            if (to.meta.requiresOrgAdmin) {
                if (!cognitoUserStore.hasAdminRights) {
                    next({ name: 'guest' });
                    return;
                }
            }
        }
        next();
    });

    return Router;
});
