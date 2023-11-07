<template>
  <q-layout view="lHh Lpr lFf">
    <q-header v-if="storeApp.isUnlocked && $router.currentRoute.value.name!='main'">
      <q-toolbar>
        <q-btn
          flat
          round
          dense
          icon="arrow_back_ios"
          @click="$router.back()"
        />
        <q-toolbar-title>
          <q-item>
            <q-item-section top avatar>
              <q-avatar size="40px" class="q-mb-sm">
                <q-img src="~assets/logo.svg" />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label>HiveAuth</q-item-label>
              <q-item-label caption style="color: white">{{storeApp.headerSubtitle}}</q-item-label>
            </q-item-section>
          </q-item>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-if="storeApp.isUnlocked"
      v-model="storeApp.menuOpen"
      dark
      show-if-above
      bordered
    >
      <HeaderMenu/>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer v-if="storeApp.isUnlocked">
      <q-toolbar>
        <q-btn
          flat
          round
          dense
          icon="public"
          :color="storeApp.isHASConnected ? 'green' : 'red'"
        />
        <div>{{ HASServer?.replaceAll('wss://', '') }} ({{Number(HASProtocol).toFixed(1)}})</div>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { defineComponent, ref , onMounted} from 'vue';
import { useQuasar } from 'quasar'
import { useAppStore } from 'src/stores/storeApp';
import { useAccountsStore, IAccount, IAccountAuth } from 'src/stores/storeAccounts';
import { useRouter } from 'vue-router';

import { Operation } from '@hiveio/dhive/lib/chain/operation';
import { IRegisterReq, IRegisterReqAccount, IRegisterAck,
         IAuthReq, IAuthReqData, IAuthAckData, IAuthReqPayload, IAuthNack,
         ISignReq, ISignReqData, ISignAck, ISignNack,
         IChallengeReq, IChallengeReqData, IChallengeAck, IChallengeNack } from '../interfaces/has.interfaces'

import CryptoJS from 'crypto-js';
import assert from 'assert';
import HASCustomPlugin from '../plugins/HASCustomPlugin';
import dhiveClient from 'src/helper/dhive-client';

import DialogAuthReq from 'components/DialogAuthReq.vue';
import DialogSignReq from 'components/DialogSignReq.vue';
import DialogChallengeReq from 'components/DialogChallengeReq.vue';

import { useI18n } from 'vue-i18n'

const { t } = useI18n(), $t = t

interface PrivateKey {
  key_type: string;
  key_private: string;
}

const PKSA_NAME = 'HiveAuth Mobile'
const KEYS_MPA = ['memo','posting','active'] // Types sorted by permission level - do not change it
const KEYS_PA = ['posting','active'] // Types sorted by permission level - do not change it
const DEFAULT_HAS_SERVER = 'wss://hive-auth.arcange.eu';

const HAS_PROTOCOL = [0.8, 1.0]        // supported HAS protocol versions
const PING_RATE = 60 * 1000 			  // 1 minute
const PING_TIMEOUT = 5 * PING_RATE  // 5 minutes

const $q = useQuasar();
const storeApp = useAppStore()
const storeAccounts = useAccountsStore();
const router = useRouter();

