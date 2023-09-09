import { registerPlugin } from '@capacitor/core';

export interface HASCustomPluginResponseInfo {
  callId: string;
}

export interface HASCustomPluginResponse {
  info: HASCustomPluginResponseInfo;
  dataString: string;
}

export interface HASCustomPlugin {
  callPlugin(options: {
    callId: string;
    method: string;
    privateKey: string;
    publicKey: string;
    memo: string;
    accountName: string;
    userKey: string;
  }): Promise<HASCustomPluginResponse>;
}

const hasCustomPlugin = registerPlugin<HASCustomPlugin>(
  'HiveAuthSignerCustomPlugin'
);

export default hasCustomPlugin;
