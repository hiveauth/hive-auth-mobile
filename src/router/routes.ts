import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'main',
        component: () => import('pages/MainPage.vue'),
      },
      {
        path: 'import-key',
        name: 'import-key',
        component: () => import('pages/ImportKey.vue'),
      },
      {
        path: 'scan',
        name: 'scan',
        component: () => import('pages/QRScannerPage.vue'),
      },
      {
        path: 'accounts',
        name: 'accounts',
        component: () => import('pages/Accounts.vue'),
      },
      {
        path: 'websocket-logs',
        name: 'websocket-logs',
        component: () => import('pages/WebSocketLogs.vue'),
      },
      {
        path: 'about',
        name: 'about',
        component: () => import('pages/About.vue'),
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
