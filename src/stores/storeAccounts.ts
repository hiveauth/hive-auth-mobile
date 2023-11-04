import { defineStore } from 'pinia';
import { SecureStorage } from '@aparajita/capacitor-secure-storage';

export interface IAccountKeys {
  posting?: string;
  active?: string;
  memo?: string;
}

export interface IAccountAuthApp {
  name: string;
  icon: string;
  description: string;
}

export interface IAccountAuth {
  expire: number;
  key: string;
  app: IAccountAuthApp;
  whitelists: string[];
  ts_create: string;
  ts_expire: string;
  ts_lastused?: string;
  nonce?: number;
}

export interface IAccount {
  name: string;
  keys: IAccountKeys;
  auths: IAccountAuth[];
}

export const useAccountsStore = defineStore('storeAccounts', {
  state: () => ({
    accounts: [] as IAccount[],
    lastSelectedAccountName: '',
  }),
  getters: {
    sortedAccounts:(state) => {
      return state.accounts.sort((a, b) => a.name.localeCompare(b.name));
    }
  },
  actions: {
    async read() {
      try {
        await SecureStorage.setSynchronize(false);
        const value = (await SecureStorage.get('accounts')) as string;
        const lastSelected = (await SecureStorage.get('lastSelectedAccount')) as string;
        if ( value && value.length > 0 ) {
          this.accounts = JSON.parse(value);
        }
        if (lastSelected && lastSelected.length > 0) {
          this.lastSelectedAccountName = lastSelected;
        }
      } catch (e) {
        console.error(`storeAccounts.read failed - ${(e as Error).message}`);
      }
      return this.accounts
    },

    async updateLastSelectedAccount(newValue: string) {
      try {
        this.lastSelectedAccountName = newValue;
        await SecureStorage.setSynchronize(false);
        await SecureStorage.set('lastSelectedAccount', newValue);
      } catch (e) {
        console.error(`storeAccounts.update failed - ${e.message}. `);
      }
    },

    async updateAccount(value: IAccount) {
      const account = this.accounts.find((o) => o.name === value.name)
      if(account) {
        account.keys = value.keys
        account.auths = value.auths
      } else {
        this.accounts.push({
          name: value.name,
          keys: value.keys,
          auths: value.auths
        })
      }
      try {
        await SecureStorage.setSynchronize(false);
        await SecureStorage.set('accounts', JSON.stringify(this.accounts));
      } catch (e) {
        console.error(`storeAccounts.update failed - ${(e as Error).message}. `);
      }
    },
  },
});
