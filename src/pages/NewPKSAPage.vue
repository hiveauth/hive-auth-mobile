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
let wsHeartbeat: number | undefined = undefined;
let hasProtocol: number | undefined = undefined;
let key_server: string | undefined = undefined;

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
      console.log(`Going to get POK using plugin - ${name}`);
      const response = await HASCustomPlugin.callPlugin({
        callId: Date.now().toString(),
        method: 'getProofOfKey',
        privateKey: key_private,
        publicKey: key_server,
        memo: `#${value}`,
      });
      const responseData = JSON.parse(response.dataString);
      return responseData.data;
    }

    function HASSend(message: string) {
      log(`[SEND] ${message}`);
      wsClient?.send(message);
    }

    function checkUsername(name: string) {
      const err = `Invalid account name "${name}"`;
      assert(name, `${err} (undefined)`);
      assert(name[0], `${err} (empty)`);
      assert(name == name.trim(), `${err} (spaces)`);
      assert(name == name.toLowerCase(), `${err} (case)`);
    }

    function validatePayload(payload: string) {
      // Check if the account is managed by the PKSA
      let accounts = hasStorageStore.accountsJson;
      let account = accounts.find((o) => o.name == payload.account);
      if (account) {
        // Known account, try to decrypt with each encryption key associated to it
        for (const auth of account.auths.filter((o) => o.expire > Date.now())) {
          try {
            let decoded;
            try {
              decoded = CryptoJS.AES.decrypt(payload.data, auth.key).toString(
                CryptoJS.enc.Utf8
              );
            } catch (e) {
              // ignore error
            }
            if (decoded && decoded != '') {
              const data = JSON.parse(decoded);
              if (data != '') {
                // Decryption succeeded, check payload against replay attack
                assert(data.nonce > (auth.nonce || 0), 'invalid (nonce)');
                // update auth in local storage with current nonce
                auth.nonce = data.nonce;
                hasStorageStore.update(accounts);
                // fs.writeFileSync(
                //   STORAGE_FILE,
                //   JSON.stringify(storage, null, '\t')
                // );
                // Then return valid auth and decrypted payload data
                return { auth, data };
              }
            }
          } catch (e) {
            if (e.code == 'ERR_ASSERTION') {
              // Invalid nonce expected error, rethrow it
              throw e;
            }
            console.debug(e.stack);
          }
        }
      }
      return undefined;
    }

    async function processMessage(message: string) {
      try {
        const payload =
          typeof message == 'string' ? JSON.parse(message) : message;
        assert(
          payload.cmd && typeof payload.cmd == 'string',
          'invalid payload (cmd)'
        );
        if (payload.uuid) {
          // validate APP request forwarded by HAS
          assert(
            payload.uuid && typeof payload.uuid == 'string',
            'invalid payload (uuid)'
          );
          assert(
            payload.expire && typeof payload.expire == 'number',
            'invalid payload (expire)'
          );
          assert(
            payload.account && typeof payload.account == 'string',
            'invalid payload (account)'
          );
          assert(
            Date.now() < payload.expire,
            `request expired - now:${Date.now()} > expire:${payload.expire}}`
          );
        }
        switch (payload.cmd) {
          // Process HAS <-> PKSA protocol
          case 'connected':
            // connection confirmation from the HAS
            hasProtocol = payload.protocol || 0;
            return;
          case 'error':
            // error from the HAS
            return;
          case 'register_ack':
            // registration confirmation from the HAS
            return;
          case 'key_ack':
            key_server = payload.key;
            if (key_server) {
              try {
                const keys = hasKeysStore.keysJson;
                if (keys.length > 0) {
                  console.log('Keys are ' + keys.length);
                  let accountsWithPOK = [];
                  for await (const account of keys) {
                    console.log(`Account: ${account.name}`);
                    checkUsername(account.name);
                    const pokValue = await getPOK(account.name);
                    console.log(`POK: ${pokValue}`);
                    accountsWithPOK.push({
                      name: account.name,
                      pok: pokValue,
                    });
                  }
                  console.log(JSON.stringify(accountsWithPOK));
                  if (accountsWithPOK.length > 0) {
                    const request = {
                      cmd: 'register_req',
                      app: hasStorageStore.pksa_name,
                      accounts: accountsWithPOK,
                    };
                    HASSend(JSON.stringify(request));
                  }
                }
              } catch (e) {
                logerror(e.message);
              }
            }
            break;
        }
      } catch (e) {
        HASSend(JSON.stringify({ cmd: 'error', error: e.message }));
      }
    }

    async function startWebsocket() {
      log(`PKSA started - protocol: ${HAS_PROTOCOL} `);
      //const wsClient = new WebSocket("ws://localhost:3000/")
      wsClient = new WebSocket(hasStorageStore.has_server as string);

      //when a websocket connection with the HAS is established
      wsClient.onopen = async function (e) {
        log('HAS connection established');
        // Wait for HAS protocol info
        while (hasProtocol == undefined) {
          await sleep(250);
        }
        // Check HAS protocol version
        if (hasProtocol && HAS_PROTOCOL < hasProtocol) {
          logerror(
            `Unsupported HAS protocol - PKSA:${HAS_PROTOCOL} <-> HAS:${hasProtocol}`
          );
          // Stop PKSA
          wsClient?.close();
        } else {
          // Request key for registration process
          HASSend(JSON.stringify({ cmd: 'key_req' }));
        }
      };

      wsClient.onmessage = async function (event) {
        log(`[RECV] ${event.data}`);
        try {
          processMessage(event.data);
        } catch (e) {
          logerror(e.stack);
        }
      };

      wsClient.onclose = async function (event) {
        // connection closed, discard the old websocket
        wsClient = undefined;
        if (event.wasClean) {
          log('HAS Connection closed');
        } else {
          // e.g. server process killed or network down
          log('HAS Connection died');
          // Wait 1 second before trying to reconnect
          await sleep(1000);
          // restart a new websocket
          startWebsocket();
        }
      };

      wsClient.onerror = function (error) {
        log(`[error] ${error.message}`);
      };

      wsClient?.on('pong', () => {
        // HAS server is alive
        wsHeartbeat = Date.now();
      });
    }

    function heartbeat() {
      if (wsHeartbeat && wsHeartbeat + PING_TIMEOUT < Date.now()) {
        // HAS server no more responding - try to reconnect
        log('HAS Connection lost');
        wsClient = undefined;
        startWebsocket();
      } else {
        if (wsClient && wsClient.readyState == 1) {
          // Ping HAS server
          wsClient?.ping();
        }
      }
    }

    return {
      data,
      hasKeysStore,
      hasStorageStore,
      datetoISO,
      log,
      logerror,
      sleep,
      loadData,
      hideEncryptedData,
      getPrivateKey,
      getLowestPrivateKey,
      getPOK,
      HASSend,
      checkUsername,
      validatePayload,
      startWebsocket,
      heartbeat,
      processMessage,
    };
  },
  mounted() {
    const store = useHasPathStore();
    store.updateTo('new-pksa-page', 'Authenticate Actions');
    this.hasKeysStore.readKeys();
    this.hasStorageStore.readStorage();
    this.loadData();
    this.startWebsocket();
  },
});
</script>

<style scoped></style>
