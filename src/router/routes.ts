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
        name: 'login',
        component: () => import('pages/Login.vue'),
      },
      {
        path: 'manage-accounts',
        name: 'manage-accounts',
        component: () => import('pages/ManageAccounts.vue'),
      },
      {
        path: 'account-management',
        name: 'account-management',
        component: () => import('pages/AccountManagement.vue'),
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
