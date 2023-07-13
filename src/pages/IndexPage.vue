<template>
  <q-page>
    <div class="q-pa-lg">
      <q-input
        outlined
        rounded
        v-model="data.hiveusername"
        label="Username"
        placeholder="Enter Hive Username"
      >
        <template v-slot:prepend>
          <q-icon name="alternate_email" />
        </template>
      </q-input>
      <q-input
        outlined
        rounded
        v-model="data.hiveuserkey"
        type="password"
        label="Private Key"
        placeholder="Enter Private Key"
        class="q-pt-lg"
      >
        <template v-slot:prepend>
          <q-icon name="key" />
        </template>
      </q-input>

      <div class="row q-mt-lg">
        <q-btn
          class="col q-pt-sm q-pb-sm"
          rounded
          color="primary"
          label="Import"
        />
      </div>

      <div class="row q-mt-lg">
        <div class="col text-subtitle1 text-center">
          Add your existing HIVE account to Keychain
        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'IndexPage',
  components: {},
  setup() {
    const data = ref({
      hiveusername: '',
      hiveuserkey: '',
    });
    return { data };
  },
});
</script>
