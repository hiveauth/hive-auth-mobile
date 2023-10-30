<template>
  <q-item>
    <q-item-section avatar>
      <q-avatar>
        <q-icon v-if="!suggestAdd" name="key" color="primary" size="1.25rem" />
        <q-btn
          v-if="suggestAdd"
          round
          color="primary"
          icon="add"
          flat
          outline
        />
      </q-avatar>
    </q-item-section>
    <q-item-section>
      <q-item-label v-if="!suggestAdd">{{ props.keyType }} Key</q-item-label>
      <q-item-label v-if="suggestAdd">Add {{ props.keyType }} Key</q-item-label>
    </q-item-section>
    <q-item-section avatar v-if="!suggestAdd">
      <div class="row">
        <div class="col">
          <q-btn
            round
            color="primary"
            icon="fa-solid fa-copy"
            flat
            outline
            @click="copyKeyToClipboard"
          />
        </div>
        <div class="col">
          <q-btn round color="red" icon="fa-solid fa-trash" flat outline />
        </div>
      </div>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { Clipboard } from '@capacitor/clipboard';
import { useQuasar } from 'quasar';

const $q = useQuasar();
async function copyKeyToClipboard() {
  try {
    await Clipboard.write({
      string: props.keyValue ?? '',
    });
    $q.notify({
      color: 'positive',
      position: 'bottom',
      message: `${props.name}'s ${props.keyType} Key is copied to clipboard`,
      icon: 'assignment',
    });
  } catch (e) {
    $q.notify({
      color: 'negative',
      position: 'bottom',
      message: `Key could not be copied - ${e.message}`,
      icon: 'report_problem',
    });
  }
}
const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  keyType: {
    type: String,
    required: true,
  },
  keyValue: {
    type: String,
    required: false,
  },
});
const currentKeyValue = props.keyValue ?? '';
const suggestAdd =
  props.keyValue === null ||
  props.keyValue === undefined ||
  currentKeyValue.length === 0;
</script>
<script lang="ts">
export default {
  name: 'AccountManagementKeyItem',
};
</script>
<style scoped></style>
