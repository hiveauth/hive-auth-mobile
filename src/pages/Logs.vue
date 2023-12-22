<template>
  <q-page>
    <q-list padding separator>
      <q-item v-for="log in logs" :key="log.id"
        class="q-mb-sm"
        clickable
        v-ripple
        @click="copyKeyToClipboard(log.message)"
      >
        <q-item-section side top>
          <q-item-label>{{ dayjs(log.id).fromNow() }}</q-item-label>
          <q-item-label style="overflow-wrap: break-word">{{
            log.message
          }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script setup lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useAppStore } from 'src/stores/storeApp';
import { Clipboard } from '@capacitor/clipboard';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const $q = useQuasar()
const { t } = useI18n(), $t = t
const storeApp = useAppStore();

// data
const logs = ref(storeApp.logs)

// functions
async function copyKeyToClipboard(str: string) {
  try {
    await Clipboard.write({string: str});
    $q.notify({
      color: 'positive',
      position: 'bottom',
      message: $t('logs.success_copy_clipboard'),
      icon: 'assignment',
    });
  } catch (e: any) {
    $q.notify({
      color: 'negative',
      position: 'bottom',
      message: `${$t('logs.error_copy_clipboard')} - ${e.message}`,
      icon: 'report_problem',
    });
  }
}

// hooks
onMounted(() => {
  storeApp.headerSubtitle = 'Logs';
})

</script>

<script lang="ts">

export default defineComponent({
  name: 'page-logs',
});
</script>
