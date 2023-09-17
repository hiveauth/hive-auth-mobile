import { defineStore } from 'pinia';
import { SecureStorage } from '@aparajita/capacitor-secure-storage';
import { NativeBiometric } from 'capacitor-native-biometric';

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
      this.$state.passcode = '';
      this.$state.hasPasscode = true;
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
        this.$state.passcode = value;
        this.$state.hasPasscode = true;
        console.log('passcode is done reading');
      } catch (e) {
        console.log(
          `Probably not stored. Error reading passcode - ${e.message}. `
        );
      }
    },

    async performBiometrics() {
      const verified = await NativeBiometric.verifyIdentity({
        reason: 'Allow Auth Signer App to use biometrics for App unlock',
        title: 'Unlock',
        subtitle: 'Unlock Auth Signer with Biometrics',
        description:
          'Provide your FaceID or Touch ID to unlock the Auth Signer Application',
      })
        .then(() => true)
        .catch(() => false);

      return verified;
    },

    async readPasscodeFromBiometrics() {
      try {
        const credentials = await NativeBiometric.getCredentials({
          server: 'https:/hiveauth.com',
        });
        const passcode = credentials.password;
        if (passcode === null) {
          return;
        }
        this.$state.passcode = passcode;
        this.$state.hasPasscode = true;
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
        server: 'https:/hiveauth.com',
      });
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
