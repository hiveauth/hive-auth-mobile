<template>
  <q-item class="row items-center">
    <q-avatar size="32px">
      <q-img v-if="app.icon" :src="app.icon" spinner-color="white" />
      <q-img v-else src="~assets/app-noicon.png"/>
    </q-avatar>
    <q-item-section class="q-ml-md">
      <q-item-label class="text-bold">{{ storeApp.capitalize(app.name) }}</q-item-label>
      <q-item-label v-if="app.description" class="text-italic" lines=1>{{ app.description }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { useAppStore } from 'src/stores/storeApp';

const storeApp = useAppStore()

const props = defineProps({
  app: {
    type: Object,
    required: true,
  },
})

</script>

<script lang="ts">
export default {
  name: 'AvatarApp',
};
</script>
