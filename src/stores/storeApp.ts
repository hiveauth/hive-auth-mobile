import { defineStore } from 'pinia';

export interface logItem {
  id: string;
  log: string;
}

export const useAppStore = defineStore('storeApp', {
  state: () => ({
    logs: [] as logItem[],
    isHasServerConnected: false,
    path: '',
    scan_value: '',
  }),
});
