<template>
  <q-page>
    <div class="text-h1">Hello World!</div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useHasPathStore } from 'src/stores/has-path';
// import WebSocket from 'ws';

const KEY_TYPES = ['memo', 'posting', 'active']; // Types sorted by permission level - do not change it

const HAS_PROTOCOL = 1; // supported HAS protocol version
const PING_RATE = 60 * 1000; // 1 minute
const PING_TIMEOUT = 5 * PING_RATE;
let wsClient: WebSocket | undefined = undefined;
let wsHeartbeat: any = undefined;
let hasProtocol: any = undefined;
let key_server: any = undefined;

export default defineComponent({
  name: 'pksa-new',
  components: {},
  setup() {
    const data = ref({});

    async function sleep(ms: number) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    function HASSend(message: string) {
      console.log(`[SEND] ${message}`);
      wsClient?.send(message);
    }

    async function processMessage(message: string) {
      try {
        const payload =
          typeof message == 'string' ? JSON.parse(message) : message;
        console.log(
          payload.cmd &&
            typeof payload.cmd == 'string' + 'invalid payload (cmd)'
        );
        if (payload.uuid) {
          // validate APP request forwarded by HAS
          console.log(
            payload.uuid && typeof payload.uuid == 'string',
            'invalid payload (uuid)'
          );
          console.log(
            payload.expire && typeof payload.expire == 'number',
            'invalid payload (expire)'
          );
          console.log(
            payload.account && typeof payload.account == 'string',
            'invalid payload (account)'
          );
          console.log(
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
            // server public key received
            key_server = payload.key;
            if (key_server) {
              // try {
              //   const storage = JSON.parse(fs.readFileSync(STORAGE_FILE))
              //   const request = {
              //     cmd: "register_req",
              //     app: storage.pksa_name,
              //     accounts: []
              //   }
              //   const accounts = storage.accounts
              //   for(const account of accounts) {
              //     checkUsername(account.name,true)
              //     // Add account and Proof of Key
              //     request.accounts.push({name:account.name, pok:getPOK(account.name)})
              //   }
              //   // Register accounts on HAS server
              //   HASSend(JSON.stringify(request))
              // } catch(e) {
              //   console.log(e.message)
              // }
            }
            break;
        }
      } catch (e) {
        HASSend(JSON.stringify({ cmd: 'error', error: e.message }));
      }
    }

    async function startWebsocket() {
      console.log(`PKSA started - protocol: ${HAS_PROTOCOL} `);
      //const wsClient = new WebSocket("ws://localhost:3000/")
      // wsClient = new WebSocket(config.has_server);
      wsClient = new WebSocket('wss://hive-auth.arcange.eu');

      //when a websocket connection with the HAS is established
      wsClient.onopen = async function (e) {
        console.log('HAS connection established');
        // Wait for HAS protocol info
        while (hasProtocol == undefined) {
          await sleep(250);
        }
        // Check HAS protocol version
        if (hasProtocol && HAS_PROTOCOL < hasProtocol) {
          console.log(
            `Unsupported HAS protocol - PKSA:${HAS_PROTOCOL} <-> HAS:${hasProtocol}`
          );
          // Stop PKSA
          wsClient?.close();
        } else {
          // Request key for registration process
          HASSend(JSON.stringify({ cmd: 'key_req' }));
        }
      };

      wsClient.onmessage = async function (
        this: WebSocket,
        event: MessageEvent
      ) {
        console.log(`[RECV] ${event.data}`);
        try {
          processMessage(event.data);
        } catch (e) {
          console.log(e.stack);
        }
      };

      wsClient.onclose = async function (event: any) {
        // connection closed, discard the old websocket
        wsClient = undefined;
        if (event.wasClean) {
          console.log('HAS Connection closed');
        } else {
          // e.g. server process killed or network down
          console.log('HAS Connection died');
          // Wait 1 second before trying to reconnect
          await sleep(1000);
          // restart a new websocket
          startWebsocket();
        }
      };

      wsClient.onerror = function (error) {
        console.log(`[error] ${error.message}`);
      };

      // wsClient.on('pong', () => {
      //   // HAS server is alive
      //   wsHeartbeat = Date.now();
      // });
    }

    return { data, sleep, startWebsocket, HASSend };
  },

  mounted() {
    console.log('In here is');
    const store = useHasPathStore();
    store.updateTo('', 'PKSA');
    this.startWebsocket();
  },
});
</script>

<style scoped></style>
