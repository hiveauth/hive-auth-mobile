<template>
  <q-item v-ripple clickable @click="toggle">
    <q-item-section avatar>
      <q-img
        :src="icon"
        spinner-color="white"
        style="height: 40px; max-width: 40px"
      />
    </q-item-section>
    <q-item-section>
      <q-item-label>{{ name }} </q-item-label>
      <q-item-label
        caption
        lines="2"
        v-if="
          description !== null &&
          description !== undefined &&
          description.length > 0
        "
      >
        {{ description ?? '' }}</q-item-label
      >
      <q-item-label
        >{{ $t('accounts.expires') }} {{ formattedDate() }}
      </q-item-label>
    </q-item-section>
    <q-item-section avatar>
      <q-btn round color="red" icon="fa-solid fa-trash" flat outline />
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
const $q = useQuasar();
dayjs.extend(relativeTime);

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  expiry: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  whitelists: {
    type: Array<string>,
    required: true,
  },
});

function toggle() {
  const whitelistOps = props.whitelists;
  const message = whitelistOps.length > 0 ? 'Following operations are whitelisted.\n' + Array.from(props.whitelists).join(', ') : 'No operations are whitelisted';
  $q.dialog({
    title: 'Whitlists',
    message: message,
  })
    .onOk((data) => {
      // console.log('>>>> OK, received', data)
    })
    .onCancel(() => {
      // console.log('>>>> Cancel')
    })
    .onDismiss(() => {
      // console.log('I am triggered on both OK and Cancel')
    });
}

function formattedDate() {
  return dayjs(props.expiry).fromNow();
}
</script>

<style scoped></style>
