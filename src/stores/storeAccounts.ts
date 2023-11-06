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
  actions: {
    async read() {
      try {
        await SecureStorage.setSynchronize(false);

        const accounts = (await SecureStorage.get('accounts')) as string;
        if ( accounts && accounts.length > 0 ) {
          this.accounts = (JSON.parse(accounts) as IAccount[]).filter(o => !Object.values(o.keys).every(el => el === undefined))
        }

        const lastSelected = (await SecureStorage.get('lastSelectedAccount')) as string;
        if (lastSelected && lastSelected.length > 0) {
          this.lastSelectedAccountName = this.accounts.some(o => o.name ==lastSelected) ? lastSelected : this.accounts.length > 0 ? this.accounts[0].name : '';
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

    async updateAccount(value: IAccount, sort = false) {
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
      if(sort) {
        this.accounts.sort((a, b) => a.name.localeCompare(b.name));
      }
      try {
        await SecureStorage.setSynchronize(false);
        await SecureStorage.set('accounts', JSON.stringify(this.accounts));
      } catch (e) {
        console.error(`storeAccounts.update failed - ${(e as Error).message}. `);
      }
    },

    async deleteAccount(name: string) {
      this.accounts = this.accounts.filter((o) => o.name != name)
      try {
        await SecureStorage.setSynchronize(false);
        await SecureStorage.set('accounts', JSON.stringify(this.accounts));
      } catch (e) {
        console.error(`storeAccounts.delete failed - ${(e as Error).message}. `);
      }
    },
  },
  
});
