<template>
  <q-page>
    <div class="q-pa-lg"></div>
  </q-page>
</template>

<script setup lang="ts">
import { defineComponent, onMounted, onUnmounted } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useAppStore } from 'src/stores/storeApp';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { useAccountsStore } from 'src/stores/storeAccounts';

import dhiveClient from 'src/helper/dhive-client';
import re from 'app/src-capacitor/android/app/build/intermediates/assets/release/public/assets/MainPage.5fecfb27';

const storeAccounts = useAccountsStore();

const $q = useQuasar();
const { t } = useI18n(),
  $t = t;
const router = useRouter();
const storeApp = useAppStore();

const lastSelectedAccountName = storeAccounts.lastSelectedAccountName;

async function validateAndImportKey(scanResult: string) {
  try {
    $q.loading.show({ group: 'validateKey' });
    const publicKeys = await dhiveClient.getUserPublicKeys(
      lastSelectedAccountName
    );
    const privateKey = dhiveClient.privateKeyFromString(scanResult);
    const publicKey = dhiveClient.publicKeyFrom(privateKey);
    let account = storeAccounts.accounts.find(
      (o) => o.name === lastSelectedAccountName
    );
    if (!account) {
      return;
    }
    if (publicKey === publicKeys.active) {
      account.keys.active = scanResult;
    } else if (publicKey === publicKeys.memo) {
      account.keys.memo = scanResult;
    } else if (publicKey === publicKeys.posting) {
      account.keys.posting = scanResult;
    } else {
      throw new Error($t('import_key.no_match'));
    }
    await storeAccounts.updateAccount(account);
    $q.notify({
      color: 'positive',
      position: 'bottom',
      message: $t('import_key.success'),
      icon: 'check',
    });
    router.back();
  } catch (e) {
    $q.notify({
      color: 'negative',
      position: 'bottom',
      message: `${$t('import_key.failed')} - ${e.message}`,
      icon: 'report_problem',
    });
  } finally {
    $q.loading.hide('validateKey');
  }
}

async function startScan() {
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
      if (result.hasContent) {
        $q.notify({
          color: 'positive',
          position: 'bottom',
          message: `QR Result - ${result.content}`,
          icon: 'camera',
        });
        await validateAndImportKey(result.content);
        // $router.pop();
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
}

// hooks
onMounted(() => {
  storeApp.path = 'Scan QR Code to import Key';
  startScan();
});

onUnmounted(() => {
  BarcodeScanner.stopScan();
});
</script>

<script lang="ts">
export default defineComponent({
  name: 'page_key_scan',
});
</script>
