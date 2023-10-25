<template>
  <q-page>
    <q-dialog v-model="confirm" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="key" color="primary" text-color="white" />
          <span class="q-ml-sm">Please select action</span>
        </q-card-section>

        <q-card-actions align="center">
          <q-btn flat label="Cancel" color="secondary" v-close-popup />
          <!-- <q-btn
            flat
            label="Copy"
            color="secondary"
            v-close-popup
            @click="copyKeyToClipboard"
          /> -->
          <q-btn
            flat
            label="Delete"
            color="primary"
            v-close-popup
            @click="deleteKey"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <div>
      <div v-if="count === 0" class="text-center q-pa-lg">
        <div class="text-h5">No Keys found</div>
        <br />
      </div>
      <div v-else class="q-pa-xs">
        <q-list>
          <q-item
            v-for="key in keys"
            :key="key.id"
            class="q-mb-sm"
            clickable
            v-ripple
            @click="selectedData = key; confirm = true;"
          >
            <q-item-section avatar>
              <q-avatar>
                <q-img
                  :src="`https://images.hive.blog/u/${key.name}/avatar/small`"
                />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label>{{ key.name }}</q-item-label>
              <q-item-label caption lines="1"
                >{{ key.type }}<br />{{ key.value }}</q-item-label
              >
            </q-item-section>

            <q-item-section side>
              <q-icon name="key" color="grey" />
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useAppStore } from 'src/stores/storeApp';
import { useAccountsStore } from 'src/stores/storeAccounts';
import { useQuasar } from 'quasar';
import { Clipboard } from '@capacitor/clipboard';
import dhiveClient from 'src/helper/dhive-client';

interface IKeyItem {
  id: string;
  name: string;
  value: string;
  type: string;
  private: string;
}

const storeAccounts = useAccountsStore();
const $q = useQuasar();
// data
const confirm = ref(false)
const keys = ref([] as IKeyItem[]);
const selectedData = ref({
    id: '',
    name: '',
    value: '',
    type: '',
    private: '',
  } as IKeyItem)


// computed
const count = computed(() => {
  console.log("count:",storeAccounts.accounts.length)
  return storeAccounts.accounts.length
})

// functions
async function loadKeys() {
  // TODO: move to app initialization
  await storeAccounts.read()
  console.log("Loading keys",JSON.stringify(storeAccounts.accounts))

  for(const account of storeAccounts.accounts) {
    if (account.keys.active) {
      keys.value.push({
        id: `${account.name}_active`,
        name: account.name,
        value: dhiveClient.publicKeyFrom(dhiveClient.privateKeyFromString(account.keys.active)),
        private: account.keys.active,
        type: 'Active Private Key',
      } as IKeyItem);
    }
    if (account.keys.posting) {
      keys.value.push({
        id: `${account.name}_posting`,
        name: account.name,
        value: dhiveClient.publicKeyFrom(dhiveClient.privateKeyFromString(account.keys.posting as string)),
        private: account.keys.posting,
        type: 'Posting Private Key',
      } as IKeyItem);
    }
    if (account.keys.memo) {
      keys.value.push({
        id: `${account.name}_memo`,
        name: account.name,
        value: dhiveClient.publicKeyFrom(dhiveClient.privateKeyFromString(account.keys.memo as string)),
        private: account.keys.memo,
        type: 'Memo Private Key',
      } as IKeyItem);
    }
  }
}

// async function copyKeyToClipboard() {
//   try {
//     await Clipboard.write({
//       string: selectedData.value.private,
//     });
//     $q.notify({
//       color: 'positive',
//       position: 'bottom',
//       message: `${selectedData.value.name}'s ${selectedData.value.type} is copied to clipboard`,
//       icon: 'assignment',
//     });
//   } catch (e) {
//     $q.notify({
//       color: 'negative',
//       position: 'bottom',
//       message: `Key could not be copied - ${e.message}`,
//       icon: 'report_problem',
//     });
//   }
// }

async function deleteKey() {
  // let currentKeys = hasKeysStore.keysJson;
  // let accountFilter = currentKeys.filter(
  //   (account) => account.name === selectedData.value.name
  // );
  // let noAccountFilter = currentKeys.filter(
  //   (account) => account.name !== selectedData.value.name
  // );
  // if (accountFilter.length === 0) {
  //   console.log('No account found. Do nothing');
  //   return;
  // }
  // let account: KeysModel = accountFilter[0];
  // if (selectedData.value.type === 'Active Private Key') {
  //   account.active = undefined;
  //   account.activePublic = undefined;
  // } else if (selectedData.value.type === 'Posting Private Key') {
  //   account.posting = undefined;
  //   account.postingPublic = undefined;
  // } else if (selectedData.value.type === 'Memo Private Key') {
  //   account.memo = undefined;
  //   account.memoPublic = undefined;
  // }
  // currentKeys = [...noAccountFilter, account];
  // await hasKeysStore.update(currentKeys);
  // loadKeys();
  // $q.notify({
  //   color: 'positive',
  //   position: 'bottom',
  //   message: `${selectedData.value.name}'s ${selectedData.value.type} is deleted`,
  //   icon: 'assignment',
  // });
  // selectedData.value = {
  //   id: '',
  //   name: '',
  //   value: '',
  //   type: '',
  //   private: '',
  // } as ManageAccountDisplay;
}


// Hooks
onMounted(() => {
  const storeApp = useAppStore();
  storeApp.path = 'Manage Keys';
  loadKeys();
})

</script>

<script lang="ts">

export default defineComponent({
  name: 'manage-accounts',
});
</script>

<style scoped>
.my-card {
  width: 100%;
}
</style>
