<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section class="row items-center">
        <q-avatar size="40px">
          <q-img :src="storeApp.getAvatar(username)" no-spinner />
        </q-avatar>
        <span class="q-ml-md text-bold">{{ username }}</span>
      </q-card-section>
      <q-item>{{ $t('dialog_auth_req.text') }}</q-item>
      <avatar-app :app="auth_req_data.app" />
      <q-separator />
      <q-card-section>
        <q-item-section class="text-italic">{{$t('dialog_auth_req.timeout')}}</q-item-section>
        <q-select map-options emit-value v-model="authTimeout" :options="options" />
      </q-card-section>
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import { useAppStore } from 'src/stores/storeApp';
import { useI18n } from 'vue-i18n'

import AvatarApp from 'components/AvatarApp.vue';

const $q = useQuasar();
const storeApp = useAppStore()
const { t } = useI18n(), $t = t

const props = defineProps({
  username: {
    type: String,
    required: true,
  },
  auth_req_data: {
    type: Object,
    required: true,
  },
  expire: {
    type: Number,
    required: true,
  },
})

const msHour = 60*60*1000
const msDay = 24 * msHour
const msWeek = 7 * msDay
const msMonth = 30 * msDay

const options = [
  {
    label: '1 Hour',
    value: msHour,
  },
  {
    label: '1 Day',
    value: msDay
  },
  {
    label: '1 Week',
    value: msWeek
  },
  {
    label: '1 Month',
    value: msMonth
  },
]

let interval:  NodeJS.Timeout

// data
const authTimeout =  ref(msDay)
const timeout = ref(0)

// functions

defineEmits([
  ...useDialogPluginComponent.emits
])

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

function onOK () {
  onDialogOK(authTimeout.value)
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
        // counter.value = 60
      }
    }, 1000)
  
});

onUnmounted(() => {
  clearInterval(interval)
});

</script>

<script lang="ts">
export default {
  name: 'DialogAuthReq',
}

</script>