import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        component: () => import('client/layouts/PublicLayout.vue'),
        children: [
            {
                path: '',
                name: 'guest',
                component: () => import('client/pages/IndexPage.vue'),
            },
        ],
    },

    {
        path: '/',
        component: () => import('client/layouts/UserLayout.vue'),
        children: [
            {
                path: '',
                name: 'main',
                component: () => import('client/pages/IndexPage.vue'),
                meta: {
                    menuSection: 'Main',
                    requiresAuth: true,
                },
            },
            {
                path: '',
                name: 'blank_page',
                component: () => import('client/pages/BlankPage.vue'),
                meta: {
                    menuSection: 'Main',
                    requiresAuth: true,
                },
            },

            {
                path: 'account/user',
                name: 'account_settings',
                component: () =>
                    import('client/pages/account/profile/ProfilePage.vue'),
                meta: {
                    menuSection: 'Account',
                    subSection: 'Profile',
                    requiresAuth: true,
                },
            },
            {
                path: 'producers/map',
                name: 'producers_map',
                component: () =>
                    import('client/pages/producers/ProducersMap.vue'),
                meta: {
                    menuSection: 'Account',
                    subSection: 'Profile',
                    requiresAuth: true,
                },
            },
            {
                path: 'management/meta',
                name: 'management_meta',
                component: () => import('cmn/pages/management/org/OrgPage.vue'),
                meta: {
                    menuSection: 'Management',
                    subSection: 'Meta',
                    requiresAuth: true,
                    requiresOrgAdmin: true,
                },
            },
            {
                path: 'management/users',
                name: 'management_users',
                component: () =>
                    import('cmn/pages/management/users/UsersPage.vue'),
                meta: {
                    menuSection: 'Management',
                    subSection: 'Users',
                    requiresAuth: true,
                    requiresOrgAdmin: true,
                },
            },
            {
                path: 'management/producers',
                name: 'management_producers',
                component: () =>
                    import('cmn/pages/management/producers/ProducerPage.vue'),
                meta: {
                    menuSection: 'Management',
                    subSection: 'Producers',
                    requiresAuth: true,
                    requiresOrgAdmin: true,
                },
            },
            {
                path: 'management/fleets',
                name: 'management_fleets',
                component: () =>
                    import('cmn/pages/management/fleets/FleetsPage.vue'),
                meta: {
                    menuSection: 'Management',
                    subSection: 'Fleets',
                    requiresAuth: true,
                    requiresOrgAdmin: true,
                },
            },
            {
                path: 'management/projects',
                name: 'management_projects',
                component: () =>
                    import('cmn/pages/management/projects/ProjectsPage.vue'),
                meta: {
                    menuSection: 'Management',
                    subSection: 'Projects',
                    requiresAuth: true,
                    requiresOrgAdmin: true,
                },
            },
        ],
    },

    // Always leave this as last one,
    // but you can also remove it
    {
        path: '/:catchAll(.*)*',
        component: () => import('client/pages/ErrorNotFound.vue'),
    },
];

export default routes;
