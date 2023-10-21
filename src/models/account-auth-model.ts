export interface AccountAuthApp {
  name: string;
  icon: string;
  description: string;
}

export interface AccountAuthSettings {
  [key: string]: boolean;
}
export interface AccountAuth {
  expire: number;
  key: string;
  app: AccountAuthApp;
  settings: AccountAuthSettings;
  ts_create: string;
  ts_expire: string;
  ts_lastused?: string;
  nonce?: number;
}

export interface AccountAuthModel {
  name: string;
  auths: AccountAuth[];
}
