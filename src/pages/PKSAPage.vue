<template>
  <q-page> </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
// import { useQuasar } from 'quasar';
import keys from 'src/data/keys.json';
import storage from 'src/data/storage.json';
import { uuid } from 'vue-uuid';

// - crypto js
import { inject } from 'vue';
import CryptoJS from 'crypto-js';
const cryptojs = inject('cryptojs') as typeof CryptoJS;
// ----

const KEY_TYPES = ['memo', 'posting', 'active']; // Types sorted by permission level - do not change it
const HAS_PROTOCOL = 1; // supported HAS protocol version
const PING_RATE = 60 * 1000; // 1 minute
const PING_TIMEOUT = 5 * PING_RATE; // 5 minutes

import dhiveClient from 'src/helper/dhive-client';

export default defineComponent({
  setup() {
    // const $q = useQuasar();
    const data = ref({
      scanning: false,
      storage: storage,
      wsClient: undefined,
      wsHeartbeat: undefined,
      hasProtocol: undefined,
      key_server: undefined,
    });

    // uuid.v4;

    function datetoISO(date: Date) {
      return date.toISOString().replace(/T|Z/g, ' ');
    }

    function log(message: string) {
      console.log(`${datetoISO(new Date())} - ${hideEncryptedData(message)}`);
    }

    function logerror(message: string) {
      console.error(`${datetoISO(new Date())} - ${hideEncryptedData(message)}`);
    }

    function sleep(ms: number) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    function getPrivateKey(name: string, type: string) {
      const account = keys.find((o) => o.name == name);
      switch (type) {
        case 'posting':
          return account.posting;
        case 'active':
          return account.active;
        case 'memo':
          return account.memo;
        default:
          throw new Error(`invalid key type ${type}`);
      }
    }

    function getLowestPrivateKey(name: string) {
      for (const key_type of KEY_TYPES) {
        const key_private = getPrivateKey(name, key_type);
        if (key_private) return { key_type, key_private };
      }
      return undefined;
    }

    return {
      data,
      keys,
      datetoISO,
      log,
      logerror,
      sleep,
      getPrivateKey,
      getLowestPrivateKey,
    };
  },
});
</script>

<style scoped></style>
