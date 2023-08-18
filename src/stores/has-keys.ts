import { defineStore } from 'pinia';
import { SecureStorage } from '@aparajita/capacitor-secure-storage';
import { KeysModel } from 'src/models/keys-model';

export const useHasKeysStore = defineStore('has-keys', {
  state: () => ({
    keys: '',
  }),
  getters: {
    keysJson: (state) => {
      if (state.keys.length === 0) {
        return [];
      } else {
        return JSON.parse(state.keys) as KeysModel[];
      }
    },
  },
  actions: {
    async updateAsJsonString(json: string) {
      try {
        await SecureStorage.setSynchronize(false);
        await SecureStorage.set('keys', json, true, false);
        this.$state.keys = json;
      } catch (e) {
        console.log(`Error saving passcode - ${e.message}. `);
      }
    },

    async update(keys: KeysModel[]) {
      const string = JSON.stringify(keys);
      this.updateAsJsonString(string);
    },

    async readKeys() {
      try {
        const value = (await SecureStorage.get('keys', true, false)) as string;
        if (value === null) {
          return;
        }
        this.$state.keys = value;
      } catch (e) {
        console.log(
          `Probably not stored. Error reading passcode - ${e.message}. `
        );
      }
    },
  },
});
