import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'import-key',
        name: 'import-key',
        component: () => import('pages/ImportKey.vue'),
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
        path: 'new-pksa-page',
        name: 'new-pksa-page',
        component: () => import('pages/NewPKSAPage.vue'),
      },
      {
        path: 'manage-accounts',
        name: 'manage-accounts',
        component: () => import('pages/ManageAccounts.vue'),
      },
      {
        path: 'main-menu',
        name: 'main-menu',
        component: () => import('pages/MainMenu.vue'),
      },
      {
        path: 'websocket-logs',
        name: 'websocket-logs',
        component: () => import('pages/WebSocketLogs.vue'),
      },
      {
        path: 'about-us',
        name: 'about-us',
        component: () => import('pages/AboutUs.vue'),
      },
      {
        path: 'active-sessions',
        name: 'active-sessions',
        component: () => import('pages/ActiveSession.vue'),
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
