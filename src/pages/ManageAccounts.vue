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
          <q-btn
            flat
            label="Copy"
            color="secondary"
            v-close-popup
            @click="copyKeyToClipboard"
          />
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
      <div v-if="data.keys.length === 0" class="text-center q-pa-lg">
        <div class="text-h5">No Keys found</div>
        <br />
        <!-- <q-btn color="primary" label="Import Keys" @click="navToImportKeys" /> -->
      </div>
      <div v-if="data.keys.length !== 0" class="q-pa-xs">
        <q-list>
          <q-item
            v-for="key in data.keys"
            :key="key.id"
            class="q-mb-sm"
            clickable
            v-ripple
            @click="
              data.selectedData = key;
              confirm = true;
            "
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

<script lang="ts">
import { ref } from 'vue';
import { defineComponent } from 'vue';
import { useAppStore } from 'src/stores/storeApp';
import { useHasKeysStore } from 'src/stores/has-keys';
import { useQuasar } from 'quasar';
import { KeysModel } from 'src/models/keys-model';
import { Clipboard } from '@capacitor/clipboard';

interface ManageAccountDisplay {
  id: string;
  name: string;
  value: string;
  type: string;
  private: string;
}

export default defineComponent({
  name: 'manage-accounts',
  setup() {
    const hasKeysStore = useHasKeysStore();

    function loadKeys() {
      const keysJson = hasKeysStore.keysJson;
      let keys: ManageAccountDisplay[] = [];
      keysJson.forEach((key) => {
        if (key.active !== undefined && key.activePublic !== undefined) {
          keys.push({
            id: `${key.name}_active`,
            name: key.name,
            value: key.activePublic,
            private: key.active,
            type: 'Active Private Key',
          } as ManageAccountDisplay);
        }
        if (key.posting !== undefined && key.postingPublic !== undefined) {
          keys.push({
            id: `${key.name}_posting`,
            name: key.name,
            value: key.postingPublic,
            private: key.posting,
            type: 'Posting Private Key',
          } as ManageAccountDisplay);
        }
        if (key.memo !== undefined && key.memoPublic !== undefined) {
          keys.push({
            id: `${key.name}_memo`,
            name: key.name,
            value: key.memoPublic,
            private: key.memo,
            type: 'Memo Private Key',
          } as ManageAccountDisplay);
        }
      });
      data.value.keys = keys;
    }

    async function copyKeyToClipboard() {
      try {
        await Clipboard.write({
          string: data.value.selectedData.private,
        });
        $q.notify({
          color: 'positive',
          position: 'bottom',
          message: `${data.value.selectedData.name}'s ${data.value.selectedData.type} is copied to clipboard`,
          icon: 'assignment',
        });
      } catch (e) {
        $q.notify({
          color: 'negative',
          position: 'bottom',
          message: `Key could not be copied - ${e.message}`,
          icon: 'report_problem',
        });
      }
    }

    async function deleteKey() {
      let currentKeys = hasKeysStore.keysJson;
      let accountFilter = currentKeys.filter(
        (account) => account.name === data.value.selectedData.name
      );
      let noAccountFilter = currentKeys.filter(
        (account) => account.name !== data.value.selectedData.name
      );
      if (accountFilter.length === 0) {
        console.log('No account found. Do nothing');
        return;
      }
      let account: KeysModel = accountFilter[0];
      if (data.value.selectedData.type === 'Active Private Key') {
        account.active = undefined;
        account.activePublic = undefined;
      } else if (data.value.selectedData.type === 'Posting Private Key') {
        account.posting = undefined;
        account.postingPublic = undefined;
      } else if (data.value.selectedData.type === 'Memo Private Key') {
        account.memo = undefined;
        account.memoPublic = undefined;
      }
      currentKeys = [...noAccountFilter, account];
      await hasKeysStore.update(currentKeys);
      loadKeys();
      $q.notify({
        color: 'positive',
        position: 'bottom',
        message: `${data.value.selectedData.name}'s ${data.value.selectedData.type} is deleted`,
        icon: 'assignment',
      });
      data.value.selectedData = {
        id: '',
        name: '',
        value: '',
        type: '',
        private: '',
      } as ManageAccountDisplay;
    }

    const $q = useQuasar();
    const data = ref({
      selectedData: {
        id: '',
        name: '',
        value: '',
        type: '',
        private: '',
      } as ManageAccountDisplay,
      keys: [] as ManageAccountDisplay[],
    });

    return {
      data,
      confirm: ref(false),
      copyKeyToClipboard,
      deleteKey,
      loadKeys,
    };
  },
  mounted() {
    const storeApp = useAppStore();
    storeApp.path = 'Manage Keys';
    this.loadKeys();
  },
});
</script>

<style scoped>
.my-card {
  width: 100%;
}
</style>
