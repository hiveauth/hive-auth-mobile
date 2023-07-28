<template>
  <q-page>
    <div class="q-pa-lg">
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
        v-if="!data.isSaved"
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
          :disable="data.code.length !== 6 || data.code !== data.repeatCode"
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
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'passcode-lock',
  components: {},
  setup() {
    const router = useRouter();
    const $q = useQuasar();
    const data = ref({
      code: '',
      repeatCode: '',
      isSaved: false,
      savedPasscode: '',
      isPasscodeVisible: false,
    });

    async function verifyCode() {
      console.log(data.value.code);
      console.log(data.value.savedPasscode);
      if (data.value.code === data.value.savedPasscode) {
        $q.notify({
          color: 'positive',
          position: 'bottom',
          message: "Passcode is valid. You're Authorised",
          icon: 'check',
        });
        router.push({ name: 'import-key' });
      } else {
        console.log('Invalid Pincode entered');
      }
    }

    async function setPasscode() {
      try {
        await SecureStorage.setSynchronize(false);
        await SecureStorage.set('passcode', data.value.code, true, false);
        $q.notify({
          color: 'positive',
          position: 'bottom',
          message: 'Passcode is now set.',
          icon: 'check',
        });
        router.push({ name: 'import-key' });
      } catch (e) {
        $q.notify({
          color: 'negative',
          position: 'bottom',
          message: 'Error setting passcode',
          icon: 'report_problem',
        });
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
