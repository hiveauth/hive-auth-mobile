<template>
  <q-dialog ref="dialogRef" v-model="confirm">
    <q-card>
      <q-card-section class="row items-center">
        <q-avatar icon="key" color="primary" text-color="white" />
        <span class="q-ml-sm"> {{ $t('account_management.import_dialog_title') }} {{ key_type }} key </span>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          no-caps
          color="primary"
          v-close-popup
          @click="tappedOnPasteFromClipboard"
        >
          <div>
            <q-icon name="fa-regular fa-clipboard" size="1.5em" />
            {{ $t('account_management.import_key_action_paste') }}
          </div>
        </q-btn>
        <q-btn
          flat
          no-caps
          color="primary"
          v-close-popup
          @click="tappedOnScanQRCode"
        >
          <div>
            <q-icon name="fa-solid fa-qrcode" size="1.5em" />
            {{ $t('account_management.import_key_action_qr') }}
          </div>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useDialogPluginComponent } from 'quasar';
const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent();

const confirm = ref(false);
const props = defineProps({
  username: {
    type: String,
    required: true,
  },
  key_type: {
    type: Object,
    required: true,
  },
});

// this is part of our example (so not required)
function tappedOnPasteFromClipboard() {
  console.log('User tapped on Paste from Clipboard');
  onDialogOK();
}

function tappedOnScanQRCode() {
  console.log('User tapped on Scan QR code');
  onDialogCancel();
}

defineEmits([...useDialogPluginComponent.emits]);
</script>

<script lang="ts">
export default {
  name: 'DialogAddKey',
};
</script>

<style scoped></style>
