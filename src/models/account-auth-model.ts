export interface AccountAuthApp {
  name: string;
  icon: string;
  description: string;
}
export interface AccountAuth {
  expire: number;
  key: string;
  app: AccountAuthApp;
  ts_create: string;
  ts_expire: string;
  ts_lastused?: string;
  nonce?: number;
}

export interface AccountAuthModel {
  name: string;
  auths: AccountAuth[];
}
