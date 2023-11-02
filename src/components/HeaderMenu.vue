<template>
  <q-list padding>
    <q-item clickable v-ripple @click="navToManageAccounts">
      <q-item-section avatar>
        <q-icon name="key" />
      </q-item-section>
      <q-item-section> Manage Keys </q-item-section>
    </q-item>

    <q-item clickable v-ripple @click="navToActiveSessions">
      <q-item-section avatar>
        <q-icon name="people" />
      </q-item-section>

      <q-item-section> Sessions </q-item-section>
    </q-item>

    <q-item clickable v-ripple @click="navToImportKeys">
      <q-item-section avatar>
        <q-icon name="download" />
      </q-item-section>
      <q-item-section> Import Keys</q-item-section>
    </q-item>
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
      <q-item-section> WebSocket Logs </q-item-section>
    </q-item>

    <q-separator dark spaced />
    <q-item clickable v-ripple @click="lockApp">
      <q-item-section avatar>
        <q-icon name="lock" />
      </q-item-section>
      <q-item-section> Lock App </q-item-section>
    </q-item>

  </q-list>
</template>
  
  <script setup lang="ts">
  import { defineComponent } from 'vue';
  import { useAppStore } from 'src/stores/storeApp';
  import { useRouter } from 'vue-router';
  
  const storeApp = useAppStore();
  const router = useRouter();
  
  // functions
  function lockApp() {
    storeApp.lockApp();
  }
  
  function navToManageAccounts() {
    router.push({ name: 'account-management' });

  }
  
  function navToAboutUs() {
    router.push({ name: 'about' });
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
  
  </script>
  
  <script lang="ts">
  export default defineComponent({
    name: 'header-menu'
  });
  </script>
  