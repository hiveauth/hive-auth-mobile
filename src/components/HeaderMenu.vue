<template>
  <q-list padding>
    <q-item clickable v-ripple @click="onAccounts">
      <q-item-section avatar>
        <q-icon name="people" />
      </q-item-section>
      <q-item-section>{{ $t('menu.accounts') }}</q-item-section>
    </q-item>

    <q-item clickable v-ripple @click="onAbout">
      <q-item-section avatar>
        <q-icon name="info" />
      </q-item-section>
      <q-item-section> {{ $t('menu.about') }} </q-item-section>
    </q-item>

    <q-separator dark spaced />
    <q-item clickable v-ripple @click="onLogs">
      <q-item-section avatar>
        <q-icon name="history" />
      </q-item-section>
      <q-item-section> {{ $t('menu.logs') }} </q-item-section>
    </q-item>

    <q-separator dark spaced />
    <q-item clickable v-ripple @click="onLock">
      <q-item-section avatar>
        <q-icon name="lock" />
      </q-item-section>
      <q-item-section> {{ $t('menu.lock') }} </q-item-section>
    </q-item>

  </q-list>
  <div class="q-pl-lg q-pb-sm text-caption text-weight-light fixed-bottom">
    Version {{ storeApp.appVersion }}
  </div>
</template>

<script setup lang="ts">
import { defineComponent } from 'vue';
import { useAppStore } from 'src/stores/storeApp';
import { useRouter } from 'vue-router';

const storeApp = useAppStore();
const router = useRouter();

// functions
function onLock() {
  storeApp.menuOpen = false
  storeApp.lockApp();
}

function onAccounts() {
  storeApp.menuOpen = false
  router.push({ name: 'accounts' });
}

function onAbout() {
  storeApp.menuOpen = false
  router.push({ name: 'about' });
}

function onLogs() {
  storeApp.menuOpen = false
  router.push({ name: 'logs' });
}

</script>

<script lang="ts">
export default defineComponent({
  name: 'header-menu'
});
</script>
