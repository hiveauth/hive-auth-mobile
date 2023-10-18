<template>
  <q-page>
    <q-list padding>
      <q-item clickable v-ripple @click="navToManageAccounts">
        <q-item-section avatar>
          <q-icon name="key" />
        </q-item-section>

        <q-item-section> Manage Keys </q-item-section>
      </q-item>

      <q-separator spaced />

      <q-item clickable v-ripple @click="navToImportKeys">
        <q-item-section avatar>
          <q-icon name="download" />
        </q-item-section>

        <q-item-section> Import </q-item-section>
      </q-item>

      <q-separator spaced />

      <q-item clickable v-ripple @click="navToScanner">
        <q-item-section avatar>
          <q-icon name="qr_code_scanner" />
        </q-item-section>

        <q-item-section> Scan QR Code </q-item-section>
      </q-item>

      <q-separator spaced />

      <q-item clickable v-ripple @click="navToActiveSessions">
        <q-item-section avatar>
          <q-icon name="people" />
        </q-item-section>

        <q-item-section> Active Sessions </q-item-section>
      </q-item>

      <q-separator spaced />

      <q-item clickable v-ripple @click="navToAboutUs">
        <q-item-section avatar>
          <q-icon name="info" />
        </q-item-section>

        <q-item-section> About Us </q-item-section>
      </q-item>

      <q-separator spaced />

      <q-item clickable v-ripple @click="navToWebSocketLogs">
        <q-item-section avatar>
          <q-icon name="history" />
        </q-item-section>

        <q-item-section> WebSocket Logs </q-item-section>
      </q-item>

      <q-separator spaced />

      <q-item clickable v-ripple @click="lockApp">
        <q-item-section avatar>
          <q-icon name="lock" />
        </q-item-section>

        <q-item-section> Lock App </q-item-section>
      </q-item>

      <q-separator spaced />
    </q-list>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useHasPathStore } from 'src/stores/has-path';
import { useHasAuthStore } from 'src/stores/has-auth';
import { useRouter } from 'vue-router';

export default defineComponent({
  setup() {
    const hasAuthStore = useHasAuthStore();
    const router = useRouter();

    function lockApp() {
      hasAuthStore.lockApp();
      router.replace({ name: 'passcode-lock' });
    }

    function navToManageAccounts() {
      router.replace({ name: 'manage-accounts' });
    }

    function navToAboutUs() {
      router.replace({ name: 'about-us' });
    }

    function navToScanner() {
      router.replace({ name: 'qr-scanner' });
    }

    function navToActiveSessions() {
      router.replace({ name: 'active-sessions' });
    }

    function navToWebSocketLogs() {
      router.replace({ name: 'websocket-logs' });
    }

    function navToImportKeys() {
      router.replace({ name: 'import-key' });
    }
    return {
      lockApp,
      navToAboutUs,
      navToActiveSessions,
      navToWebSocketLogs,
      navToManageAccounts,
      navToScanner,
      navToImportKeys,
    };
  },
  mounted() {
    const store = useHasPathStore();
    store.updateTo('main-menu', 'Main Menu');
    console.log('At Main Menu Page');
  },
});
</script>

<style scoped></style>
