import { defineStore } from 'pinia';

export interface HasStoreItem {
  id: string;
  log: string;
}

export const useHasLogsStore = defineStore('has-logs', {
  state: () => ({
    logs: [] as HasStoreItem[],
    isHasServerConnected: false,
  }),
});
