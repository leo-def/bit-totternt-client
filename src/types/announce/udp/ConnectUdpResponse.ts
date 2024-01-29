import { TrackerUdpRequestActionEnum } from "../../../enum/TrackerUdpRequestAction.enum"
import { ConnectUdpRequest } from "./ConnectUdpRequest"

export class ConnectUdpResponse {
  constructor(
    /**
     *  Offset  Size            Name            Value 
     *  0       32-bit integer  action          0 // connect
     */
    readonly action: TrackerUdpRequestActionEnum = TrackerUdpRequestActionEnum.connect,
    
    /**
     *  Offset  Size            Name            Value 
     *  4       32-bit integer  transaction_id // random
     */
    readonly transactionId: number = 0,
    
    /**
     *  Offset  Size            Name            Value 
     *  8       64-bit integer  connection_id  // save
     *  16
     */
    readonly connectionId: bigint = 0n
  ){}
  
    static validate(request: ConnectUdpRequest, response: ConnectUdpResponse): boolean {
      return ((request.action === response.action &&
        request.action === TrackerUdpRequestActionEnum.connect
        ) &&
        request.transactionId === response.transactionId
        )
    }
  
    static fromPacket(response: Buffer) {
      const action = response.readUInt32BE(0)
      const transactionId = response.readUInt32BE(4)
      const connectionId = response.readBigUInt64BE(8)
      return new ConnectUdpResponse(
        action,
        transactionId,
        connectionId,
      )
    }
  }