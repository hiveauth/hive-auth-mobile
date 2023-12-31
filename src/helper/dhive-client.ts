import { Client, PrivateKey } from '@hiveio/dhive';

export interface IPublicKeys {
  owner: string;
  active: string;
  posting: string;
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

async function getPublicKeys(username: string): Promise<IPublicKeys> {
  try {
    const account = await client.database.getAccounts([username]);
    if (account.length == 0) {
      throw new Error(`User '${username}' not found.`);
    }
    return {
      owner: account[0].owner.key_auths[0][0],
      active: account[0].active.key_auths[0][0],
      memo: account[0].memo_key,
      posting: account[0].posting.key_auths[0][0],
    } as IPublicKeys;
  } catch (error) {
    console.error('Error occurred while retrieving user public keys:', error);
    throw error;
  }
}

export default {
  privateKeyFromString,
  publicKeyFrom,
  getPublicKeys,
  client,
};
