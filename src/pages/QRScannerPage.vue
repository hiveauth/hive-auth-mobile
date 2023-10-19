<template>
  <q-page>
    <div class="q-pa-lg">
      <!-- <div class="row q-mt-lg">
        <q-btn
          class="col q-pt-sm q-pb-sm"
          rounded
          color="primary"
          label="Scan QR Code"
          @click="startScan()"
        />
      </div> -->
    </div>
  </q-page>
</template>

<script setup  lang="ts">
import { defineComponent, onMounted, onUnmounted } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router';
import { useQrResultStore } from 'src/stores/qr-result-store';
import { useHasPathStore } from 'src/stores/has-path';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';

const $q = useQuasar()
const { t } = useI18n(), $t = t
const router = useRouter();
const storeQRResult = useQrResultStore();
const storeHASPath = useHasPathStore();

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
        storeQRResult.rawQRString = result.content;
        router.replace('main-menu');
      } else {
        $q.notify({
          color: 'negative',
          position: 'bottom',
          message: $t("scan.error_scan"),
          icon: 'camera',
        });
      }
    } else {
      $q.notify({
        color: 'negative',
        position: 'bottom',
        message: $t("scan.error_permission_denied"),
        icon: 'camera',
      });
    }
  } catch (e) {
    $q.notify({
      color: 'negative',
      position: 'bottom',
      message: $t("scan.error_start_scan"),
      icon: 'camera',
    });
  }
};

// hooks
onMounted(() => {
  storeHASPath.updateTo('qr-scanner', 'Scan QR Code');
  console.log('At QR Scanner page');
  startScan();
})

onUnmounted(() => {
  BarcodeScanner.stopScan()
})

</script>

<script lang="ts">
export default defineComponent({
  name: 'page_scanner'
});
</script>