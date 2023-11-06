<template>
  <q-item v-ripple clickable @click="toggle" class="q-py-md">
    <q-item-section avatar>
      <q-img
        :src="auth.app.icon"
        spinner-color="white"
        style="height: 40px; max-width: 40px"
      />
    </q-item-section>
    <q-item-section>
      <q-item-label class="text-bold">{{ auth.app.name }} </q-item-label>
      <q-item-label
        >{{ $t('accounts.expires') }} {{ formattedDate() }}
      </q-item-label>
    </q-item-section>
    <q-item-section avatar>
      <q-btn round color="red" icon="fa-solid fa-trash" flat outline @click="onDeleteAuth"/>
    </q-item-section>
  </q-item>
  <q-separator />
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { useAccountsStore, IAccount, IAccountAuth } from 'src/stores/storeAccounts';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const $q = useQuasar();
const storeAccounts = useAccountsStore()

const props = defineProps({
  account: {
    type: Object,
    required: true,
  },
  auth: {
    type: Object,
    required: true,
  },
});

// functions
function toggle() {
  const whitelistOps = props.auth.whitelists;
  const message = whitelistOps.length > 0 ? 'Following operations are whitelisted.\n' + Array.from(props.auth.whitelists).join(', ') : 'No operations are whitelisted';
  $q.dialog({
    title: 'Whitlists',
    message: message,
  })
    .onOk((data) => {
      // console.log('>>>> OK, received', data)
    })
    .onCancel(() => {
      // console.log('>>>> Cancel')
    })
    .onDismiss(() => {
      // console.log('I am triggered on both OK and Cancel')
    });
}

function formattedDate() {
  return dayjs(props.auth.expire).fromNow();
}

function onDeleteAuth() {
  const account = props.account
  account.auths = props.account.auths.filter((o: IAccountAuth) => o.key != props.auth.key)
  storeAccounts.updateAccount(props.account as IAccount)
}

</script>

<style scoped></style>
