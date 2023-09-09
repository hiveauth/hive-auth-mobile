<template>
  <q-layout view="lHh Lpr lFf">
    <q-header>
      <q-toolbar>
        <q-toolbar-title>
          <q-item>
            <q-item-section top avatar>
              <q-btn
                flat
                @click="data.isDrawerOpen = !data.isDrawerOpen"
                round
                dense
                icon="menu"
                v-if="hasAuthStore.isUnlocked"
              />
            </q-item-section>

            <q-item-section>
              <q-item-label>Auth Signer</q-item-label>
              <q-item-label caption style="color: white">{{
                hasPathStore.pathName
              }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-avatar size="40px" class="q-mb-sm">
                <q-img
                  src="https://images.hive.blog/u/hiveauth/avatar/small"
                  height="40px"
                  width="40px"
                />
              </q-avatar>
            </q-item-section>
          </q-item>
        </q-toolbar-title>
      </q-toolbar>

      <q-drawer
        v-model="data.isDrawerOpen"
        show-if-above
        class="bg-primary text-white"
        v-if="hasAuthStore.isUnlocked"
      >
        <q-scroll-area style="height: calc(100% - 100px); margin-top: 100px">
          <q-list padding>
            <q-item clickable v-ripple>
              <q-item-section avatar>
                <q-icon name="wallet" />
              </q-item-section>

              <q-item-section> Wallet </q-item-section>
            </q-item>

            <q-item clickable v-ripple @click="navToManageAccounts">
              <q-item-section avatar>
                <q-icon name="people" />
              </q-item-section>

              <q-item-section> Manage Accounts </q-item-section>
            </q-item>

            <q-item clickable v-ripple @click="navToImportKeys">
              <q-item-section avatar>
                <q-icon name="key" />
              </q-item-section>

              <q-item-section> Import Keys </q-item-section>
            </q-item>

            <q-item clickable v-ripple>
              <q-item-section avatar>
                <q-icon name="qr_code_scanner" />
              </q-item-section>

              <q-item-section> Scan QR </q-item-section>
            </q-item>

            <q-item clickable v-ripple>
              <q-item-section avatar>
                <q-icon name="info" />
              </q-item-section>

              <q-item-section> About </q-item-section>
            </q-item>

            <q-item clickable v-ripple>
              <q-item-section avatar>
                <q-icon name="settings" />
              </q-item-section>

              <q-item-section> Settings </q-item-section>
            </q-item>

            <q-item clickable v-ripple @click="lockApp">
              <q-item-section avatar>
                <q-icon name="lock" />
              </q-item-section>

              <q-item-section> Lock </q-item-section>
            </q-item>
          </q-list>
        </q-scroll-area>

        <q-img
          class="absolute-top"
          src="https://cdn.quasar.dev/img/material.png"
          style="height: 100px; width: 100%"
        >
          <div class="bg-transparent">
            <div class="q-mt-lg"></div>
            <div class="row">
              <div class="q-pr-sm q-pt-sm">
                <q-avatar size="40px" class="q-mb-sm">
                  <q-img
                    src="https://images.hive.blog/u/hiveauth/avatar/small"
                    height="40px"
                    width="40px"
                  />
                </q-avatar>
              </div>
              <div class="col q-pt-sm">
                <div class="text-weight-bold">Auth Signer</div>
                <div>@arcange, @sagarkothari88</div>
              </div>
            </div>
          </div>
        </q-img>
      </q-drawer>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useHasPathStore } from 'src/stores/has-path';
import { useHasAuthStore } from 'src/stores/has-auth';
import { useHasStorageStore } from 'src/stores/has-storage';
import { useQrResultStore } from 'src/stores/qr-result-store';
import { useRouter } from 'vue-router';
import CryptoJS from 'crypto-js';
import assert from 'assert';
import { useHasKeysStore } from 'src/stores/has-keys';
import HASCustomPlugin from '../plugins/HASCustomPlugin';
import { KeysModel } from 'src/models/keys-model';

interface LowestPrivateKey {
  key_type: string;
  key_private: string;
}

