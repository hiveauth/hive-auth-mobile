import { defineStore } from 'pinia';
import { SecureStorage } from '@aparajita/capacitor-secure-storage';
import { NativeBiometric } from 'capacitor-native-biometric';

import { createI18n } from 'vue-i18n'
import messages from 'src/i18n'

const i18n = createI18n({locale: 'en-US', messages}).global

// TODO: Replace CREDENTIALS_SERVER
//const CREDENTIALS_SERVER = 'hiveauth.mobile'
const CREDENTIALS_SERVER = 'https:/hiveauth.com'


export interface logItem {
  id: string;
  log: string;

}

export const useAppStore = defineStore('storeApp', {
  state: () => ({
    logs: [] as logItem[],
    isHasServerConnected: false,
    path: '',
    scan_value: '',
    // app authentication
    isUnlocked: false,
    passcode: '',
    hasPasscode: false,
  }),

  getters: {
    isDeviceLocked: (state) => !state.isUnlocked,
    isValidPasscode: (state) => {
      return ((enteredPasscode: string) => (
        state.hasPasscode &&
        enteredPasscode.length === 6 &&
        enteredPasscode === state.passcode
      ))
    },
  },

  actions: {
    unlockApp() {
      this.isUnlocked = true;
    },

    lockApp() {
      this.isUnlocked = false;
      this.hasPasscode = true;
    },

    async doWeHaveNativeBiometrics() {
      const result = await NativeBiometric.isAvailable();
      return result.isAvailable === true;
    },

    async readCode() {
      try {
        const value = (await SecureStorage.get(
          'passcode',
          true,
          false
        )) as string;
        if (value === null) {
          return;
        }
        this.passcode = value;
        this.hasPasscode = true;
        console.log('passcode is done reading');
      } catch (e) {
        console.log(`Probably not stored. Error reading passcode - ${e.message}. `);
      }
    },

    async performBiometrics() {
      const verified = await NativeBiometric.verifyIdentity({
        reason: i18n.t('store_auth.biometrics_reason'),
        title: i18n.t('store_auth.biometrics_title'),
        subtitle: i18n.t('store_auth.biometrics_subtitle'),
        description: i18n.t('store_auth.biometrics_description'),
      })
      .then(() => true)
      .catch(() => false);

      return verified;
    },

    async readPasscodeFromBiometrics() {
      try {
        const credentials = await NativeBiometric.getCredentials({
          server: CREDENTIALS_SERVER,
        });
        const passcode = credentials.password;
        if (passcode === null) {
          return;
        }
        this.passcode = passcode;
        this.hasPasscode = true;
        console.log('passcode is done reading');
      } catch (e) {
        console.log(
          `Probably not stored. Error reading passcode - ${e.message}. `
        );
      }
    },

    async setPasscodeToBiometrics(passcode: string) {
      await NativeBiometric.setCredentials({
        username: 'passcode',
        password: passcode,
        server: CREDENTIALS_SERVER,
      });
    },

    async setPasscode(passcode: string) {
      try {
        await SecureStorage.setSynchronize(false);
        await SecureStorage.set('passcode', passcode, true, false);
        this.passcode = passcode;
        this.hasPasscode = true;
      } catch (e: any) {
        console.log(`Error saving passcode - ${e.message}. `);
      }
    },
  },
});
