<template>
  <q-page>
    <div class="q-pa-lg">
      <q-input
        outlined
        rounded
        v-model="data.hiveusername"
        label="Username"
        placeholder="Enter Hive Username"
      >
        <template v-slot:prepend>
          <q-icon name="alternate_email" />
        </template>
      </q-input>
      <q-input
        outlined
        rounded
        v-model="data.hiveuserkey"
        type="password"
        label="Private Key"
        placeholder="Enter Private Key"
        class="q-pt-lg"
      >
        <template v-slot:prepend>
          <q-icon name="key" />
        </template>
      </q-input>

      <div class="row q-mt-lg">
        <q-btn
          class="col q-pt-sm q-pb-sm"
          rounded
          color="primary"
          label="Import"
          :disable="
            data.hiveuserkey.length == 0 || data.hiveusername.length == 0
          "
          @click="validateKeys()"
        />
      </div>

      <div class="row q-mt-lg">
        <div class="col text-subtitle1 text-center">
          Add your existing HIVE account to Keychain
        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useQuasar } from 'quasar';
import dhiveClient from 'src/helper/dhive-client';

export default defineComponent({
  name: 'IndexPage',
  components: {},
  setup() {
    const $q = useQuasar();
    const data = ref({
      hiveusername: '',
      hiveuserkey: '',
    });
    async function validateKeys() {
      console.log('validating keys');
      $q.loading.show({ group: 'validating_keys' });
      console.log('validating keys - showing loader');
      try {
        const allPublicKeys = await dhiveClient.getUserPublicKeys(
          data.value.hiveusername.toLowerCase().trim()
        );
        console.log(JSON.stringify(allPublicKeys));
        try {
          const privateKey = dhiveClient.privateKeyFromString(
            data.value.hiveuserkey
          );
          const publicKey = dhiveClient.publicKeyFrom(privateKey);
          console.log(publicKey);
        } catch (e) {
          $q.notify({
            color: 'negative',
            position: 'bottom',
            message: `Invalid private key - ${e.message}`,
            icon: 'report_problem',
          });
        }
        $q.loading.hide('validating_keys');
      } catch (e) {
        $q.loading.hide('validating_keys');
        console.log(e);
        $q.notify({
          color: 'negative',
          position: 'bottom',
          message: `Failed - ${e.message}`,
          icon: 'report_problem',
        });
      }
    }
    return { data, validateKeys };
  },
});
</script>
