<template>
  <q-layout view="lHh Lpr lFf">
    <q-header>
      <q-toolbar>
        <q-toolbar-title>
          <q-item>
            <q-item-section top avatar>
              <q-btn
                flat
                @click="data.isDrawerOpen = !data.isDrawerOpen"
                round
                dense
                icon="menu"
                v-if="hasAuthStore.isUnlocked"
              />
            </q-item-section>

            <q-item-section>
              <q-item-label>Auth Signer</q-item-label>
              <q-item-label caption style="color: white">{{
                hasPathStore.pathName
              }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-avatar size="40px" class="q-mb-sm">
                <q-img
                  src="https://images.hive.blog/u/hiveauth/avatar/small"
                  height="40px"
                  width="40px"
                />
              </q-avatar>
            </q-item-section>
          </q-item>
        </q-toolbar-title>
      </q-toolbar>

      <q-drawer
        v-model="data.isDrawerOpen"
        show-if-above
        class="bg-primary text-white"
        v-if="hasAuthStore.isUnlocked"
      >
        <q-scroll-area style="height: calc(100% - 100px); margin-top: 100px">
          <q-list padding>
            <q-item clickable v-ripple>
              <q-item-section avatar>
                <q-icon name="wallet" />
              </q-item-section>

              <q-item-section> Wallet </q-item-section>
            </q-item>

            <q-item clickable v-ripple @click="navToManageAccounts">
              <q-item-section avatar>
                <q-icon name="people" />
              </q-item-section>

              <q-item-section> Manage Accounts </q-item-section>
            </q-item>

            <q-item clickable v-ripple @click="navToImportKeys">
              <q-item-section avatar>
                <q-icon name="key" />
              </q-item-section>

              <q-item-section> Import Keys </q-item-section>
            </q-item>

            <q-item clickable v-ripple @click="navToPksaPage">
              <q-item-section avatar>
                <q-icon name="check_box" />
              </q-item-section>

              <q-item-section> Authenticate Actions </q-item-section>
            </q-item>

            <q-item clickable v-ripple>
              <q-item-section avatar>
                <q-icon name="qr_code_scanner" />
              </q-item-section>

              <q-item-section> Scan QR </q-item-section>
            </q-item>

            <q-item clickable v-ripple>
              <q-item-section avatar>
                <q-icon name="info" />
              </q-item-section>

              <q-item-section> About </q-item-section>
            </q-item>

            <q-item clickable v-ripple>
              <q-item-section avatar>
                <q-icon name="settings" />
              </q-item-section>

              <q-item-section> Settings </q-item-section>
            </q-item>

            <q-item clickable v-ripple @click="lockApp">
              <q-item-section avatar>
                <q-icon name="lock" />
              </q-item-section>

              <q-item-section> Lock </q-item-section>
            </q-item>
          </q-list>
        </q-scroll-area>

        <q-img
          class="absolute-top"
          src="https://cdn.quasar.dev/img/material.png"
          style="height: 100px; width: 100%"
        >
          <div class="bg-transparent">
            <div class="q-mt-lg"></div>
            <div class="row">
              <div class="q-pr-sm q-pt-sm">
                <q-avatar size="40px" class="q-mb-sm">
                  <q-img
                    src="https://images.hive.blog/u/hiveauth/avatar/small"
                    height="40px"
                    width="40px"
                  />
                </q-avatar>
              </div>
              <div class="col q-pt-sm">
                <div class="text-weight-bold">Auth Signer</div>
                <div>@arcange, @sagarkothari88</div>
              </div>
            </div>
          </div>
        </q-img>
      </q-drawer>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useHasPathStore } from 'src/stores/has-path';
import { useHasAuthStore } from 'src/stores/has-auth';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'MainLayout',

  components: {},

  setup() {
    const hasPathStore = useHasPathStore();
    const hasAuthStore = useHasAuthStore();
    const router = useRouter();
    const data = ref({
      isDrawerOpen: false,
    });

    function lockApp() {
      hasAuthStore.lockApp();
      router.push({ name: 'passcode-lock' });
    }

    function navToPksaPage() {
      router.push({ name: 'new-pksa-page' });
    }

    function navToManageAccounts() {
      router.push({ name: 'manage-accounts' });
    }

    function navToImportKeys() {
      router.push({ name: 'import-key' });
    }

    return {
      data,
      hasPathStore,
      hasAuthStore,
      lockApp,
      navToPksaPage,
      navToManageAccounts,
      navToImportKeys,
    };
  },
  mounted() {
    this.hasAuthStore.readCode();
  },
});
</script>

<style scoped>
.safe-area {
  padding-bottom: env(safe-area-inset-bottom);
  padding-top: env(safe-area-inset-top);
}
</style>
