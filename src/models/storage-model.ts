import { AccountAuthModel } from 'src/models/account-auth-model';

export interface StroageModel {
  pksa_name: string;
  auth_req_secret: string;
  auth_timeout_days: number;
  auth_req_approve: boolean;
  auto_approve_auth_req: boolean;
  auth_req_reject: boolean;
  sign_req_reject: boolean;
  challenge_req_reject: boolean;
  hive_api: string;
  has_server: string;
  hideEncryptedData: boolean;
  accounts: AccountAuthModel[];
}
