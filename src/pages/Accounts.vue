<template>
  <div>
    <div class="q-pa-md">
      <q-btn-dropdown v-if="accounts.length > 0"
        push
        no-caps
        rounded
        class="full_width"
      >
        <template v-slot:label>
          <q-item-section avatar>
            <q-avatar>
              <img :src="`https://images.hive.blog/u/${selectedAccount.name}/avatar/small`"/>
            </q-avatar>
          </q-item-section>
          <q-item-section class="text-left username">
            @{{ selectedAccount.name }}
          </q-item-section>
        </template>
        <q-list>
          <q-item
            v-for="(account, index) in accounts"
            :key="`${account.name}-${index}`"
            clickable
            v-close-popup
            @click="onSelectAccount(index)"
          >
            <q-item-section avatar>
              <q-avatar>
                <q-img :src="`https://images.hive.blog/u/${account.name}/avatar/small`" />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label>@{{ account.name }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </div>
    <div class="q-pl-md q-pr-md q-pb-md">
      <q-btn
      class="full_width"
        color="primary"
        icon="add"
        label="Add an Account"
        @click="onAddAccount"
      />
    </div>
    <q-tabs v-if="accounts.length > 0" 
      v-model="tab" 
      inline-label
    >
      <q-tab
        name="sessions"
        icon="fa-solid fa-id-card"
        :label="$t('accounts.sessions')"
      />
      <q-tab name="keys" icon="key" :label="$t('accounts.keys')" />
    </q-tabs>
    <div v-if="tab === 'keys' &&accounts.length === 0" class="absolute-center">
      {{ $t('accounts.empty') }}
    </div>
    <div class="q-pa-md" v-if="tab === 'keys' && accounts.length > 0">
      <AccountKeyList
        :name="selectedAccount.name"
        :active="selectedAccount.keys.active"
        :memo="selectedAccount.keys.memo"
        :posting="selectedAccount.keys.posting"
      />
    </div>
    <div v-if="tab === 'sessions' && selectedAccount.auths.length > 0" class="q-pa-md">
      <q-list bordered>
        <AccountSessionItem
          v-for="(auth, index) in selectedAccount.auths"
          :key="`${auth.app}-${index}`"
          :icon="auth.app.icon"
          :expiry="auth.expire"
          :description="auth.app.description"
          :name="auth.app.name"
          :whitelists="auth.whitelists"
        />
      </q-list>
    </div>
    <div v-if="tab === 'sessions' && selectedAccount.auths.length === 0" class="absolute-center" >
      {{ $t('accounts.empty_sessions') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, onMounted, ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useAppStore } from 'src/stores/storeApp';
import { useAccountsStore } from 'src/stores/storeAccounts';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import AccountKeyList from 'components/AccountKeyList.vue';
import AccountSessionItem from 'components/AccountSessionItem.vue';

const $q = useQuasar();
const router = useRouter();
const storeApp = useAppStore();
const storeAccounts = useAccountsStore();
const { t } = useI18n(), $t = t;

// data
const accounts = ref(storeAccounts.accounts);
const selectedIndex = ref(0);
const tab = ref('sessions');
const username = ref('');

// computed
const selectedAccount = computed(() => { return accounts.value[selectedIndex.value] })

// functions
function onSelectAccount(index: number) {
  selectedIndex.value = index;
  storeAccounts.updateLastSelectedAccount(accounts.value[index].name);
}

function onAddAccount() {
  router.push({name: "import-key"})
}

// hooks
onMounted(() => {
  storeApp.headerSubtitle = 'Accounts';
  const lastSelectedAccountName = storeAccounts.lastSelectedAccountName;
  if (lastSelectedAccountName.length > 0) {
    const index = storeAccounts.accounts.findIndex((account) => {
      return account.name == lastSelectedAccountName;
    });
    if (index != -1) {
      selectedIndex.value = index;
    }
  }
});
</script>

<script lang="ts">
export default defineComponent({
  name: 'page-accounts',
});
</script>

<style scoped>
.username {
  font-size: medium;
}
.full_width {
  width: 100%;
}
</style>
