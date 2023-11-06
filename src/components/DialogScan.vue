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
  // REQUIRED; need to specify some events that your
  // component will emit through useDialogPluginComponent()
  ...useDialogPluginComponent.emits
])

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()
// dialogRef      - Vue ref to be applied to QDialog
// onDialogHide   - Function to be used as handler for @hide on QDialog
// onDialogOK     - Function to call to settle dialog with "ok" outcome
//                    example: onDialogOK() - no payload
//                    example: onDialogOK({ /*...*/ }) - with payload
// onDialogCancel - Function to call to settle dialog with "cancel" outcome

// this is part of our example (so not required)
function onOK () {
  // on OK, it is REQUIRED to call onDialogOK (with optional payload)
  // or with payload: onDialogOK({ ... }) ...and it will also hide the dialog automatically
  onDialogOK(authTimeout.value)
}

function onCancel() {
  onDialogCancel()
}

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
