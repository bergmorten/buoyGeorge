import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        component: () => import('admin/layouts/PublicLayout.vue'),
        children: [
            {
                path: '',
                name: 'guest',
                component: () => import('admin/pages/IndexPage.vue'),
            },
        ],
    },
    {
        path: '/',
        component: () => import('admin/layouts/AdminLayout.vue'),
        children: [
            {
                path: '',
                name: 'main',
                component: () => import('admin/pages/admin/ClientPage.vue'),
                meta: {
                    menuSection: 'AdminClients',
                    requiresAuth: true,
                },
            },
            {
                path: '',
                name: 'admin_clients',
                component: () => import('admin/pages/admin/ClientPage.vue'),
                meta: {
                    menuSection: 'AdminClients',
                    requiresAuth: true,
                },
            },
            {
                path: 'meta',
                name: 'client_meta',
                component: () => import('admin/pages/clients/Org/OrgMeta.vue'),
                meta: {
                    menuSection: 'Management',
                    subSection: 'Meta',
                    requiresAuth: true,
                    requiresSuper: true,
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
                    requiresSuper: true,
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
                    requiresSuper: true,
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
                    requiresSuper: true,
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
                    requiresSuper: true,
                },
            },
            {
                path: 'management/demo',
                name: 'management_demo',
                component: () =>
                    import('admin/pages/clients/Demo/DemoData.vue'),
                meta: {
                    menuSection: 'Management',
                    subSection: 'Demo',
                    requiresAuth: true,
                    requiresSuper: true,
                },
            },
            {
                path: '',
                name: 'blank_page',
                component: () => import('admin/pages/BlankPage.vue'),
                meta: {
                    menuSection: 'Main',
                    requiresAuth: true,
                },
            },
        ],
    },
    // Always leave this as last one,
    // but you can also remove it
    {
        path: '/:catchAll(.*)*',
        component: () => import('admin/pages/ErrorNotFound.vue'),
    },
];

export default routes;
