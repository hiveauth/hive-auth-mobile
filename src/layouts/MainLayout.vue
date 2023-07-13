<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>
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
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'MainLayout',

  components: {},

  setup() {
    return {};
  },
});
</script>
