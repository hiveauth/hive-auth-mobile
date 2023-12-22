<template>
  <div v-if="isBiometricsAvailable" class="q-pa-lg">
    <div v-if="askPIN">
      <div v-if="storeApp.hasPasscode" class="text-center text-white text-h5">{{ $t('login.pin_enter') }}</div>
      <div v-else class="text-center text-white text-h5">{{ $t('login.pin_create') }}</div>
      <input-pin-keyboard v-model="PIN" />
    </div>
    <div v-if="confirmPIN">
      <div class="text-center text-white text-h5">{{ $t('login.pin_confirm') }}</div>
      <input-pin-keyboard v-model="PIN_repeat" />
    </div>
    <div v-if="storeApp.hasPasscode" class="row q-mt-lg">
      <q-btn
        class="col"
        flat
        no-caps
        color="primary"
        :label="$t('login.pin_forgotten')"
        @click="onForgotPin()"
      />
    </div>
  </div>
  <div v-else class="q-pa-lg" style="color: white">
    {{$t('login.biometrics_unavailable')}}
  </div>
</template>

<script setup lang="ts">
import { defineComponent, ref, watch, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router';
import { useAppStore } from 'src/stores/storeApp';
import { useAccountsStore } from 'src/stores/storeAccounts';

import InputPinKeyboard from 'components/InputPinKeyboard.vue';

const $q = useQuasar();
const { t } = useI18n(), $t = t
const router = useRouter();
const storeApp = useAppStore();
const storeAccounts = useAccountsStore();

// data
const isBiometricsAvailable = ref(false)
const PIN = ref('')
const PIN_repeat = ref('')
const askPIN = ref(true)
const confirmPIN = ref(false)

// watchers
watch(PIN, (newValue) => { 
  if(PIN.value.length == 6) {
    if(storeApp.hasPasscode) {
      verifyCode();
    } else {
      askPIN.value = false
      confirmPIN.value = true
    }
  }
})

watch(PIN_repeat, (newValue) => { 
  if(PIN_repeat.value.length == 6) {
    if(PIN.value == PIN_repeat.value) {
      setPasscode();
    } else {
      $q.notify({
        color: 'negative',
        position: 'bottom',
        message: $t('login.pin_mismatch'),
        icon: 'dangerous',
        timeout: 1500,
      });
      PIN.value = ''
      PIN_repeat.value = ''
      askPIN.value = true
      confirmPIN.value = false
    }
  }
})

// functions

function reset() {
  PIN.value = ''
  PIN_repeat.value = ''
  askPIN.value = true
  confirmPIN.value = false
}

async function verifyCode() {
  const biometricsResult = await storeApp.performBiometrics();
  if (biometricsResult && storeApp.isValidPasscode(PIN.value)) {
    await storeAccounts.read(PIN.value);
    storeApp.unlockApp();
  } else {
    reset()
    $q.notify({
      color: 'negative',
      position: 'bottom',
      message: $t('login.failed'),
      icon: 'dangerous',
    });
  }
}

async function setPasscode() {
  try {
    await storeApp.setPasscodeToBiometrics(PIN.value);
    await storeApp.readPasscodeFromBiometrics();
    await storeAccounts.read(PIN.value);
    storeApp.unlockApp();
    router.push({name: '"import-key'})
    $q.notify({
      color: 'positive',
      position: 'bottom',
      message: $t('login.pin_init'),
      icon: 'check',
    });
  } catch (e) {
    $q.notify({
      color: 'negative',
      position: 'bottom',
      message: $t('login.pin_error'),
      icon: 'report_problem',
    });
    reset()
  }
}

function onForgotPin() {
  $q.dialog({
    title: $t('login.confirm_reset.title'),
    message: $t('login.confirm_reset.message'),
    cancel: true,
    focus: 'cancel',
    color: 'red',
    html: true,
  }).onOk(async () => {
    await storeAccounts.reset()
    await storeApp.reset()
    reset()
    $q.notify({
      color: 'positive',
      position: 'bottom',
      message: $t('login.pin_reset'),
      icon: 'check',
      timeout: 1000,
    });
  })
}

// hooks
onMounted(async () => {
  isBiometricsAvailable.value = await storeApp.isBiometricsAvailable();
})

</script>

<script lang="ts">
export default defineComponent({
  name: 'InputPin',
});
</script>
