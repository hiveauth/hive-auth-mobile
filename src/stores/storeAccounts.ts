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

const VERSION = 1
const KEY_VERSION = 'version'
const KEY_ACCOUNTS = 'accounts'
const KEY_LASTACCOUNTNAME = 'lastAccountName'
const KEY_LASTACCOUNTTAB = 'lastAccountTab'

let encryptionKey = ""

export const useAccountsStore = defineStore('storeAccounts', {

  state: () => ({
    accounts: [] as IAccount[],
    lastAccountName: '',
    lastAccountTab: '',
  }),
  actions: {
    clean() {
      for (const account of this.accounts) {
        account.auths = account.auths.filter(o => o.expire > Date.now())
      }
    },

    async read(pinCode: string) {
      encryptionKey = pinCode
      try {
        await SecureStorage.setSynchronize(false)

        const version = (await SecureStorage.get(KEY_VERSION)) as number

        let accounts = (await SecureStorage.get(KEY_ACCOUNTS)) as string
        if ( accounts && accounts.length > 0 ) {
          if(version > 0) {
            accounts = CryptoJS.AES.decrypt(accounts, encryptionKey).toString(CryptoJS.enc.Utf8)
          }
          this.accounts = (JSON.parse(accounts) as IAccount[]).filter(o => !Object.values(o.keys).every(el => el === undefined))
          this.clean()
        }
        const lastAccountName = (await SecureStorage.get(KEY_LASTACCOUNTNAME)) as string;
        if (lastAccountName && lastAccountName.length > 0) {
          this.lastAccountName = this.accounts.some(o => o.name ==lastAccountName) ? lastAccountName : this.accounts.length > 0 ? this.accounts[0].name : '';
        }
        this.lastAccountTab = (await SecureStorage.get(KEY_LASTACCOUNTTAB)) as string;
      } catch (e) {
        console.error(`storeAccounts.read failed - ${(e as Error).message}`);
      }
      return this.accounts
    },

    async write() {
      try {
        this.clean()
        await SecureStorage.setSynchronize(false);
        await SecureStorage.set(KEY_VERSION, VERSION);
        await SecureStorage.set(KEY_ACCOUNTS, CryptoJS.AES.encrypt(JSON.stringify(this.accounts),encryptionKey).toString())
        await SecureStorage.set(KEY_LASTACCOUNTNAME, this.lastAccountName);
        await SecureStorage.set(KEY_LASTACCOUNTTAB, this.lastAccountTab);
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
