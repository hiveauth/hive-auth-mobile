<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <avatar-app class="bg-grey-4" :app="auth.app" />

      <q-card-section><span class="text-bold">@{{ username }}</span> {{ $t('dialog_challenge_req.text') }}</q-card-section>

      <q-separator />
      <q-card-section horizontal>
        <q-card-section>
          <q-circular-progress
            show-value
            :value="timeout"
            :max="storeApp.nodeTimeout"
            size="sm"
            color="primary"
            center-color="grey-2"
          />
        </q-card-section>
        <q-space />
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
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
  
<script setup lang="ts">
import { useQuasar } from 'quasar'
import { ref, onMounted, onUnmounted } from 'vue';
import { useDialogPluginComponent } from 'quasar'
import { useAppStore } from 'src/stores/storeApp';
import { useI18n } from 'vue-i18n'

import AvatarApp from 'components/AvatarApp.vue';


const $q = useQuasar();
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

let interval:  NodeJS.Timeout

// data
const timeout = ref(0)

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

// hooks
onMounted(() => {
  timeout.value = ((props.expire - Date.now()) / 1000) | 0;
  interval = setInterval(() => {
      if(timeout.value > 0) {
        timeout.value--
      } else {
        $q.notify({
          color: 'negative',
          position: 'bottom',
          message: $t('request_expired'),
          timeout: 1000
        });
        clearInterval(interval)
        onDialogHide()
      }
    }, 1000)
  
});

onUnmounted(() => {
  clearInterval(interval)
});

</script>

<script lang="ts">
export default {
  name: 'DialogChallengeReq',
}

</script>