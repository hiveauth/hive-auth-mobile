<template>
  <q-list bordered>
    <AccountKeyItem
      :key="`${name}-active`"
      :name="name"
      key-type="Active"
      :keyValue="active"
    />
    <q-separator />
    <AccountKeyItem
      :key="`${name}-posting`"
      :name="name"
      key-type="Posting"
      :keyValue="posting"
    />
    <q-separator />
    <AccountKeyItem
      :key="`${name}-memo`"
      :name="name"
      key-type="Memo"
      :keyValue="memo"
    />
    <q-separator />
  </q-list>
</template>

<script setup lang="ts">
import AccountKeyItem from 'components/AccountKeyItem.vue';

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  active: {
    type: String,
    required: false,
  },
  memo: {
    type: String,
    required: false,
  },
  posting: {
    type: String,
    required: false,
  },
});
</script>
<script lang="ts">
export default {
  name: 'AccountKeyList',
};
</script>
<style scoped></style>