const operations = [
  { type:'account_create', key:'active'},
  { type:'account_create_with_delegation', key:'active'},
  { type:'account_update', key:'active'},
  { type:'account_update2', key:'active'},
  { type:'account_witness_proxy', key:'active'},
  { type:'account_witness_vote', key:'active'},
  { type:'cancel_transfer_from_savings', key:'active'},
  { type:'challenge_authority', key:'active'},
  { type:'change_recovery_account', key:'owner'},
  { type:'claim_account', key:'active'},
  { type:'claim_reward_balance', key:'posting'},
  { type:'claim_reward_balance2', key:'posting'},
  { type:'collateralized_convert', key:'active'},
  { type:'comment', key:'posting'},
  { type:'comment_options', key:'posting'},
  { type:'convert', key:'active'},
  { type:'create_claimed_account', key:'active'},
  { type:'create_proposal', key:'posting'},
  { type:'custom', key:'active'},
  { type:'custom_binary', key:'posting'},
  { type:'custom_json', key:'posting'},
  { type:'decline_voting_rights', key:'owner'},
  { type:'delegate_vesting_shares', key:'active'},
  { type:'delete_comment', key:'posting'},
  { type:'escrow_approve', key:'active'},
  { type:'escrow_dispute', key:'active'},
  { type:'escrow_release', key:'active'},
  { type:'escrow_transfer', key:'active'},
  { type:'feed_publish', key:'active'},
  { type:'limit_order_cancel', key:'active'},
  { type:'limit_order_create', key:'active'},
  { type:'limit_order_create2', key:'active'},
  { type:'pow', key:'active'},
  { type:'pow2', key:'active'},
  { type:'price', key:'active'},
  { type:'prove_authority', key:'active'},
  { type:'recover_account', key:'owner'},
  { type:'recurrent_transfer', key:'active'},
  { type:'remove_proposal', key:'posting'},
  { type:'report_over_production', key:'active'},
  { type:'request_account_recovery', key:'active'},
  { type:'reset_account', key:'active'},
  { type:'set_reset_account', key:'owner'},
  { type:'set_withdraw_vesting_route', key:'active'},
  { type:'smt_contribute', key:'active'},
  { type:'smt_create', key:'active'},
  { type:'smt_set_runtime_parameters', key:'active'},
  { type:'smt_set_setup_parameters', key:'active'},
  { type:'smt_setup', key:'active'},
  { type:'smt_setup_emissions', key:'active'},
  { type:'transfer', key:'active'},
  { type:'transfer_from_savings', key:'active'},
  { type:'transfer_to_savings', key:'active'},
  { type:'transfer_to_vesting', key:'active'},
  { type:'update_proposal', key:'posting'},
  { type:'update_proposal_votes', key:'posting'},
  { type:'vote', key:'posting'},
  { type:'vote2', key:'posting'},
  { type:'withdraw_vesting', key:'active'},
  { type:'witness_set_properties', key:'active'},
  { type:'witness_update', key:'active'},
]

let key_server: string | null = null
let wsClient: WebSocket | null = null
let tsHeartbeat = 0

// data
const HASServer = ref(DEFAULT_HAS_SERVER)
const HASProtocol = ref(0)

// functions
function datetoISO(date: Date) {
  return date.toISOString().replace(/T|Z/g, ' ')
}

function hideEncryptedData(str: string) {
  if (/*config.hideEncryptedData*/ true) {
    str = str.replaceAll(/"data":"(.*?)"/g, '"data":<...>');
    str = str.replaceAll(/"pok":"(.*?)"/g, '"pok":<...>');
  }
  return str;
}

function HASSend(message: string) {
  assert(wsClient, 'Websocket not initialized')

  console.log(`[SEND] ${hideEncryptedData(message)}`);
  storeApp.logs.push({
    id: new Date().toISOString(),
    log: `SENT: ${hideEncryptedData(message)}`,
  });
  wsClient.send(message);
}

function checkUsername(name: string) {
  const err = `Invalid account name "${name}"`;
  assert(name, `${err} (undefined)`);
  assert(name[0], `${err} (empty)`);
  assert(name == name.trim(), `${err} (spaces)`);
  assert(name == name.toLowerCase(), `${err} (case)`);
}

/**
 * Get an account private key from the store
 *
 * @param name Hive username
 * @param type name of private key requested
 * @returns the account's private key
 * @throws {Error} if no account key is stored or if type is invalid
 */
function getPrivateKey(name: string, type: string) {
  const account = storeAccounts.accounts.find(o => o.name === name)
  assert(account, `Unknown account ${name}`)

  switch (type) {
    case 'posting':
      return account.keys.posting;
    case 'active':
      return account.keys.active;
    case 'memo':
      return account.keys.memo;
    default:
      throw new Error(`Invalid key type ${type}`);
  }
}

function getLowestPrivateKey(name: string) {
  for (const key_type of KEYS_MPA) {
    const key_private = getPrivateKey(name, key_type);
    if (key_private) return { key_type, key_private } as PrivateKey;
  }
  return undefined;
}

async function getPOK(name: string, value: string) {
  if (value.length === 0) {
    value = Date.now().toString();
  }
  const result = getLowestPrivateKey(name);
  const key_private = result?.key_private;
  assert(key_private, `No private key available for ${name}`);
  const response = await HASCustomPlugin.callPlugin({
    callId: Date.now().toString(),
    method: 'getProofOfKey',
    privateKey: key_private,
    publicKey: key_server ?? '',
    memo: `#${value}`,
    accountName: '',
    userKey: '',
    challenge: '',
    key: '',
  });
  return JSON.parse(response.dataString).data;
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
  return JSON.parse(response.dataString).data;
}

