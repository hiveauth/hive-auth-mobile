<template>
  <q-expansion-item group="sessions-group" class="q-py-sm" dense-toggle>
    <template v-slot:header>
      <q-item-section avatar>
        <q-img v-if="auth.app.icon" :src="auth.app.icon" no-spinner style="height: 40px; max-width: 40px" />
        <q-img v-else src="~assets/app-noicon.png" no-spinner style="height: 40px; max-width: 40px"/>
      </q-item-section>
      <q-item-section>
        <q-item-label class="text-bold">{{ storeApp.capitalize(auth.app.name) }} </q-item-label>
        <q-item-label v-if="props.auth.expire < Date.now()">
          Expired
        </q-item-label>
        <q-item-label v-else>
          {{ $t('account_session.expires') }} {{ dayjs(props.auth.expire).fromNow() }}
        </q-item-label>
      </q-item-section>
      <q-item-section avatar>
        <q-btn round color="red" icon="fa fa-trash-can" size='sm' flat outline @click="onDeleteAuth"/>
      </q-item-section>
    </template>
    <q-card>
      <q-separator />
      <q-card-section>
        <table>
          <tr><td>Created:</td><td>{{ storeApp.formatDate(auth.created) }}</td></tr>
          <tr><td>Last used:</td><td>{{ storeApp.formatDate(auth.lastused)}}</td></tr>
          <tr><td>Expires:</td><td>{{ storeApp.formatDate(auth.expire) }}</td></tr>
        </table>
        <div v-if="auth.whitelists.length > 0">
          <q-separator spaced />
          <div class="text-bold">{{ $t('account_session.whilelists.title') }}</div>
          <q-list>
            <q-item v-for="(op) in auth.whitelists" :key="op" dense>
              <q-item-section>
                <q-item-label>{{ op }}</q-item-label>
              </q-item-section>
              <q-item-section avatar>
                <q-btn round color="red" icon="fa fa-trash-can" size="xs" flat outline @click="onDeleteWhitelist(op)"/>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-card-section>
    </q-card>
  </q-expansion-item>
  <q-separator />
</template>

<script setup lang="ts">
import { onMounted, PropType } from 'vue';
import { useQuasar } from 'quasar';
import { useAppStore } from 'src/stores/storeApp';
import { useAccountsStore, IAccount, IAccountAuth } from 'src/stores/storeAccounts';
import { useI18n } from 'vue-i18n'

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const $q = useQuasar();
const storeApp = useAppStore()
const storeAccounts = useAccountsStore()
const { t } = useI18n(), $t = t

const props = defineProps({
  account: {
    type: Object as PropType<IAccount>,
    required: true,
  },
  auth: {
    type: Object as PropType<IAccountAuth>,
    required: true,
  },
});

// functions
function onDeleteAuth() {
  const account = props.account
  account.auths = props.account.auths.filter(o => o.key != props.auth.key)
  storeAccounts.updateAccount(props.account)
}

function onDeleteWhitelist(op: string) {
  const auth =  props.auth
  auth.whitelists = auth.whitelists.filter(o => o!=op)
  storeAccounts.updateAccount(props.account)
  $q.notify({
          color: 'positive',
          position: 'bottom',
          message: $t('account_session.whilelists.deleted'),
          icon: 'fa fa-trash-can',
        });
}

// hooks
onMounted(() => {
  storeAccounts.clean();
});

</script>
