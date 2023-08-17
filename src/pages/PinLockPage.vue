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
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useHasPathStore } from 'src/stores/has-path';
import { useHasAuthStore } from 'src/stores/has-auth';
import { useHasKeysStore } from 'src/stores/has-keys';

export default defineComponent({
  name: 'passcode-lock',
  components: {},
  setup() {
    const hasAuthStore = useHasAuthStore();
    const hasKeysStore = useHasKeysStore();
    const router = useRouter();
    const $q = useQuasar();
    const data = ref({
      code: '',
      repeatCode: '',
      isPasscodeVisible: false,
    });

    async function verifyCode() {
      if (hasAuthStore.isValidPasscode(data.value.code)) {
        $q.notify({
          color: 'positive',
          position: 'bottom',
          message: "Passcode is valid. You're Authorised",
          icon: 'check',
        });
        hasAuthStore.unlockApp();
        await hasKeysStore.readKeys();
        router.push({ name: 'import-key' });
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
        await hasAuthStore.setPasscode(data.value.code);
        hasAuthStore.unlockApp();
        await hasKeysStore.readKeys();
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

    return { data, verifyCode, setPasscode, hasAuthStore, hasKeysStore };
  },

  mounted() {
    const store = useHasPathStore();
    store.updateTo('', 'Passcode');
  },
});
</script>

<style scoped></style>
