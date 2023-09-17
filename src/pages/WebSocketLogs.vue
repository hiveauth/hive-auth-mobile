<template>
  <q-page>
    <q-list padding separator>
      <q-item
        v-for="logItem in data.logs"
        :key="logItem.id"
        class="q-mb-sm"
        clickable
        v-ripple
        @click="copyKeyToClipboard(logItem.log)"
      >
        <q-item-section side top>
          <q-item-label>{{ getDateInTimeAgoFormat(logItem.id) }}</q-item-label>
          <q-item-label style="overflow-wrap: break-word">{{
            logItem.log
          }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useHasLogsStore } from 'src/stores/has-logs';
import { useHasPathStore } from 'src/stores/has-path';
import moment from 'moment';
import { Clipboard } from '@capacitor/clipboard';

export default defineComponent({
  setup() {
    const hasLogsStore = useHasLogsStore();
    const data = ref({
      logs: hasLogsStore.logs,
    });

    async function copyKeyToClipboard(string: string) {
      try {
        await Clipboard.write({
          string: string,
        });
        $q.notify({
          color: 'positive',
          position: 'bottom',
          message: 'Websocket log is copied to clipboard',
          icon: 'assignment',
        });
      } catch (e) {
        $q.notify({
          color: 'negative',
          position: 'bottom',
          message: `Key could not be copied - ${e.message}`,
          icon: 'report_problem',
        });
      }
    }

    function getDateInTimeAgoFormat(date: string) {
      const value = moment(date).toNow(true);
      console.log(`Returning value - ${value}`);
      return `${value} ago`;
    }

    return {
      data,
      copyKeyToClipboard,
      getDateInTimeAgoFormat,
    };
  },
  mounted() {
    const store = useHasPathStore();
    store.updateTo('websocket-logs', 'Websocket Logs');
    console.log('At WebSocket Logs page');
  },
});
</script>

<style scoped></style>
