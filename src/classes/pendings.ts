import assert from 'assert';
import { IAuthReq, IAuthReqPayloadPending} from '../interfaces/has.interfaces'

// const Mutex = require('async-mutex').Mutex
// const lock = new Mutex()

export class Pendings {
  // Private properties
  private pendings = [] as any[]
  private debug = false

  /**
   * 
   * @param {Boolean?} debug - enable debug log - default value = false
   */
  constructor(debug = false) {
    this.debug = debug
  }

  private clean() {
    if(this.debug) {
      const now = Date.now()
      this.pendings.filter(o => o.expire <= now).forEach(p => {
        console.debug(`cleaned ${JSON.stringify({ account: p.account, uuid: p.uuid })}`)
      })
    }
    this.pendings = this.pendings.filter(o => o.expire > Date.now())
  }

  push(item: any) {
    this.clean()
    assert(item.uuid,'invalid pending (missing uuid)')
    assert(item.expire,'invalid pending (missing expire)')
    assert(!this.pendings.some(o => o.uuid == item.uuid),`duplicate pending uuid ${item.uuid}`)
    this.pendings.push(item)
  }

  // WARNING: Be carefull if reactivating locks and making pop async -> add await to external calls
  pop(uuid: string) {
    // let release = undefined
    let pending = undefined
    try {
      // release = await lock.acquire()
      const index = this.pendings.findIndex(o => o.uuid==uuid)
      if(index >= 0) {
        pending = this.pendings[index]
        this.pendings.splice(index,1) // delete pending request
      }
    }
    finally {
    // if(release) release()
    }
    return pending
  }
}