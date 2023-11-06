<template>
  <q-item>
    <q-item-section avatar>
      <q-avatar>
        <q-icon name="key" color="primary" size="1.25rem" />
      </q-avatar>
    </q-item-section>
    <q-item-section>
      {{ keyName }} Key
    </q-item-section>
    <q-item-section avatar v-if="keyMissing">
      <q-btn v-if="keyMissing"
        round
        color="primary"
        icon="add"
        flat
        outline
        @click="onAddKey"
      />
    </q-item-section>
    <q-item-section v-if="!keyMissing" avatar>
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
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { ref, computed } from 'vue';
import { useAccountsStore } from 'src/stores/storeAccounts';
import { useAppStore } from 'src/stores/storeApp';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const $q = useQuasar();
const router = useRouter();
const storeApp = useAppStore();
const storeAccounts = useAccountsStore();
const { t } = useI18n(), $t = t;

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  keyType: {
    type: String,
    required: true,
    validator(value: string) {
      return ['active', 'posting', 'memo'].includes(value)
    }
  },
  keyValue: {
    type: String,
    required: false,
  },
});

const currentKeyValue = props.keyValue ?? '';
const keyName = props.keyType.charAt(0).toUpperCase() + props.keyType.slice(1).toLowerCase()

// computed
const keyMissing = computed(() => { return props.keyValue === null || props.keyValue === undefined || currentKeyValue.length === 0 });

function onAddKey() {
  router.push({name:"import-key", query: {username: props.name, type: props.keyType}})
}
async function onDeleteKey() {
  let needReset = false;
  try {
    $q.loading.show({ group: 'deleteKey' });
    const account = storeAccounts.accounts.find((o) => o.name === props.name);
    if (!account) {
      return;
    }
    // take a copy of existing keys to work on it before updating the account
    const keys = {...account.keys}
    switch(props.keyType) {
      case 'active':
      keys.active = undefined;
      break;
      case 'posting':
        keys.posting = undefined;
        break;
      case 'memo':
        keys.memo = undefined;
        break;
      default:
        throw new Error(`onConfirmDelete - Invalid keyType ${props.keyType}`);
    }
    // Check if the account no more holds any key
    if(!keys.active && !keys.posting && !keys.memo) {
      // ask user to confirm account deletion
      $q.dialog({
        title: $t('accounts_key.confirm_delete_account.title'),
        message: $t('accounts_key.confirm_delete_account.message'),
        cancel: true,
        focus: "cancel",
        color: "red",
        persistent: true
      }).onOk(async () => {
        await storeAccounts.deleteAccount(account.name)
      })
    } else {
      // Ask user to confirm key deletation
      $q.dialog({
        title: $t('accounts_key.confirm_delete_key.title'),
        message: $t('accounts_key.confirm_delete_key.message'),
        cancel: true,
        focus: "cancel",
        color: "red",
        persistent: true
      }).onOk(async () => {
        account.keys = keys
        await storeAccounts.updateAccount(account);
        $q.notify({
          color: 'negative',
          position: 'bottom',
          message: $t('accounts_key.deleted'),
          icon: 'fa-solid fa-trash',
        });
      })
    }
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
</script>
<script lang="ts">
export default {
  name: 'AccountKeyItem',
};
</script>
<style scoped></style>
