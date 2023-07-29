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
        <q-list padding style="margin-top: 155px; height: calc(100% - 155px)">
          <q-item clickable v-ripple>
            <q-item-section avatar>
              <q-icon name="inbox" />
            </q-item-section>
            <q-item-section> Inbox </q-item-section>
          </q-item>

          <q-item clickable v-ripple>
            <q-item-section avatar>
              <q-icon name="star" />
            </q-item-section>

            <q-item-section> Star </q-item-section>
          </q-item>

          <q-item clickable v-ripple>
            <q-item-section avatar>
              <q-icon name="send" />
            </q-item-section>

            <q-item-section> Send </q-item-section>
          </q-item>

          <q-item clickable v-ripple>
            <q-item-section avatar>
              <q-icon name="send" />
            </q-item-section>

            <q-item-section> Send </q-item-section>
          </q-item>

          <q-item clickable v-ripple>
            <q-item-section avatar>
              <q-icon name="drafts" />
            </q-item-section>

            <q-item-section> Drafts </q-item-section>
          </q-item>
        </q-list>

        <q-img
          class="absolute-top"
          src="https://cdn.quasar.dev/img/material.png"
          style="height: 155px"
        >
          <div class="bg-transparent">
            <div class="q-mt-lg"></div>
            <q-avatar size="40px" class="q-mb-sm">
              <q-img
                class="iv-logo-color"
                src="src/icon/AppIcon.png"
                width="40px"
                height="40px"
              />
            </q-avatar>
            <div class="text-weight-bold">Hive Auth Signer</div>
            <div>@arcange</div>
            <div>@sagarkothari88</div>
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

export default defineComponent({
  name: 'MainLayout',

  components: {},

  setup() {
    const hasPathStore = useHasPathStore();
    const hasAuthStore = useHasAuthStore();
    const data = ref({
      isDrawerOpen: false,
    });
    return { data, hasPathStore, hasAuthStore };
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
