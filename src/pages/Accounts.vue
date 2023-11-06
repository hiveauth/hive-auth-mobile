<template>
    <div class="q-mx-md">
      <q-btn-dropdown v-if="accounts.length > 0" class="q-my-md full_width"
        push
        no-caps
        rounded
      >
        <template v-slot:label>
          <q-item-section avatar>
            <q-avatar>
              <img :src="storeApp.getAvatar(selectedAccount.name)"/>
            </q-avatar>
          </q-item-section>
          <q-item-section class="text-left username">
            @{{ selectedAccount.name }}
          </q-item-section>
        </template>
        <q-list>
          <q-item
            v-for="(account) in storeAccounts.accounts"
            :key="account.name"
            clickable
            v-close-popup
            @click="onSelectAccount(account.name)"
          >
            <q-item-section avatar>
              <q-avatar>
                <q-img :src="storeApp.getAvatar(account.name)" />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label>@{{ account.name }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
      <div class="q-py-md">
        <q-btn
        class="full_width"
          color="primary"
          icon="add"
          label="Add an Account"
          @click="onAddAccount"
        />
      </div>
      <div v-if="accounts.length === 0" class="absolute-center">
        {{ $t('accounts.empty') }}
      </div>
      <div v-else>
        <q-tabs 
          v-model="tab" 
          inline-label
          @update ="onTabUpdate"
        >
          <q-tab name="sessions" icon="fa-solid fa-id-card" :label="$t('accounts.sessions')" />
          <q-tab name="keys" icon="key" :label="$t('accounts.keys')" />
        </q-tabs>
        <div class="q-my-md" v-if="tab === 'keys' && accounts.length > 0">
          <q-list bordered>
            <AccountKey
              :name="selectedAccount.name"
              keyType="active"
              :keyValue="selectedAccount.keys.active"
            />
            <q-separator />
            <AccountKey
              :name="selectedAccount.name"
              keyType="posting"
              :keyValue="selectedAccount.keys.posting"
            />
            <q-separator />
            <AccountKey
              :name="selectedAccount.name"
              keyType="memo"
              :keyValue="selectedAccount.keys.memo"
            />
            <q-separator />
          </q-list>
        </div>
        <div v-if="tab === 'sessions'">
          <div v-if="auths.length > 0" class="q-pa-md">
            <q-list bordered>
              <AccountSession
                v-for="(auth) in auths"
                :key="auth.key"
                :icon="auth.app.icon"
                :expiry="auth.expire"
                :description="auth.app.description"
                :name="auth.app.name"
                :whitelists="auth.whitelists"
              />
            </q-list>
          </div>
          <div v-else class="absolute-center" >
            {{ $t('accounts.empty_sessions') }}
          </div>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { defineComponent, onMounted, ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useAppStore } from 'src/stores/storeApp';
import { useAccountsStore, IAccount } from 'src/stores/storeAccounts';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import AccountKey from 'components/AccountKey.vue';
import AccountSession from 'components/AccountSession.vue';
import { IAuthAck } from 'src/interfaces/has.interfaces';

const $q = useQuasar();
const router = useRouter();
const storeApp = useAppStore();
const storeAccounts = useAccountsStore();
const { t } = useI18n(), $t = t;

// computed
const accounts = computed(() => storeAccounts.accounts)
const selectedAccount = computed(() => { 
  if (storeAccounts.lastAccountName) {
    return storeAccounts.accounts.find(o => o.name==storeAccounts.lastAccountName) as IAccount
  } 
  return storeAccounts.accounts[0]
})

const auths = computed(() => { return selectedAccount.value ? selectedAccount.value.auths : [] })
const tab = computed({
  get: () => (storeAccounts.lastAccountTab || 'sessions'),
  set: (value)  => storeAccounts.updateLastAccountTab(value)
})

// functions
function onSelectAccount(name: string) {
  storeAccounts.updateLastAccountName(name);
}

function onAddAccount() {
  router.push({name: "import-key"})
}

function onTabUpdate(value: string) {
  storeAccounts.updateLastAccountTab(value)
}

// hooks
onMounted(() => {
  storeApp.headerSubtitle = 'Accounts';
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