async function getDecryptedChallenge(challenge: string, key: string) {
  const response = await HASCustomPlugin.callPlugin({
    callId: Date.now().toString(),
    method: 'decrypt',
    privateKey: key,
    publicKey: '',
    memo: '',
    accountName: '',
    userKey: '',
    challenge: challenge,
    key: key,
  });
  return JSON.parse(response.dataString).data;
}

async function checkKeys(account: IAccount) {
  const publicKeys = await dhiveClient.getPublicKeys(account.name);
  if (account.keys.active) {
    assert(dhiveClient.publicKeyFrom(dhiveClient.privateKeyFromString(account.keys.active))==publicKeys.active,'active')
  }
  if (account.keys.posting) {
    assert(dhiveClient.publicKeyFrom(dhiveClient.privateKeyFromString(account.keys.posting))==publicKeys.posting,'posting')
  }
  if (account.keys.memo) {
    assert(dhiveClient.publicKeyFrom(dhiveClient.privateKeyFromString(account.keys.memo))==publicKeys.memo,'memo')
  }
}

async function getPublicKey(key: string) {
  const response = await HASCustomPlugin.callPlugin({
    callId: Date.now().toString(),
    method: 'getPublicKey',
    privateKey: key,
    publicKey: '',
    memo: '',
    accountName: '',
    userKey: '',
    challenge: '',
    key: key,
  });
  return JSON.parse(response.dataString).data;
}

function handleRegisterAck(register_ack: IRegisterAck) {
  $q.notify({
    color: 'positive',
    message: `${register_ack.account} ${$t('main_layout.registered')}`,
    timeout: 1000,
    icon: 'check',
  });
}

async function handleKeyAck() {
  // server public key received
  if (key_server && storeApp.isUnlocked) {
    storeApp.isHASConnected = true;
    try {
      if (storeAccounts.accounts.length > 0) {
        const request = {
          cmd: 'register_req',
          app: PKSA_NAME,
          accounts: [] as IRegisterReqAccount[],
        } as IRegisterReq;

        for await (const account of storeAccounts.accounts) {
          checkUsername(account.name);
          try {
            // Verify if stored keys are still valid
            await checkKeys(account)
            const pokValue = await getPOK(account.name, '');
            // Add account and Proof of Key
            request.accounts.push({name: account.name, pok: pokValue});
          } catch(e) {
            $q.notify({
              color: 'negative',
              position: 'bottom',
              message: `Invalid ${(e as Error).message} key for account ${account.name}`,
              icon: 'report_problem',
            })
          }
        }
        HASSend(JSON.stringify(request));
      }
    } catch (e) {
      console.error((e as Error).message);
    }
  }
}

function tryDecrypt(data: string, key: string): string | null {
  if(data && key) {
    try {
      const res = CryptoJS.AES.decrypt(data, key).toString(CryptoJS.enc.Utf8);
      if (res !== '') {
        // decryption succedded
        return res
      }
    } catch(e) {
      // expected decryption failure - nothing to do
    }
  }
  return null
}

