import type { Router } from 'vue-router';
import { defineStore } from 'pinia';
import { reactive, computed } from 'vue';

export interface RouteState {
    routeName: string;
    menuSection: string;
    subSection: string | null;
}

export const useRouterStore = defineStore('route', () => {
    let _router: Router | undefined = undefined;
    const state = reactive<RouteState>({
        routeName: '',
        menuSection: 'Main',
        subSection: null,
    });

    const initRouterStore = (router: Router) => {
        _router = router;
        //const clickHandler = this.setAutoRoute.bind(this);

        state.menuSection = _router.currentRoute.value.meta.menuSection
            ? (_router.currentRoute.value.meta.menuSection as string)
            : 'Main';
        state.subSection = _router.currentRoute.value.meta.subSection
            ? (_router.currentRoute.value.meta.subSection as string)
            : null;
        state.routeName = _router.currentRoute.value.name
            ? _router.currentRoute.value.name.toString()
            : '';

        _router.afterEach((route) => {
            state.menuSection = route.meta.menuSection as string;
            state.subSection = route.meta.subSection
                ? (route.meta.subSection as string)
                : null;
            state.routeName = route.name ? route.name.toString() : '';
        });
    };

    const routerMeta = computed<RouteState>(() => {
        return {
            menuSection: state.menuSection,
            subSection: state.subSection,
            routeName: state.routeName,
        };
    });

    return {
        routerMeta,
        initRouterStore,
    };
});
