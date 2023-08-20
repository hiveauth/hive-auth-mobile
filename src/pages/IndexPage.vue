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
          Add your existing HIVE account to AuthSigner
        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useQuasar } from 'quasar';
import dhiveClient from 'src/helper/dhive-client';
import { useHasPathStore } from 'src/stores/has-path';
import { useHasKeysStore } from 'src/stores/has-keys';
import { KeysModel } from 'src/models/keys-model';

export default defineComponent({
  name: 'import-key',
  components: {},
  setup() {
    const $q = useQuasar();
    const hasKeysStore = useHasKeysStore();
    const data = ref({
      hiveusername: '',
      hiveuserkey: '',
    });

    async function validateKeys() {
      console.log('validating keys');
      $q.loading.show({ group: 'validating_keys' });
      try {
        const username = data.value.hiveusername.toLowerCase().trim();
        const allPublicKeys = await dhiveClient.getUserPublicKeys(username);
        console.log(JSON.stringify(allPublicKeys));
        try {
          const privateKey = dhiveClient.privateKeyFromString(
            data.value.hiveuserkey
          );
          const publicKey = dhiveClient.publicKeyFrom(privateKey);
          console.log(publicKey);
          let currentKeys = hasKeysStore.keysJson;
          let accountFilter = currentKeys.filter(
            (account) => account.name === username
          );
          let noAccountFilter = currentKeys.filter(
            (account) => account.name !== username
          );
          let keyType = 'Private Key';
          if (accountFilter.length === 0) {
            // account is not added
            let newAccount: KeysModel = { name: username };
            let shouldSave = false;
            if (publicKey === allPublicKeys.active) {
              newAccount.active = data.value.hiveuserkey;
              newAccount.activePublic = publicKey;
              shouldSave = true;
              keyType = 'Private Active Key';
            } else if (publicKey === allPublicKeys.memo) {
              newAccount.memo = data.value.hiveuserkey;
              newAccount.memoPublic = publicKey;
              shouldSave = true;
              keyType = 'Private Memo Key';
            } else if (publicKey === allPublicKeys.posting) {
              newAccount.posting = data.value.hiveuserkey;
              newAccount.postingPublic = publicKey;
              shouldSave = true;
              keyType = 'Private Posting Key';
            }
            if (shouldSave) {
              currentKeys.push(newAccount);
              await hasKeysStore.update(currentKeys);
            }
          } else {
            // account is already added
            let existingAccount: KeysModel = accountFilter[0];
            let shouldSave = false;
            if (publicKey === allPublicKeys.active) {
              existingAccount.active = data.value.hiveuserkey;
              existingAccount.activePublic = publicKey;
              shouldSave = true;
              keyType = 'Private Active Key';
            } else if (publicKey === allPublicKeys.memo) {
              console.log('in here - memo key writing');
              existingAccount.memo = data.value.hiveuserkey;
              existingAccount.memoPublic = publicKey;
              shouldSave = true;
              keyType = 'Private Memo Key';
            } else if (publicKey === allPublicKeys.posting) {
              existingAccount.posting = data.value.hiveuserkey;
              existingAccount.postingPublic = publicKey;
              shouldSave = true;
              keyType = 'Private Posting Key';
            }
            if (shouldSave) {
              currentKeys = [...noAccountFilter, existingAccount];
              await hasKeysStore.update(currentKeys);
            }
          }
          $q.loading.hide('validating_keys');
          $q.notify({
            color: 'positive',
            position: 'bottom',
            message: `${data.value.hiveusername}'s ${keyType} is securely saved`,
            icon: 'check',
          });
          data.value.hiveusername = '';
          data.value.hiveuserkey = '';
        } catch (e) {
          $q.notify({
            color: 'negative',
            position: 'bottom',
            message: `Invalid private key - ${e.message}`,
            icon: 'report_problem',
          });
          $q.loading.hide('validating_keys');
        }
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
  mounted() {
    const store = useHasPathStore();
    store.updateTo('index', 'Import Keys');
    console.log('At import keys page');
  },
});
</script>