async function approveAuthRequest(payload: IAuthReq, account: IAccount, auth_key: string, timeout?: number | undefined) {
  assert(typeof payload.account == 'string', 'invalid payload (account)');
  assert(typeof payload.data == 'string', 'invalid payload (data)');
  assert(typeof payload.data == 'string', 'invalid payload (uuid)');
  assert(typeof payload.expire == 'number', 'invalid payload (expire)');

  // Prepare reply
  let auth_ack_data: IAuthAckData
  // Decrypt data received with encryption key received offline from the app
  const auth_req_data = JSON.parse(CryptoJS.AES.decrypt(payload.data, auth_key).toString(CryptoJS.enc.Utf8))
  // clean storage from expired auths
  account.auths = account.auths.filter(o => o.expire > Date.now())
  // Check if the matching auth it's still valid
  const validAuth = account.auths.find(o => o.key==auth_key && o.expire > Date.now())
  if(validAuth) {
    // auth is valid, reuse it and approve auth_req
    auth_ack_data = { expire: validAuth.expire }
  } else {
    // If not provided, the default expiration time for an auth_key is 24 hours
    auth_ack_data = { expire: Date.now() + (timeout ? timeout : (24 * 60 * 60 * 1000)) }
  }
  // Check if the app also requires the PKSA to sign a challenge
  if(auth_req_data.challenge) {
    const challenge_data = auth_req_data.challenge
    assert(challenge_data.key_type && typeof(challenge_data.key_type)=='string' && KEYS_MPA.includes(challenge_data.key_type), 'invalid payload (challenge_data.key_type)')
    assert(challenge_data.challenge && typeof(challenge_data.challenge)=='string', 'invalid payload (challenge_data.challenge)')
    // Check if the PKSA stores the requested private key
    const key_private = getPrivateKey(payload.account,challenge_data.key_type)
    if(key_private)  {
      // const pubKey = ecc.PrivateKey.fromWif(key_private).toPublic().toString()
      // const sigHex = ecc.Signature.signBuffer(challenge_data.challenge,key_private).toHex()

      const res = await getSignedChallenge(challenge_data.challenge,key_private);
      const challengeDataParts = res.split('___');
      const pubKey = challengeDataParts[0]
      const sigHex = challengeDataParts[1]
      auth_ack_data.challenge = { pubkey:pubKey, challenge:sigHex }
    }
  }
  // Encrypt auth_ack_data before sending it to the HAS server
  const data = CryptoJS.AES.encrypt(JSON.stringify(auth_ack_data), auth_key).toString()
  HASSend(JSON.stringify({cmd:'auth_ack', uuid:payload.uuid, data:data, pok: await getPOK(payload.account, payload.uuid) }))
  if(!validAuth) {
    // Add new auth into storage
    account.auths.push({
      expire:auth_ack_data.expire,
      key:auth_key,
      app:auth_req_data.app,
      whitelists: [],
      ts_create: datetoISO(new Date()),
      ts_lastused: datetoISO(new Date()),
      ts_expire: datetoISO(new Date(auth_ack_data.expire))
    })
  } else {
    validAuth.ts_lastused = datetoISO(new Date())
  }
  // Update storage
  storeAccounts.updateAccount(account)
}

function processAuthReqPayload(auth_req_payload: IAuthReqPayload) {
  assert(typeof auth_req_payload?.account == 'string', 'invalid auth_req_payload (account)')
  assert(typeof auth_req_payload?.uuid == 'string', 'invalid auth_req_payload (uuid)')
  assert(typeof auth_req_payload?.key == 'string', 'invalid auth_req_payload (key)')
  assert(typeof auth_req_payload?.host == 'string', 'invalid auth_req_payload (host)')

  const account = storeAccounts.accounts.find(o => o.name === auth_req_payload.account);
  if(!account) {
    console.log(`account not managed (${auth_req_payload.account})`)
    return // account is no more managed by PKSA
  }

  // search for matching request in pendings
  const pending = storeApp.pendings.pop(auth_req_payload.uuid)
  if(pending) {
    const auth_req = (pending as unknown as IAuthReq)
    // Try to descript the pending request with the payload auth_key
    const decrypted = tryDecrypt(auth_req.data, auth_req_payload.key)
    if (decrypted) {
      // Successfuly decripted
      const auth_key = auth_req_payload.key;
      // ask user to approve or reject authentication request
      const auth_req_data = JSON.parse(decrypted) as IAuthReqData
      assert(typeof auth_req_data?.app?.name == 'string', 'invalid payload (auth_req_data.app.name)');

      $q.dialog({
        component: DialogAuthReq,
        componentProps: {
          // dialog props
          persistent: true,
          // custom props
          username: auth_req.account,
          auth_req_data: auth_req_data,
          expire: auth_req.expire,
        },
      }).onOk((timeout) => {
        approveAuthRequest(auth_req, account, auth_key as string, timeout);
      }).onCancel(async () => {
        const auth_nack_data = CryptoJS.AES.encrypt(auth_req.uuid,auth_key).toString()
        const auth_nack = {cmd: 'auth_nack', uuid: auth_req.uuid, data: auth_nack_data, pok: await getPOK(auth_req.account, auth_req.uuid)} as IAuthNack
        HASSend(JSON.stringify(auth_nack))
      })
    }
  }
}

