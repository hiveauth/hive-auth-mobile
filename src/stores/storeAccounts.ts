import { defineStore } from 'pinia';
import { SecureStorage } from '@aparajita/capacitor-secure-storage';
import CryptoJS from 'crypto-js';

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
  created: number;
  lastused: number;
  nonce?: number;
}

export interface IAccount {
  name: string;
  keys: IAccountKeys;
  auths: IAccountAuth[];
}

const STORE_VERSION = 1
let key = ""

export const useAccountsStore = defineStore('storeAccounts', {

  state: () => ({
    accounts: [] as IAccount[],
    lastAccountName: '',
    lastAccountTab: '',
    storeVersion: 0
  }),
  actions: {
    clean() {
      for (const account of this.accounts) {
        account.auths = account.auths.filter(o => o.expire > Date.now())
      }
    },

    async read(pinCode: string) {
      key = pinCode
      try {
        await SecureStorage.setSynchronize(false)

        const storeVersion = (await SecureStorage.get('version')) as number

        let accounts = (await SecureStorage.get('accounts')) as string
        if ( accounts && accounts.length > 0 ) {
          if(storeVersion > 0) {
            accounts = CryptoJS.AES.decrypt(accounts, key).toString(CryptoJS.enc.Utf8)
          }
          this.accounts = (JSON.parse(accounts) as IAccount[]).filter(o => !Object.values(o.keys).every(el => el === undefined))
          this.clean()
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

    async write() {
      try {
        this.clean()
        await SecureStorage.setSynchronize(false);
        await SecureStorage.set('storeVersion', STORE_VERSION);
        await SecureStorage.set('accounts', CryptoJS.AES.encrypt(JSON.stringify(this.accounts),key).toString())
        await SecureStorage.set('lastAccountName', this.lastAccountName);
        await SecureStorage.set('lastAccountTab', this.lastAccountTab);
      } catch (e) {
        console.error(`storeAccounts.write failed - ${(e as Error).message}. `);
      }
    },

    async updateLastAccountName(value: string) {
        this.lastAccountName = value;
        this.write()
    },

    async updateLastAccountTab(value: string) {
        this.lastAccountTab = value;
        this.write()
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
      this.write()
    },

    async deleteAccount(name: string) {
      this.accounts = this.accounts.filter((o) => o.name != name)
      this.write()
    },

    async reset() {
      this.accounts = []
      this.lastAccountName = ''
      this.lastAccountTab = ''
      await this.write()
    }
  },
});
