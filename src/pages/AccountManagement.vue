<template>
  <div>
    <div class="q-pa-md">
      <q-btn-dropdown
        push
        no-caps
        rounded
        v-if="storeAccounts.accounts.length > 0"
        class="account-drop-down"
      >
        <template v-slot:label>
          <q-item-section avatar>
            <q-avatar>
              <img
                :src="`https://images.hive.blog/u/${storeAccounts.accounts[selectedIndex].name}/avatar/small`"
              />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            {{ storeAccounts.accounts[selectedIndex].name }}
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
    <q-tabs v-model="tab" inline-label v-if="storeAccounts.accounts.length > 0">
      <q-tab name="sessions" icon="fa-solid fa-id-card" :label="$t('account_management.sessions')" />
      <q-tab name="keys" icon="key" :label="$t('account_management.keys')" />
    </q-tabs>
    <div class="absolute-center" v-if="storeAccounts.accounts.length === 0">
      {{ $t('account_management.empty') }}
    </div>
    <div
      class="q-pa-md"
      v-if="tab === 'keys' && storeAccounts.accounts.length > 0"
    >
      <AccountManagementKeyList
        :name="storeAccounts.accounts[selectedIndex].name"
        :active="storeAccounts.accounts[selectedIndex].keys.active"
        :memo="storeAccounts.accounts[selectedIndex].keys.memo"
        :posting="storeAccounts.accounts[selectedIndex].keys.posting"
      />
    </div>
    <div
      class="q-pa-md"
      v-if="
        tab === 'sessions' &&
        storeAccounts.accounts[selectedIndex].auths.length > 0
      "
    >
      <q-list bordered>
        <AccountManagementSessionItem
        v-for="(auth, index) in storeAccounts.accounts[selectedIndex].auths"
        :key="`${auth.app}-${index}`"
        :icon=auth.app.icon
        :expiry=auth.expire
        :description=auth.app.description
        :name=auth.app.name
        :whitelists=auth.whitelists
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
}

onMounted(() => {
  storeApp.path = 'account-management';
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
