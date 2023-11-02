<template>
  <q-page>
    <div class="q-my-xl text-h6 text-center">HiveAuth Mobile v{{storeApp.appVersion}}</div>
    <q-separator inset />
    <q-list padding separator>
      <q-item clickable v-ripple @click="openLink('https://hiveauth.com')">
        <q-item-section top avatar>
          <q-avatar size="40px" class="q-mb-sm">
            <q-btn flat round dense icon="public" />
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label>More info</q-item-label>
          <q-item-label caption>HiveAuth Website</q-item-label>
        </q-item-section>
      </q-item>

      <q-item
        clickable
        v-ripple
        @click="openLink('https://discord.gg/Tk5dkAgQPh')"
      >
        <q-item-section top avatar>
          <q-avatar size="40px" class="q-mb-sm">
            <q-btn flat round dense icon="fa-brands fa-discord" />
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label>Support</q-item-label>
          <q-item-label caption>Contact us on Discord</q-item-label>
        </q-item-section>
      </q-item>

      <q-item
        clickable
        v-ripple
        @click="openLink('https://github.com/hiveauth')"
      >
        <q-item-section top avatar>
          <q-avatar size="40px" class="q-mb-sm">
            <q-btn flat round dense icon="fa-brands fa-github" />
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label>Github</q-item-label>
          <q-item-label caption>Follow Us on Github</q-item-label>
        </q-item-section>
      </q-item>

      <!--
      <q-item
        clickable
        v-ripple
        @click="openLink('https://t.me/+vdjU673twHRhNjU8')"
      >
        <q-item-section top avatar>
          <q-avatar size="40px" class="q-mb-sm">
            <q-btn flat round dense icon="fa-brands fa-telegram" />
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label>Telegram</q-item-label>
          <q-item-label caption>Join Us on Telegram</q-item-label>
        </q-item-section>
      </q-item>

      <q-item
        clickable
        v-ripple
        @click="openLink('https://twitter.com/hiveauth')"
      >
        <q-item-section top avatar>
          <q-avatar size="40px" class="q-mb-sm">
            <q-icon name="fa-brands fa-twitter" />
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label>Twitter</q-item-label>
          <q-item-label caption>Follow Us on Twitter</q-item-label>
        </q-item-section>
      </q-item>
      -->
    </q-list>
  </q-page>
</template>

<script setup lang="ts">

import { defineComponent, onMounted } from 'vue';
import { useAppStore } from 'src/stores/storeApp';
import { AppLauncher } from '@capacitor/app-launcher';

const storeApp = useAppStore();

// functions
async function openLink(string: string) {
  await AppLauncher.openUrl({url: string,});
}

// hooks
onMounted(() => {
  storeApp.path = 'About';
});

</script>

<script lang="ts">

export default defineComponent({
  name: 'page-about',
});

</script>