async function handleAuthReq(auth_req: IAuthReq) {
  try {
    // Do not process auth_req when app is locked
    if (!storeApp.isUnlocked) return;

    assert(typeof auth_req.account == 'string', 'invalid payload (account)');
    assert(typeof auth_req.data == 'string', 'invalid payload (data)');
    assert(typeof auth_req.data == 'string', 'invalid payload (uuid)');
    assert(typeof auth_req.expire == 'number', 'invalid payload (expire)');

    const account = storeAccounts.accounts.find(o => o.name === auth_req.account);
    if(!account) {
      console.debug(`account not managed (${auth_req.account})`)
      return // account is no more managed by PKSA
    }

    let auth_key: string | null = null;

    // For debug purpose, the APP can pass the encryption key (auth_key) to the PKSA with the auth_req payload
    if (auth_req?.auth_key && process.env.AUTH_REQ_SECRET) {
      // Decrypt the provided auth_key using the pre-shared PKSA secret
      auth_key = tryDecrypt(auth_req.auth_key, process.env.AUTH_REQ_SECRET)
    }

    if (!auth_key) {
      // check if the account store any non-expired auth_key that can decrypt the auth_req_data
      for (const auth of account.auths.filter((o) => o.expire > Date.now())) {
        if (tryDecrypt(auth_req.data, auth.key)) {
          // auth_key successfuly decrypted - stop searching
          auth_key = auth.key
          break;
        }
      }
    }
    if(auth_key) {
      // We have an auth_key - automaticaly approve request
      approveAuthRequest(auth_req, account, auth_key);
    } else {
      // No auth key found, add the request to pendings and wait for scan or deeplink
      storeApp.pendings.push(auth_req)
    }
  } catch (e) {
    $q.notify({
      color: 'negative',
      position: 'bottom',
      message: (e as Error).message,
      icon: 'report_problem',
    })
  }
}

/**
 * Try to decrypt a payload using the auth keys stored by the related account
 *
 * @param payload An encrypted payload
 * @return the account, auth used to decrypt the payload and the decrypted payload data, or undefined is the payload couldn't be decrypted
 * @throws {Error} if the payload or the nonce is invalid
 */
async function validatePayload(payload: any) {
  // Check if the account is managed by the PKSA
  const account = storeAccounts.accounts.find((o) => o.name === payload.account) as IAccount;
  if (account) {
    for (const auth of account.auths.filter((o) => o.expire > Date.now())) {
      try {
        const decoded = tryDecrypt(payload.data, auth.key)
        if (decoded && decoded !== '') {
          const data = JSON.parse(decoded);
          if (data !== '') {
            // Decryption succeeded, check payload against replay attack
            assert(data.nonce  > (auth.nonce || 0),'invalid (nonce)')
            // update auth in storage with current nonce
            auth.nonce = data.nonce;
            await storeAccounts.updateAccount(account);
            // Then return valid auth and decrypted payload data
            return { account, auth, data };
          }
        }
      } catch (e) {
        if (e.code == 'ERR_ASSERTION') {
          // Invalid nonce expected error, rethrow it
          throw e;
        }
        console.debug((e as Error).stack);
      }
    }
  }
  throw new Error('invalid (unknown account)');
}

function checkTransaction(sign_req_data: ISignReqData, auth: IAccountAuth) {
  let level = -1
  let askApproval = false
  let askWhitelist = false
  const opSet = new Set()

  for(const op of sign_req_data.ops) {
    const opType = op[0] as string
    const opInfo = operations.find(o => o.type == opType)
    assert(opInfo, `Unknown operation ${opType}`)
    assert(opInfo.key!='owner', 'Transaction requires owner key')

    level = Math.max(level, KEYS_PA.indexOf(opInfo.key))
    // Check if operation is already whitelisted
    if (!auth.whitelists.includes(opType)) {
      askApproval = true
      // check is op can be whitelisted and manage special case of custom_json
      if (opInfo.key == 'posting' && !(opType == 'custom_json' && (op[1] as any)?.required_auths.length > 0) ) {
        askWhitelist = true
        opSet.add(opType)
      }
    }
  }
  // TODO: improve management of ops
  if (opSet.size > 1) {
    askWhitelist = false
  }
  return { level, askApproval, askWhitelist, opSet }
}

