<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <avatar-app class="bg-grey-4" :app="auth.app" />

      <q-card-section><span class="text-bold">@{{ username }}</span> {{ $t('dialog_sign_req.text') }}</q-card-section>

      <div class="q-mx-md">
        <q-list bordered style="max-height: 40vh" class="scroll">
            <operation-details v-for="op in sign_req_data.ops" :key="op"
              :op="op"
              :expanded="showDetails"
              class="bg-grey-2"
            />
        </q-list>
      </div>      

      <div v-if="askWhitelist">
        <q-item>
          <q-item-section avatar>
            <q-checkbox v-model="whitelist" />
          </q-item-section>
          <q-item-section>
            <q-item-label caption>{{$t('dialog_sign_req.whitelist', {type: opType})}}</q-item-label>
          </q-item-section>
        </q-item>          
        <q-separator />
      </div>
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
import OperationDetails from 'components/OperationDetails.vue';


const $q = useQuasar();
const storeApp = useAppStore()
const { t } = useI18n(), $t = t

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
  showDetails: {
    type: Boolean,
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

let interval:  NodeJS.Timeout

// data
const whitelist = ref(false)
const timeout = ref(0)

// functions

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
  name: 'DialogSignReq',
}

</script>

<style scoped>
.background {
  background-color: red-10
}
</style>