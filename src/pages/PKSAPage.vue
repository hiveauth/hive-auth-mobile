<template>
  <q-page> </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useQuasar } from 'quasar';
import dhiveClient from 'src/helper/dhive-client';
import { useHasPathStore } from 'src/stores/has-path';
import { useHasKeysStore } from 'src/stores/has-keys';
import { KeysModel } from 'src/models/keys-model';
import { useHasStorageStore } from 'src/stores/has-storage';
import assert from 'assert';

const KEY_TYPES = ['memo', 'posting', 'active']; // Types sorted by permission level - do not change it

const HAS_PROTOCOL = 1; // supported HAS protocol version
const PING_RATE = 60 * 1000; // 1 minute
const PING_TIMEOUT = 5 * PING_RATE;
let wsClient: WebSocket | undefined = undefined;
let wsHeartbeat: any = undefined;
let hasProtocol: any = undefined;
let key_server: any = undefined;

interface LowestPrivateKey {
  key_type: string;
  key_private: string;
}

export default defineComponent({
  name: 'pksa-page',
  setup() {
    const $q = useQuasar();
    const hasKeysStore = useHasKeysStore();
    const hasStorageStore = useHasStorageStore();
    const data = ref({
      keys: [] as KeysModel[],
    });

    function loadData() {
      data.value.keys = hasKeysStore.keysJson;
    }

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
      const account = data.value.keys.find((o) => o.name == name);
      switch (type) {
        case 'posting':
          return account?.posting;
        case 'active':
          return account?.active;
        case 'memo':
          return account?.memo;
        default:
          throw new Error(`invalid key type ${type}`);
      }
    }

    function getLowestPrivateKey(name: string) {
      for (const key_type of KEY_TYPES) {
        const key_private = getPrivateKey(name, key_type);
        if (key_private) return { key_type, key_private } as LowestPrivateKey;
      }
      return undefined;
    }

    function getPOK(name: string, value = Date.now()) {
      const result = getLowestPrivateKey(name);
      const key_private = result?.key_private;
      assert(key_private, `No private available for ${name}`);
      return memo.encode(key_private, key_server, '#' + value);
    }

    return {
      datetoISO,
      log,
      logerror,
      sleep,
      loadData,
      getPrivateKey,
      getLowestPrivateKey,
    };
  },
  mounted() {
    const store = useHasPathStore();
    store.updateTo('pksa-page', 'Authenticate Actions');
    this.loadData();
  },
});
</script>

<style scoped></style>