async function approveSignRequest(payload: ISignReq, sign_req_data: ISignReqData, key_private: string) {
  if(sign_req_data.broadcast) {
    const res = await dhiveClient.client.broadcast.sendOperations(sign_req_data.ops as Operation[], dhiveClient.privateKeyFromString(key_private))
    const sign_ack = {cmd: 'sign_ack', uuid: payload.uuid, data: res.id as unknown, broadcast: sign_req_data.broadcast, pok: await getPOK(payload.account, payload.uuid)} as ISignAck
    HASSend(JSON.stringify(sign_ack))
  } else {
    throw new Error('Transaction signing only is not enabled')
    // To enable transaction signing, comment the above line and uncomment the following code.
    //
    // const tx = new Transaction
    // tx.ops = ops
    // const signed_tx = await hiveClient.broadcast.sign(tx, PrivateKey.from(key_private))
    // HASSend(JSON.stringify({cmd:"sign_ack", uuid:uuid, broadcast:payload.broadcast, data:signed_tx, pok:getPOK(payload.account, payload.uuid)}))
  }
}

async function handleSignReq(payload: ISignReq) {
  try {
    // Do not process sign_req when app is locked
    if (!storeApp.isUnlocked) return;

    assert(payload.account && typeof payload.account == 'string', 'invalid payload (account)');
    assert(payload.data && typeof payload.data == 'string', 'invalid payload (data)');

    const { account, auth, data } = await validatePayload(payload);
    const sign_req_data = data as ISignReqData

    if (!auth) return;
    // validate decrypted sign_req_data (nonce has already been validated by validatePayload)
    assert(sign_req_data.key_type && typeof sign_req_data.key_type == 'string' && KEYS_PA.includes(sign_req_data.key_type), 'invalid data (key_type)');
    assert(sign_req_data.ops && sign_req_data.ops.length > 0, 'invalid data (ops)');
    assert(sign_req_data.broadcast!=undefined, 'invalid data (broadcast)')

    const check = checkTransaction(sign_req_data, auth)

    // Check if the PKSA stores the requested private key
    //const key_private = getPrivateKey(payload.account, sign_req_data.key_type);
    const key_type = KEYS_PA[check.level]
    const key_private = getPrivateKey(payload.account, key_type);
    assert(key_private,`Private ${key_type} key is missing`)

    if (!check.askApproval) {
      await approveSignRequest(payload, sign_req_data, key_private)
    } else {
      const opType = [...check.opSet][0] as string
      $q.dialog({
        component: DialogSignReq,
        componentProps: {
          // dialog props
          persistent: true,
          // custom props
          username: payload.account,
          auth: auth,
          sign_req_data: sign_req_data,
          askWhitelist: check.askWhitelist,
          opType: opType,
          expire: payload.expire,
        },
      }).onOk(async (whitelist) => {
        await approveSignRequest(payload, sign_req_data, key_private)
        if (whitelist) {
          auth.whitelists.push(opType)
          storeAccounts.updateAccount(account)
        }
      }).onCancel(async () => {
        const sign_nack_data = CryptoJS.AES.encrypt(payload.uuid,auth.key).toString()
        const sign_nack = {cmd: 'sign_nack', uuid: payload.uuid, data: sign_nack_data, pok: await getPOK(payload.account, payload.uuid)} as ISignNack
        HASSend(JSON.stringify(sign_nack))
      })
    }
  } catch (e) {
    $q.notify({
      color: 'negative',
      position: 'bottom',
      message: (e as Error).message,
      icon: 'report_problem',
    })
  }
}

async function approveChallengeRequest(payload: IChallengeReq, challenge_req_data: IChallengeReqData, key_private: string, auth: IAccountAuth) {
  let challengeResponse = '';
  if (challenge_req_data.decrypt) {
    // Decrypt challenge
    challengeResponse = await getDecryptedChallenge(challenge_req_data.challenge, key_private);
  } else {
    // Encrypt challenge
    const res = await getSignedChallenge(challenge_req_data.challenge, key_private);
    const challengeDataParts = res.split('___');
    challengeResponse = challengeDataParts[1];
  }
  const key_public = await getPublicKey(key_private);
  const challenge_ack_data = {pubkey: key_public, challenge: challengeResponse};
  // Encrypt the challenge_ack_data
  const data = CryptoJS.AES.encrypt(JSON.stringify(challenge_ack_data),auth.key).toString();
  const challenge_ack = { cmd:'challenge_ack', uuid:payload.uuid, data:data, pok: await getPOK(payload.account, payload.uuid)} as IChallengeAck
  HASSend(JSON.stringify(challenge_ack))
}