export default defineComponent({
  name: 'MainLayout',
  components: {},
  setup() {
    const hasPathStore = useHasPathStore();
    const hasAuthStore = useHasAuthStore();
    const hasStorageStore = useHasStorageStore();
    const hasQrResultStore = useQrResultStore();
    const hasKeysStore = useHasKeysStore();
    const router = useRouter();
    const data = ref({
      isDrawerOpen: false,
      wsClient: null as WebSocket | null,
      wsHeartbeat: null as number | null,
      keyServer: null as string | null,
      pingRate: (60 * 1000) as number,
      pingTimeout: (5 * 60 * 1000) as number,
      hasProtocol: 1 as number,
      keyTypes: ['memo', 'posting', 'active'] as string[],
      hasServer: hasStorageStore.has_server,
    });

    function lockApp() {
      hasAuthStore.lockApp();
      router.push({ name: 'passcode-lock' });
    }

    function navToManageAccounts() {
      router.push({ name: 'manage-accounts' });
    }

    function navToImportKeys() {
      router.push({ name: 'import-key' });
    }

    function HASSend(message: string) {
      console.log(`[SEND] ${message}`);
      data.value.wsClient?.send(message);
    }

    function checkUsername(name: string) {
      const err = `Invalid account name "${name}"`;
      assert(name, `${err} (undefined)`);
      assert(name[0], `${err} (empty)`);
      assert(name == name.trim(), `${err} (spaces)`);
      assert(name == name.toLowerCase(), `${err} (case)`);
    }

    function getPrivateKey(name: string, type: string, keys: KeysModel[]) {
      const account = keys.find((o) => o.name == name);
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

    function getLowestPrivateKey(name: string, keys: KeysModel[]) {
      for (const key_type of data.value.keyTypes) {
        const key_private = getPrivateKey(name, key_type, keys);
        if (key_private) return { key_type, key_private } as LowestPrivateKey;
      }
      return undefined;
    }

    async function getPOK(name: string, value: number, keys: KeysModel[]) {
      if (value == 0) {
        value = Date.now();
      }
      const result = getLowestPrivateKey(name, keys);
      const key_private = result?.key_private;
      assert(key_private, `No private available for ${name}`);
      console.log(`Going to get POK using plugin - ${name}`);
      const response = await HASCustomPlugin.callPlugin({
        callId: Date.now().toString(),
        method: 'getProofOfKey',
        privateKey: key_private,
        publicKey: data.value.keyServer ?? '',
        memo: `#${value}`,
        accountName: '',
        userKey: '',
      });
      const responseData = JSON.parse(response.dataString);
      return responseData.data;
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
          case 'connected':
            data.value.hasProtocol = payload.protocol || 0;
            return;
          case 'error':
            return;
          case 'register_ack':
            return;
          case 'key_ack':
            data.value.keyServer = payload.key;
            if (data.value.keyServer) {
              try {
                await hasKeysStore.readKeys();
                const keys = hasKeysStore.keysJson;
                if (keys.length > 0 && hasAuthStore.isUnlocked) {
                  let accountsWithPOK = [];
                  for await (const account of keys) {
                    checkUsername(account.name);
                    const pokValue = await getPOK(account.name, 0, keys);
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
                console.log(e.message);
              }
            }
            break;
        }
      } catch (e) {
        HASSend(JSON.stringify({ cmd: 'error', error: e.message }));
      }
    }

    async function startWebsocket() {
      data.value.wsClient = new WebSocket(data.value.hasServer as string);
      data.value.wsClient.onopen = async function (e) {
        console.log('HAS connection established');
        HASSend(JSON.stringify({ cmd: 'key_req' }));
      };

      data.value.wsClient.onmessage = async function (event) {
        console.log(`[RECV] ${event.data}`);
        try {
          processMessage(event.data);
        } catch (e) {
          console.log(e.stack);
        }
      };

      data.value.wsClient.onclose = async function (event) {
        // connection closed, discard the old websocket
        data.value.wsClient = null;
        if (event.wasClean) {
          console.log('HAS Connection closed');
        } else {
          // e.g. server process killed or network down
          console.log('HAS Connection died');
          // Wait 1 second before trying to reconnect
          await new Promise((resolve) => setTimeout(resolve, 1000));
          // restart a new websocket
          startWebsocket();
        }
      };

      data.value.wsClient.onerror = function (error) {
        console.log(`[error] ${error.message}`);
      };

      data.value.wsClient?.on('pong', () => {
        // HAS server is alive
        data.value.wsHeartbeat = Date.now();
      });
    }

    function heartbeat() {
      if (
        data.value.wsHeartbeat &&
        data.value.wsHeartbeat + data.value.pingTimeout < Date.now()
      ) {
        // HAS server no more responding - try to reconnect
        console.log('HAS Connection lost');
        data.value.wsClient = null;
        startWebsocket();
      } else {
        if (data.value.wsClient && data.value.wsClient.readyState == 1) {
          // Ping HAS server
          data.value.wsClient?.ping();
        }
      }
    }

    async function frequentChecker() {
      if (hasAuthStore.isUnlocked == false) {
        data.value.wsClient?.close();
        data.value.wsClient = null;
      } else {
        const qrHasServer = hasQrResultStore.getQRAuthReqPayload;
        if (qrHasServer !== null && qrHasServer.host !== data.value.hasServer) {
          data.value.wsClient?.close();
          data.value.wsClient = null;
        }
        if (data.value.wsClient === null) {
          const hasServer = qrHasServer?.host ?? hasStorageStore.has_server;
          data.value.hasServer = hasServer;
          startWebsocket();
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
      frequentChecker();
    }

    return {
      data,
      hasPathStore,
      hasAuthStore,
      hasStorageStore,
      lockApp,
      navToManageAccounts,
      navToImportKeys,
      frequentChecker,
      heartbeat,
      HASSend,
      startWebsocket,
      checkUsername,
    };
  },
  mounted() {
    this.hasAuthStore.readCode();
    this.frequentChecker();
  },
});
</script>

<style scoped>
.safe-area {
  padding-bottom: env(safe-area-inset-bottom);
  padding-top: env(safe-area-inset-top);
}
</style>
