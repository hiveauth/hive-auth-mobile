<template>
    <q-dialog ref="dialogRef" @hide="onDialogHide">
      <q-card class="q-dialog-plugin">
        <q-card-section class="row items-center">
          <q-avatar  size="40px">
            <q-img :src="storeApp.getAvatar(username)" />
          </q-avatar>
          <span class="q-ml-md text-bold">{{ username }}</span>
        </q-card-section>
        <q-item>{{ $t('dialog_sign_req.text') }}</q-item>
        <q-card-section class="row items-center">
          <q-avatar v-if="auth.app.icon" size="40px">
            <q-img
              :src="auth.app.icon"
              spinner-color="white"
            />
          </q-avatar>
          <span class="q-ml-md  text-bold">{{ auth.app.name }}</span>
          <span v-if="auth.app.description" class="q-ml-sm">{{ auth.app.description }}</span>
        </q-card-section>
        <q-separator />
        <q-card-section style="max-height: 50vh" class="scroll">
          <p>{{ JSON.stringify(sign_req_data.ops, null, 4) }}</p>
        </q-card-section>
        <q-separator />
        <div v-if="askWhitelist">
          <q-card-section>
            <q-checkbox v-model="whitelist" label="" />
            {{$t('dialog_sign_req.whitelist')}} {{ opType }}
          </q-card-section>
          <q-separator />
        </div>
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
  import { ref } from 'vue';
  import { useDialogPluginComponent } from 'quasar'
  import { useAppStore } from 'src/stores/storeApp';
  import { useI18n } from 'vue-i18n'
  
  const storeApp = useAppStore()
  const { t } = useI18n(), $t = t

  const whitelist = ref(false)
  
  const props = defineProps({
    username: {
      type: String,
      required: true,
    },
    auth: {
      type: Object,
      required: true,
    },
    sign_req_data: {
      type: Object,
      required: true,
    },
    askWhitelist: {
      type: Boolean,
      required: true,
    },
    opType: {
      type: String,
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
    name: "DialogSignReq",
  }
  
  </script>