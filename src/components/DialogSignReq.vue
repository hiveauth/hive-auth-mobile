<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-item class="bg-grey-4">
        <q-item-section avatar>
          <q-img
            :src="auth.app.icon"
            spinner-color="white"
            style="height: 32px; max-width: 32px"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-bold">{{ storeApp.capitalize(auth.app.name) }}</q-item-label>
          <q-item-label v-if="auth.app.description" class="text-italic" lines=1>{{ auth.app.description }}</q-item-label>
        </q-item-section>
      </q-item>

      <!-- <q-card-section class="row items-center">
        <q-avatar  size="24px">
          <q-img :src="storeApp.getAvatar(username)" />
        </q-avatar>
        <span class="q-ml-xs text-bold">@{{ username }}</span>
      </q-card-section> -->
      <q-card-section><span class="text-bold">@{{ username }}</span> {{ $t('dialog_sign_req.text') }}</q-card-section>

      <div class="q-mx-md">
        <q-list bordered style="max-height: 40vh" class="scroll">
            <operation-details v-for="op in sign_req_data.ops" :key="op"
              :op="op"
            />
        </q-list>
      </div>      
      <div v-if="askWhitelist">
        <q-card-section>
          <q-checkbox v-model="whitelist" label="" />
          {{$t('dialog_sign_req.whitelist', {type: opType})}}
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
import { ref, computed } from 'vue';
import { useDialogPluginComponent } from 'quasar'
import { useAppStore } from 'src/stores/storeApp';
import { useI18n } from 'vue-i18n'

import OperationDetails from 'components/OperationDetails.vue';


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

// computed

const ops = computed(() => {
  const map = new Map()
  for(const op of props.sign_req_data.ops) {
    map.set(op[0], (map.get(op[0]) || 0) + 1)
  }
  return map
})

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

</script>

<script lang="ts">
export default {
  name: "DialogSignReq",
}

</script>

<style scoped>
.background {
  background-color: red-10
}
</style>