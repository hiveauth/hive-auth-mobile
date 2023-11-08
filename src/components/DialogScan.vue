<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <div class="q-pa-lg"></div>
  </q-dialog>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useQuasar } from 'quasar';
import { useDialogPluginComponent } from 'quasar'
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { useI18n } from 'vue-i18n'

const $q = useQuasar();
const { t } = useI18n(), $t = t

async function startScan() {
  try {
    var permissionResult = await BarcodeScanner.checkPermission({force: true});
    if (permissionResult.granted === true || permissionResult.restricted === true ) {
      BarcodeScanner.hideBackground();
      const result = await BarcodeScanner.startScan();
      if (result.hasContent) {
        // $q.notify({
        //   color: 'positive',
        //   position: 'bottom',
        //   message: `QR Result - ${result.content}`,
        //   icon: 'camera',
        // });
        onDialogOK(result.content)
      } else {
        $q.notify({
          color: 'negative',
          position: 'bottom',
          message: $t('scan.error_scan'),
          icon: 'camera',
        });
        onDialogCancel()
      }
    } else {
      $q.notify({
        color: 'negative',
        position: 'bottom',
        message: $t('scan.error_permission_denied'),
        icon: 'camera',
      });
      onDialogCancel()
    }
  } catch (e) {
    $q.notify({
      color: 'negative',
      position: 'bottom',
      message: $t('scan.error_start_scan'),
      icon: 'camera',
    });
    onDialogCancel()
  }
}

// functions

defineEmits([
  ...useDialogPluginComponent.emits
])

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

// hooks
onMounted(() => {
  startScan();
});

onUnmounted(() => {
  BarcodeScanner.stopScan();
});
</script>

<script lang="ts">
export default {
  name: 'DialogScan',
};
</script>
