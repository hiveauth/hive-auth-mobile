<template>
  <q-page>
    <div class="q-pa-lg">
      <q-input
        outlined
        rounded
        v-model="data.code"
        type="password"
        label="6 Digit Passcode"
        placeholder="Enter six digit passcode here"
        class="q-pt-lg"
      >
        <template v-slot:prepend>
          <q-icon name="pin" />
        </template>
      </q-input>

      <q-input
        outlined
        rounded
        v-model="data.repeatCode"
        type="password"
        label="Repeat Passcode"
        placeholder="Repeat passcode here"
        class="q-pt-lg"
        v-if="!data.isSaved"
      >
        <template v-slot:prepend>
          <q-icon name="pin" />
        </template>
      </q-input>

      <div class="row q-mt-lg" v-if="data.isSaved">
        <q-btn
          class="col q-pt-sm q-pb-sm"
          rounded
          color="primary"
          label="Unlock"
          @click="verifyCode()"
        />
      </div>

      <div class="row q-mt-lg" v-if="!data.isSaved">
        <q-btn
          class="col q-pt-sm q-pb-sm"
          rounded
          color="primary"
          label="Set Passcode"
          :disable="data.code.length != 6 || data.code !== data.repeatCode"
          @click="setPasscode()"
        />
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useQuasar } from 'quasar';
import { SecureStorage } from '@aparajita/capacitor-secure-storage';

export default defineComponent({
  components: {},
  setup() {
    const $q = useQuasar();
    const data = ref({
      code: '',
      repeatCode: '',
      isSaved: false,
      savedPasscode: '',
    });

    async function verifyCode() {
      if (data.value.code === data.value.savedPasscode) {
        console.log('Valid Pincode entered');
      } else {
        console.log('Invalid Pincode entered');
      }
    }

    async function setPasscode() {
      try {
        await SecureStorage.setSynchronize(false);
        await SecureStorage.set('passcode', data.value, true, false);
        $q.notify({
          color: 'positive',
          position: 'bottom',
          message: 'Passcode is now set.',
          icon: 'check',
        });
      } catch (e) {
        $q.notify({
          color: 'negative',
          position: 'bottom',
          message: 'Error setting passcode',
          icon: 'report_problem',
        });
        $q.loading.hide('validating_keys');
      }
    }

    async function readKeys() {
      try {
        const value = (await SecureStorage.get(
          'passcode',
          true,
          false
        )) as string;
        if (value === null) {
          return;
        }
        data.value.savedPasscode = value;
        data.value.isSaved = true;
      } catch (e) {
        console.log(`Probably not stored. Error reading keys - ${e.message}. `);
      }
    }
    return { data, readKeys, verifyCode, setPasscode };
  },
  mounted() {
    this.readKeys();
  },
});
</script>

<style scoped></style>
