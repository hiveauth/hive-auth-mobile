import { defineStore } from 'pinia';
import { SecureStorage } from '@aparajita/capacitor-secure-storage';
import { AccountAuthModel } from 'src/models/account-auth-model';

const DEFAULT_HAS_SERVER = 'wss://hive-auth.arcange.eu';
const DEFAULT_HIVE_API = 'https://api.hive.blog';

export const useHasStorageStore = defineStore('has-storage', {
  state: () => ({
    accounts: '',
  }),
  getters: {
    accountsJson: (state) => {
      if (state.accounts.length === 0) {
        return [];
      } else {
        return JSON.parse(state.accounts) as AccountAuthModel[];
      }
    },
    pksa_name: () => 'HiveAuth App',
    auth_req_secret: () => process.env.AUTH_REQ_SECRET,
    auth_timeout_days: () => 30,
    auth_req_approve: () => true,
    auto_approve_auth_req: () => true,
    auth_req_reject: () => false,
    sign_req_reject: () => true,
    challenge_req_reject: () => false,
    hive_api: () => process.env.HIVE_API || DEFAULT_HIVE_API,
    has_server: () => process.env.HAS_SERVER || DEFAULT_HAS_SERVER,
    hideEncryptedData: () => true,
  },
  actions: {
    async updateAsJsonString(json: string) {
      try {
        await SecureStorage.setSynchronize(false);
        await SecureStorage.set('accounts', json, true, false);
        this.$state.accounts = json;
      } catch (e) {
        console.log(`Error saving passcode - ${e.message}. `);
      }
    },

    async update(accounts: AccountAuthModel[]) {
      const string = JSON.stringify(accounts);
      this.updateAsJsonString(string);
    },

    async readStorage() {
      try {
        const value = (await SecureStorage.get(
          'accounts',
          true,
          false
        )) as string;
        if (value === null) {
          return;
        }
        this.$state.accounts = value;
      } catch (e) {
        console.log(
          `Probably not stored. Error reading passcode - ${e.message}. `
        );
      }
    },
  },
});
