<template>
  <q-list padding>
    <div v-if="storeAccounts.lastAccountName != ''">
      <q-item class="row justify-center q-mt-lg">
        <q-avatar size="5rem">
          <img :src="storeApp.getAvatar(storeAccounts.lastAccountName)"/>
        </q-avatar>
      </q-item>
      <q-item class="row justify-center text-h6 q-pt-none">
        @{{storeAccounts.lastAccountName}}
      </q-item>
    </div>
    <q-item v-else class="row justify-center q-mt-lg">
      <q-avatar size="5rem">
          <img src="~assets/logo.svg"/>
        </q-avatar>
      </q-item>
    <q-separator dark spaced />
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

    <div v-if="tapCount > 2">
    <q-separator dark spaced />
    <q-item clickable v-ripple @click="onLogs">
      <q-item-section avatar>
        <q-icon name="history" />
      </q-item-section>
      <q-item-section> {{ $t('menu.logs') }} </q-item-section>
    </q-item>
    </div>

    <q-separator dark spaced />
    <q-item clickable v-ripple @click="onLock">
      <q-item-section avatar>
        <q-icon name="lock" />
      </q-item-section>
      <q-item-section> {{ $t('menu.lock') }} </q-item-section>
    </q-item>

  </q-list>
  <div class="q-pl-lg q-pb-sm text-caption text-weight-light fixed-bottom">
    <div clickable @click="onClickVersion()">Version {{ storeApp.appVersion }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from 'src/stores/storeApp';
import { useAccountsStore } from 'src/stores/storeAccounts';

const router = useRouter();
const storeApp = useAppStore();
const storeAccounts = useAccountsStore();

// data
const tapCount = ref(0)

// functions
function onLock() {
  storeApp.menuOpen = false
  storeApp.lockApp();
}

function onAccounts() {
  storeApp.menuOpen = false
  if(storeAccounts.accounts.length > 0) {
    router.push({ name: 'accounts' });
  } else {
    router.push({ name: 'import-key' });
  }
}

function onAbout() {
  storeApp.menuOpen = false
  router.push({ name: 'about' });
}

function onLogs() {
  storeApp.menuOpen = false
  router.push({ name: 'logs' });
}

function onClickVersion() {
  tapCount.value += 1
}

</script>

<script lang="ts">
export default defineComponent({
  name: 'header-menu'
});
</script>
