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
    method: string;
    privateKey: string;
    publicKey: string;
    memo: string;
    accountName: string;
    userKey: string;
  }): Promise<HASCustomPluginResponseInfo>;
}

const hasCustomPlugin = registerPlugin('HiveAuthSignerCustomPlugin');

export default hasCustomPlugin;
