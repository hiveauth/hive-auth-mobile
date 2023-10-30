<template>
  <q-list bordered>
    <AccountManagementKeyItem
      :key="`${name}-active`"
      key-type="Active"
      v-if="active !== null && active !== undefined"
    />
    <q-separator v-if="active !== null && active !== undefined" />
    <AccountManagementKeyItem
      key-type="Posting"
      :key="`${name}-posting`"
      v-if="posting !== null && posting !== undefined"
    />
    <q-separator v-if="posting !== null && posting !== undefined" />

    <AccountManagementKeyItem
      :key="`${name}-memo`"
      key-type="Memo"
      v-if="memo !== null && memo !== undefined"
    />
    <q-separator v-if="memo !== null && memo !== undefined" />
  </q-list>
</template>

<script setup lang="ts">
import AccountManagementKeyItem from 'components/AccountManagementKeyItem.vue';

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
  name: 'AccountManagementKeyList',
};
</script>
<style scoped></style>
