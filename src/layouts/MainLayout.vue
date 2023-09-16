<template>
  <q-layout view="lHh Lpr lFf">
    <q-header>
      <q-toolbar>
        <q-toolbar-title>
          <q-item>
            <q-item-section top avatar>
              <q-avatar size="40px" class="q-mb-sm">
                <q-img
                  src="https://images.hive.blog/u/hiveauth/avatar/small"
                  height="40px"
                  width="40px"
                />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label>Auth Signer</q-item-label>
              <q-item-label caption style="color: white">{{
                hasPathStore.pathName
              }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
      <q-dialog v-model="data.showConfirmDialog" persistent>
        <q-card>
          <q-card-section class="row items-center">
            <q-avatar color="primary" text-color="white" size="80px">
              <q-img
                :src="data.confirmDialogAvatar"
                spinner-color="white"
                style="height: 80px; max-width: 80px"
              />
            </q-avatar>
            <span class="q-ml-md">{{ data.confirmDialogTitle }}</span>
            <span class="q-ml-sm">{{ data.confirmDialogSubtitle }}</span>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              flat
              label="Reject"
              color="primary"
              v-close-popup
              @click="rejectRequestButtonTapped"
            />
            <q-btn
              flat
              label="Approve"
              color="primary"
              v-close-popup
              @click="approveRequestButtonTapped"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-page-container>

    <q-footer>
      <q-toolbar>
        {{ data.hasServer?.replaceAll('wss://', '') }}
      </q-toolbar>
    </q-footer>
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
import { useQuasar } from 'quasar';

import {
  AccountAuth,
  AccountAuthModel,
  AccountAuthApp,
} from 'src/models/account-auth-model';

export interface LowestPrivateKey {
  key_type: string;
  key_private: string;
}

export interface QRAuthReqPayload {
  account: string;
  uuid: string;
  key: string;
  host: string;
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
      lastQRResultString: '',
      approvalString: '',
      rejectionString: '',
      showConfirmDialog: false,
      confirmDialogAvatar: 'https://images.hive.blog/u/hiveauth/avatar',
      confirmDialogTitle: '',
      confirmDialogSubtitle: '',
      confirmNewAccountName: '',
      confirmNewAccountAuth: null as AccountAuth | null,
    });

    function lockApp() {
      hasAuthStore.lockApp();
      router.push({ name: 'passcode-lock' });
    }

    function navToManageAccounts() {
      router.push({ name: 'manage-accounts' });
    }

    function navToScanner() {
      router.push({ name: 'qr-scanner' });
    }

    function navToImportKeys() {
      router.push({ name: 'import-key' });
    }

    function HASSend(message: string) {
      console.log(`[SEND] ${message}`);
      data.value.wsClient?.send(message);
    }

    function getLastQRResult() {
      if (
        data.value.lastQRResultString.length === 0 ||
        data.value.lastQRResultString.includes('has://auth_req/') == false
      ) {
        return null;
      }
      const base64Data =
        data.value.lastQRResultString.split('has://auth_req/')[1];
      const base64DecodedString = atob(base64Data);
      const result = JSON.parse(base64DecodedString);
      return {
        account: result.account,
        uuid: result.uuid,
        key: result.key,
        host: result.host,
      } as QRAuthReqPayload;
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

    async function getPOK(name: string, value: string, keys: KeysModel[]) {
      if (value.length === 0) {
        value = Date.now().toString();
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
        challenge: '',
        key: '',
      });
      const responseData = JSON.parse(response.dataString);
      return responseData.data;
    }

    async function getSignedChallenge(challenge: string, key: string) {
      const response = await HASCustomPlugin.callPlugin({
        callId: Date.now().toString(),
        method: 'signChallenge',
        privateKey: '',
        publicKey: '',
        memo: '',
        accountName: '',
        userKey: '',
        challenge: challenge,
        key: key,
      });
      const responseData = JSON.parse(response.dataString);
      return responseData.data;
    }

    async function handleKeyAck() {
      if (data.value.keyServer) {
        try {
          await hasKeysStore.readKeys();
          const keys = hasKeysStore.keysJson;
          if (keys.length > 0 && hasAuthStore.isUnlocked) {
            let accountsWithPOK = [];
            for await (const account of keys) {
              checkUsername(account.name);
              const pokValue = await getPOK(account.name, '', keys);
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
    }

    async function approveRequestButtonTapped() {
      HASSend(data.value.approvalString);
      data.value.showConfirmDialog = false;
      data.value.approvalString = '';
      data.value.rejectionString = '';
      data.value.showConfirmDialog = false;
      data.value.confirmDialogAvatar =
        'https://images.hive.blog/u/hiveauth/avatar';
      data.value.confirmDialogTitle = '';
      data.value.confirmDialogSubtitle = '';
      if (data.value.confirmNewAccountAuth !== null) {
        let name = data.value.confirmNewAccountName as string;
        await hasStorageStore.readStorage();
        let storeAccounts = hasStorageStore.accountsJson;
        let storeAccountsOfUser = storeAccounts.filter(
          (account) => account.name === name
        );
        let otherAccounts = storeAccounts.filter(
          (account) => account.name !== name
        );
        if (storeAccountsOfUser.length === 0) {
          storeAccountsOfUser = [
            {
              name: name,
              auths: [data.value.confirmNewAccountAuth],
            } as AccountAuthModel,
          ];
        } else {
          storeAccountsOfUser[0].auths = [
            ...storeAccountsOfUser[0].auths,
            data.value.confirmNewAccountAuth,
          ];
        }
        await hasStorageStore.updateAsJsonString(
          JSON.stringify([...storeAccountsOfUser, ...otherAccounts])
        );
      }
      data.value.confirmNewAccountAuth = null;
      data.value.confirmNewAccountName = '';
    }

    function rejectRequestButtonTapped() {
      HASSend(data.value.rejectionString);
      data.value.showConfirmDialog = false;
      data.value.approvalString = '';
      data.value.rejectionString = '';
      data.value.showConfirmDialog = false;
      data.value.confirmDialogAvatar =
        'https://images.hive.blog/u/hiveauth/avatar';
      data.value.confirmDialogTitle = '';
      data.value.confirmDialogSubtitle = '';
    }

    async function handleAuthReq(payload: any) {
      assert(
        payload.account && typeof payload.account == 'string',
        'invalid payload (account)'
      );
      assert(
        payload.data && typeof payload.data == 'string',
        'invalid payload (data)'
      );
      await hasKeysStore.readKeys();
      const keys = hasKeysStore.keysJson;
      const requestAccount = payload.account as string;
      const accounts = keys.filter((a) => a.name == requestAccount);
      const payloadData = payload.data as string;
      if (
        (payloadData.length > 0 &&
          accounts.length > 0 &&
          hasAuthStore.isUnlocked) == false
      )
        return;
      const account = accounts[0];
      let authKey: string | null = null;
      // If the PKSA run in "service mode " or for debug purpose, the APP can pass the encryption key (auth_key) to the PKSA with the auth_req payload
      if (payload.auth_key && hasStorageStore.auth_req_secret) {
        // Decrypt the provided auth_key using the pre-shared PKSA secret
        authKey = CryptoJS.AES.decrypt(
          payload.auth_key,
          hasStorageStore.auth_req_secret
        ).toString(CryptoJS.enc.Utf8);
      }
      await hasStorageStore.readStorage();
      var storeAccounts = hasStorageStore.accountsJson;
      var storeAccountsOfUser = storeAccounts.filter(
        (account) => account.name === payload.account
      );
      let authKeyFromStoreAccountsOfUser = false;
      if (!authKey && storeAccountsOfUser.length > 0) {
        for (const auth of storeAccountsOfUser[0].auths.filter(
          (o) => o.expire > Date.now()
        )) {
          try {
            const res = CryptoJS.AES.decrypt(payload.data, auth.key).toString(
              CryptoJS.enc.Utf8
            );
            if (res !== '') {
              // decryption succedded - use this auth_key
              authKey = auth.key;
              authKeyFromStoreAccountsOfUser = true;
              break;
            }
          } catch (e) {}
        }
      }
      var lastQRResult = getLastQRResult();
      if (lastQRResult !== null) {
        try {
          const res = CryptoJS.AES.decrypt(
            payload.data,
            lastQRResult.key
          ).toString(CryptoJS.enc.Utf8);
          if (res != '') {
            authKey = lastQRResult.key;
          }
        } catch (e) {}
      }
      if (authKey == null) return;
      let approve = false;
      let authAckData = {};
      const timeout =
        (hasStorageStore.auth_timeout_days || 1) * 24 * 60 * 60 * 1000;
      const authReqData = JSON.parse(
        CryptoJS.AES.decrypt(payload.data, authKey).toString(CryptoJS.enc.Utf8)
      );
      console.log(`Decrypted payload: ${JSON.stringify(authReqData)}`);
      if (storeAccountsOfUser.length > 0 && authKey !== null) {
        const storeAccountAuths = storeAccountsOfUser[0].auths.filter(
          (o) => o.key === authKey && o.expire > Date.now()
        );
        if (storeAccountAuths.length > 0) {
          approve = true;
          authAckData.expire = storeAccountAuths[0].expire;
        } else {
          authAckData.expire = Date.now() + timeout;
        }
      } else {
        authAckData.expire = Date.now() + timeout;
      }
      if (authReqData.challenge) {
        const challengeData = authReqData.challenge;
        assert(
          challengeData.key_type &&
            typeof challengeData.key_type == 'string' &&
            data.value.keyTypes.includes(challengeData.key_type),
          'invalid payload (challenge_data.key_type)'
        );
        assert(
          challengeData.challenge && typeof challengeData.challenge == 'string',
          'invalid payload (challenge_data.challenge)'
        );
        const keyPrivate = getPrivateKey(
          payload.account,
          challengeData.key_type,
          keys
        );
        if (keyPrivate) {
          const resultDataOfSignedChallenge = await getSignedChallenge(
            challengeData.challenge,
            keyPrivate
          );
          const challengeDataParts = resultDataOfSignedChallenge.split('___');
          authAckData.challenge = {
            pubkey: challengeDataParts[0],
            challenge: challengeDataParts[1],
          };
          console.log(`authAckData: ${JSON.stringify(authAckData)}`);
        } else {
          approve = false;
        }
      }
      const encryptedAuthAckData = CryptoJS.AES.encrypt(
        JSON.stringify(authAckData),
        authKey
      ).toString();
      console.log(`payload account - ${payload.account}`);
      console.log(`payload uuid - ${payload.uuid}`);
      const pokValue = await getPOK(payload.account, payload.uuid, keys);
      const approvalString = JSON.stringify({
        cmd: 'auth_ack',
        uuid: payload.uuid,
        data: encryptedAuthAckData,
        pok: pokValue,
      });
      console.log(`Approval string - ${approvalString}`);
      const encryptedRejectionData = CryptoJS.AES.encrypt(
        payload.uuid,
        authKey
      ).toString();
      const rejectionString = JSON.stringify({
        cmd: 'auth_nack',
        uuid: payload.uuid,
        data: encryptedRejectionData,
        pok: pokValue,
      });
      console.log(`Rejection string - ${rejectionString}`);
      data.value.approvalString = approvalString;
      data.value.rejectionString = rejectionString;
      data.value.showConfirmDialog = true;
      if (authReqData.app !== null) {
        if (authReqData.app.icon !== null) {
          data.value.confirmDialogAvatar = authReqData.app.icon;
        }
        if (authReqData.app.name !== null) {
          data.value.confirmDialogTitle = authReqData.app.name;
        }
        if (authReqData.app.description !== null) {
          data.value.confirmDialogSubtitle = authReqData.app.description;
        }
      }
      if (authKeyFromStoreAccountsOfUser === false) {
        let newAuth = {
          expire: authAckData.expire,
          key: authKey,
          app: {
            name: authReqData.app.name,
            icon: authReqData.app.icon,
            description: authReqData.app.description,
          } as AccountAuthApp,
          ts_create: new Date().toISOString(),
          ts_expire: authAckData.expire.toISOString(),
          ts_lastused: new Date().toISOString(),
          nonce: undefined,
        } as AccountAuth;
        data.value.confirmNewAccountName = account.name;
        data.value.confirmNewAccountAuth = newAuth;
      }
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
            await handleKeyAck();
            break;
          case 'auth_req':
            await handleAuthReq(payload);
            break;
        }
      } catch (e) {
        HASSend(JSON.stringify({ cmd: 'error', error: e.message }));
      }
    }

    async function startWebsocket() {
      console.log('Starting websocket with ' + data.value.hasServer);
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
        const deepLinkResponse = await HASCustomPlugin.callPlugin({
          callId: Date.now().toString(),
          method: 'getDeepLinkData',
          privateKey: '',
          publicKey: '',
          memo: '',
          accountName: '',
          userKey: '',
          challenge: '',
          key: '',
        });
        console.log(`DeepLinkResponse: ${deepLinkResponse.dataString}`);
        const qrHasServer = hasQrResultStore.rawQRString;
        if (qrHasServer.length > 0 || deepLinkResponse.dataString.length > 0) {
          hasQrResultStore.rawQRString = '';
          data.value.lastQRResultString =
            qrHasServer.length > 0 ? qrHasServer : deepLinkResponse.dataString;
          const lastQRData = getLastQRResult();
          // Reconnect only if HAS Server is a different server
          if (lastQRData?.host !== null && lastQRData?.host !== undefined) {
            data.value.wsClient?.close();
            data.value.wsClient = null;
          }
        }
        if (data.value.wsClient === null) {
          const lastQRData = getLastQRResult();
          const hasServer = lastQRData?.host ?? hasStorageStore.has_server;
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
      navToScanner,
      frequentChecker,
      heartbeat,
      HASSend,
      startWebsocket,
      checkUsername,
      approveRequestButtonTapped,
      rejectRequestButtonTapped,
    };
  },
  mounted() {
    this.hasAuthStore.readCode();
    this.frequentChecker();
    const $q = useQuasar();
    $q.dark.set(true);
  },
});
</script>

<style scoped>
.safe-area {
  padding-bottom: env(safe-area-inset-bottom);
  padding-top: env(safe-area-inset-top);
}
</style>