async function handleChallengeReq(payload: IChallengeReq) {
  try{
    // Do not process challenge_req when app is locked
    if (!storeApp.isUnlocked) return;

    assert(payload.account && typeof payload.account == 'string', 'invalid payload (account)');
    assert(payload.data && typeof payload.data == 'string', 'invalid payload (data)');

    const { auth, data } = await validatePayload(payload);
    const challenge_req_data = data as IChallengeReqData

    if (!auth) return;
    // validate decrypted challenge_req_data (nonce has already been validated by validatePayload)
    assert(challenge_req_data.key_type  && typeof challenge_req_data.key_type == 'string' && KEYS_MPA.includes(challenge_req_data.key_type), 'invalid data (key_type)')
    assert(challenge_req_data.challenge && typeof(challenge_req_data.challenge)=='string' && challenge_req_data.challenge.length > 0, 'invalid data (challenge)')
    // Check if the PKSA stores the requested private key
    const key_private = getPrivateKey(payload.account, challenge_req_data.key_type);
    assert(key_private,`Private ${challenge_req_data.key_type} key is missing`)

    $q.dialog({
      component: DialogChallengeReq,
      componentProps: {
        // dialog props
        persistent: true,
        // custom props
        username: payload.account,
        auth: auth,
        challenge_req_data: challenge_req_data,
        expire: payload.expire,
      },
    }).onOk(async (whitelist) => {
      await approveChallengeRequest(payload, challenge_req_data, key_private, auth)
    }).onCancel(async () => {
      const sign_nack_data = CryptoJS.AES.encrypt(payload.uuid, auth.key).toString()
      const sign_nack = {cmd: 'challenge_nack', uuid: payload.uuid, data: sign_nack_data, pok: await getPOK(payload.account, payload.uuid)} as IChallengeNack
      HASSend(JSON.stringify(sign_nack))
    })
  } catch (e) {
    $q.notify({
      color: 'negative',
      position: 'bottom',
      message: (e as Error).message,
      icon: 'report_problem',
    })
  }
}

async function processMessage(message: string) {
  try {
    const payload = typeof message == 'string' ? JSON.parse(message) : message;
    assert(payload.cmd && typeof payload.cmd == 'string', 'invalid payload (cmd)');
    if (payload.uuid) {
      assert(payload.uuid && typeof payload.uuid == 'string', 'invalid payload (uuid)');
      assert(payload.expire && typeof payload.expire == 'number', 'invalid payload (expire)');
      assert(payload.account && typeof payload.account == 'string', 'invalid payload (account)');
      assert(Date.now() < payload.expire, `request expired - now:${Date.now()} > expire:${payload.expire}}`);
    }
    switch (payload.cmd) {
      case 'connected':
        // TODO: validate HAS "protocol" value
        assert(HAS_PROTOCOL.includes(payload.protocol || 0 ),'Unsupported HAS protocol')
        HASProtocol.value = payload.protocol
        return;
      case 'error':
        return;
      case 'register_ack':
        handleRegisterAck(payload)
        return;
      case 'key_ack':
        key_server = payload.key;
        await handleKeyAck();
        break;
      case 'auth_req':
        await handleAuthReq(payload);
        break;
      case 'sign_req':
        await handleSignReq(payload);
        break;
      case 'challenge_req':
        await handleChallengeReq(payload);
        break;
    }
  } catch (e) {
    HASSend(JSON.stringify({ cmd: 'error', error: (e as Error).message }));
  }
}

let busy = false

