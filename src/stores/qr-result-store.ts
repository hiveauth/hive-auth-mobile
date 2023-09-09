import { defineStore } from 'pinia';

export const useQrResultStore = defineStore('qr-result-store', {
  state: () => ({
    rawQRString: '',
  }),
});
