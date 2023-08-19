import { Client, PrivateKey } from '@hiveio/dhive';
import { PublicKeysModel } from 'src/models/public-keys-model';
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

async function getUserPublicKeys(username: string): Promise<PublicKeysModel> {
  try {
    console.log('Getting user public keys');
    const account = await client.database.getAccounts([username]);
    if (account.length === 0) {
      throw new Error(`User '${username}' not found.`);
    }
    console.log('Got user info');
    return {
      active: account[0].active.key_auths.map(([key]) => key)[0],
      memo: account[0].memo_key,
      posting: account[0].posting.key_auths.map(([key]) => key)[0],
    } as PublicKeysModel;
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
