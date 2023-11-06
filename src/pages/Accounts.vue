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
      <div class="q-pb-md">
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
      </div>
      <div v-if="tab === 'sessions'">
        <div v-if="auths.length > 0" class="q-pa-md">
          <q-list bordered>
            <AccountSession
              v-for="(auth, index) in auths"
              :key="`${auth.app}-${index}`"
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
</template>

<script setup lang="ts">
import { defineComponent, onMounted, ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useAppStore } from 'src/stores/storeApp';
import { useAccountsStore } from 'src/stores/storeAccounts';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import AccountKey from 'components/AccountKey.vue';
import AccountSession from 'components/AccountSession.vue';

const $q = useQuasar();
const router = useRouter();
const storeApp = useAppStore();
const storeAccounts = useAccountsStore();
const { t } = useI18n(), $t = t;

// data
const accounts = ref(storeAccounts.accounts);
const selectedIndex = ref(0);
const tab = ref('sessions');

// computed
const selectedAccount = computed(() => { return accounts.value[selectedIndex.value] })
const auths = computed(() => { return selectedAccount.value ? selectedAccount.value.auths : [] })

// functions
function onSelectAccount(index: number) {
  selectedIndex.value = index;
  storeAccounts.updateLastAccountName(accounts.value[index].name);
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
  if (storeAccounts.lastAccountName.length > 0) {
    const index = storeAccounts.accounts.findIndex(o => o.name == storeAccounts.lastAccountName);
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
