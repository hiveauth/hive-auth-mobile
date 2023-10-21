<template>
  <q-page>
    <q-list padding v-if="sessions.length > 0">
      <q-item
        v-for="session in sessions"
        :key="`${session.name}-${session.auth.app}-${session.auth.key}`"
        class="q-mb-sm"
        clickable
        v-ripple
      >
        <q-item-section avatar>
          <q-avatar>
            <q-img :src="session.auth.app.icon" />
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label>{{ session.auth.app.name }}</q-item-label>
          <q-item-label caption lines="1">{{ session.auth.app.description }}<br />Valid till {{ getDateInTimeAgoFormat(session.auth.expire) }}</q-item-label>
        </q-item-section>
      </q-item></q-list
    >
    <div class="absolute-center" v-if="sessions.length === 0">
      No active sessions found
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useHasStorageStore } from 'src/stores/has-storage';
import { useHasPathStore } from 'src/stores/has-path';
import {
  AccountAuthModel,
  AccountAuth,
  AccountAuthApp,
} from 'src/models/account-auth-model';
import dayjs from 'dayjs';
// import relativeTime from 'dayjs/plugin/relativeTime';

interface ActiveSessionData {
  name: string;
  auth: AccountAuth;
}

const $q = useQuasar()
const { t } = useI18n(), $t = t
const storeHASStorage = useHasStorageStore();
const storeHASPath = useHasPathStore();

// data
const sessions = ref([] as ActiveSessionData[]);

// functions
async function reloadStorageSessions() {
  await storeHASStorage.readStorage();
  const accounts = storeHASStorage.accountsJson;
  console.log(`Found ${accounts.length} accounts`);
  let sessionData = [] as ActiveSessionData[];
  accounts.forEach((account) => {
    account.auths.forEach((auth) => {
      sessionData.push({
        name: account.name,
        auth: auth,
      });
    });
  });
  console.log(`Found ${sessionData.length} sessionData`);
  sessions.value = sessionData;
}

function getDateInTimeAgoFormat(date: string) {
  return dayjs(date).format('YYYY-MM-DD hh:mm:ss')
}

// hooks
onMounted(() => {
  storeHASPath.updateTo('active-sessions', 'Active Sessions');
  console.log('At Active sessions Page');
  reloadStorageSessions();
}

</script>

<script lang="ts">

export default defineComponent({
  name: 'page-sessions'
});
</script>
