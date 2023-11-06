<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section class="row items-center">
        <q-avatar  size="40px">
          <q-img :src="storeApp.getAvatar(username)" />
        </q-avatar>
        <span class="q-ml-md text-bold">{{ username }}</span>
      </q-card-section>
      <q-item>{{ $t('dialog_auth_req.text') }}</q-item>
      <q-card-section class="row items-center">
        <q-avatar v-if="auth_req_data.app.icon" size="40px">
          <q-img
            :src="auth_req_data.app.icon"
            spinner-color="white"
          />
        </q-avatar>
        <span class="q-ml-md  text-bold">{{ auth_req_data.app.name }}</span>
        <span v-if="auth_req_data.app.description" class="q-ml-sm">{{ auth_req_data.app.description }}</span>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-item-section class="text-italic">{{$t('dialog_auth_req.timeout')}}</q-item-section>
        <q-select map-options emit-value v-model="authTimeout" :options="options" />
      </q-card-section>
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
import { ref } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import { useAppStore } from 'src/stores/storeApp';
import { useI18n } from 'vue-i18n'

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

// data
const authTimeout =  ref(msDay)

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
</script>

<script lang="ts">
export default {
  name: "DialogAuthReq",
}

</script>