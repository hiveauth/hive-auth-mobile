<template>
  <q-page>
    <div class="q-pa-lg">
    </div>
  </q-page>
</template>

<script setup  lang="ts">
import { defineComponent, onMounted, onUnmounted } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router';
import { useAppStore } from 'src/stores/storeApp';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';

const $q = useQuasar()
const { t } = useI18n(), $t = t
const router = useRouter();
const storeApp = useAppStore();

// functions
async function startScan() {
  try {
    var permissionResult = await BarcodeScanner.checkPermission({force: true});
    if (permissionResult.granted === true || permissionResult.restricted === true) {
      BarcodeScanner.hideBackground();
      const result = await BarcodeScanner.startScan();
      if (result.hasContent) {
        $q.notify({
          color: 'positive',
          position: 'bottom',
          message: `QR Result - ${result.content}`,
          icon: 'camera',
        });
        storeApp.scan_value = result.content;
        router.replace('main-menu');
      } else {
        $q.notify({
          color: 'negative',
          position: 'bottom',
          message: $t('scan.error_scan'),
          icon: 'camera',
        });
      }
    } else {
      $q.notify({
        color: 'negative',
        position: 'bottom',
        message: $t('scan.error_permission_denied'),
        icon: 'camera',
      });
    }
  } catch (e) {
    $q.notify({
      color: 'negative',
      position: 'bottom',
      message: $t('scan.error_start_scan'),
      icon: 'camera',
    });
  }
};

// hooks
onMounted(() => {
  storeApp.path = 'Scan QR Code'
  startScan();
})

onUnmounted(() => {
  BarcodeScanner.stopScan()
})

</script>

<script lang="ts">
export default defineComponent({
  name: 'page_scan'
});
</script>
