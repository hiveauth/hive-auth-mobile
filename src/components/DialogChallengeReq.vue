<template>
    <q-dialog ref="dialogRef" @hide="onDialogHide">
      <q-card class="q-dialog-plugin">
        <q-card-section class="row items-center">
          <q-avatar  size="40px">
            <q-img :src="storeApp.getAvatar(username)" />
          </q-avatar>
          <span class="q-ml-md text-bold">{{ username }}</span>
        </q-card-section>
        <q-item>{{ $t('dialog_challenge_req.text') }}</q-item>
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

  const whitelist = ref(true)
  
  const props = defineProps({
    username: {
      type: String,
      required: true,
    },
    auth: {
      type: Object,
      required: true,
    },
    challenge_req_data: {
      type: Object,
      required: true,
    },
    expire: {
      type: Number,
      required: true,
    },
  })
  
  defineEmits([
    ...useDialogPluginComponent.emits
  ])
  
  const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

  function onOK () {
    onDialogOK(whitelist.value)
  }
  
  function onCancel() {
    onDialogCancel()
  }
  
  </script>
  
  <script lang="ts">
  export default {
    name: 'DialogChallengeReq',
  }
  
  </script>