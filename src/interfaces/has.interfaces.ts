export interface IConnected { 
  cmd: "connected"
  timeout: number
  version: string
  protocol: number
}

export interface IKeyReq { 
  cmd: "key_req" 
}

export interface IKeyAck { 
  cmd: "key_ack"
  key: string
}

export interface IRegisterReqAccount {
  name: string
  pok: any
}

export interface IRegisterReq {
  cmd: "register_req"
  app: string
  accounts: IRegisterReqAccount[]
}

export interface IRegisterAck {
  cmd: "register_ack"
  account: string
}

export interface IAuthReq {
  cmd: 'auth_req'
  account: string
  data: string
  uuid: string 
  expire: number
  auth_key?: string
}

export interface IAuthReqData {
  app: {
      name: string
      description: string | undefined
      icon: string | undefined
  },
  challenge : object | undefined
  token: string | undefined // DEPRECATED - protocol < 1 only
}

export interface IAuthReqPayload {
  account: string
  uuid: string
  key: string
  host: string
}

export interface IAuthAckData {
  token: string | undefined // DEPRECATED - protocol < 1.0 only
  expire: number
  challenge: any | undefined
}

export interface IAuthAck {
  cmd: "auth_ack"
  uuid: string
  data: string
  pok: string
}

export interface IAuthNack {
  cmd: "auth_nack"
  uuid: string
  data: string
  pok: string
}

export interface IAuthError {
  cmd: "auth_err"
  uuid: string
  error: string
  pok: string
}

export interface ISignReqData {
  key_type: string
  ops: string
  broadcast: boolean
  nonce: number
}

export interface ISignReq {
  cmd: "sign_req" 
  account: string
  data: string
  uuid: string
  expire: number
  token: string | undefined // DEPRECATED - protocol < 1 only
}

export interface ISignAck {
  cmd: "sign_ack"
  uuid: string
  data : any,
  broadcast: boolean
  pok: string
}

export interface ISignNack {
  cmd: "sign_nack"
  uuid: string
  data: string
  pok: string
}

export interface ISignError {
  cmd: "sign_err"
  uuid: string
  error: string
  pok: string
}

export interface IChallengeReq {
  cmd: "challenge_req"
  account: string
  data: string
  uuid: string
  expire: number
  // token: string // DEPRECATED since protocol v1
}

export interface IChallengeReqData {
  key_type: string,
  challenge: string,
  decrypt: boolean
  nonce: number
}

export interface IChallengeAckData {
  pubkey: string,
  challenge: string
}

export interface IChallengeAck {
  cmd: "challenge_ack"
  uuid: string
  data: string
  pok: string
}
export interface IChallengeNack {
  cmd: "challenge_nack"
  uuid: string
  data: string
  pok: string
}

export interface iChallengeError {
  cmd: "challenge_err"
  uuid: string
  error: string
  pok: string
}

module.exports = true