<template>
  <q-page>
    <div class="q-pa-lg">
      <q-input
        outlined
        rounded
        v-model="username"
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
        v-model="private_key"
        type="text"
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
          :disable="private_key.length == 0 || username.length == 0"
          @click="validateKey()"
        />
      </div>

      <div class="row q-mt-lg">
        <div class="col text-subtitle1 text-center">
          Add your existing HIVE account
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import assert from 'assert';
import dhiveClient from 'src/helper/dhive-client';
import { defineComponent, ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n'
import { useAppStore } from 'src/stores/storeApp';
import { useAccountsStore } from 'src/stores/storeAccounts';

const $q = useQuasar();
const { t } = useI18n(), $t = t
const storeApp = useAppStore();
const storeAccounts = useAccountsStore();

// data
const username = ref('');
const private_key = ref('');
  
// functions
async function validateKey() {
  let needReset = false
  try {
    $q.loading.show({ group: 'validateKey' });

    username.value = username.value.toLowerCase().trim();

    const publicKeys = await dhiveClient.getUserPublicKeys(username.value);
    const privateKey = dhiveClient.privateKeyFromString(private_key.value);
    const publicKey = dhiveClient.publicKeyFrom(privateKey);

    let account = storeAccounts.accounts.find((o) => o.name === username.value);
    if (!account) {
      // New account
      account = { 
        name: username.value, 
        keys: { 
          posting:undefined, 
          active:undefined,
          memo:undefined,
        },
        auths:[],
      };
      needReset = true
    } 
    if (publicKey === publicKeys.active) {
      account.keys.active = private_key.value;
    } else if (publicKey === publicKeys.memo) {
      account.keys.memo = private_key.value;
    } else if (publicKey === publicKeys.posting) {
      account.keys.posting = private_key.value;
    } else {
      throw new Error($t('import_key.no_match'));
    }
    await storeAccounts.updateAccount(account);
    $q.notify({
      color: 'positive',
      position: 'bottom',
      message: $t('import_key.success'),
      icon: 'check',
    });
    username.value = '';
    private_key.value = '';
  } catch (e) {
    $q.notify({
      color: 'negative',
      position: 'bottom',
      message: `${$t('import_key.failed')} - ${e.message}`,
      icon: 'report_problem',
    });
  } finally {
    $q.loading.hide('validateKey');
    if(needReset) storeApp.resetWebsocket = true
  }
}

// Hooks
onMounted(() => {
  storeApp.path = 'Import Keys';
  if(process.env.IMPORT_USERNAME) username.value = process.env.IMPORT_USERNAME
  if(process.env.IMPORT_KEY) private_key.value = process.env.IMPORT_KEY
})

</script>
  
<script lang="ts">
  export default defineComponent({
    name: 'import-key',
  });
  </script>
  