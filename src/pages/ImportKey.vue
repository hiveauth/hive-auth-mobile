<template>
  <q-page>
    <div v-if="!storeApp.isScanning" class="q-ma-lg">
      <div class="text-center text-h6 q-mt-lg">
        {{ !keyType ? $t('import_key.title.account') : $t('import_key.title.key')}}
      </div>
      <q-input v-if="!keyType" class="q-mt-lg"
        outlined
        v-model="username"
        :label="$t('import_key.username.label')"
        :placeholder="$t('import_key.username.placeholder')"
        :autofocus="keyType==undefined"
      >
        <template v-slot:prepend>
          <q-icon name="alternate_email" />
        </template>
      </q-input>
      <q-input class="q-pt-lg"
        outlined
        v-model="private_key"
        type="text"
        :label= "$t('import_key.key.label', { type: storeApp.capitalize(keyType ?? '') })" 
        :placeholder="$t('import_key.key.placeholder')"
        :autofocus="keyType!=undefined"
      >
        <template v-slot:prepend>
          <q-icon name="key" />
        </template>
        <template v-slot:append>
           <q-icon name="fa fa-qrcode" @click="scanKey()" />
         </template>
      </q-input>

      <div class="row q-mt-lg">
        <q-btn
          class="col q-pt-sm q-pb-sm"
          rounded
          color="primary"
          :label="$t('import_key.btn_import')"
          :disable="private_key.length == 0 || username.length == 0"
          @click="validateKey()"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import dhive from 'src/helper/dhive-client';
import { defineComponent, ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n'
import { useAppStore } from 'src/stores/storeApp';
import { useAccountsStore } from 'src/stores/storeAccounts';
import { KeyRole, PrivateKey } from '@hiveio/dhive';

import DialogScan from 'components/DialogScan.vue';

const $q = useQuasar();
const router = useRouter();
const storeApp = useAppStore();
const storeAccounts = useAccountsStore();
const { t } = useI18n(), $t = t

enum KeyTypes {
  active = 'active',
  posting = 'posting',
  memo = 'memo'
}

// data
const keyType = ref(router.currentRoute.value.query.type as string)
const username = ref((router.currentRoute.value.query.username || '') as string);
const private_key = ref('');
  
// functions

/** 
 * Generate all keys from username and password
 * @param username 
 * @param password 
 */
function getKeys(username: string, password: string) {
  const keys: any = {}
  for (const role of ['active', 'posting', 'memo']) {
    const privateKey = PrivateKey.fromLogin(username, password, role as KeyRole).toString()

    keys[role] = {}
    keys[role].private = privateKey
    keys[role].public = PrivateKey.from(privateKey).createPublic().toString()
  }
  return keys
}

async function validateKey() {
  let newAccount = false
  try {
    $q.loading.show({ group: 'validateKey' });

    username.value = username.value.toLowerCase().trim();

    const publicKeys = await dhive.getPublicKeys(username.value);
    let publicKey: string | undefined = undefined
    try {
      // try to derive public key from entered valud
      publicKey = PrivateKey.from(private_key.value).createPublic().toString()
    } catch(e) {
      // failed - nothing to do as user can enter a master password or a keychain export
    }

    let account = storeAccounts.accounts.find((o) => o.name === username.value);
    if (!account) {
      // New account
      account = { 
        name: username.value, 
        keys: { 
          posting: undefined, 
          active: undefined,
          memo: undefined,
        },
        auths: [],
      };
      newAccount = true
    }

    switch (keyType.value) {
      case KeyTypes.active:
        if (publicKey != publicKeys.active) throw new Error($t('import_key.invalid', { type: storeApp.capitalize(keyType.value) }));
        account.keys.active = private_key.value
        break
      case KeyTypes.posting:
      if (publicKey != publicKeys.posting) throw new Error($t('import_key.invalid', { type: storeApp.capitalize(keyType.value) }));
        account.keys.posting = private_key.value
        break
      case KeyTypes.memo:
      if (publicKey != publicKeys.memo) throw new Error($t('import_key.invalid', { type: storeApp.capitalize(keyType.value) }));
        account.keys.memo = private_key.value
        break
      default:
        if (publicKey === publicKeys.active) {
          account.keys.active = private_key.value;
        } else if (publicKey === publicKeys.posting) {
          account.keys.posting = private_key.value;
        } else if (publicKey === publicKeys.memo) {
          account.keys.memo = private_key.value;
        } else {
          // Check if provided value is a master password
          let isMasterPassword = false
          const keys = getKeys(username.value, private_key.value)
          if(publicKeys.active == keys.active.public) {
            isMasterPassword = true
            account.keys.active = keys.active.private
          }
          if(publicKeys.posting == keys.posting.public) {
            isMasterPassword = true
            account.keys.posting = keys.posting.private
          }
          if(publicKeys.memo == keys.memo.public) {
            isMasterPassword = true
            account.keys.memo = keys.memo.private
          }
          // TODO: Enable import of keychain export

          if (!isMasterPassword) {
            throw new Error($t('import_key.no_match'));
          }
        }
    }
    await storeAccounts.updateAccount(account, newAccount);
    $q.notify({
      color: 'positive',
      position: 'bottom',
      message: $t('import_key.success'),
      icon: 'check',
    });
    storeAccounts.updateLastAccountName(username.value)
    storeAccounts.updateLastAccountTab('keys')
    router.back()
  } catch (e) {
    newAccount = false
    $q.notify({
      color: 'negative',
      position: 'bottom',
      message: `${$t('import_key.failed')} - ${(e as Error).message}`,
      icon: 'report_problem',
    });
  } finally {
    $q.loading.hide('validateKey');
    if(newAccount) storeApp.resetWebsocket = true
  }
}

function scanKey() {
  storeApp.isScanning = true
  $q.dialog({
    component: DialogScan
  })
  .onOk(async (value) => {
    private_key.value = value
    if(!username.value) {
      // try to retrieve username from 
      try {
        // try to derive public key from entered valud
        const publicKey = PrivateKey.from(private_key.value).createPublic().toString()
        const res = await dhive.client.call('account_by_key_api','get_key_references', { "keys":[publicKey] } )
        if(res.accounts.length > 0 ) {
          username.value = res.accounts[0][0]
        }
      } catch(e) {
        // failed - nothing to do as user can enter a master password or a keychain export
        console.log((e as Error).message)
      }
    }
    if(username.value) {
      validateKey()
    }
  }).onDismiss(() => {
    storeApp.isScanning = false
  })
}

// Hooks
onMounted(() => {
  storeApp.headerSubtitle = 'Import Keys';
  if(process.env.DEV && process.env.IMPORT_USERNAME) username.value = process.env.IMPORT_USERNAME
  if(process.env.DEV && process.env.IMPORT_KEY) private_key.value = process.env.IMPORT_KEY
})

</script>
  
<script lang="ts">
  export default defineComponent({
    name: 'import-key',
  });
  </script>
  