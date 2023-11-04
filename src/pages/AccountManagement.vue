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
    <div class="q-pl-md q-pr-md q-pb-md">
      <q-btn
      class="account-drop-down"
        color="primary"
        icon="add"
        label="Add an Account"
        @click="addAccountTapped"
      />
    </div>
    <q-tabs v-model="tab" inline-label v-if="sortedAccountsRef.length > 0">
      <q-tab
        name="sessions"
        icon="fa-solid fa-id-card"
        :label="$t('account_management.sessions')"
      />
      <q-tab name="keys" icon="key" :label="$t('account_management.keys')" />
    </q-tabs>
    <div
      class="absolute-center"
      v-if="sortedAccountsRef.length === 0 && tab === 'keys'"
    >
      {{ $t('account_management.empty') }}
    </div>
    <div class="q-pa-md" v-if="tab === 'keys' && sortedAccountsRef.length > 0">
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
        tab === 'sessions' && sortedAccountsRef[selectedIndex].auths.length > 0
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
    <div
      class="absolute-center"
      v-if="
        sortedAccountsRef[selectedIndex].auths.length === 0 &&
        tab === 'sessions'
      "
    >
      {{ $t('account_management.empty_sessions') }}
      {{ sortedAccountsRef[selectedIndex].name }}
    </div>

    <q-dialog v-model="showAddPrompt">
      <q-card>
        <q-card-section>
          <div class="text-h6">Enter hive username</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            dense
            v-model="usernameEntered"
            autofocus
            @keyup.enter="showAddPrompt = false"
          />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn flat label="Add Account" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </div>
</template>

<script setup lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useAppStore } from 'src/stores/storeApp';
import { useAccountsStore } from 'src/stores/storeAccounts';
import AccountManagementKeyList from 'components/AccountManagementKeyList.vue';
import AccountManagementSessionItem from 'components/AccountManagementSessionItem.vue';
import dhiveClient from 'src/helper/dhive-client';

const $q = useQuasar();
const storeApp = useAppStore();
const storeAccounts = useAccountsStore();
let selectedIndex = ref(0);
let tab = ref('sessions');
let usernameEntered = ref('');
let showAddPrompt = ref(false);
const sortedAccountsRef = ref(storeAccounts.sortedAccounts);

function onClickItemAtIndex(index: number) {
  selectedIndex.value = index;
  storeAccounts.updateLastSelectedAccount(sortedAccountsRef.value[index].name);
}

function addAccountTapped() {
  showAddPrompt.value = true;
}

async function addAccountTappedFromDialog() {
  let needReset = false
  try {
    $q.loading.show({ group: 'validateKey' });
    usernameEntered.value = usernameEntered.value.toLowerCase().trim();
    let account = storeAccounts.accounts.find((o) => o.name === usernameEntered.value);
    if (!account) {
      account = {
        name: usernameEntered.value,
        keys: {
          posting:undefined,
          active:undefined,
          memo:undefined,
        },
        auths:[],
      };
      needReset = true
    } else {
      $q.notify({
      color: 'negative',
      position: 'bottom',
      message: 'Account is alredy added',
      icon: 'report_problem',
    });
    }
    // if (publicKey === publicKeys.active) {
    //   account.keys.active = private_key.value;
    // } else if (publicKey === publicKeys.memo) {
    //   account.keys.memo = private_key.value;
    // } else if (publicKey === publicKeys.posting) {
    //   account.keys.posting = private_key.value;
    // } else {
    //   throw new Error($t('import_key.no_match'));
    // }
    // await storeAccounts.updateAccount(account);
    // $q.notify({
    //   color: 'positive',
    //   position: 'bottom',
    //   message: $t('import_key.success'),
    //   icon: 'check',
    // });
    // username.value = '';
    // private_key.value = '';
  } catch (e) {
    $q.notify({
      color: 'negative',
      position: 'bottom',
      message: `${$t('import_key.failed')} - ${e.message}`,
      icon: 'report_problem',
    });
  } finally {
    $q.loading.hide('validateKey');
    if(needReset) storeApp.resetWebsocket = true
  }
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
