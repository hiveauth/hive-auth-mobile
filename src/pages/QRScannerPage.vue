<template>
  <q-page>
    <div class="q-pa-lg">
      <div class="text-h6" v-if="!data.scanning">{{ data.scanResult }}</div>
      <div class="row q-mt-lg">
        <q-btn
          class="col q-pt-sm q-pb-sm"
          rounded
          color="primary"
          label="Scan QR Code"
          @click="startScan()"
          v-if="!data.scanning"
        />
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { useQuasar } from 'quasar';
import { useQrResultStore } from 'src/stores/qr-result-store';
import { useHasPathStore } from 'src/stores/has-path';
import { useRouter } from 'vue-router';

export default defineComponent({
  setup() {
    const $q = useQuasar();
    const router = useRouter();
    const hasQrResultStore = useQrResultStore();
    const data = ref({
      scanning: false,
      scanResult: '',
    });

    const startScan = async () => {
      data.value.scanning = true;
      try {
        var permissionResult = await BarcodeScanner.checkPermission({
          force: true,
        });
        if (
          permissionResult.granted === true ||
          permissionResult.restricted === true
        ) {
          BarcodeScanner.hideBackground();
          const result = await BarcodeScanner.startScan();
          data.value.scanning = false;
          if (result.hasContent) {
            $q.notify({
              color: 'positive',
              position: 'bottom',
              message: `QR Result - ${result.content}`,
              icon: 'camera',
            });
            console.log(result.content); // log the raw scanned content
            hasQrResultStore.rawQRString = result.content;
            data.value.scanResult = result.content;
            router.back();
          } else {
            $q.notify({
              color: 'negative',
              position: 'bottom',
              message: 'QR scan failed',
              icon: 'camera',
            });
          }
        } else {
          data.value.scanning = false;
          $q.notify({
            color: 'negative',
            position: 'bottom',
            message: 'Camera Permissions denied',
            icon: 'camera',
          });
        }
      } catch (e) {
        data.value.scanning = false;
        $q.notify({
          color: 'negative',
          position: 'bottom',
          message:
            'Permissions denied or Error when getting camera permissions.',
          icon: 'camera',
        });
      }
    };

    return {
      data,
      startScan,
    };
  },
  mounted() {
    const store = useHasPathStore();
    store.updateTo('qr-scanner', 'Scan QR Code');
    console.log('At QR Scanner page');
  },
});
</script>

<style scoped></style>
