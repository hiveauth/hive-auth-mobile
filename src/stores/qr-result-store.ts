import { defineStore } from 'pinia';

interface QRAuthReqPayload {
  account: string;
  uuid: string;
  key: string;
  host: string;
}

export const useQrResultStore = defineStore('qr-result-store', {
  state: () => ({
    rawQRString: '',
  }),
  getters: {
    getQRAuthReqPayload: (state) => {
      if (
        state.rawQRString.length === 0 ||
        state.rawQRString.includes('has://auth_req/') == false
      ) {
        return null;
      }
      const base64Data = state.rawQRString.split('has://auth_req/')[1];
      const data = atob(base64Data);
      const result = JSON.parse(data);
      return {
        account: result.account,
        uuid: result.uuid,
        key: result.key,
        host: result.host,
      } as QRAuthReqPayload;
    },
  },
});
