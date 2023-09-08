<template>
  <q-page><div class="text-h3">Hello World!</div> </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useHasPathStore } from 'src/stores/has-path';
import { useHasKeysStore } from 'src/stores/has-keys';
import { KeysModel } from 'src/models/keys-model';
import { useHasStorageStore } from 'src/stores/has-storage';
import assert from 'assert';
// - crypto js
// import { inject } from 'vue';
import CryptoJS from 'crypto-js';
// const cryptojs = inject('cryptojs') as typeof CryptoJS;
// ----

// import { memo } from '@hiveio/hive-js';
import HASCustomPlugin from '../plugins/HASCustomPlugin';

const KEY_TYPES = ['memo', 'posting', 'active']; // Types sorted by permission level - do not change it

const HAS_PROTOCOL = 1; // supported HAS protocol version
const PING_RATE = 60 * 1000; // 1 minute
const PING_TIMEOUT = 5 * PING_RATE;
let wsClient: WebSocket | undefined = undefined;
let wsHeartbeat: Date | undefined = undefined;
let hasProtocol: number | undefined = undefined;
let key_server: string | undefined = undefined;

interface LowestPrivateKey {
  key_type: string;
  key_private: string;
}

export default defineComponent({
  name: 'new-pksa-page',
  setup() {
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

    function hideEncryptedData(str: string) {
      if (hasStorageStore.hideEncryptedData) {
        while (str.includes('"data":"')) {
          str = str.replace(/"data":"(.*?)"/, '"data":<...>');
        }
        while (str.includes('"pok":"')) {
          str = str.replace(/"pok":"(.*?)"/, '"pok":<...>');
        }
      }
      return str;
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

    async function getPOK(name: string, value = Date.now()) {
      console.log(value);
      const result = getLowestPrivateKey(name);
      const key_private = result?.key_private;
      assert(key_private, `No private available for ${name}`);
      const response = await HASCustomPlugin.callPlugin({
        callId: Date.now().toString(),
        method: 'getProofOfKey',
        privateKey: key_private,
        publicKey: 'STM62ourfAJGoWjzs1uyhRtC9BbwmQGi1wse8Fw5CTrBvUBz6Wym3', //key_server,
        memo: `#${value}`,
      });
      console.log(response);
      return response;
    }

    return {
      data,
      datetoISO,
      log,
      logerror,
      sleep,
      loadData,
      hideEncryptedData,
      getPrivateKey,
      getLowestPrivateKey,
      getPOK,
    };
  },
  mounted() {
    const store = useHasPathStore();
    store.updateTo('new-pksa-page', 'Authenticate Actions');
    this.loadData();
    this.getPOK('shaktimaaan');
  },
});
</script>

<style scoped></style>
