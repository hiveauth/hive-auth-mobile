export interface AccountAuthApp {
  name: string;
  icon: string;
  description: string;
}

export interface AccountAuthWhitelistSettings {
  vote: boolean;
  comment: boolean;
  account_update2: boolean;
  comment_options: boolean;
  delete_comment: boolean;
  custom_json: boolean;
  custom_binary: boolean;
  claim_reward_balance: boolean;
  claim_reward_balance2: boolean;
  create_proposal: boolean;
  remove_proposal: boolean;
  update_proposal: boolean;
  update_proposal_votes: boolean;
  vote2: boolean;
}
export interface AccountAuth {
  expire: number;
  key: string;
  app: AccountAuthApp;
  settings: AccountAuthWhitelistSettings;
  ts_create: string;
  ts_expire: string;
  ts_lastused?: string;
  nonce?: number;
}

export interface AccountAuthModel {
  name: string;
  auths: AccountAuth[];
}
