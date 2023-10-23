<template>
  <q-page>
    <div v-if="doWeHaveDeviceBiometrics" class="q-pa-lg">
      <q-input
        outlined
        rounded
        autofocus
        v-model="PIN"
        :label="$t('unlock.pin_label')"
        :placeholder="$t('unlock.pin_placeholder')"
        class="q-pt-lg"
        :type="isPasscodeVisible ? 'text' : 'password'"
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
            :name="isPasscodeVisible ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="isPasscodeVisible = !isPasscodeVisible"
          />
        </template>
      </q-input>

      <q-input
        v-if="!storeHASAuth.hasPasscode"
        outlined
        rounded
        v-model="PIN_repeat"
        :label="$t('unlock.pin_repeat_label')"
        :placeholder="$t('unlock.pin_repeat_placeholder')"
        class="q-pt-lg"
        :type="isPasscodeVisible ? 'text' : 'password'"
        inputmode="numeric"
        pattern="[0-9]*"
        autocomplete="off"
        maxlength="6"
      >
        <template v-slot:prepend>
          <q-icon name="pin" />
        </template>
        <template v-slot:append>
          <q-icon
            :name="isPasscodeVisible ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="isPasscodeVisible = !isPasscodeVisible"
          />
        </template>
      </q-input>

      <div v-if="!storeHASAuth.hasPasscode" class="row q-mt-lg">
        <q-btn
          class="col q-pt-sm q-pb-sm"
          rounded
          color="primary"
          :label="$t('unlock.btn_save')"
          :disable="PIN.length !== 6 || PIN !== PIN_repeat"
          @click="setPasscode()"
        />
      </div>
    </div>
    <div v-else class="q-pa-lg">
      {{$t('unlock.biometrics_unavailable')}}
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router';
import { useAppStore } from 'src/stores/storeApp';
import { useHasAuthStore } from 'src/stores/has-auth';
import { useHasKeysStore } from 'src/stores/has-keys';
import { useHasStorageStore } from 'src/stores/has-storage';

const $q = useQuasar();
const { t } = useI18n(), $t = t
const router = useRouter();
const storeHASAuth = useHasAuthStore();
const storeHASKeys = useHasKeysStore();
const storeHASStorage = useHasStorageStore();

// data
const doWeHaveDeviceBiometrics = ref(false)
const isPasscodeVisible = ref(false)
const PIN = ref('')
const PIN_repeat = ref('')

// functions
function digitsChanged(newValue: string | number | null) {
  if (
    storeHASAuth.hasPasscode &&
    typeof newValue === 'string' &&
    newValue.length === 6
  ) {
    verifyCode();
  }
}

async function reloadBiometrics() {
  doWeHaveDeviceBiometrics.value = await storeHASAuth.doWeHaveNativeBiometrics();
}

async function verifyCode() {
  const biometricsResult = await storeHASAuth.performBiometrics();
  if (biometricsResult && storeHASAuth.isValidPasscode(PIN.value)) {
    storeHASAuth.unlockApp();
    await storeHASKeys.readKeys();
    await storeHASStorage.readStorage();
    router.replace({ name: 'main-menu' });
  } else {
    PIN.value=''
    $q.notify({
      color: 'negative',
      position: 'bottom',
      message: $t('unlock.failed'),
      icon: 'dangerous',
    });
  }
}

async function setPasscode() {
  try {
    await storeHASAuth.setPasscodeToBiometrics(PIN.value);
    await storeHASAuth.readPasscodeFromBiometrics();
    storeHASAuth.unlockApp();
    await storeHASKeys.readKeys();
    await storeHASStorage.readStorage();
    $q.notify({
      color: 'positive',
      position: 'bottom',
      message: 'Passcode is now set.',
      icon: 'check',
    });
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

// hooks
onMounted(() => {
  const storeApp = useAppStore();
  storeApp.path = 'Passcode'
  reloadBiometrics();
})

</script>

<script lang="ts">
export default defineComponent({
  name: 'passcode-lock',
  components: {}
});
</script>
