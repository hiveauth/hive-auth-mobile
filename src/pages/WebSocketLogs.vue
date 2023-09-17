<template>
  <q-page>
    <q-list padding separator>
      <q-item
        v-for="logItem in data.logs"
        :key="logItem.id"
        class="q-mb-sm"
        clickable
        v-ripple
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

export default defineComponent({
  setup() {
    const hasLogsStore = useHasLogsStore();
    const data = ref({
      logs: hasLogsStore.logs,
    });

    function getDateInTimeAgoFormat(date: string) {
      const value = moment(date).toNow(true);
      console.log(`Returning value - ${value}`);
      return `${value} ago`;
    }

    return {
      data,
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
