<template>
  <q-item>
    <q-item-section avatar>
      <q-avatar>
        <q-icon name="key" color="primary" size="1.25rem" />
      </q-avatar>
    </q-item-section>
    <q-item-section>
      {{ props.keyType }} Key
    </q-item-section>
    <q-item-section avatar v-if="suggestAdd">
      <q-btn v-if="suggestAdd"
        round
        color="primary"
        icon="add"
        flat
        outline
        @click="onAddKey"
      />
    </q-item-section>
    <q-item-section v-if="!suggestAdd" avatar>
      <q-btn
        round
        color="red"
        icon="fa-solid fa-trash"
        flat
        outline
        @click="onDeleteKey"
      />
    </q-item-section>
  </q-item>
  <q-dialog v-model="confirmDialogPresent" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <q-avatar icon="fa-solid fa-trash" color="red" text-color="white" />
        <span class="q-ml-sm" >Are you sure you want to delete this key? This action can not be undone.</span>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Delete" color="red" v-close-popup @click="onConfirmDelete" />
        <q-btn flat label="Cancel" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { ref } from 'vue';
import { useAccountsStore } from 'src/stores/storeAccounts';
import { useAppStore } from 'src/stores/storeApp';
import { Clipboard } from '@capacitor/clipboard';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import DialogAddKey from 'components/DialogAddKey.vue';
import dhiveClient from 'src/helper/dhive-client';

const router = useRouter();
const { t } = useI18n(), $t = t;
const storeApp = useAppStore();
const storeAccounts = useAccountsStore();
const $q = useQuasar();
const confirmDialogPresent = ref(false);
const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  keyType: {
    type: String,
    required: true,
  },
  keyValue: {
    type: String,
    required: false,
  },
});

function onAddKey() {
  router.push({name:"import-key", query: {username: props.name, type: props.keyType}})
}

function onDeleteKey() {
  confirmDialogPresent.value = true;
}

async function onConfirmDelete() {
  let needReset = false;
  try {
    $q.loading.show({ group: 'deleteKey' });
    let account = storeAccounts.accounts.find((o) => o.name === props.name);
    if (!account) {
      return;
    }
    if (props.keyType === 'Active') {
      account.keys.active = undefined;
    } else if (props.keyType === 'Memo') {
      account.keys.memo = undefined;
    } else if (props.keyType === 'Posting') {
      account.keys.posting = undefined;
    } else {
      throw new Error($t('import_key.no_match'));
    }
    await storeAccounts.updateAccount(account);
    $q.notify({
      color: 'negative',
      position: 'bottom',
      message: $t('account_management.delete_key_deleted_notify'),
      icon: 'fa-solid fa-trash',
    });
  } catch (e) {
    $q.notify({
      color: 'negative',
      position: 'bottom',
      message: `${$t('import_key.failed')} - ${e.message}`,
      icon: 'report_problem',
    });
  } finally {
    $q.loading.hide('deleteKey');
    if (needReset) storeApp.resetWebsocket = true;
  }
}

const currentKeyValue = props.keyValue ?? '';
const suggestAdd =
  props.keyValue === null ||
  props.keyValue === undefined ||
  currentKeyValue.length === 0;
</script>
<script lang="ts">
export default {
  name: 'AccountManagementKeyItem',
};
</script>
<style scoped></style>
