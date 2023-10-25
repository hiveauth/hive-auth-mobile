<template>
    <q-dialog ref="dialogRef" @hide="onDialogHide">
      <q-card class="q-dialog-plugin">
        <q-card-section class="row items-center">
          <q-avatar v-if="auth.app.icon" color="primary" text-color="white" size="40px">
            <q-img
              :src="auth.app.icon"
              spinner-color="white"
              style="height: 40px; max-width: 40px"
            />
          </q-avatar>
          <span class="q-ml-md">{{ auth.app.name }}</span>
          <span v-if="auth.app.description" class="q-ml-sm">{{ auth.app.description }}</span>
        </q-card-section>
        <q-separator />
        <q-card-section>
          {{ auth.app.name }} would like to sign a challenge to verify that you have the valid key.
        </q-card-section>
        <q-separator />
        <q-card-actions align="right">
          <q-btn
            flat
            :label="$t('btn_reject')"
            color="primary"
            @click="onCancel"
          />
          <q-btn
            flat
            :label = "$t('btn_approve')"
            color="primary"
            @click="onOK"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useDialogPluginComponent } from 'quasar'
  import { useI18n } from 'vue-i18n'
  
  const { t } = useI18n(), $t = t

  const whitelist = ref(true)
  
  const props = defineProps({
    name: {
      type: String,
      required: true,
    },
    auth: {
      type: Object,
      required: true,
    },
    expire: {
      type: Number,
      required: true,
    },
  })
  
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
    onDialogOK(whitelist.value)
  }
  
  function onCancel() {
    onDialogCancel()
  }
  
  </script>
  
  <script lang="ts">
  export default {
    name: "DialogChallengeReq",
  }
  
  </script>