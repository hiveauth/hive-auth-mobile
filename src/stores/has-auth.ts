import { defineStore } from 'pinia';
import { SecureStorage } from '@aparajita/capacitor-secure-storage';

export const useHasAuthStore = defineStore('has-auth', {
  state: () => ({
    isUnlocked: false,
    passcode: '',
    hasPasscode: false,
  }),
  getters: {
    isDeviceLocked: (state) => !state.isUnlocked,
  },
  actions: {
    isValidPasscode(enteredPasscode: string): boolean {
      return (
        this.$state.hasPasscode &&
        enteredPasscode.length === 6 &&
        this.$state.passcode === enteredPasscode
      );
    },

    unlockApp() {
      this.$state.isUnlocked = true;
    },

    lockApp() {
      this.$state.isUnlocked = false;
    },

    async readKeys() {
      try {
        const value = (await SecureStorage.get(
          'passcode',
          true,
          false
        )) as string;
        if (value === null) {
          return;
        }
        this.$state.passcode = value;
        this.$state.hasPasscode = true;
        console.log('passcode is done reading');
      } catch (e) {
        console.log(
          `Probably not stored. Error reading passcode - ${e.message}. `
        );
      }
    },

    async setPasscode(passcode: string) {
      try {
        await SecureStorage.setSynchronize(false);
        await SecureStorage.set('passcode', passcode, true, false);
        this.$state.passcode = passcode;
        this.$state.hasPasscode = true;
      } catch (e) {
        console.log(`Error saving passcode - ${e.message}. `);
      }
    },
  },
});
