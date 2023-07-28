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
          />
          <q-avatar size="40px">
            <q-img
              class="iv-logo-color"
              src="src/icon/AppIcon.png"
              width="40px"
              height="40px"
            />
          </q-avatar>
          HiveAuth Signer
        </q-toolbar-title>
      </q-toolbar>
      <q-drawer v-model="data.isDrawerOpen" class="bg-primary text-white">
        <q-list padding>
          <q-item clickable v-ripple>
            <q-item-section avatar>
              <q-icon name="inbox" />
            </q-item-section>
            <q-item-section> Inbox </q-item-section>
          </q-item>

          <q-item active clickable v-ripple>
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
              <q-icon name="drafts" />
            </q-item-section>

            <q-item-section> Drafts </q-item-section>
          </q-item>
        </q-list>
      </q-drawer>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'MainLayout',

  components: {},

  setup() {
    const data = ref({
      isDrawerOpen: false,
    });
    return { data };
  },
});
</script>

<style scoped>
.safe-area {
  padding-bottom: env(safe-area-inset-bottom);
  padding-top: env(safe-area-inset-top);
}
</style>
