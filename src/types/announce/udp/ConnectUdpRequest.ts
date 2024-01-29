import crypto from 'crypto'
import { TrackerUdpRequestActionEnum } from '../../../enum/TrackerUdpRequestAction.enum'

export class ConnectUdpRequest {
  constructor(
    /**
     *  Offset  Size            Name            Value
     *  0       64-bit integer  protocol_id     0x41727101980 // magic constant
     */
    readonly protocolId = 41727101980n,
  
    /**
     *  Offset  Size            Name            Value
     *  8       32-bit integer  action          0 // connect
     */
    readonly action: TrackerUdpRequestActionEnum = TrackerUdpRequestActionEnum.connect,
  
    /**
     *  Offset  Size            Name            Value 
     *  12      32-bit integer  transaction_id  // random
     *  16
     */
    readonly transactionId: number = 0,
  ){}
  
    static build(): ConnectUdpRequest {
      return new ConnectUdpRequest(
        41727101980n,
        TrackerUdpRequestActionEnum.connect,
        crypto.randomBytes(4).readInt32BE()
      )
    }
  
    static toPacket(request?: ConnectUdpRequest){
      request = request ?? ConnectUdpRequest.build()
      const protocolIdBuffer = Buffer.alloc(8)
      protocolIdBuffer.writeBigInt64BE(request.protocolId, 0)
      const actionBuffer = Buffer.alloc(4)
      actionBuffer.writeInt32BE(request.action, 0)
      const transactionIdBuffer = Buffer.alloc(4)
      transactionIdBuffer.writeInt32BE(request.transactionId, 0)
      return Buffer.concat([
        protocolIdBuffer,
        actionBuffer,
        transactionIdBuffer
      ])
    }
  }
  