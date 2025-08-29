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
        component: () => import('layouts/AdminLayout.vue'),
        children: [
            {
                path: '',
                name: 'main',
                component: () => import('pages/ClientPage.vue'),
                meta: {
                    menuSection: 'AdminClients',
                    requiresAuth: true,
                },
            },
            {
                path: '',
                name: 'admin_clients',
                component: () => import('pages/ClientPage.vue'),
                meta: {
                    menuSection: 'AdminClients',
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
