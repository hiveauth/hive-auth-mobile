<template>
  <q-page>
    <div class="text-h1">Hello World</div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
// import { useQuasar } from 'quasar';
import { KeysModel } from 'src/models/keys-model';
import { StroageModel } from 'src/models/storage-model';
// import { AccountAuth } from 'src/models/account-auth-model';
// import { PrivateKey, PublicKey, Transaction } from '@hiveio/dhive';
import keys from 'src/data/keys.json';
import storage from 'src/data/storage.json';
// import { uuid } from 'vue-uuid';

// - crypto js
// import { inject } from 'vue';
import CryptoJS from 'crypto-js';
// const cryptojs = inject('cryptojs') as typeof CryptoJS;
// ----

import memo from '@hiveio/hive-js/lib/auth/memo';
// import ecc from '@hiveio/hive-js/lib/auth/ecc';

// import dhiveClient from 'src/helper/dhive-client';

let wsClient: WebSocket | undefined = undefined;

export default defineComponent({
  name: 'pk-sa',
  components: {},
  setup() {
    // const $q = useQuasar();
    const data = ref({
      scanning: false,
      storage: storage as StroageModel,
      keys: keys as KeysModel[],
      ws_heartbeat: undefined,
      key_server: undefined,
      key_types: ['memo', 'posting', 'active'], // Types sorted by permission level - do not change it
      has_protocol: 1, // supported HAS protocol version
      ping_rate: 60 * 1000, // 1 minute
      ping_timeout: 5 * 60 * 1000, // 5 minutes
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
      const keysValue = data.value.keys as KeysModel[];
      const account = keysValue.find((o) => o.name == name);
      if (account == null) {
        throw new Error(`Account not found ${account}`);
      }
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
      for (const key_type of data.value.key_types) {
        const key_private = getPrivateKey(name, key_type);
        if (key_private) return { key_type, key_private };
      }
      return undefined;
    }

    function getPOK(name: string, value = Date.now()) {
      const result = getLowestPrivateKey(name);
      const key_private = result?.key_private;
      if (key_private == null) {
        throw new Error('invalid key');
      }
      return memo.encode(key_private, data.value.key_server, '#' + value);
    }

    function hideEncryptedData(str: string) {
      if (data.value.storage.hideEncryptedData) {
        while (str.includes('"data":"')) {
          str = str.replace(/"data":"(.*?)"/, '"data":<...>');
        }
        while (str.includes('"pok":"')) {
          str = str.replace(/"pok":"(.*?)"/, '"pok":<...>');
        }
      }
      return str;
    }

    function HASSend(message: string) {
      log(`[SEND] ${message}`);
      wsClient?.send(message);
    }

    function checkUsername(name: string) {
      const err = `Invalid account name "${name}"`;
      console.log(name, `${err} (undefined)`);
      console.log(name[0], `${err} (empty)`);
      console.log(name == name.trim(), `${err} (spaces)`);
      console.log(name == name.toLowerCase(), `${err} (case)`);
    }

    function validatePayload(payload: any) {
      // Check if the account is managed by the PKSA
      const account = data.value.storage.accounts.find(
        (o) => o.name == payload.account
      );
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
                console.log(
                  data.nonce > (auth.nonce || 0) + ' - invalid (nonce)'
                );
                // update auth in local storage with current nonce
                auth.nonce = data.nonce;
                console.log('Write to nonce to storage');
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

    // async function processMessage(message: string) {
    //   try {
    //     const payload =
    //       typeof message == 'string' ? JSON.parse(message) : message;
    //     console.log(
    //       payload.cmd &&
    //         typeof payload.cmd == 'string' + 'invalid payload (cmd)'
    //     );
    //     if (payload.uuid) {
    //       // validate APP request forwarded by HAS
    //       console.log(
    //         payload.uuid &&
    //           typeof payload.uuid == 'string' + 'invalid payload (uuid)'
    //       );
    //       console.log(
    //         payload.expire &&
    //           typeof payload.expire == 'number' + 'invalid payload (expire)'
    //       );
    //       console.log(
    //         payload.account &&
    //           typeof payload.account == 'string' + 'invalid payload (account)'
    //       );
    //       console.log(
    //         (Date.now() < (payload.expire as number)) +
    //           `request expired - now:${Date.now()} > expire:${payload.expire}}`
    //       );
    //     }
    //     switch (payload.cmd) {
    //       // Process HAS <-> PKSA protocol
    //       case 'connected':
    //         // connection confirmation from the HAS
    //         data.value.has_protocol = payload.protocol || 0;
    //         return;
    //       case 'error':
    //         // error from the HAS
    //         return;
    //       case 'register_ack':
    //         // registration confirmation from the HAS
    //         return;
    //       case 'key_ack':
    //         // server public key received
    //         data.value.key_server = payload.key;
    //         if (data.value.key_server) {
    //           try {
    //             // const storage = JSON.parse(fs.readFileSync(STORAGE_FILE));
    //             const request = {
    //               cmd: 'register_req',
    //               app: data.value.storage.pksa_name,
    //               accounts: [],
    //             };
    //             const accounts = data.value.storage.accounts;
    //             for (const account of accounts) {
    //               checkUsername(account.name);
    //               // Add account and Proof of Key
    //               request.accounts.push({
    //                 name: account.name,
    //                 pok: getPOK(account.name),
    //               });
    //             }
    //             // Register accounts on HAS server
    //             HASSend(JSON.stringify(request));
    //           } catch (e) {
    //             logerror(e.message);
    //           }
    //         }
    //         break;

    //       // Process App requests relayed by HAS
    //       case 'auth_req':
    //         // Authentications request
    //         // Payload structure:
    //         // {
    //         //   cmd: "auth_req"
    //         //   account: string
    //         //   data: {
    //         //       app: {
    //         //           name: string
    //         //           description: string = undefined
    //         //           icon: string = undefined
    //         //       }
    //         //       challenge: { = undefined
    //         //           key_type: string
    //         //           challenge: string
    //         //       }
    //         //   }
    //         // }
    //         //
    //         // NOTE:    PKSA may not process "auth_req" from the HAS except when it runs in "service" mode
    //         //          It the PKSA wants to display info from the app data, it must wait for "auth_req" before displaying information to the user and sending "auth_ack" or "auth_nack" back to the HAS
    //         //          Processing "auth_req" allows a "service" APP to retieve an auth expiration and optionally communication encryption key (auth_key)
    //         //          If the app send the auth_key online with the auth_req payload, it must be encrypted with an encryption secret pre-shared between the app and the PKSA.
    //         //          This prevents any HAS node from being able to decrypt communication between an App and the PKSA!

    //         console.log(
    //           payload.account &&
    //             typeof payload.account == 'string' + 'invalid payload (account)'
    //         );
    //         console.log(
    //           payload.data &&
    //             typeof payload.data == 'string' + 'invalid payload (data)'
    //         );
    //         // Reload data from storage
    //         // const storage = JSON.parse(fs.readFileSync(STORAGE_FILE));
    //         // Check if the account is managed by the PKSA
    //         const account = data.value.storage.accounts.find(
    //           (o) => o.name == payload.account
    //         );
    //         // Process payload only if the PKSA manage the account else ignore message
    //         if (account) {
    //           let auth_key = undefined;
    //           // If the PKSA run in "service mode " or for debug purpose, the APP can pass the encryption key (auth_key) to the PKSA with the auth_req payload
    //           if (payload.auth_key && storage.auth_req_secret) {
    //             // Decrypt the provided auth_key using the pre-shared PKSA secret
    //             auth_key = CryptoJS.AES.decrypt(
    //               payload.auth_key,
    //               storage.auth_req_secret
    //             ).toString(CryptoJS.enc.Utf8);
    //           }
    //           // if the auth_key was not provided by the app, check if we store any non-expired auth_key that can decrypt the auth_req_data
    //           if (!auth_key) {
    //             for (const auth of account.auths.filter(
    //               (o) => o.expire > Date.now()
    //             )) {
    //               try {
    //                 const res = CryptoJS.AES.decrypt(
    //                   payload.data,
    //                   auth.key
    //                 ).toString(CryptoJS.enc.Utf8);
    //                 if (res != '') {
    //                   // decryption succedded - use this auth_key
    //                   auth_key = auth.key;
    //                   break;
    //                 }
    //               } catch (e) {
    //                 // decryption failed - nothing to do
    //               }
    //             }
    //           }
    //           if (auth_key) {
    //             try {
    //               // NOTE: A PKSA with a UI should ask for user approval here
    //               //       If the PKSA runs in "service" mode,
    //               //       - set approve to true if you want the PKSA to automatically approve new authentications with a new auth_key
    //               //       - set approve to false when your APP has already authenticated and registered an auth_key
    //               //       Alternatively, you can define the auth_req_approve value in your storage file.
    //               let approve = storage.auth_req_approve || false;
    //               // Prepare reply
    //               const auth_ack_data = {};
    //               // NOTE: The default expiration time for an auth_key is 24 hours - It can be set to a longer duration for "service" APPS
    //               const timeout =
    //                 (storage.auth_timeout_days || 1) * 24 * 60 * 60 * 1000;
    //               // Decrypt data received with encryption key received offline from the app
    //               const auth_req_data = JSON.parse(
    //                 CryptoJS.AES.decrypt(payload.data, auth_key).toString(
    //                   CryptoJS.enc.Utf8
    //                 )
    //               );
    //               // Check if the matching auth it's still valid
    //               const validAuth = account.auths.find(
    //                 (o) => o.key == auth_key && o.expire > Date.now()
    //               );
    //               if (validAuth) {
    //                 // auth is valid, reuse it and approve auth_req
    //                 approve = true;
    //                 auth_ack_data.expire = validAuth.expire;
    //               } else {
    //                 // create a new auth
    //                 auth_ack_data.expire = Date.now() + timeout;
    //               }
    //               // Check if the app also requires the PKSA to sign a challenge
    //               if (auth_req_data.challenge) {
    //                 const challenge_data = auth_req_data.challenge;
    //                 console.log(
    //                   challenge_data.key_type &&
    //                     typeof challenge_data.key_type == 'string' &&
    //                     data.value.key_types.includes(challenge_data.key_type) +
    //                       'invalid payload (challenge_data.key_type)'
    //                 );
    //                 console.log(
    //                   challenge_data.challenge &&
    //                     typeof challenge_data.challenge ==
    //                       'string' +
    //                         'invalid payload (challenge_data.challenge)'
    //                 );
    //                 // Check if the PKSA stores the requested private key
    //                 const key_private = getPrivateKey(
    //                   payload.account,
    //                   challenge_data.key_type
    //                 );
    //                 if (key_private) {
    //                   const sigHex = ecc.Signature.signBuffer(
    //                     challenge_data.challenge,
    //                     key_private
    //                   ).toHex();
    //                   const pubKey = ecc.PrivateKey.fromWif(key_private)
    //                     .toPublic()
    //                     .toString();
    //                   auth_ack_data.challenge = {
    //                     pubkey: pubKey,
    //                     challenge: sigHex,
    //                   };
    //                 } else {
    //                   // Else case must be managed with caution to avoid malicious actor sniffing keys availability
    //                   approve = false;
    //                 }
    //               }
    //               if (approve) {
    //                 // Encrypt the returned data
    //                 const data = CryptoJS.AES.encrypt(
    //                   JSON.stringify(auth_ack_data),
    //                   auth_key
    //                 ).toString();
    //                 HASSend(
    //                   JSON.stringify({
    //                     cmd: 'auth_ack',
    //                     uuid: payload.uuid,
    //                     data: data,
    //                     pok: getPOK(payload.account, payload.uuid),
    //                   })
    //                 );
    //                 if (!validAuth) {
    //                   // Add new auth into storage
    //                   account.auths.push({
    //                     expire: auth_ack_data.expire,
    //                     key: auth_key,
    //                     app: auth_req_data.app.name,
    //                     ts_create: datetoISO(new Date()),
    //                     ts_expire: datetoISO(new Date(auth_ack_data.expire)),
    //                     nonce: undefined,
    //                     ts_lastused: undefined,
    //                   });
    //                 } else {
    //                   validAuth.ts_lastused = datetoISO(new Date());
    //                 }
    //               } else {
    //                 if (storage.auth_req_reject) {
    //                   // PKSA does not allow another PKSA to approve auth_req
    //                   const data = CryptoJS.AES.encrypt(
    //                     payload.uuid,
    //                     auth_key
    //                   ).toString();
    //                   HASSend(
    //                     JSON.stringify({
    //                       cmd: 'auth_nack',
    //                       uuid: payload.uuid,
    //                       data: data,
    //                       pok: getPOK(payload.account, payload.uuid),
    //                     })
    //                   );
    //                 }
    //               }
    //               // clean storage from expired auths
    //               account.auths = account.auths.filter(
    //                 (o) => o.expire > Date.now()
    //               );
    //               // Update local storage
    //               // TO-DO: update local storage here.
    //               // fs.writeFileSync(
    //               //   STORAGE_FILE,
    //               //   JSON.stringify(storage, null, '\t')
    //               // );
    //             } catch (e) {
    //               logerror(e.message);
    //               HASSend(
    //                 JSON.stringify({
    //                   cmd: 'auth_err',
    //                   uuid: payload.uuid,
    //                   error: 'Failed to process authentication request',
    //                   pok: getPOK(payload.account, payload.uuid),
    //                 })
    //               );
    //             }
    //           }
    //         }
    //         break;
    //       case 'sign_req': {
    //         // Transaction request
    //         // Payload structure:
    //         // {
    //         //   cmd: "auth_req"
    //         //   account: string
    //         //   data: {
    //         //    key_type: string
    //         //    ops: string
    //         //    broadcast: boolean
    //         //    nonce: number
    //         //   }
    //         // }
    //         console.log(
    //           payload.account &&
    //             typeof payload.account == 'string' + 'Invalid payload (account)'
    //         );
    //         console.log(
    //           payload.data && typeof payload.data == 'string',
    //           'invalid payload (data)'
    //         );
    //         const { auth, data: sign_req_data } = validatePayload(payload);
    //         if (auth) {
    //           // Decryption was successful, we can process the request
    //           try {
    //             // validate decrypted sign_data
    //             console.log(
    //               sign_req_data.key_type &&
    //                 typeof sign_req_data.key_type == 'string' &&
    //                 data.value.key_types.includes(sign_req_data.key_type),
    //               'invalid data (key_type)'
    //             );
    //             console.log(
    //               sign_req_data.ops &&
    //                 sign_req_data.ops.length > 0 + 'invalid data (ops)'
    //             );
    //             console.log(
    //               sign_req_data.broadcast !=
    //                 undefined + 'invalid data (broadcast)'
    //             );

    //             const key_private = getPrivateKey(
    //               payload.account,
    //               sign_req_data.key_type
    //             );
    //             let approve = false;
    //             // WARNING: A PKSA running in service mode should NOT allow operations requiring the active key
    //             //          Bypass the following test at your own risk.
    //             if (sign_req_data.key_type != 'active') {
    //               // Check if the PKSA stores the requested private key
    //               if (key_private) {
    //                 // NOTE: A PKSA with a UI should ask for user approval here
    //                 approve = true;
    //               }
    //             }
    //             if (approve) {
    //               if (sign_req_data.broadcast) {
    //                 const res =
    //                   await dhiveClient.client.broadcast.sendOperations(
    //                     sign_req_data.ops,
    //                     PrivateKey.from(key_private)
    //                   );
    //                 HASSend(
    //                   JSON.stringify({
    //                     cmd: 'sign_ack',
    //                     uuid: payload.uuid,
    //                     data: res.id,
    //                     broadcast: payload.broadcast,
    //                     pok: getPOK(payload.account, payload.uuid),
    //                   })
    //                 );
    //               } else {
    //                 throw new Error('Transaction signing only is not enabled');
    //                 // To enable transaction signing, comment the above line and uncomment the following code.
    //                 //
    //                 // const tx = new Transaction
    //                 // tx.ops = ops
    //                 // const signed_tx = await hiveClient.broadcast.sign(tx, PrivateKey.from(key_private))
    //                 // HASSend(JSON.stringify({cmd:"sign_ack", uuid:uuid, broadcast:payload.broadcast, data:signed_tx, pok:getPOK(payload.account, payload.uuid)}))
    //               }
    //             } else {
    //               if (storage.sign_req_reject) {
    //                 // PKSA does not allow another PKSA to approve sign_req
    //                 const data = CryptoJS.AES.encrypt(
    //                   payload.uuid,
    //                   auth.key
    //                 ).toString();
    //                 HASSend(
    //                   JSON.stringify({
    //                     cmd: 'sign_nack',
    //                     uuid: payload.uuid,
    //                     data: data,
    //                     pok: getPOK(payload.account, payload.uuid),
    //                   })
    //                 );
    //               }
    //             }
    //           } catch (e) {
    //             // Encrypt error message before sending it to the APP via the HAS
    //             const ee = CryptoJS.AES.encrypt(e.message, auth.key).toString();
    //             HASSend(
    //               JSON.stringify({
    //                 cmd: 'sign_err',
    //                 uuid: payload.uuid,
    //                 error: ee,
    //                 pok: getPOK(payload.account, payload.uuid),
    //               })
    //             );
    //           }
    //         }
    //         break;
    //       }
    //       case 'challenge_req': {
    //         // Challenge request
    //         // Payload structure:
    //         // {
    //         //   cmd: "challenge_req"
    //         //   account: string
    //         //   data: {
    //         //       key_type: string
    //         //       challenge: string
    //         //       decrypt: boolean
    //         //       nonce: number
    //         //   }
    //         // }
    //         assert(
    //           payload.account && typeof payload.account == 'string',
    //           'Invalid payload (account)'
    //         );
    //         assert(
    //           payload.data && typeof payload.data == 'string',
    //           'invalid payload (data)'
    //         );

    //         const storage = JSON.parse(fs.readFileSync(STORAGE_FILE));
    //         const { auth, data: challenge_req_data } = validatePayload(
    //           storage,
    //           payload
    //         );
    //         if (auth) {
    //           // Decryption was successful, we can process the request
    //           try {
    //             assert(
    //               challenge_req_data.key_type &&
    //                 KEY_TYPES.includes(challenge_req_data.key_type),
    //               'invalid data (key_type)'
    //             );
    //             assert(
    //               challenge_req_data.challenge &&
    //                 typeof challenge_req_data.challenge == 'string' &&
    //                 challenge_req_data.challenge.length > 0,
    //               'invalid data (challenge)'
    //             );

    //             let approve = false;
    //             // Check if the PKSA stores the requested private key
    //             const key_private = getPrivateKey(
    //               payload.account,
    //               challenge_req_data.key_type
    //             );
    //             if (key_private) {
    //               // NOTE: A PKSA with a UI should ask for user approval here
    //               approve = true;
    //             }
    //             if (approve) {
    //               let challenge_res;
    //               if (challenge_req_data.decrypt) {
    //                 // Decrypt challenge
    //                 challenge_res = await memo.decode(
    //                   key_private,
    //                   challenge_req_data.challenge
    //                 );
    //               } else {
    //                 // Encrypt challenge
    //                 challenge_res = ecc.Signature.signBuffer(
    //                   challenge_req_data.challenge,
    //                   key_private
    //                 ).toHex();
    //               }
    //               const pubKey = ecc.PrivateKey.fromWif(key_private)
    //                 .toPublic()
    //                 .toString();
    //               const challenge_ack_data = {
    //                 pubkey: pubKey,
    //                 challenge: challenge_res,
    //               };
    //               // Encrypt the returned data
    //               const data = CryptoJS.AES.encrypt(
    //                 JSON.stringify(challenge_ack_data),
    //                 auth.key
    //               ).toString();
    //               HASSend(
    //                 JSON.stringify({
    //                   cmd: 'challenge_ack',
    //                   uuid: payload.uuid,
    //                   data: data,
    //                   pok: getPOK(payload.account, payload.uuid),
    //                 })
    //               );
    //             } else {
    //               if (storage.challenge_req_reject) {
    //                 const data = CryptoJS.AES.encrypt(
    //                   payload.uuid,
    //                   auth.key
    //                 ).toString();
    //                 HASSend(
    //                   JSON.stringify({
    //                     cmd: 'challenge_nack',
    //                     uuid: payload.uuid,
    //                     data: data,
    //                     pok: getPOK(payload.account, payload.uuid),
    //                   })
    //                 );
    //               }
    //             }
    //           } catch (e) {
    //             // Encrypt error message before sending it to the APP via the HAS
    //             const ee = CryptoJS.AES.encrypt(e.message, auth.key).toString();
    //             HASSend(
    //               JSON.stringify({
    //                 cmd: 'challenge_err',
    //                 uuid: payload.uuid,
    //                 error: ee,
    //                 pok: getPOK(payload.account, payload.uuid),
    //               })
    //             );
    //           }
    //         }
    //         break;
    //       }
    //       default:
    //         throw new Error('Invalid payload (unknown cmd)');
    //     }
    //   } catch (e) {
    //     HASSend(JSON.stringify({ cmd: 'error', error: e.message }));
    //   }
    // }

    function heartbeat() {
      if (
        data.value.ws_heartbeat &&
        data.value.ws_heartbeat + data.value.ping_timeout < Date.now()
      ) {
        // HAS server no more responding - try to reconnect
        log('HAS Connection lost');
        wsClient = undefined;
        // startWebsocket();
      } else {
        if (wsClient && wsClient.readyState == 1) {
          // Ping HAS server
          wsClient?.ping();
        }
      }
    }

    async function startWebsocket() {
      log(`PKSA started - protocol: ${data.value.has_protocol} `);
      //const wsClient = new WebSocket("ws://localhost:3000/")
      wsClient = new WebSocket(data.value.storage.has_server);

      //when a websocket connection with the HAS is established
      wsClient.onopen = async function (e) {
        log('HAS connection established');
        // Wait for HAS protocol info
        while (data.value.has_protocol == undefined) {
          await sleep(250);
        }
        HASSend(JSON.stringify({ cmd: 'key_req' }));
      };

      wsClient.onmessage = async function (event) {
        log(`[RECV] ${event.data}`);
        try {
          // processMessage(event.data);
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

      wsClient.on('pong', () => {
        // HAS server is alive
        data.value.ws_heartbeat = Date.now();
      });
    }

    return {
      data,
      datetoISO,
      log,
      logerror,
      sleep,
      getPrivateKey,
      getLowestPrivateKey,
      getPOK,
      hideEncryptedData,
      HASSend,
      checkUsername,
      validatePayload,
      // processMessage,
      heartbeat,
      startWebsocket,
    };
  },

  mounted() {
    this.startWebsocket();
  },
});
</script>

<style scoped></style>
