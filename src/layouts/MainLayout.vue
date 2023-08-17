<template>
  <q-layout view="lHh Lpr lFf">
    <q-header>
      <q-toolbar>
        <q-toolbar-title>
          <q-btn
            flat
            @click="data.isDrawerOpen = !data.isDrawerOpen"
            round
            dense
            icon="menu"
            v-if="hasAuthStore.isUnlocked"
          />
          Hive Auth - {{ hasPathStore.pathName }}
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

            <q-item clickable v-ripple>
              <q-item-section avatar>
                <q-icon name="people" />
              </q-item-section>

              <q-item-section> Manage Accounts </q-item-section>
            </q-item>

            <q-item clickable v-ripple @click="navToPksaPage">
              <q-item-section avatar>
                <q-icon name="check_box" />
              </q-item-section>

              <q-item-section> PKSA </q-item-section>
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
                    class="iv-logo-color"
                    src="src/icon/AppIcon.png"
                    width="40px"
                    height="40px"
                  />
                </q-avatar>
              </div>
              <div class="col q-pt-sm">
                <div class="text-weight-bold">Hive Auth Signer</div>
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
      router.push({ name: 'pksa-new' });
    }

    return {
      data,
      hasPathStore,
      hasAuthStore,
      lockApp,
      navToPksaPage,
    };
  },
  mounted() {
    this.hasAuthStore.readKeys();
  },
});
</script>

<style scoped>
.safe-area {
  padding-bottom: env(safe-area-inset-bottom);
  padding-top: env(safe-area-inset-top);
}
</style>
