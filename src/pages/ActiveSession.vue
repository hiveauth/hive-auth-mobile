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
          <q-item-label caption lines="1">{{ session.auth.app.description }}<br />{{$t('sessions.valid')}} {{ formatDate(session.auth.expire) }}</q-item-label>
        </q-item-section>
      </q-item></q-list
    >
    <div class="absolute-center" v-if="sessions.length === 0">
      {{$t('sessions.empty')}}
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useAppStore } from 'src/stores/storeApp';
import { useAccountsStore, IAccountAuth } from 'src/stores/storeAccounts';
import dayjs from 'dayjs';
// import relativeTime from 'dayjs/plugin/relativeTime';

interface ISessionData {
  name: string;
  auth: IAccountAuth;
}

const $q = useQuasar()
const { t } = useI18n(), $t = t
const storeAccounts = useAccountsStore();
const storeApp = useAppStore();

// data
const sessions = ref([] as ISessionData[]);

// functions
function formatDate(timestamp: number) {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
}

// hooks
onMounted(() => {
  storeApp.path = 'Sessions';
  sessions.value = []
  storeAccounts.accounts.forEach((account) => {
    account.auths.forEach((auth) => {
      sessions.value.push({
        name: account.name,
        auth: auth,
      });
    });
  });
})

</script>

<script lang="ts">

export default defineComponent({
  name: 'page-sessions'
});
</script>