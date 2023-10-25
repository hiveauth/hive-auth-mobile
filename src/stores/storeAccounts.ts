import { defineStore } from 'pinia';
import { SecureStorage } from '@aparajita/capacitor-secure-storage';
// import { KeysModel } from 'src/models/keys-model';

await SecureStorage.setSynchronize(false);

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

type whitelist_ops = 
  'vote'
  | 'comment'
  | 'account_update2'
  | 'comment_options'
  | 'delete_comment'
  | 'custom_json'
  | 'custom_binary'
  | 'claim_reward_balance'
  | 'claim_reward_balance2'
  | 'create_proposal'
  | 'remove_proposal'
  | 'update_proposal'
  | 'update_proposal_votes'
  | 'vote2'

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
    didUpdate: false,
  }),
  actions: {
    async read() {
      try {
        const value = (await SecureStorage.get('accounts')) as string;
        if (value ) {
          this.accounts = JSON.parse(value);
        }
      } catch (e) {
        console.log(`storeAccounts.read failed - ${e.message}`);
      }
      return this.accounts
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
        await SecureStorage.set('accounts', JSON.stringify(this.accounts));
        this.didUpdate = true;
      } catch (e) {
        console.log(`storeAccounts.update failed - ${e.message}. `);
      }
    },
  },
});
