<template>
  <div class="q-pa-md">
    <q-btn-dropdown push no-caps rounded class="">
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
</template>

<script setup lang="ts">
import { defineComponent, onMounted } from 'vue';
import { useAppStore } from 'src/stores/storeApp';
import { useAccountsStore, IAccount } from 'src/stores/storeAccounts';

const storeApp = useAppStore();
const storeAccounts = useAccountsStore();
let selectedIndex = 0;

function onClickItemAtIndex(index: number) {
  selectedIndex = index;
};

onMounted(() => {
  storeApp.path = 'Account Management';
});
</script>

<script lang="ts">
export default defineComponent({
  name: 'account-management',
});
</script>

<style scoped></style>
