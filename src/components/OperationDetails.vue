<template>
  <q-expansion-item group="ops-group" class="q-py-sm" 
    :default-opened="expanded"
    dense
    dense-toggle 
    expand-icon-class="text-red-10"
  >
    <template v-slot:header>
      <q-item-section>
        {{ op[0] }}
      </q-item-section>
    </template>
    <div v-if="isPrettyAvailable" class="q-mx-md">
      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="pretty" :label="$t('operation_details.pretty')" no-caps />
        <q-tab name="raw" :label="$t('operation_details.raw')" no-caps />
      </q-tabs>
      <q-separator />
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="pretty">
          <div v-if="op[0]=='vote'">
            <div><span class="text-bold">Author:</span> {{ op[1].author }}</div>
            <div><span class="text-bold">Permlink:</span> {{ op[1].permlink }}</div>
            <div><span class="text-bold">Weight:</span> {{ op[1].weight / 100 }}%</div>
          </div>
          <div v-else-if="op[0]=='comment'">
            <div><span v-if="!op[1].title" class="text-bold">Reply to:</span> {{ op[1].parent_author }}</div>
            <div><span v-if="op[1].title" class="text-bold">Title:</span> {{ op[1].title }}</div>
            <q-item-label lines="3"><span class="text-bold">Body:</span> {{ op[1].body }}</q-item-label>
          </div>
          <div v-else-if="op[0]=='transfer'">
            <div><span class="text-bold">To:</span> {{ op[1].to }}</div>
            <div><span class="text-bold">Amount:</span> {{ op[1].amount }}</div>
            <q-item-label lines="3"><span class="text-bold">Memo:</span> {{ op[1].memo }}</q-item-label>
          </div>

          <!-- Custom jsons -->
          <div v-else-if="op[0]=='custom_json'">
            <operation-pretty-custom-json :data="op[1]" />
          </div>
          <!-- Other ops -->
          <div v-else>
            <p>{{ JSON.stringify(op[1]) }}</p>
          </div>
        </q-tab-panel>
        <q-tab-panel name="raw">
          <div  class="raw">{{ JSON.stringify(op[1]) }}</div>
        </q-tab-panel>
      </q-tab-panels>      
    </div>
    <div v-else class="q-mx-md">
      {{ JSON.stringify(op[1]) }}
    </div>
  </q-expansion-item>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

import OperationPrettyCustomJson from 'components/OperationsPrettyCustomJson.vue';

const prettyView = ['comment','vote', 'transfer', 'custom_json']

const props = defineProps({
  op: {
    type: Object,
    required: true,
  },
  expanded: {
    type: Boolean,
    required: false,
    default: false
  }
});

// data

const tab = ref('pretty')

// computed

const isPrettyAvailable = computed(() => prettyView.includes(props.op[0]))

</script>

<script lang="ts">
export default {
  name: 'OperationDetails',
};
</script>

<style scoped>
.raw {
  word-break: break-all;
}
</style>
