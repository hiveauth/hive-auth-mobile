<template>
  <q-page>
    <q-list padding>
      <q-item clickable v-ripple @click="navToAccountManagement">
        <q-item-section avatar>
          <q-icon name="fa-solid fa-users" />
        </q-item-section>

        <q-item-section> Account Management </q-item-section>
      </q-item>

      <q-separator spaced />

      <q-item clickable v-ripple @click="navToImportKeys">
        <q-item-section avatar>
          <q-icon name="download" />
        </q-item-section>

        <q-item-section> Import Keys</q-item-section>
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

        <q-item-section> Sessions </q-item-section>
      </q-item>

      <q-separator dark spaced />

      <q-item clickable v-ripple @click="navToAboutUs">
        <q-item-section avatar>
          <q-icon name="info" />
        </q-item-section>

        <q-item-section> About </q-item-section>
      </q-item>

      <q-separator dark spaced />

      <q-item clickable v-ripple @click="navToWebSocketLogs">
        <q-item-section avatar>
          <q-icon name="history" />
        </q-item-section>

        <q-item-section> Logs </q-item-section>
      </q-item>

      <q-separator dark spaced />

      <q-item clickable v-ripple @click="lockApp">
        <q-item-section avatar>
          <q-icon name="lock" />
        </q-item-section>

        <q-item-section> Lock App </q-item-section>
      </q-item>

      <q-separator dark spaced />
    </q-list>
  </q-page>
</template>

<script setup lang="ts">
import { defineComponent, onMounted } from 'vue';
import { useAppStore } from 'src/stores/storeApp';
import { useRouter } from 'vue-router';

const storeApp = useAppStore();
const router = useRouter();

// functions
function lockApp() {
  storeApp.lockApp();
  router.replace({ name: 'main' });
}

function navToManageAccounts() {
  router.push({ name: 'manage-accounts' });
}

function navToAccountManagement() {
  router.replace({ name: 'account-management' });
}

function navToAboutUs() {
  router.push({ name: 'about' });
}

function navToScanner() {
  router.push({ name: 'scan' });
}

function navToActiveSessions() {
  router.push({ name: 'active-sessions' });
}

function navToWebSocketLogs() {
  router.push({ name: 'websocket-logs' });
}

function navToImportKeys() {
  router.push({ name: 'import-key' });
}

// Hooks
onMounted(() => {
  storeApp.path = 'Menu';
})

</script>

<script lang="ts">
export default defineComponent({
  name: 'mainMenu'
});
</script>
