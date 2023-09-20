<template>
  <q-page>
    <q-list padding separator>
      <q-item clickable v-ripple>
        <q-item-section top avatar>
          <q-avatar size="40px" class="q-mb-sm">
            <q-img
              src="https://images.hive.blog/u/hiveauth/avatar/small"
              height="40px"
              width="40px"
            />
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label>HiveAuth</q-item-label>
          <q-item-label caption>HiveAuth Mobile App</q-item-label>
        </q-item-section>
      </q-item>

      <q-item
        clickable
        v-ripple
        @click="openLink('https://hive.blog/@arcange')"
      >
        <q-item-section top avatar>
          <q-avatar size="40px" class="q-mb-sm">
            <q-img
              src="https://images.hive.blog/u/arcange/avatar/small"
              height="40px"
              width="40px"
            />
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label>@arcange</q-item-label>
          <q-item-label caption>Project Lead</q-item-label>
        </q-item-section>
      </q-item>

      <q-item
        clickable
        v-ripple
        @click="openLink('https://vote.hive.uno/@sagarkothari88')"
      >
        <q-item-section top avatar>
          <q-avatar size="40px" class="q-mb-sm">
            <q-img
              src="https://images.hive.blog/u/sagarkothari88/avatar/small"
              height="40px"
              width="40px"
            />
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label>@sagarkothari88</q-item-label>
          <q-item-label caption>Mobile Application Developer</q-item-label>
        </q-item-section>
      </q-item>

      <q-item clickable v-ripple @click="openLink('https://hiveauth.com')">
        <q-item-section top avatar>
          <q-avatar size="40px" class="q-mb-sm">
            <q-btn flat round dense icon="public" />
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label>https://hiveauth.com</q-item-label>
          <q-item-label caption>Open Website</q-item-label>
        </q-item-section>
      </q-item>

      <q-item
        clickable
        v-ripple
        @click="openLink('https://hive.blog/@hiveauth')"
      >
        <q-item-section top avatar>
          <q-avatar size="40px" class="q-mb-sm">
            <q-btn flat round dense icon="newspaper" />
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label>HiveAuth Blog</q-item-label>
          <q-item-label caption>Open HiveAuth Blog on Hive</q-item-label>
        </q-item-section>
      </q-item>

      <q-item
        clickable
        v-ripple
        @click="
          openLink('https://peakd.com/hive-139531/@arcange/hiveauth-proposal-2')
        "
      >
        <q-item-section top avatar>
          <q-avatar size="40px" class="q-mb-sm">
            <q-btn flat round dense icon="thumb_up_alt" />
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label>HiveAuth proposal</q-item-label>
          <q-item-label caption>Vote for HiveAuth proposal</q-item-label>
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
          <q-item-label>Discord</q-item-label>
          <q-item-label caption>Join Us on Discord</q-item-label>
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

      <q-item
        clickable
        v-ripple
        @click="openLink('https://docs.hiveauth.com/')"
      >
        <q-item-section top avatar>
          <q-avatar size="40px" class="q-mb-sm">
            <q-icon name="far fa-file-word" />
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label>Documentation</q-item-label>
          <q-item-label caption>HiveAuth Documentation</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useHasPathStore } from 'src/stores/has-path';
import { AppLauncher } from '@capacitor/app-launcher';

export default defineComponent({
  setup() {
    async function openLink(string: string) {
      await AppLauncher.openUrl({
        url: string,
      });
    }
    return {
      openLink,
    };
  },
  mounted() {
    const store = useHasPathStore();
    store.updateTo('about-us', 'About Us');
    console.log('At About Us Page');
  },
});
</script>

<style scoped></style>
