<template>
  <q-item>
    <q-item-section avatar>
      <q-avatar>
        <q-icon name="key" color="primary" size="1.25rem" />
      </q-avatar>
    </q-item-section>
    <q-item-section>
      <q-item-label v-if="!suggestAdd">{{ props.keyType }} Key</q-item-label>
      <q-item-label v-if="suggestAdd">{{ props.keyType }} Key</q-item-label>
    </q-item-section>
    <q-item-section avatar v-if="suggestAdd">
      <q-btn
        v-if="suggestAdd"
        round
        color="primary"
        icon="add"
        flat
        outline
        @click="addKeyTapped"
      />
    </q-item-section>
    <q-item-section avatar v-if="!suggestAdd">
      <q-btn round color="red" icon="fa-solid fa-trash" flat outline />
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import DialogAddKey from 'components/DialogAddKey.vue';
import { useQuasar } from 'quasar'
const $q = useQuasar();
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
function addKeyTapped() {
  $q.dialog({
    component: DialogAddKey,
    componentProps: {
      // dialog props
      persistent: false,
      // custom props
      username: props.name,
      key_type: props.keyType,
    },
  })
    .onOk(() => {
      console.log('User tapped on Paste from Clipboard');
    })
    .onCancel(async () => {
      console.log('User tapped on Scan QR code');
    });
}
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
