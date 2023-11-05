import { Client, PrivateKey } from '@hiveio/dhive';

export interface IPublicKeys {
  posting: string;
  active: string;
  memo: string;
}
const client = new Client([
  'https://api.hive.blog',
  'https://api.deathwing.me',
  'https://hive-api.arcange.eu',
  'https://hived.emre.sh',
  'https://api.openhive.network',
  'https://rpc.ausbit.dev',
  'https://rpc.mahdiyari.info',
  'https://hive-api.3speak.tv',
  'https://techcoderx.com',
]);

function privateKeyFromString(string: string): PrivateKey {
  return PrivateKey.from(string);
}

function publicKeyFrom(privateKey: PrivateKey): string {
  return privateKey.createPublic().toString();
}

async function getUserPublicKeys(username: string): Promise<IPublicKeys> {
  try {
    const [account] = await client.database.getAccounts([username]);
    if (!account) {
      throw new Error(`User '${username}' not found.`);
    }
    return {
      active: account.active.key_auths[0][0],
      memo: account.memo_key,
      posting: account.posting.key_auths[0][0],
    } as IPublicKeys;
  } catch (error) {
    console.error('Error occurred while retrieving user public keys:', error);
    throw error;
  }
}

export default {
  privateKeyFromString,
  publicKeyFrom,
  getUserPublicKeys,
  client,
};
