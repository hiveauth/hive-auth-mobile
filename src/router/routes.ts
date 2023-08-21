import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'index',
        name: 'import-key',
        component: () => import('pages/IndexPage.vue'),
      },
      {
        path: 'qr',
        name: 'qr-scanner',
        component: () => import('pages/QRScannerPage.vue'),
      },
      {
        path: '',
        name: 'passcode-lock',
        component: () => import('pages/PinLockPage.vue'),
      },
      {
        path: 'pksa-page',
        name: 'pksa-page',
        component: () => import('pages/PKSAPage.vue'),
      },
      {
        path: 'manage-accounts',
        name: 'manage-accounts',
        component: () => import('pages/ManageAccounts.vue'),
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
