<template>
  <q-page>
    <q-list padding>
      <q-item
        clickable
        v-ripple
        @click="openOpenHiveAuthHiveBlog('https://hive.blog/@hiveauth')"
      >
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
          <q-item-label>Hive Auth</q-item-label>
          <q-item-label caption>Auth Signer Mobile Application</q-item-label>
        </q-item-section>
      </q-item>

      <q-separator spaced />

      <q-item
        clickable
        v-ripple
        @click="openOpenHiveAuthHiveBlog('https://hive.blog/@hiveauth')"
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

      <q-separator spaced />

      <q-item clickable v-ripple>
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

      <q-separator spaced />
    </q-list>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useHasPathStore } from 'src/stores/has-path';
import { AppLauncher } from '@capacitor/app-launcher';

export default defineComponent({
  setup() {
    async function openOpenHiveAuthHiveBlog(string: string) {
      await AppLauncher.openUrl({
        url: string,
      });
    }
    return {
      openOpenHiveAuthHiveBlog,
    };
  },
  mounted() {
    const store = useHasPathStore();
    store.updateTo('about-us', 'about-us');
    console.log('At About Us Page');
  },
});
</script>

<style scoped></style>
