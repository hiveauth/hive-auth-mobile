<template>
    <q-item clickable v-ripple>
      <q-item-section avatar>
        <q-avatar>
          <q-icon name="key" color="primary" size="1.25rem" />
        </q-avatar>
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ props.keyType }}</q-item-label>
      </q-item-section>
      <q-item-section avatar>
        <div class="row">
          <div class="col">
            <q-icon color="primary" name="fa-solid fa-copy" size="1.25rem" />
          </div>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <div class="col">
            <q-icon color="red" name="fa-solid fa-trash" size="1.25rem" />
          </div>
        </div>
      </q-item-section>
    </q-item>
</template>

<script setup lang="ts">
const props = defineProps({
  keyType: {
    type: String,
    required: true,
  },
});
</script>
<script lang="ts">
export default {
  name: 'AccountManagementKeyItem',
};
</script>
<style scoped></style>
