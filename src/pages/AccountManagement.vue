<template>
  <div>
    <div class="q-pa-md">
      <q-btn-dropdown
        push
        no-caps
        rounded
        v-if="sortedAccountsRef.length > 0"
        class="account-drop-down"
      >
        <template v-slot:label>
          <q-item-section avatar>
            <q-avatar>
              <img
                :src="`https://images.hive.blog/u/${sortedAccountsRef[selectedIndex].name}/avatar/small`"
              />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            {{ sortedAccountsRef[selectedIndex].name }}
          </q-item-section>
        </template>
        <q-list>
          <q-item
            v-for="(account, index) in sortedAccountsRef"
            :key="`${account.name}-${index}`"
            clickable
            v-close-popup
            @click="onClickItemAtIndex(index)"
          >
            <q-item-section avatar>
              <q-avatar>
                <q-img
                  :src="`https://images.hive.blog/u/${account.name}/avatar/small`"
                />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ account.name }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </div>
    <q-tabs v-model="tab" inline-label v-if="sortedAccountsRef.length > 0">
      <q-tab
        name="sessions"
        icon="fa-solid fa-id-card"
        :label="$t('account_management.sessions')"
      />
      <q-tab name="keys" icon="key" :label="$t('account_management.keys')" />
    </q-tabs>
    <div class="absolute-center" v-if="sortedAccountsRef.length === 0 && tab === 'keys'">
      {{ $t('account_management.empty') }}
    </div>
    <div
      class="q-pa-md"
      v-if="tab === 'keys' && sortedAccountsRef.length > 0"
    >
      <AccountManagementKeyList
        :name="sortedAccountsRef[selectedIndex].name"
        :active="sortedAccountsRef[selectedIndex].keys.active"
        :memo="sortedAccountsRef[selectedIndex].keys.memo"
        :posting="sortedAccountsRef[selectedIndex].keys.posting"
      />
    </div>
    <div
      class="q-pa-md"
      v-if="
        tab === 'sessions' &&
        sortedAccountsRef[selectedIndex].auths.length > 0
      "
    >
      <q-list bordered>
        <AccountManagementSessionItem
          v-for="(auth, index) in sortedAccountsRef[selectedIndex].auths"
          :key="`${auth.app}-${index}`"
          :icon="auth.app.icon"
          :expiry="auth.expire"
          :description="auth.app.description"
          :name="auth.app.name"
          :whitelists="auth.whitelists"
        />
      </q-list>
    </div>
    <div class="absolute-center" v-if="sortedAccountsRef[selectedIndex].auths.length === 0 && tab === 'sessions'">
      {{ $t('account_management.empty_sessions') }} {{ sortedAccountsRef[selectedIndex].name }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useAppStore } from 'src/stores/storeApp';
import { useAccountsStore } from 'src/stores/storeAccounts';
import AccountManagementKeyList from 'components/AccountManagementKeyList.vue';
import AccountManagementSessionItem from 'components/AccountManagementSessionItem.vue';

const storeApp = useAppStore();
const storeAccounts = useAccountsStore();
let selectedIndex = ref(0);
let tab = ref('sessions');
const sortedAccountsRef = ref(storeAccounts.sortedAccounts);
function onClickItemAtIndex(index: number) {
  selectedIndex.value = index;
  storeAccounts.updateLastSelectedAccount(sortedAccountsRef.value[index].name);
}

onMounted(() => {
  storeApp.path = 'Account Management';
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
  name: 'account-management',
});
</script>

<style scoped>
.account-drop-down {
  width: 100%;
}
</style>
