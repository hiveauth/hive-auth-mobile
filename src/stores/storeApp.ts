import { defineStore } from 'pinia';
import { SecureStorage } from '@aparajita/capacitor-secure-storage';
import { NativeBiometric } from 'capacitor-native-biometric';
import { Pendings } from '../classes/pendings'
import { createI18n } from 'vue-i18n'
import messages from 'src/i18n'
import packageJson from '../../package.json'
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)

const i18n = createI18n({locale: 'en-US', messages}).global

const CREDENTIALS_SERVER = 'hiveauth.mobile'

export interface logItem {
  id: number;
  message: string;
}

export const useAppStore = defineStore('storeApp', {
  state: () => ({
    pendingsAuthReq: new Pendings(),
    pendingsAuthPayload: new Pendings(),
    logs: [] as logItem[],
    resetWebsocket: false,
    isUnlocked: false,
    isHASConnected: false,
    isScanning: false,
    menuOpen: false,
    headerSubtitle: '',
    scanValue: '',
    passcode: '',
    hasPasscode: false,
    appVersion: '',
    nodeTimeout: 0,
  }),

  getters: {
    isValidPasscode: (state) => {
      return ((enteredPasscode: string) => (
        state.hasPasscode &&
        enteredPasscode.length === 6 &&
        enteredPasscode === state.passcode
      ))
    },
    // helper functions
    getAvatar: () => { return (username: string) => `https://images.hive.blog/u/${username}/avatar/small` },
    capitalize: () => { return (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() },
    formatDate: () => { return (timestamp: number | string) => dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss') },
  },

  actions: {
    log(message: string) {
      console.log(message);
      this.logs.push({
        id: Date.now(),
        message: message,
      })
    },

    unlockApp() {
      this.appVersion = packageJson.version
      this.isUnlocked = true;
    },

    lockApp() {
      this.isUnlocked = false;
      this.hasPasscode = true;
    },

    async isBiometricsAvailable() {
      const result = await NativeBiometric.isAvailable();
      return result.isAvailable === true;
    },

    async readCode() {
      try {
        const value = (await SecureStorage.get( 'passcode', true, false )) as string;
        if (value === null) {
          return;
        }
        this.passcode = value;
        this.hasPasscode = true;
      } catch (e) {
        console.error(`storeApp.readCode failed - ${(e as Error).message}. `);
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
      .catch(() => false)

      return verified;
    },

    async readPasscodeFromBiometrics() {
      try {
        const credentials = await NativeBiometric.getCredentials({ server: CREDENTIALS_SERVER });
        const passcode = credentials.password;
        if (passcode === null) {
          return;
        }
        this.passcode = passcode;
        this.hasPasscode = true;
      } catch (e) {
        console.error(`storeApp.readPasscodeFromBiometrics failed - ${(e as Error).message}`
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
      } catch (e) {
        console.error(`Error saving passcode - ${(e as Error).message}. `);
      }
    },

    async reset() {
      await this.setPasscode('')
      this.hasPasscode = false
    },
  },
});

