<template>
  <div>
    <div class="q-pa-md">
      <q-btn-dropdown
        push
        no-caps
        rounded
        v-if="storeAccounts.sortedAccounts.length > 0"
        class="account-drop-down"
      >
        <template v-slot:label>
          <q-item-section avatar>
            <q-avatar>
              <img
                :src="`https://images.hive.blog/u/${storeAccounts.sortedAccounts[selectedIndex].name}/avatar/small`"
              />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            {{ storeAccounts.sortedAccounts[selectedIndex].name }}
          </q-item-section>
        </template>
        <q-list>
          <q-item
            v-for="(account, index) in storeAccounts.accounts"
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
    <q-tabs v-model="tab" inline-label v-if="storeAccounts.sortedAccounts.length > 0">
      <q-tab
        name="sessions"
        icon="fa-solid fa-id-card"
        :label="$t('account_management.sessions')"
      />
      <q-tab name="keys" icon="key" :label="$t('account_management.keys')" />
    </q-tabs>
    <div class="absolute-center" v-if="storeAccounts.sortedAccounts.length === 0">
      {{ $t('account_management.empty') }}
    </div>
    <div
      class="q-pa-md"
      v-if="tab === 'keys' && storeAccounts.sortedAccounts.length > 0"
    >
      <AccountManagementKeyList
        :name="storeAccounts.sortedAccounts[selectedIndex].name"
        :active="storeAccounts.sortedAccounts[selectedIndex].keys.active"
        :memo="storeAccounts.sortedAccounts[selectedIndex].keys.memo"
        :posting="storeAccounts.sortedAccounts[selectedIndex].keys.posting"
      />
    </div>
    <div
      class="q-pa-md"
      v-if="
        tab === 'sessions' &&
        storeAccounts.sortedAccounts[selectedIndex].auths.length > 0
      "
    >
      <q-list bordered>
        <AccountManagementSessionItem
          v-for="(auth, index) in storeAccounts.sortedAccounts[selectedIndex].auths"
          :key="`${auth.app}-${index}`"
          :icon="auth.app.icon"
          :expiry="auth.expire"
          :description="auth.app.description"
          :name="auth.app.name"
          :whitelists="auth.whitelists"
        />
      </q-list>
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

function onClickItemAtIndex(index: number) {
  selectedIndex.value = index;
  storeAccounts.updateLastSelectedAccount(storeAccounts.sortedAccounts[index].name);
}

onMounted(() => {
  storeApp.path = 'account-management';
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
