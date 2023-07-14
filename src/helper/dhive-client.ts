import { Client, PrivateKey, PublicKey } from '@hiveio/dhive';

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

async function getUserPublicKeys(
  username: string
): Promise<(string | PublicKey)[]> {
  try {
    console.log('Getting user public keys');
    const account = await client.database.getAccounts([username]);
    if (account.length === 0) {
      throw new Error(`User '${username}' not found.`);
    }
    console.log('Got user info');
    return [
      ...account[0].active.key_auths.map(([key]) => key),
      ...account[0].owner.key_auths.map(([key]) => key),
      ...account[0].posting.key_auths.map(([key]) => key),
    ];
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