async function startWebsocket() {
  try {
    if (busy || wsClient!= null) return
    busy = true

    storeApp.isHASConnected = false;
    console.log('Websocket - Connecting  to ' + HASServer.value);
    wsClient = new WebSocket(HASServer.value);
    wsClient.onopen = async function (e) {
      console.log('Websocket - Connected');
      HASSend(JSON.stringify({ cmd: 'key_req' }));
    };

    wsClient.onmessage = async function (event) {
      console.log(`[RECV] ${hideEncryptedData(event.data)}`);
      storeApp.logs.push({
        id: new Date().toISOString(),
        log: `RECV: ${hideEncryptedData(event.data)}`,
      });
      processMessage(event.data);
    };

    wsClient.onclose = async function (event) {
      // connection closed, discard the old websocket
      wsClient = null;
      if (event.wasClean) {
        console.log('Websocket - Connection closed');
      } else {
        // e.g. server process killed or network down
        console.log('Websocket - Connection died');
        // Wait 1 second before trying to reconnect
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // restart a new websocket
        startWebsocket();
      }
    };

    wsClient.onerror = function (error) {
      console.error(`[error] ${JSON.stringify(error)}`);
    };

    // Not supported
    // wsClient.on('pong', () => {
    //   // HAS server is alive
    //   tsHeartbeat = Date.now();
    // });
  } finally {
    busy = false
  }
}

function heartbeat() {
  if (tsHeartbeat && tsHeartbeat + PING_TIMEOUT < Date.now()
  ) {
    // HAS server no more responding - try to reconnect
    console.log('Websocket - Connection lost');
    wsClient = null;
    startWebsocket();
  } else {
    if (wsClient && wsClient.readyState == 1) {
      // Ping HAS server
      wsClient.ping();
    }
  }
}

/**
 * Process a QRCode or DeepLink
 */
function processQRDL(value: string) {
  const URI_HAS = 'has://auth_req/'
  const URI_HIVE = 'hive://sign/'

  if (value.startsWith(URI_HAS)) {
    const base64Data = value.split(URI_HAS)[1];
    const base64DecodedString = atob(base64Data);
    const result = JSON.parse(base64DecodedString);
    const auth_req_payload =  {
      account: result.account,
      uuid: result.uuid,
      key: result.key,
      host: result.host,
    }  as IAuthReqPayload;

    // IF the PKSA is not yet connected to a HAS node, use the provided host and connect
    if (!wsClient) {
      HASServer.value = auth_req_payload?.host || DEFAULT_HAS_SERVER;
      startWebsocket();
    }
    else {
      // // Reconnect only if HAS Server is a different server
      // if (auth_req_payload?.host && auth_req_payload?.host != HASServer.value) {
      //   TODO: connect to new host
      // }
    }
    processAuthReqPayload(auth_req_payload)
  }

  if(value.startsWith(URI_HIVE)) {
    $q.notify({
      color: 'negative',
      position: 'bottom',
      message: `${$t('not_supported')}`,
      icon: 'report_problem',
    })
  }
}

async function frequentChecker() {
  if (storeApp.isUnlocked) {
    // Retrieve any deeplink or scanned qrcode value
    const qrcode = storeApp.scanValue
    const deeplink = (await HASCustomPlugin.callPlugin({
      callId: Date.now().toString(),
      method: 'getDeepLinkData',
      privateKey: '',
      publicKey: '',
      memo: '',
      accountName: '',
      userKey: '',
      challenge: '',
      key: '',
    })).dataString;
    //console.log(`qrcode: ${qrcode} deeplink: ${deeplink}`);
    if (qrcode.length > 0 || deeplink.length > 0) {
      // reset value in store
      storeApp.scanValue = '';
      processQRDL(qrcode.length > 0 ? qrcode : deeplink)
    }
    if (!wsClient) {
      startWebsocket();
    } else if (storeApp.resetWebsocket) {
      // Websocket needs to be reset to re-register accounts
      storeApp.resetWebsocket = false;
      wsClient.close();
      wsClient = null;
      startWebsocket();
    }
  } else {
    // App is locked
    if (wsClient!=null) {
      // websocket is still open -> close it
      wsClient.close();
      wsClient = null;
    }
  }
  await new Promise((resolve) => setTimeout(resolve, 1000));
  frequentChecker();
}

// hooks
onMounted(() => {
  storeApp.readPasscodeFromBiometrics();
  frequentChecker();
  // $q.dark.set(true);
})

</script>

<script lang="ts">
import HeaderMenu from 'components/HeaderMenu.vue'

export default defineComponent({
  name: 'MainLayout',
  components: { HeaderMenu  },
});

</script>

<style scoped>
.safe-area {
  padding-bottom: env(safe-area-inset-bottom);
  padding-top: env(safe-area-inset-top);
}
</style>
