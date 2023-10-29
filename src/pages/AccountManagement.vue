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
      <q-tab name="keys" icon="key" label="Keys" />
      <q-tab name="sessions" icon="fa-solid fa-id-card" label="Sessions" />
    </q-tabs>
    <div class="absolute-center" v-if="storeAccounts.accounts.length === 0">
      {{ $t('account_management.empty') }}
    </div>
    <div
      class="q-pa-md"
      v-if="tab === 'keys' && storeAccounts.accounts.length > 0"
    >
      <q-list bordered separator>
        <q-item
          clickable
          v-if="
            storeAccounts.accounts[selectedIndex].keys.active !== null &&
            storeAccounts.accounts[selectedIndex].keys.active !== undefined
          "
        >
          <q-item-section avatar>
            <q-avatar>
              <q-icon name="key" />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>Active Key</q-item-label>
          </q-item-section>
          <q-item-section avatar>
            <q-icon color="red" name="bin" />
          </q-item-section>
        </q-item>

        <q-item
          clickable
          v-if="
            storeAccounts.accounts[selectedIndex].keys.posting !== null &&
            storeAccounts.accounts[selectedIndex].keys.posting !== undefined
          "
        >
          <q-item-section avatar>
            <q-avatar>
              <q-icon name="key" color="primary" size="1.75rem" />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>Posting Key</q-item-label>
          </q-item-section>
          <q-item-section avatar>
            <div class="row">
              <div class="col">
                <q-icon color="primary" name="fa-solid fa-copy" size="1.75rem" />
              </div>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <div class="col">
                <q-icon color="red" name="fa-solid fa-trash" size="1.75rem" />
              </div>
            </div>
          </q-item-section>
        </q-item>

        <q-item
          clickable
          v-if="
            storeAccounts.accounts[selectedIndex].keys.memo !== null &&
            storeAccounts.accounts[selectedIndex].keys.memo !== undefined
          "
        >
          <q-item-section avatar>
            <q-avatar>
              <q-icon name="key" />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>Memo Key</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useAppStore } from 'src/stores/storeApp';
import { useAccountsStore } from 'src/stores/storeAccounts';

const storeApp = useAppStore();
const storeAccounts = useAccountsStore();
let selectedIndex = 0;
let tab = ref('keys');

function onClickItemAtIndex(index: number) {
  selectedIndex = index;
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
