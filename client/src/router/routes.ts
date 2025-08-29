import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        component: () => import('layouts/PublicLayout.vue'),
        children: [
            {
                path: '',
                name: 'guest',
                component: () => import('pages/IndexPage.vue'),
            },
        ],
    },

    {
        path: '/',
        component: () => import('layouts/UserLayout.vue'),
        children: [
            {
                path: '',
                name: 'main',
                component: () => import('pages/IndexPage.vue'),
                meta: {
                    menuSection: 'Main',
                    requiresAuth: true,
                },
            },
            {
                path: '',
                name: 'blank_page',
                component: () => import('pages/BlankPage.vue'),
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
                path: 'management/meta',
                name: 'management_meta',
                component: () =>
                    import('client/pages/management/org/OrgPage.vue'),
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
                component: () => import('pages/management/users/UsersPage.vue'),
                meta: {
                    menuSection: 'Management',
                    subSection: 'Users',
                    requiresAuth: true,
                    requiresOrgAdmin: true,
                },
            },
            {
                path: 'management/fleets',
                name: 'management_fleets',
                component: () =>
                    import('client/pages/management/fleets/FleetsPage.vue'),
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
                    import('client/pages/management/projetcs/ProjectsPage.vue'),
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
        component: () => import('pages/ErrorNotFound.vue'),
    },
];

export default routes;
