<template>
  <q-page>
    <div class="q-pa-lg" v-if="data.doWeHaveDeviceBiometrics">
      <q-input
        outlined
        rounded
        v-model="data.code"
        label="6 Digit Passcode"
        placeholder="Enter six digit passcode here"
        class="q-pt-lg"
        :type="data.isPasscodeVisible ? 'text' : 'password'"
        inputmode="numeric"
        pattern="[0-9]*"
        autocomplete="off"
        maxlength="6"
        @update:model-value="digitsChanged"
      >
        <template v-slot:prepend>
          <q-icon name="pin" />
        </template>
        <template v-slot:append>
          <q-icon
            :name="data.isPasscodeVisible ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="data.isPasscodeVisible = !data.isPasscodeVisible"
          />
        </template>
      </q-input>

      <q-input
        outlined
        rounded
        v-model="data.repeatCode"
        label="Repeat Passcode"
        placeholder="Repeat passcode here"
        class="q-pt-lg"
        :type="data.isPasscodeVisible ? 'text' : 'password'"
        inputmode="numeric"
        pattern="[0-9]*"
        autocomplete="off"
        maxlength="6"
        v-if="!hasAuthStore.hasPasscode"
      >
        <template v-slot:prepend>
          <q-icon name="pin" />
        </template>
        <template v-slot:append>
          <q-icon
            :name="data.isPasscodeVisible ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="data.isPasscodeVisible = !data.isPasscodeVisible"
          />
        </template>
      </q-input>

      <div class="row q-mt-lg" v-if="hasAuthStore.hasPasscode">
        <q-btn
          class="col q-pt-sm q-pb-sm"
          rounded
          color="primary"
          label="Unlock"
          @click="verifyCode()"
        />
      </div>

      <div class="row q-mt-lg" v-if="!hasAuthStore.hasPasscode">
        <q-btn
          class="col q-pt-sm q-pb-sm"
          rounded
          color="primary"
          label="Set Passcode"
          :disable="data.code.length !== 6 || data.code !== data.repeatCode"
          @click="setPasscode()"
        />
      </div>
    </div>
    <div class="q-pa-lg" v-if="data.doWeHaveDeviceBiometrics === false">
      Device Biometrics not available. Please enable it & restart app.
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useHasPathStore } from 'src/stores/has-path';
import { useHasAuthStore } from 'src/stores/has-auth';
import { useHasKeysStore } from 'src/stores/has-keys';
import { useHasStorageStore } from 'src/stores/has-storage';

export default defineComponent({
  name: 'passcode-lock',
  components: {},
  setup() {
    const hasAuthStore = useHasAuthStore();
    const hasKeysStore = useHasKeysStore();
    const hasStorageStore = useHasStorageStore();
    const router = useRouter();
    const $q = useQuasar();
    const data = ref({
      code: '',
      repeatCode: '',
      isPasscodeVisible: false,
      doWeHaveDeviceBiometrics: false,
    });

    function digitsChanged(newValue: string | number | null) {
      if (
        hasAuthStore.hasPasscode &&
        typeof newValue === 'string' &&
        newValue.length === 6
      ) {
        verifyCode();
      }
    }

    async function reloadBiometrics() {
      let result = await hasAuthStore.doWeHaveNativeBiometrics();
      data.value.doWeHaveDeviceBiometrics = result;
    }

    async function verifyCode() {
      const biometricsResult = await hasAuthStore.performBiometrics();
      if (biometricsResult && hasAuthStore.isValidPasscode(data.value.code)) {
        $q.notify({
          color: 'positive',
          position: 'bottom',
          message: "Passcode is valid. You're Authorised",
          icon: 'check',
        });
        hasAuthStore.unlockApp();
        await hasKeysStore.readKeys();
        await hasStorageStore.readStorage();
        // router.push({ name: 'import-key' });
        router.replace({ name: 'main-menu' });
      } else {
        console.log('Invalid Passcode entered');
        $q.notify({
          color: 'negative',
          position: 'bottom',
          message: 'Passcode is invalid.',
          icon: 'dangerous',
        });
      }
    }

    async function setPasscode() {
      try {
        await hasAuthStore.setPasscodeToBiometrics(data.value.code);
        await hasAuthStore.readPasscodeFromBiometrics();
        hasAuthStore.unlockApp();
        await hasKeysStore.readKeys();
        await hasStorageStore.readStorage();
        $q.notify({
          color: 'positive',
          position: 'bottom',
          message: 'Passcode is now set.',
          icon: 'check',
        });
        // router.push({ name: 'main-menu' });
        router.replace({ name: 'main-menu' });
      } catch (e) {
        $q.notify({
          color: 'negative',
          position: 'bottom',
          message: 'Error setting passcode',
          icon: 'report_problem',
        });
      }
    }

    return {
      data,
      digitsChanged,
      verifyCode,
      setPasscode,
      reloadBiometrics,
      hasAuthStore,
      hasKeysStore,
    };
  },

  mounted() {
    const store = useHasPathStore();
    store.updateTo('', 'Passcode');
    this.reloadBiometrics();
  },
});
</script>
