<template>
  <div v-if="doWeHaveDeviceBiometrics" class="q-pa-lg">
    <q-input
      outlined
      dark
      autofocus
      v-model="PIN"
      :label="$t('login.pin_label')"
      :placeholder="$t('login.pin_placeholder')"
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
      v-if="!storeApp.hasPasscode"
      outlined
      dark
      v-model="PIN_repeat"
      :label="$t('login.pin_repeat_label')"
      :placeholder="$t('login.pin_repeat_placeholder')"
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

    <div v-if="!storeApp.hasPasscode" class="row q-mt-lg">
      <q-btn
        class="col q-pt-sm q-pb-sm"
        rounded
        color="primary"
        :label="$t('login.btn_save')"
        :disable="PIN.length !== 6 || PIN !== PIN_repeat"
        @click="setPasscode()"
      />
    </div>
  </div>
  <div v-else class="q-pa-lg" style="color: white">
    {{$t('login.biometrics_unavailable')}}
  </div>
</template>

<script setup lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router';
import { useAppStore } from 'src/stores/storeApp';
import { useAccountsStore } from 'src/stores/storeAccounts';

const $q = useQuasar();
const { t } = useI18n(), $t = t
const router = useRouter();
const storeApp = useAppStore();
const storeAccounts = useAccountsStore();

// data
const doWeHaveDeviceBiometrics = ref(false)
const isPasscodeVisible = ref(false)
const PIN = ref('')
const PIN_repeat = ref('')

// functions
function digitsChanged(newValue: string | number | null) {
  if (
    storeApp.hasPasscode &&
    typeof newValue === 'string' &&
    newValue.length === 6
  ) {
    verifyCode();
  }
}

async function verifyCode() {
  const biometricsResult = await storeApp.performBiometrics();
  if (biometricsResult && storeApp.isValidPasscode(PIN.value)) {
    await storeAccounts.read();
    storeApp.unlockApp();
  } else {
    PIN.value=''
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
    await storeAccounts.read();
    storeApp.unlockApp();
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
  }
}

// hooks
onMounted(async () => {
  doWeHaveDeviceBiometrics.value = await storeApp.doWeHaveNativeBiometrics();
})

</script>

<script lang="ts">
export default defineComponent({
  name: 'InputPin',
});
</script>
