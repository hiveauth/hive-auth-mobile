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
    lastAccountName: '',
    lastAccountTab: '',
  }),
  actions: {
    async read() {
      try {
        await SecureStorage.setSynchronize(false);

        const accounts = (await SecureStorage.get('accounts')) as string;
        if ( accounts && accounts.length > 0 ) {
          this.accounts = (JSON.parse(accounts) as IAccount[]).filter(o => !Object.values(o.keys).every(el => el === undefined))
        }
        const lastAccountName = (await SecureStorage.get('lastAccountName')) as string;
        if (lastAccountName && lastAccountName.length > 0) {
          this.lastAccountName = this.accounts.some(o => o.name ==lastAccountName) ? lastAccountName : this.accounts.length > 0 ? this.accounts[0].name : '';
        }
        this.lastAccountTab = (await SecureStorage.get('lastAccountTab')) as string;
      } catch (e) {
        console.error(`storeAccounts.read failed - ${(e as Error).message}`);
      }
      return this.accounts
    },

    async updateLastAccountName(value: string) {
      try {
        this.lastAccountName = value;
        await SecureStorage.setSynchronize(false);
        await SecureStorage.set('lastSelectedAccount', value);
      } catch (e) {
        console.error(`storeAccounts.updateLastAccountName failed - ${(e as Error).message}. `);
      }
    },

    async updateLastAccountTab(value: string) {
      try {
        this.lastAccountName = value;
        await SecureStorage.setSynchronize(false);
        await SecureStorage.set('lastSelectedtab', value);
      } catch (e) {
        console.error(`storeAccounts.updateLastAccountName failed - ${(e as Error).message}. `);
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
