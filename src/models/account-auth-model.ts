export interface AccountAuth {
  expire: number;
  key: string;
  app: string;
  ts_create: string;
  ts_expire: string;
  ts_lastused?: string;
  nonce?: number;
}

export interface AccountAuthModel {
  name: string;
  auths: AccountAuth[];
}
